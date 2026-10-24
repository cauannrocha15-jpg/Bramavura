# Mudança de versão observada durante a captura

Em 23/10/2026, a referência passou de `main-MUNRWAJS.js` para `main-USP7XJJP.js` enquanto a investigação estava em andamento. O cliente executável da entrega permanece fixado na primeira compilação; as 83 telas de caçada foram observadas na segunda e seus dados foram validados pelo cliente fixado.

Foram capturados os 47 arquivos do fechamento de imports estáticos do novo main, sem falhas. A comparação identificou 27 arquivos idênticos por bytes e outros com nomes/imports/aliases alterados pela recompilação. As alterações de corpo isoladas concentram-se no componente principal do jogo e no módulo de validadores/constantes compartilhadas.

O corpo do módulo de transporte/codec é idêntico após retirar os imports: `chunk-L7RK2YWL.js` e `chunk-OJ2AHEWS.js`. Isso não prova que todos os fluxos de aplicação sejam equivalentes.

A mudança localizada no componente do jogo afeta a disponibilidade da pesquisa: o novo `pollWindow` consulta explicitamente os estados de tutorial `done` e `training-home`. O módulo compartilhado remove um predicado que excluía vários estados do tutorial e renumera identificadores/export aliases. A análise não demonstrou alterações nas fórmulas do servidor.

Não substituir apenas o arquivo main ao atualizar: o grafo de imports e os módulos carregados sob demanda precisam ser mantidos consistentes. Uma atualização futura deverá capturar também as rotas de personagens/login correspondentes e repetir os testes de codec, contratos e navegador. Nenhuma comparação desses arquivos prova fidelidade de 100% ao jogo completo.
