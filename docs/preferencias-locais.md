O servidor local agora salva layout e favoritos e os restaura no bootstrap da próxima sessão. Antes, layout era ignorado e favoritos eram somente devolvidos à sessão atual. A ausência de `window-layout` também deixava desativado o envio de alterações pelo próprio cliente capturado.

Os contratos vêm de `chunk-JRE7IT7W.js`, `chunk-LPHOZM5K.js`, `chunk-RLNSICFX.js` e `chunk-L7RK2YWL.js` do manifesto capturado. As mensagens usam `set-window-layout`/83, `window-layout`/104, `set-hunt-favorites`/173 e `hunt-favorites`/176.

O layout reconhece 18 janelas: inventory, loot, analyzer, dps-analyzer, character, cyclopedia, friends, hunt, prey, chat, debug, highscores, guild, expeditions, bestiary, proficiency, imbuements e boss-route. Conserva somente os campos aproveitáveis do contrato:

| Campo | Normalização do cliente |
| --- | --- |
| open | Booleano |
| size | Até seis chaves de 1–24 caracteres; números finitos, arredondados a meio ponto e limitados a −10000…10000 |
| pos | x/y finitos, arredondados e limitados a 0…20000 |
| picks | Até dez strings de 1–64 caracteres; lista vazia explícita preservada |

Favoritos devem ser IDs conhecidos do catálogo capturado, únicos e na ordem recebida. A lista vazia remove todos. Um objeto vazio de layout limpa o snapshot. Envelopes malformados não apagam um snapshot válido: essa guarda é uma política local mais restrita que o normalizador de recepção do cliente.

O armazenamento usa os personagens e o arquivo JSON local já existentes. O wire público não demonstra se o servidor original organiza essas preferências por personagem, conta ou dispositivo; o escopo por personagem é uma escolha local documentada. Não há sincronização imediata entre duas sessões simultâneas. A restauração ocorre na entrada da sessão, e a UI original continua responsável pelo debounce e pelo comportamento em telas pequenas.

A suíte portátil compara a normalização com o validador original, transporta as mensagens pelo codec original e verifica todas as 18 chaves, filtros, limites, ordem dos favoritos, comandos malformados, reconexão, reinício do backend, isolamento e limpeza persistente. A regressão falhou antes da correção e passou depois. Uma mutação somente em memória que desativou a gravação voltou a fazê-la falhar. Esses testes comprovam o comportamento local exercitado, sem recuperar a política do servidor original.
