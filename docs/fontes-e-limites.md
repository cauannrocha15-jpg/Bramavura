# Huntera — cliente capturado e servidor local

Data: 23/10/2026. Este relatório distingue o que existe no cliente público daquilo que o backend local implementa por aproximação. Não há código do servidor original nesta investigação.

## Fontes e evidência

- Cliente atual: `public/main-MUNRWAJS.js` e seus imports capturados pelo agente principal. A tela de personagens está em `chunk-GMX3AVI7.js`; transporte em `chunk-L7RK2YWL.js`; validadores compartilhados em `chunk-JRE7IT7W.js`; estado do jogo em `chunk-RLNSICFX.js`.
- Captura histórica: captura anterior de 18–19/10/2026, mantida no workspace de investigação. Os documentos `network-contract.md`, `game-data-notes.md`, `game-data.json`, `bestiary.json` e `new-hunts-normalized-20261019.json` no diretório pai documentam a procedência dos dados reutilizados.
- O relatório histórico cita REA `ev_ed893ed2efffc5fde0f842f64e05eff82c1b18013782c078cd3f038ce6a2caf6`, análise semântica parcial apesar de parse de 46 JS sem erro. A consulta ao inventário REA nesta sessão retornou zero registros retidos: essa referência é histórica, não uma nova análise nem um registro atualmente consultável. Não repeti a varredura inteira.
- Foram lidos arquivos estáticos e executados localmente apenas módulos compartilhados do cliente para validar compatibilidade. Não foram consultadas APIs administrativas, credenciais ou banco de dados do serviço original.

## Contrato observado no cliente atual

O transporte contém **192 nomes de mensagens servidor → cliente e 211 cliente → servidor**. Esses números foram extraídos das tabelas `ft` e `je` da compilação atual; não representam quantidade de funcionalidades implementadas no backend local.

O formato de uma mensagem é um seed uint32 little-endian, seguido de flags e JSON `[opcode, campos]`, transformados por XOR/xorshift com chave 1213550164. Existe suporte de leitura a deflate e agrupamentos no cliente. O backend envia mensagens individuais sem compressão, que o cliente aceita. O backend decodifica as mensagens individuais enviadas pelo navegador, incluindo deflate quando presente.

Admissão HTTP: `POST /api/game-tickets {characterId}`. A interface usa `{character, ticket, websocketUrl}` e chama `socket.start(character.name,ticket,websocketUrl)`. O servidor local fornece um ticket estritamente local e conexão `ws://127.0.0.1:<porta>/game-socket`.

A restauração de admissão no cliente usa `sessionStorage['tibia-web.admission-handover']`, com `{admission,at}` e validade de 60 segundos. A implementação entregue utiliza a própria tela original de personagens, portanto não precisa alterar essa guarda de rota.

Ordem de inicialização necessária: `welcome` para identidade → `scenario-terrain` para cache → `instance-enter` referindo terreno existente → `creature-appear` do jogador → snapshots de atributos e inventário → catálogos/configurações. O cache precisa conhecer terrainId antes de entrar na instância.

Particularidades confirmadas pelos validadores reais:

- Item de inventário admite `slot` ausente ou nome de slot; **rejeita `slot:null`**. Itens de catálogo admitem `slot:null`.
- Tutorial concluído usa `step:'done'`, não `'complete'`.
- `creature-hit.effect` usa efeitos como `'blood'`; `'physical'` é um canal de dano, não um efeito visual válido.
- `player-stats.cooldowns` exige attack/heal/support/item numéricos e um objeto spells.
- Capacidade e pesos são centésimos de oz. O texto mostra `(capacity - carried) / 100`, com duas casas decimais. O seed local foi ajustado para mostrar a capacidade disponível observada, sem inferir uma fórmula autoritativa.
- `/api/me/campaigns` deve devolver `{origin,campaigns:[],pix}`, não um sucesso genérico. A conta usa `emailVerified` para evitar o aviso de confirmação de e-mail.

## Recursos e mapas

A base do loader de aparências é `/things/1332`. `catalog-content.json` informa o arquivo de aparências e as sheets de sprites por firstspriteid/lastspriteid/spritetype/file. O cliente desenha sprites desses arquivos, não de uma pasta genérica `/sprites`.

