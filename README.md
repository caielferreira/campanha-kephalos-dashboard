# Crónicas — campanhas e personagens

Aplicação estática. O Google Sheets privado guarda os registos; o Drive guarda imagens e backups. O dashboard importa biblioteca.json em memória, com seleção de campanha e grupo. Não envia dados pela rede nem usa localStorage. Imagens abrem por fileId no Drive.

## Contrato v2

schemaVersion: 2; revision: inteiro não negativo; updatedAt: data ISO. Cada tabela abaixo corresponde a uma lista JSON. IDs únicos por lista. Tipos numéricos e booleanos devem ser preservados. Campos adicionais sobrevivem à exportação.
- campaigns: id, title, system, revision, location, worldTime, resume, notes
- characters: id, name, appearance, backstory, source
- participants: id, campaignId, characterId, description, level, hp, maxHp, tempHp, ac, str, dex, con, int, wis, cha, cp, sp, ep, gp, pp, conditions, concentration, inspiration, skills, features, notes, verifiedAt
- groups: id, campaignId, name, notes
- memberships: id, groupId, participantId
- spells: id, participantId, name, level, prepared, source, ability, notes
- inventory: id, participantId, name, quantity, equipped, notes
- resources: id, participantId, name, current, max, recovery, notes
- sessions: id, campaignId, groupId, date, summary, changes, resume
- quests: id, campaignId, title, status, notes
- images: id, campaignId, characterId, sessionId, fileId, driveUrl, caption, prompt, references, createdAt

Characters é identidade; Participants guarda estado independente por campanha. Groups combina Participants através de Memberships, com validação da campanha. Magias, equipamento e recursos pertencem a participantId. Não misturar estados entre campanhas. O formato v1 continua importável com preservação do snapshot original.

## Executar e testar

Servir esta pasta por HTTP. GitHub Pages: main, raiz. Sem dependências de execução. Testes: node --test library.test.mjs dashboard.test.cjs.

Os registos não devem entrar no Git. O chat exporta as linhas do Sheets para biblioteca.json; o utilizador importa a cópia. Sem OAuth ou escrita automática no Sheets. Nunca publicar credenciais, snapshots privados ou imagens da campanha.
