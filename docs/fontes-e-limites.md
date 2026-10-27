# Huntera — cliente capturado e servidor local

Perfil observado em 26/10/2026, com verificação local registrada em 27/10. Este relatório distingue o que existe no cliente público daquilo que o backend local implementa por aproximação. Não há código do servidor original nesta investigação. A [migração do cliente](migracao-cliente-20261026.md) registra o escopo atual; referências a capturas anteriores abaixo são históricas.

## Fontes e evidência

- Cliente ativo: `public/main-WHI3EZUB.js` e `styles-R5EQY622.css`. A tela de personagens está em `chunk-QHQDRMHS.js`; transporte em `chunk-DOXOLALI.js`; validadores compartilhados em `chunk-3UYZ2FFW.js`; estado do jogo em `chunk-QVCUBXOB.js`. O conjunto anterior MUNRWAJS foi conservado como histórico, sem misturar sua closure com a ativa.
- Captura histórica: captura anterior de 18–19/10/2026, mantida no workspace de investigação. Os documentos `network-contract.md`, `game-data-notes.md`, `game-data.json`, `bestiary.json` e `new-hunts-normalized-20261019.json` no diretório pai documentam a procedência dos dados reutilizados.
- O relatório histórico cita REA `ev_ed893ed2efffc5fde0f842f64e05eff82c1b18013782c078cd3f038ce6a2caf6`, análise semântica parcial apesar de parse de 46 JS sem erro. A consulta ao inventário REA nesta sessão retornou zero registros retidos: essa referência é histórica, não uma nova análise nem um registro atualmente consultável. Não repeti a varredura inteira.
- Foram lidos arquivos estáticos e executados localmente apenas módulos compartilhados do cliente para validar compatibilidade. Não foram consultadas APIs administrativas, credenciais ou banco de dados do serviço original.

## Contrato observado no cliente atual

O transporte contém **193 nomes de mensagens servidor → cliente e 213 cliente → servidor**, extraídos literalmente das tabelas `ct` e `Ve` de WHI. Os 192/211 nomes comuns conservam seus códigos. As adições são `hunt-report:199`, `bosstiary-pattern:216` e `hunt-report-request:217`; não foram deduzidas por ordem. Esses números não representam quantidade de funcionalidades implementadas no backend local. Os recursos de relatório e regras de Bosstiary continuam incompletos.

O formato de uma mensagem é um seed uint32 little-endian, seguido de flags e JSON `[opcode, campos]`, transformados por XOR/xorshift com chave 1213550164. Existe suporte de leitura a deflate e agrupamentos no cliente. O backend envia mensagens individuais sem compressão, que o cliente aceita. O backend decodifica as mensagens individuais enviadas pelo navegador, incluindo deflate quando presente.

Admissão HTTP: `POST /api/game-tickets {characterId}`. A interface usa `{character, ticket, websocketUrl}` e chama `socket.start(character.name,ticket,websocketUrl)`. O servidor local fornece um ticket estritamente local e conexão `ws://127.0.0.1:<porta>/game-socket`.

A restauração de admissão no cliente usa `sessionStorage['tibia-web.admission-handover']`, com `{admission,at}` e validade de 60 segundos. A implementação entregue utiliza a própria tela original de personagens, portanto não precisa alterar essa guarda de rota.

Os caminhos normais de admissão continuam usando `0.3.0+e0`, ping de 5 segundos, API relativa, `credentials:include` e JSON. O cliente novo trata o erro opcional `mustRename`; isso não cria um novo campo obrigatório no ticket de sucesso. Há também whitelist de comandos permitidos ao espectador; ela não equivale à implementação local de observação.

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

O manifesto atual tem **4.429 arquivos capturados, incluindo históricos**, com as 4.171 sheets. A travessia independente WHI contém 82 scripts e 670 referências literais, incluindo imports por efeito colateral, sem import faltante. Os 367 da auditoria inicial WHI abrangiam apenas `from`/`import()`. O worker `worker-OU3KHZRC.js`, fora dessa closure de imports ES, foi conferido separadamente e é byte a byte igual ao anterior. A auditoria antiga de 258 vínculos JS/worker/CSS não cobria 24 imports lazy; não comprovava closure completa. A comparação posterior registra 55 scripts presentes/226 referências ES/24 alvos faltantes naquele perfil antigo.