A cidade local provisória utiliza **o terreno público de demonstração** `public/assets/gate/temple-terrain.json`: 1189 tiles e eye `{x:1071,y:1067,z:7}`. O backend conserva coordenadas e itens do arquivo e valida tiles bloqueados ao mover. Esse arquivo público não comprova que o mapa da cidade do servidor seja igual ao preview.

As caçadas usam um mapa de teste gerado pelo backend. Esse terreno não foi recuperado do servidor. O catálogo só conserva o outfit confirmado de Rat; espécies sem correspondência confirmada ficam sem retrato. A aparência não é equivalente à referência inteira.

## Backend implementado

Arquivo: `backend.cjs`, sem dependências externas. API exportada: `createBackend()` com `handleHttp`, `handleUpgrade` e `close`; o servidor estático do agente principal chama essas funções.

Revisão de 26/10: layout e favoritos são persistidos por personagem local e restaurados no bootstrap. O normalizador conserva as 18 chaves e os campos open/size/pos/picks aceitos pelo cliente; favoritos são IDs conhecidos, únicos e ordenados. A mensagem inicial de layout habilita o coletor original, antes inativo. Regressões com os codecs e validadores originais cobrem filtros, reconexão, reinício, isolamento e limpeza. O wire não comprova o escopo de armazenamento do servidor original; o escopo por personagem e a rejeição de envelopes malformados são políticas locais. `docs/preferencias-locais.md` detalha os contratos e limites.

Inclui conta local, seleção/criação/exclusão de personagens locais, admissão, codec binário compatível, WebSocket, snapshots, 83 caçadas, entrada/saída de caçada, combate automático de demonstração, atributos, gold/XP, inventário, equipamento, movimento na cidade, depot, loja NPC simples e configurações de barra/postura. Persiste os personagens em `data/local-state.json`.

O WebSocket exige versão 13, chave válida, frames mascarados, origem local com a mesma porta quando Origin existe e limite de 4 MiB para frame/mensagem fragmentada. O backend não conecta ao Huntera.

**Aproximações independentes:** dano aleatório, cadência de tick, progressão, loot, spawns, pesos seed, capacidade total seed e terreno de caçada. A lista de 83 nomes/IDs vem dos dados observados e enumeração do cliente; isso não recupera os tiers, loot completo, portraits e regras de cada área. Diversos comandos avançados devolvem indicação explícita de falta de implementação.

## Validação executada

`tests/compatibility.cjs` passou após as correções. Os testes usam o encoder/decoder da compilação original e o seu validador `Gc`, não uma cópia dos validadores do backend.

Verificações: comandos originais são decodificados pelo backend; eventos locais são aceitos pelo decoder original; HTTP de admissão, conta e campanhas; handshake WebSocket; todos os eventos de bootstrap aceitos pelo validador original; terrain precede instance; combate da caçada; saída; movimento; ofertas NPC. Catálogo validado: 83 caçadas. As chamadas de loopback exigiram execução fora do sandbox de rede; a primeira tentativa restrita retornou EACCES.

Os testes provam interoperabilidade das mensagens exercitadas. Não provam equivalência das fórmulas, multiplayer, conteúdo integral ou fidelidade visual, que o agente principal verifica separadamente no navegador.

## Revisão posterior: Cyclopedia, integridade e caçadas observadas

`cyclopedia-request` agora devolve um catálogo validado pelo cliente original com 192 fichas de criaturas e 12 nomes de bosses. Os atributos numéricos, classes e resistências provêm das fichas observadas. O requisito de 2.500 abates foi conferido em todos os 186 textos de `bestiary-records.json` e nas seis novas capturas. Os registros armazenam dano recebido; o wire armazena resistência, convertido como `100 - danoRecebido`. A função real `bc()` do cliente participa do teste: Amazon exibe 105% físico/morte e Flimsy Lost Soul exibe 0% morte. A correção também foi conferida na ficha de Amazon no navegador.

