# Estado da reconstrução de Huntera

Objetivo preservado: fazer engenharia reversa de https://huntera.com.br/characters e copiar o jogo com 100% de fidelidade.

## Entrega atual

`huntera-local/` contém o cliente capturado e um servidor local sem dependências externas. A tela de personagens e a entrada no mundo já foram observadas em execução. As folhas de sprites e dependências capturadas passaram pela auditoria estática.

## Auditoria de conclusão

| Requisito | Estado | Evidência/pendência |
| --- | --- | --- |
| Aparência da seleção de personagens | Parcialmente verificada | Mesmo cliente/CSS/frames; seleção e entrada observadas; estados e dados de conta ainda diferem |
| Arte e renderizador do mundo | Capturados; teste parcial | 4.171 sheets, appearances e renderizador original; mapa completo do servidor não disponível |
| Protocolo e bootstrap local | Compatibilidade parcial | Codec/opcodes e teste com validadores reais do cliente |
| Layout e favoritos | Persistência local verificada | 18 janelas, favoritos válidos/ordenados, reconexão e reinício; escopo por personagem é política local, não recuperada do servidor |
| Catálogo visível de caçadas | Captura e integração verificadas nos campos observados | 83 caçadas, 251 pulls e 774 nomes de itens; testes com codec original e conferência visual de dificuldades, espécies e loot |
| Cyclopedia e Bestiary | Lista completa de itens, atributos e loot individual integrados; equivalência parcial | 192 criaturas; 1.070 itens observados em 134 páginas, com campos e desconhecidos comparados por testes; 2.779 entradas de loot e 660 máximos preservados; retratos e atributos omitidos pela UI ainda incompletos |
| Retratos das criaturas | Cinco representantes visuais selecionados | Adult Goanna, Arachnophobica, Blood Crab, Blood Priest e Bog Raider; 13 capturas de ficha utilizáveis e sete rejeitadas. IDs canônicos e cores desconhecidos; outras direções/ciclo completo ainda não validados |
| Combate, IA, loot, progressão | Não equivalentes comprovados | Implementação local provisória; fórmulas originais desconhecidas |
| Mapas e conteúdo integral | Incompletos | Terreno público do templo capturado; mapas de instâncias/caçadas não recuperados |
| Todos os subsistemas online | Incompletos | Backend ainda não implementa todos os comandos, persistência e regras do original |
| Cópia 100% fiel | Não alcançada | Exige evidência funcional ampla e informação adicional sobre o servidor |

Não usar hashes de arquivos, testes de codec ou a presença das telas como prova de equivalência integral. Nenhum pagamento real faz parte desta versão. O repositório escolhido para guardar esta etapa é cauannrocha15-jpg/Bramavura; o jogo continua sendo executado localmente.

Na referência de 26/10, a interface exibe 195 criaturas e o enum acrescenta Rotten Wasteland como a 84ª caçada. A entrega mantém a captura anterior de 192 criaturas/83 caçadas, ainda sem esses acréscimos. A pesquisa de retratos revisou as 192 referências anteriores: 134 aparências estáticas coerentes, 33 formas com paleta não verificada e 25 casos retidos; nenhuma nova atribuição canônica foi integrada. A exportação própria de 101 representantes produziu 557 frames, conferidos com o helper original em dez representantes. Animações e demais direções continuam em verificação.

Cinco desses representantes foram selecionados para desenho no catálogo e nas caçadas após comparação de fichas: 1195, 1135, 200, 553 e 299, respectivamente. O campo obrigatório `outfitId` transporta a seleção visual local; não recupera o ID do servidor. `unknownOutfits` conserva 191 nomes e `unknownRenderAppearances` passa a 186. Nenhuma paleta aproximada foi atribuída. A fonte curada é fixada por SHA-256 e rejeitada integralmente se faltar ou divergir; os testes cobrem os cinco registros, o transporte original e 11 casos inválidos. O fluxo existente também usa esse campo no spawn do mundo, iniciado a oeste; esse uso extrapola as direções observadas e permanece sem validação visual.