O plano finito derivado de código/metadados contém 96 caminhos: 22 imagens de wheel, 72 de spells e duas bordas de proficiency. Todos foram capturados e verificados por PIL; 94 eram novos em relação à base. O campo `scope` de `derived-resources-capture.json` foi herdado do plano e conserva a frase `no remote downloads`, referente à derivação de caminhos. A etapa posterior efetivamente fez os downloads: 96 recursos/96 registros, zero falhas e respostas HTTP de sucesso. O registro congelado não foi reescrito. Isso não autoriza expansão por combinações adivinhadas: imagens de perks/configurações fornecidos pelo servidor, receitas de imbuements e IDs de blessings continuam como famílias incompletas. Os 17 caminhos de arquivos do CSS foram conferidos, sem URLs externas; os SVGs `data:` são inline. A evidência de entrada tem 20 registros, incluindo HTML público consultado, CSS, worker e esses 17 arquivos.

O HTML público consultado já referia `main-6YGHWJTK.js`, diferente do main WHI observado na sessão. O HTML histórico WHI não foi recuperado. O `public/index.html` é um shell local próprio que referencia WHI/R5, sem se apresentar como a resposta HTML histórica do servidor.

A cidade local provisória utiliza **o terreno público de demonstração** `public/assets/gate/temple-terrain.json`: 1189 tiles e eye `{x:1071,y:1067,z:7}`. O backend conserva coordenadas e itens do arquivo e valida tiles bloqueados ao mover. Esse arquivo público não comprova que o mapa da cidade do servidor seja igual ao preview.

As caçadas usam um mapa de teste gerado pelo backend. Esse terreno não foi recuperado do servidor. O catálogo conserva o valor histórico de Rat e cinco representantes visuais selecionados; as demais espécies, incluindo as três novas, continuam sem aparência atribuída. A aparência não é equivalente à referência inteira.

## Backend implementado

Arquivo: `backend.cjs`, sem dependências externas. API exportada: `createBackend()` com `handleHttp`, `handleUpgrade` e `close`; o servidor estático do agente principal chama essas funções.

Revisão de 26/10: layout e favoritos são persistidos por personagem local e restaurados no bootstrap. O normalizador conserva as 18 chaves e os campos open/size/pos/picks aceitos pelo cliente; favoritos são IDs conhecidos, únicos e ordenados. A mensagem inicial de layout habilita o coletor original, antes inativo. Regressões com os codecs e validadores originais cobrem filtros, reconexão, reinício, isolamento e limpeza. O wire não comprova o escopo de armazenamento do servidor original; o escopo por personagem e a rejeição de envelopes malformados são políticas locais. `docs/preferencias-locais.md` detalha os contratos e limites.

Inclui conta local, seleção/criação/exclusão de personagens locais, admissão, codec binário compatível, WebSocket, snapshots, 84 caçadas, entrada/saída de caçada, combate automático de demonstração, atributos, gold/XP, inventário, equipamento, movimento na cidade, depot, loja NPC simples e configurações de barra/postura. Persiste os personagens em `data/local-state.json`.

O WebSocket exige versão 13, chave válida, frames mascarados, origem local com a mesma porta quando Origin existe e limite de 4 MiB para frame/mensagem fragmentada. O backend não conecta ao Huntera.

**Aproximações independentes:** dano aleatório, cadência de tick, progressão, loot, spawns, pesos seed, capacidade total seed e terreno de caçada. As 84 caçadas e seus 254 pulls conservam os campos visíveis observados; isso não recupera probabilidades, contagens de spawn, retratos e regras completas de cada área. Diversos comandos avançados devolvem indicação explícita de falta de implementação.

## Validação executada

`tests/compatibility.cjs` passou no candidato após as correções. Os testes usam o encoder `Je`, decoder `Qe` e validador `Fc` da compilação WHI, não uma cópia dos validadores do backend. O perfil capturado em [evidências](evidencias/perfil-cliente-WHI3EZUB.json) registra os bindings e hashes; seu `migrationReady:false` é histórico, não uma flag operacional ou aprovação de release.

Verificações: comandos originais são decodificados pelo backend; eventos locais são aceitos pelo decoder WHI; HTTP de admissão, conta e campanhas; handshake WebSocket; eventos de bootstrap aceitos pelo validador real; terrain precede instance; combate de demonstração; saída; movimento; ofertas NPC. Catálogo validado: 84 caçadas/254 pulls, incluindo nova scenarioId e favoritos persistidos. As chamadas de loopback exigiram execução fora do sandbox de rede na investigação.

Os testes provam interoperabilidade das mensagens exercitadas. Não provam equivalência das fórmulas, multiplayer, conteúdo integral ou fidelidade visual, que o agente principal verifica separadamente no navegador.

## Revisão posterior: Cyclopedia, integridade e caçadas observadas

