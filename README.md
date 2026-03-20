# 📊 Report Campanhas MKT | CRM — Fotus

## 🔗 URLs

| Página | URL |
|--------|-----|
| **Report (para compartilhar)** | `https://report-campanhas-fotus.vercel.app/` |
| **Admin (para atualizar)** | `https://report-campanhas-fotus.vercel.app/admin` |

**Senha do admin:** `fotus2026`

---

## 🔄 Como atualizar o report (time de marketing)

1. Acesse `[url-do-report]/admin`
2. Digite a senha
3. Preencha os campos com os dados do dia
4. Clique em **"🚀 Publicar Atualização"**
5. Aguarde ~60 segundos e o report estará atualizado

> O admin só atualiza os **KPIs dos cards** e o **resumo para a diretoria**.  
> Para atualizar as tabelas por equipe, edite o arquivo `data/campanhas.json` diretamente no GitHub.

---

## 📁 Estrutura do projeto

```
/
├── public/
│   ├── index.html     ← página do report (não editar)
│   └── admin.html     ← painel de atualização (não editar)
├── api/
│   └── update.js      ← função serverless (não editar)
├── data/
│   └── campanhas.json ← ÚNICO ARQUIVO DE DADOS
└── vercel.json
```

---

## ⚙️ Variáveis de ambiente (Vercel)

Configurar no painel do Vercel → Settings → Environment Variables:

| Variável | Valor |
|----------|-------|
| `GITHUB_TOKEN` | Token de acesso pessoal do GitHub (com permissão `contents:write`) |
| `GITHUB_REPO` | `igorpirola-fotus/report-campanhas` |
| `GITHUB_BRANCH` | `main` |
