# Crónicas — dashboard de campanha

Interface estática sem dependências. Abrir index.html diretamente ou servir com qualquer servidor estático. GitHub Pages: Settings > Pages > Deploy from a branch > main > /(root).

## Separação de responsabilidades
- GitHub: apenas código e documentação técnica genérica.
- Pages: interface pública, sem dados de campanha incorporados.
- Google Drive: ficheiro campanha.json privado, mantido pelo ChatGPT através do plugin.
- Dashboard: importar a cópia JSON descarregada do Drive. Exportar devolve uma cópia; não grava no Drive.

Não existe autenticação Google nem sincronização automática nesta versão. Nenhum token ou segredo deve entrar no repositório. Os dados importados são mantidos apenas em memória, descartados ao fechar/recarregar. Não há analytics, armazenamento local ou pedidos de rede pela aplicação.

## Contrato JSON (schemaVersion 1)
Campos obrigatórios: schemaVersion=1; revision inteiro >=0; title texto; notes texto; characters, quests e sessions listas.
Personagem: name texto, level/ac/hp/maxHp inteiros não negativos, hp <= maxHp, spells e inventory listas de texto. Opcionais: description, resources, abilities, notes (texto).
Missão: title, status, notes (texto). Sessão: id, date, summary (texto). As listas podem estar vazias.
updatedAt opcional, ISO 8601. Campos adicionais são preservados ao exportar. Usar IDs únicos para sessões e incrementar revision depois de cada gravação no Drive.

Teste: node --test dashboard.test.cjs (colocado junto de index.html). Nenhum ficheiro real da campanha deve ser enviado para este repositório.
