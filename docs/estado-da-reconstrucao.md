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
| Catálogo visível de caçadas | Captura e integração verificadas nos campos observados | 83 caçadas, 251 pulls e 774 nomes de itens; testes com codec original e conferência visual de dificuldades, espécies e loot |
| Cyclopedia e Bestiary | Atributos e loot individual integrados e verificados | 192 criaturas, 811 itens com categoria confirmada; 2.779 entradas de loot e 660 máximos comparados por testes; Amazon/Ripper conferidos no navegador; retratos e propriedades de itens ainda incompletos |
| Combate, IA, loot, progressão | Não equivalentes comprovados | Implementação local provisória; fórmulas originais desconhecidas |
| Mapas e conteúdo integral | Incompletos | Terreno público do templo capturado; mapas de instâncias/caçadas não recuperados |
| Todos os subsistemas online | Incompletos | Backend ainda não implementa todos os comandos, persistência e regras do original |
| Cópia 100% fiel | Não alcançada | Exige evidência funcional ampla e informação adicional sobre o servidor |

Não usar hashes de arquivos, testes de codec ou a presença das telas como prova de equivalência integral. Nenhum pagamento real faz parte desta versão. O repositório escolhido para guardar esta etapa é cauannrocha15-jpg/Bramavura; o jogo continua sendo executado localmente.
