# Estado da reconstrução de Huntera

Objetivo preservado: fazer engenharia reversa de https://huntera.com.br/characters e copiar o jogo com 100% de fidelidade.

## Entrega atual

A pasta contém o conjunto observado `main-WHI3EZUB.js` / `styles-R5EQY622.css` e um servidor local sem dependências externas. O manifesto conserva 4.429 arquivos capturados, incluindo históricos. O navegador local confirmou personagens → cidade, abertura da 84ª caça, entrada na instância, término do carregamento e retorno à cidade. Isso valida os fluxos observados, não a equivalência integral do servidor.

## Auditoria de conclusão

| Requisito | Estado | Evidência/pendência |
| --- | --- | --- |
| Aparência da seleção de personagens | Parcialmente verificada | Cliente WHI/CSS R5 observados; seleção e entrada conferidas; shell HTML próprio e dados de conta locais |
| Arte e renderizador do mundo | Capturados; teste parcial | 4.171 sheets, appearances e renderizador original; mapa completo do servidor não disponível |
| Protocolo e bootstrap local | Compatibilidade parcial | Tabelas literais de 193 opcodes servidor/213 cliente; codec e schema WHI originais; funcionalidades avançadas ainda incompletas |
| Layout e favoritos | Persistência local verificada | 18 janelas, favoritos válidos/ordenados, reconexão e reinício; escopo por personagem é política local, não recuperada do servidor |
| Catálogo visível de caçadas | Captura e integração verificadas nos campos observados | 84 caçadas/254 pulls: base 83/251 preservada mais Rotten Wasteland/3 pulls; três tiers/27 loots conferidos no navegador local |
| Cyclopedia e Bestiary | Lista completa de itens, atributos e loot individual integrados; equivalência parcial | 195 criaturas; 1.070 itens observados em 134 páginas, com campos e desconhecidos comparados por testes; 2.815 entradas de loot e 662 máximos preservados; retratos e atributos omitidos pela UI ainda incompletos |
| Retratos das criaturas | Cinco representantes visuais selecionados | Adult Goanna, Arachnophobica, Blood Crab, Blood Priest e Bog Raider; Pesquisa consolidada: 36 screenshots, 29 utilizáveis e sete rejeitados em três batches/9 tentativas de cinco espécies. IDs canônicos e cores desconhecidos; outras direções/ciclo completo ainda não validados |
| Recursos estáticos da migração | Cobertura delimitada verificada | 82 scripts/670 imports literais, incluindo efeito colateral, sem faltas; worker idêntico; 96 recursos derivados capturados, 17 caminhos locais do CSS; famílias dependentes do servidor ainda abertas |
| Combate, IA, loot, progressão | Não equivalentes comprovados | Implementação local provisória; fórmulas originais desconhecidas |
| Mapas e conteúdo integral | Incompletos | Terreno público do templo capturado; mapas de instâncias/caçadas não recuperados |
| Todos os subsistemas online | Incompletos | Backend ainda não implementa todos os comandos, persistência e regras do original |
| Cópia 100% fiel | Não alcançada | Exige evidência funcional ampla e informação adicional sobre o servidor |

Não usar hashes de arquivos, testes de codec ou a presença das telas como prova de equivalência integral. Nenhum pagamento real faz parte desta versão. O repositório escolhido para guardar esta etapa é cauannrocha15-jpg/Bramavura; o jogo continua sendo executado localmente.

Na referência de 26/10, a interface exibe 195 criaturas e Rotten Wasteland é a 84ª caçada. O conjunto WHI integra os três novos pulls sem modificar a base anterior. A pesquisa de retratos revisou as 192 referências anteriores: 134 aparências estáticas coerentes, 33 formas com paleta não verificada e 25 casos retidos; nenhuma nova atribuição canônica foi integrada. A exportação própria de 101 representantes produziu 557 frames, conferidos com o helper original em dez representantes. Animações e demais direções continuam em verificação.

Cinco desses representantes foram selecionados para desenho no catálogo e nas caçadas após comparação de fichas: 1195, 1135, 200, 553 e 299, respectivamente. O campo obrigatório `outfitId` transporta a seleção visual local; não recupera o ID do servidor. `unknownOutfits` conserva 194 nomes e `unknownRenderAppearances` contém 189, incluindo as três novas criaturas sem retrato atribuído. Nenhuma paleta aproximada foi atribuída. A fonte curada é fixada por SHA-256 e rejeitada integralmente se faltar ou divergir; os testes cobrem os cinco registros, o transporte original e 11 casos inválidos. O fluxo existente também usa esse campo no spawn do mundo, iniciado a oeste; esse uso extrapola as direções observadas e permanece sem validação visual.

As três fichas de 26/10 acrescentam 36 entradas de loot e dois máximos às 192 fichas anteriores, preservadas em sua própria fonte. O catálogo combinado passa nos validadores e no decoder WHI com 195 espécies. A fonte adicional é fixada por hash; sete casos de rejeição conservam o baseline de 192. A fonte de Rotten Wasteland também é fixada por hash; nove casos inválidos retornam às 83/251 anteriores, com diagnóstico de cobertura incompleta.

A auditoria antiga de 258 referências não abrangia 24 imports lazy e não provava captura completa. A auditoria independente atual cobre 670 imports literais, incluindo efeito colateral, e o worker separadamente. Os 367 da auditoria inicial WHI cobriam apenas `from`/`import()`. Os 96 recursos concretos derivados do código/metadados foram capturados (94 novos) e decodificados por PIL; isso não esgota famílias que dependem de dados do servidor. Os 20 registros de recursos de entrada incluem a consulta do HTML público, CSS, worker e 17 arquivos locais do CSS, sem URLs externas.

O HTML público consultado usa `main-6YGHWJTK.js`; ele não é o HTML histórico WHI. O shell local próprio usa os arquivos WHI/R5 observados. No navegador persistem `ResizeObserver`, aviso de outfit 0 e a indicação `daily-boss-open` não implementado. `hunt-report`/`bosstiary-pattern`, mapas, combate e demais sistemas continuam com os limites descritos em [migração do cliente](migracao-cliente-20261026.md). O perfil de evidência preservado não constitui aprovação da release inteira.
