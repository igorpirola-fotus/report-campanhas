const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO  = process.env.GITHUB_REPO;   // ex: "igorpirola-fotus/report-campanhas"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const FILE_PATH = 'data/campanhas.json';

function githubRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'fotus-report-admin',
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return res.status(500).json({ error: 'Variáveis de ambiente não configuradas.' });
  }

  try {
    const update = req.body;

    // 1. Get current file to obtain SHA
    const getRes = await githubRequest('GET',
      `/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${GITHUB_BRANCH}`
    );
    if (getRes.status !== 200) {
      return res.status(500).json({ error: 'Não foi possível obter o arquivo atual do GitHub.' });
    }
    const currentSha = getRes.body.sha;
    const currentContent = JSON.parse(Buffer.from(getRes.body.content, 'base64').toString('utf8'));

    // 2. Merge updates into current data
    currentContent.meta = { ...currentContent.meta, ...update.meta };

    if (update.campanhasUpdate) {
      update.campanhasUpdate.forEach(upd => {
        const camp = currentContent.campanhas.find(c => c.id === upd.id);
        if (camp) {
          camp.kpiPrincipal = upd.kpiPrincipal;
          camp.kpiLabel     = upd.kpiLabel;
          camp.barPct       = upd.barPct;
          camp.rodape1Valor = upd.rodape1Valor;
          camp.rodape1Label = upd.rodape1Label;
          camp.rodape2Valor = upd.rodape2Valor;
          camp.rodape2Label = upd.rodape2Label;
          // Auto-detect status based on barPct
          camp.status = upd.barPct >= 90 ? 'verde' : 'critico';
        }
      });
    }

    // 3. Commit updated file
    const newContent = Buffer.from(JSON.stringify(currentContent, null, 2)).toString('base64');
    const commitRes = await githubRequest('PUT',
      `/repos/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        message: `📊 Update report ${update.meta?.atualizadoEm || new Date().toLocaleDateString('pt-BR')}`,
        content: newContent,
        sha: currentSha,
        branch: GITHUB_BRANCH
      }
    );

    if (commitRes.status === 200 || commitRes.status === 201) {
      return res.status(200).json({ ok: true, commit: commitRes.body.commit?.sha });
    } else {
      return res.status(500).json({ error: `GitHub error: ${commitRes.status}`, detail: commitRes.body });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