`cyclopedia-request` devolve um catálogo validado pelo cliente WHI com 195 fichas de criaturas e 12 nomes de bosses. Os atributos numéricos, classes e resistências provêm das fichas observadas. O requisito de 2.500 abates foi conferido nos 186 textos de `bestiary-records.json`, nas seis adições anteriores e nas três de 26/10. Os registros armazenam dano recebido; o wire armazena resistência, convertido como `100 - danoRecebido`. A função real `Sc()` do cliente atual participa do teste: Amazon exibe 105% físico/morte e Flimsy Lost Soul exibe 0% morte. A correção também foi conferida na ficha de Amazon no navegador.

O DAT público fornece nomes/IDs/categorias de itens; os seus 1.280 outfits não têm nomes. A correspondência histórica de Rat é conservada. Cinco representantes visuais foram selecionados depois da comparação da grade e de poses de ficha: Adult Goanna 1195, Arachnophobica 1135, Blood Crab 200, Blood Priest 553 e Bog Raider 299. A seleção curada congelada usou 13 screenshots utilizáveis e rejeitou sete capturas vazias, com UI ou com a criatura anterior. A pesquisa consolidada posterior soma 36 screenshots: 29 utilizáveis e sete rejeitados, em três batches/9 tentativas de cinco espécies. `data/outfit-render-representatives-observed.json` registra hashes, decisões e limites e é fixado por SHA-256 no backend; alterações ou dados incompletos rejeitam o conjunto inteiro. Os cinco IDs canônicos e suas cores continuam null. Os diagnósticos separam 194 IDs canônicos desconhecidos de 189 retratos sem representante; estes usam outfitId=0. A comparação cobre sul estático e poses amostradas, sem fase exata/ciclo completo/outras direções. O campo também alimenta o spawn do mundo a oeste; esse uso permanece sem validação visual. As associações de itens a loot de criaturas só são preenchidas onde observadas. Classes de raridade soltas não determinam associações.

A revisão da base anterior confirmou 67 registros em `equipment-observed.json`, dos quais somente 26 possuem texto de tooltip. Entradas com `tooltip:null` não comprovam atributos. O catálogo atual usa a lista completa observada na interface, e os tooltips anteriores só suplementam campos quando o mesmo ID/nome/categoria e os valores compartilhados conferem. Campos de combate obrigatórios sem observação usam zero neutro de transporte, explicitamente registrado como **desconhecido**, e não como estatística recuperada. A rota local `/api/local/catalog-evidence` expõe a proveniência e os campos desconhecidos por item.

O backend dá preferência a `data/hunts-observed-current.json`. Conserva descrição, nomes dos tiers, lista global de criaturas e, para cada pull capturado, apenas as criaturas ativas e a ordem/raridade dos seus loots. Resolve moedas sem data-item-id por correspondência exata de nome no DAT. Não associa loot de um pull composto a uma criatura individual. A contagem de monstros, ausente na UI, fica na sentinela numérica 0 exigida pelo schema; não há consumidor visual desse campo nos demais JS capturados. Tiers/pulls ausentes são listados como lacunas e não ganham quantidades ou pesos inventados.

A fonte anterior conserva **83 caçadas e 251 pulls** (há caçadas com um ou quatro pulls), observados no DOM da versão `main-USP7XJJP.js` e inicialmente validados pelo baseline MUNRWAJS. Ela não foi reescrita. `data/hunt-rotten-wasteland-observed-20261026.json` acrescenta a 84ª caçada e três pulls, levando o conjunto a **84/254**, agora validados pelo cliente WHI. Todos os IDs/raridades de loot desses campos foram resolvidos; zero caçadas ou pulls faltantes. O arquivo-base tem aproximadamente 1,1 MB. Os testes conferem os pulls contra cada fonte e não uniformizam seus tiers.

A captura posterior da lista de itens percorreu **134 páginas e 1.070 IDs únicos**, sem páginas ausentes. O backend substitui o catálogo provisório de 811 itens pelos IDs e nomes exatos da lista, sem inserir um ID apenas por aparecer no loot. São 23 categorias observadas, 1.069 pesos, 187 ataques, 193 defesas, 156 armaduras, 74 alcances, 14 bônus de velocidade e 26 danos elementais. O peso de experience scroll (14758) não é exibido. O chip original `+-5` de depth calcei foi preservado e interpretado como velocidade -5, conforme a concatenação do renderer. Seis divergências com o DAT são registradas, com prioridade para a UI observada; por exemplo, experience scroll está na categoria Outros/9, embora o DAT indique 22. Gold coin (3031) aparece no loot mas não na lista dos 1.070 itens. A omissão de um chip não prova estatística zero. O rótulo antigo Uma mão também é um fallback do cliente e não comprova o booleano-fonte `twoHanded:false`.

O seed de sabre/cheese usava IDs incorretos; o DAT confirmou 3273/3607. A migração corrige esses itens pelos nomes/IDs específicos, preservando seus UIDs. O contador global de UID agora é recalculado a partir do estado e persistido; duplicatas anteriores são realocadas sem alterar os UIDs já únicos.

