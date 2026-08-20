# LOGX Dashboard — Exportação Marítima

Dashboard interativo de exportação marítima FCL/LCL.

## Como atualizar

1. Acesse o repositório no GitHub
2. Clique no arquivo `Relatorio_IAN.csv`
3. Clique no ícone de lápis (editar) → "Upload files"
4. Selecione o CSV novo exportado do sistema
5. Clique em "Commit changes"
6. Aguarde ~2 minutos → dashboard atualizado automaticamente

## Estrutura

| Arquivo | Função |
|---|---|
| `Relatorio_IAN.csv` | Dados exportados do sistema (substituir para atualizar) |
| `processar.py` | Script que converte CSV → HTML |
| `dash_v3_template.html` | Template do dashboard (layout/CSS) |
| `js_final.js` | JavaScript do dashboard |
| `index.html` | Dashboard final gerado (não editar) |
| `.github/workflows/atualizar.yml` | Automação GitHub Actions |

## Acesso

Link do dashboard: https://ArielyAmaro.github.io/logx-dashboard

Desenvolvido por: Ariely Amaro — LOGX Logistics