O DAT público fornece nomes/IDs/categorias de itens; os seus 1.280 outfits não têm nomes. A correspondência histórica de Rat é conservada. Cinco representantes visuais foram selecionados depois da comparação da grade e de poses de ficha: Adult Goanna 1195, Arachnophobica 1135, Blood Crab 200, Blood Priest 553 e Bog Raider 299. São 13 screenshots utilizáveis; sete capturas vazias, com UI ou com a criatura anterior foram rejeitadas. `data/outfit-render-representatives-observed.json` registra hashes, decisões e limites e é fixado por SHA-256 no backend; alterações ou dados incompletos rejeitam o conjunto inteiro. Os cinco IDs canônicos e suas cores continuam null. Os diagnósticos separam 191 IDs canônicos desconhecidos de 186 retratos sem representante; estes usam outfitId=0. A comparação cobre sul estático e poses amostradas, sem fase exata/ciclo completo/outras direções. O campo também alimenta o spawn do mundo a oeste; esse uso permanece sem validação visual. As associações de itens a loot de criaturas só são preenchidas onde observadas. Classes de raridade soltas não determinam associações.

A revisão da base anterior confirmou 67 registros em `equipment-observed.json`, dos quais somente 26 possuem texto de tooltip. Entradas com `tooltip:null` não comprovam atributos. O catálogo atual usa a lista completa observada na interface, e os tooltips anteriores só suplementam campos quando o mesmo ID/nome/categoria e os valores compartilhados conferem. Campos de combate obrigatórios sem observação usam zero neutro de transporte, explicitamente registrado como **desconhecido**, e não como estatística recuperada. A rota local `/api/local/catalog-evidence` expõe a proveniência e os campos desconhecidos por item.

O backend dá preferência a `data/hunts-observed-current.json`. Conserva descrição, nomes dos tiers, lista global de criaturas e, para cada pull capturado, apenas as criaturas ativas e a ordem/raridade dos seus loots. Resolve moedas sem data-item-id por correspondência exata de nome no DAT. Não associa loot de um pull composto a uma criatura individual. A contagem de monstros, ausente na UI, fica na sentinela numérica 0 exigida pelo schema; não há consumidor visual desse campo nos demais JS capturados. Tiers/pulls ausentes são listados como lacunas e não ganham quantidades ou pesos inventados.

A captura de caçadas foi concluída: **83 caçadas e 251 pulls** (há caçadas com um ou quatro pulls), observados no DOM da versão `main-USP7XJJP.js`. Os dados foram validados pelo schema do cliente baseline `main-MUNRWAJS.js`. Todos os IDs/raridades de loot foram resolvidos; zero caçadas ou pulls faltantes. O arquivo de observações tem aproximadamente 1,1 MB. Os testes conferem todos os pulls contra a captura e não uniformizam seus tiers.

A captura posterior da lista de itens percorreu **134 páginas e 1.070 IDs únicos**, sem páginas ausentes. O backend substitui o catálogo provisório de 811 itens pelos IDs e nomes exatos da lista, sem inserir um ID apenas por aparecer no loot. São 23 categorias observadas, 1.069 pesos, 187 ataques, 193 defesas, 156 armaduras, 74 alcances, 14 bônus de velocidade e 26 danos elementais. O peso de experience scroll (14758) não é exibido. O chip original `+-5` de depth calcei foi preservado e interpretado como velocidade -5, conforme a concatenação do renderer. Seis divergências com o DAT são registradas, com prioridade para a UI observada; por exemplo, experience scroll está na categoria Outros/9, embora o DAT indique 22. Gold coin (3031) aparece no loot mas não na lista dos 1.070 itens. A omissão de um chip não prova estatística zero. O rótulo antigo Uma mão também é um fallback do cliente e não comprova o booleano-fonte `twoHanded:false`.

O seed de sabre/cheese usava IDs incorretos; o DAT confirmou 3273/3607. A migração corrige esses itens pelos nomes/IDs específicos, preservando seus UIDs. O contador global de UID agora é recalculado a partir do estado e persistido; duplicatas anteriores são realocadas sem alterar os UIDs já únicos.

