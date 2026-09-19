# Crónicas — campanhas e personagens

Aplicação estática. O Google Sheets privado guarda os registos; o Drive guarda imagens e backups. O dashboard importa biblioteca.json em memória, com seleção de campanha e grupo. Não envia dados pela rede. Rascunhos persistem em localStorage; Fechar biblioteca remove-os. Imagens abrem por fileId no Drive.

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

Servir esta pasta por HTTP. GitHub Pages: main, raiz. Sem dependências de execução. Testes: node --test library.test.mjs dashboard.test.cjs play.test.mjs.

Os registos não devem entrar no Git. O chat exporta as linhas do Sheets para biblioteca.json; o utilizador importa a cópia. Sem OAuth ou escrita automática no Sheets. Nunca publicar credenciais, snapshots privados ou imagens da campanha.

## Jogar e guardar
Dados criptograficamente aleatórios, vantagem/desvantagem, registo por campanha/personagem; o resultado nunca resolve a ação automaticamente. Party permite grupos combináveis. Fichas, recursos, preparação de magias e inventário são editáveis; diário admite novas entradas. A preparação e recuperação exigem validação das regras com o DM.

Exportações incluem localChanges (changeId, campaignId, date, baseRevision, table, id, before, after). O chat deve reconciliar cada mudança com o estado atual do Sheets, preservar alterações concorrentes, deduplicar IDs e só então incrementar a revisão. Não copiar cegamente o rascunho sobre a base. O snapshot confirmado não inclui localChanges.

Rolls: id, campaignId, participantId opcional para NPC, actor opcional, date, label, count, sides, modifier, mode, values, total. values é um array no JSON e texto JSON no Sheets.

Testes de UI usam qa-data.json local temporário, ignorado pelo Git. Nunca publicar dados de teste privados.