Mutação HTTP exige application/json, rejeita Origin externo e rejeita corpos null, arrays e primitivos com 400. APIs desconhecidas retornam 501 em vez de sucesso genérico. Os testes ampliados passaram: compatibilidade original, catálogo, preservação de dados por pull, rejeição de flags binárias reservadas, CSRF/conteúdo incorreto, disponibilidade após JSON null e unicidade de UIDs após reinício e compra.

Na etapa histórica dos 83 rosters e 251 pulls, a revisão independente confirmou zero divergências no merge. Seus dois achados foram corrigidos e revalidados: nomes objeto/número/null/array retornam 400 sem exceção em criação/rename; referências de inventário inválidas não expandem arrays, enquanto a troca válida continua funcionando. A limpeza dos testes engloba setup/fetch e foi verificada por falha injetada após listen, sem servidor remanescente. Essa revisão histórica não constitui aprovação da migração WHI inteira.

## Lacunas que impedem afirmar cópia 100%

O loot da caçada não comprova a tabela completa de uma criatura: mesmo uma caçada monoespécie pode omitir raridades presentes no Bestiary (observado com Ripper Spectre). A captura anterior das 192 fichas, em `data/bestiary-loot-observed-current.json`, recuperou 2.779 entradas, 803 IDs distintos e 660 máximos de quantidade. Mantém notas, ordem e duplicatas. Com as três fichas adicionais, o conjunto tem 195 espécies, 2.815 entradas e 662 máximos. Isso resolve a fonte das associações visíveis, não as probabilidades de drop.

O teste portátil usa uma pasta temporária própria para persistência. `close()` aguarda o encerramento dos sockets e suas gravações antes da limpeza, rejeita novos upgrades ao iniciar o encerramento e limpa os timers de movimento. Esses casos passaram pelo teste de integração.

A suíte portátil compara os 195 arrays de loot com suas fontes e após transporte WebSocket, preservando 2.815 entradas e 662 máximos. Dados inválidos (`max:null` ou loot vazio sem confirmação) continuam desconhecidos. Amazon e Ripper Spectre foram conferidos anteriormente no navegador local. Permanecem 194 IDs canônicos de outfit desconhecidos e 189 lacunas de desenho. Campos obrigatórios não observados usam valores neutros de transporte; isso não invalida os ataques/defesas/armaduras individuais efetivamente exibidos.

Não foram recuperados fórmulas autoritativas, RNG/drop rates, IA/pathfinding do servidor, mapas privados, persistência/concorrência original, economia/RMT, guildas, quests/bosses, arena, forja/imbuements transacionais, wheel e demais regras avançadas. A compilação pública torna vários contratos e dados observáveis; não fornece todos os algoritmos ou o estado do servidor.

## Fichas acrescentadas em 26/10

A referência `main-WHI3EZUB.js` expõe 195 criaturas e 84 caçadas. Branchy Crawler, Mould Phantom e Rotten Golem foram capturados por texto e atributos DOM renderizados; seus 36 loots e dois máximos foram preservados, com raw e hash em `data/new-monsters-observed-20261026.json`. O catálogo local contém 195 criaturas/2.815 entradas/662 máximos, com fontes separadas de 192+3. Os três outfits e IDs canônicos continuam desconhecidos; slugs de nome são apenas identificadores locais. A adição completa é fixada por hash e rejeitada em conjunto, sem perder as 192 fichas anteriores. O teste RED inicial mostrou 192 em vez de 195; os testes posteriores confrontam atributos e bandas DOM e passam pelo decoder original.

Rotten Wasteland foi observada no catálogo original em Agressivo/Suicida/Hardcore, cada um com três espécies e 27 itens ordenados por Peso. A quantidade de spawn permanece desconhecida. O enum antigo de 83 IDs rejeitava catálogo, favoritos e scenarioId novos; a migração do conjunto WHI/R5 permite a ID real, sem patch isolado no enum. A fonte curada é fixada por hash, e nove casos inválidos preservam as 83/251 anteriores com diagnóstico de incompletude. `docs/conteudo-20261026.md` registra as fontes e os limites. Nenhuma compra, recompensa ou caçada original foi executada.

A auditoria do navegador local de 27/10 confirmou personagens → cidade, `HUNT 84`, três tiers/27 linhas de loot, entrada na instância de teste, término do carregamento e retorno à cidade. Permaneceram o erro `ResizeObserver`, aviso `unknown outfit 0` para arte desconhecida e toast de `daily-boss-open` não implementado. Esses registros foram preservados. Não se afirma aqui aprovação independente da release inteira nem cópia 100% fiel.