Mutação HTTP exige application/json, rejeita Origin externo e rejeita corpos null, arrays e primitivos com 400. APIs desconhecidas retornam 501 em vez de sucesso genérico. Os testes ampliados passaram: compatibilidade original, catálogo, preservação de dados por pull, rejeição de flags binárias reservadas, CSRF/conteúdo incorreto, disponibilidade após JSON null e unicidade de UIDs após reinício e compra.

A revisão independente confirmou zero divergências no merge dos 83 rosters e 251 pulls. Seus dois achados foram corrigidos e revalidados pelo revisor: nomes objeto/número/null/array retornam 400 sem exceção em criação/rename; referências de inventário inválidas não expandem arrays, enquanto a troca válida continua funcionando. A suíte passou novamente após essas correções. A limpeza dos testes engloba setup/fetch e foi verificada com falha injetada após listen: o processo encerrou em aproximadamente 1,6 s, sem servidor remanescente. Uma execução integral posterior passou em aproximadamente 2,7 s.

## Lacunas que impedem afirmar cópia 100%

O loot da caçada não comprova a tabela completa de uma criatura: mesmo uma caçada monoespécie pode omitir raridades presentes no Bestiary (observado com Ripper Spectre). Uma nova captura direta das 192 fichas, em `data/bestiary-loot-observed-current.json`, recuperou 2.779 entradas, 803 IDs distintos e 660 máximos de quantidade. Mantém notas, ordem e duplicatas; todos os nomes correspondem ao catálogo de 192 criaturas, sem ausências ou extras. Isso resolve a fonte das associações visíveis, não as probabilidades de drop.

O teste portátil usa uma pasta temporária própria para persistência. `close()` aguarda o encerramento dos sockets e suas gravações antes da limpeza, rejeita novos upgrades ao iniciar o encerramento e limpa os timers de movimento. Esses casos passaram pelo teste de integração.

A integração do loot individual passou na suíte portátil executada de dentro da entrega: os 192 arrays foram comparados com a captura e após transporte WebSocket, mantendo 2.779 entradas e 660 máximos. Dados inválidos (`max:null` ou loot vazio sem confirmação) continuam desconhecidos. Amazon e Ripper Spectre foram conferidos no navegador local: percentuais, raridades e notas coincidem com a observação original. Permanecem 191 outfits não identificados. Com a lista completa de itens, apenas gold coin (3031) está fora dela; todos os 803 IDs de loot ainda têm pelo menos um campo de combate obrigatório não observado. Isso não invalida os ataques/defesas/armaduras individuais que foram efetivamente exibidos.

Não foram recuperados fórmulas autoritativas, RNG/drop rates, IA/pathfinding do servidor, mapas privados, persistência/concorrência original, economia/RMT, guildas, quests/bosses, arena, forja/imbuements transacionais, wheel e demais regras avançadas. A compilação pública torna vários contratos e dados observáveis; não fornece todos os algoritmos ou o estado do servidor.

## Fichas acrescentadas em 26/10

A referência `main-WHI3EZUB.js` expõe 195 criaturas e 84 caçadas. Branchy Crawler, Mould Phantom e Rotten Golem foram capturados por texto e atributos DOM renderizados; seus 36 loots e dois máximos foram preservados, com raw e hash em `data/new-monsters-observed-20261026.json`. O catálogo local contém 195 criaturas/2.815 entradas/662 máximos, com fontes separadas de 192+3. Os três outfits e IDs canônicos continuam desconhecidos; slugs de nome são apenas identificadores locais. A adição completa é fixada por hash e rejeitada em conjunto, sem perder as 192 fichas anteriores. O teste RED inicial mostrou 192 em vez de 195; os testes posteriores confrontam atributos e bandas DOM e passam pelo decoder original.

Rotten Wasteland foi observada no catálogo em Agressivo/Suicida/Hardcore, cada um com três espécies e 27 itens, ordenados por peso. A quantidade de spawn permanece desconhecida. O enum baseline só aceita 83 IDs: catálogo com a nova hunt, favoritos e scenarioId são rejeitados. A nova hunt exige migração coerente de cliente/dicionário/contratos, por isso a entrega permanece195/83. `docs/conteudo-20261026.md` registra os limites. Nenhuma compra, recompensa ou caçada original foi executada.
