# Huntera local — reconstrução em andamento

Esta pasta executa uma cópia capturada do cliente público do Huntera, acompanhada de um servidor local de compatibilidade. **Ainda não é uma cópia 100% fiel do jogo completo.**

## Executar

Requer Node.js 22 ou mais recente, sem instalar pacotes. No Windows, execute `iniciar.cmd`, ou use:

```powershell
node server.cjs
```

Abra <http://127.0.0.1:4173/characters>. Execute o comando a partir desta pasta. Para encerrar, pressione Ctrl+C. O servidor escuta somente em 127.0.0.1. A política de conteúdo limita as conexões do cliente à máquina local.

Os personagens e o progresso desta cópia são gravados em `data/local-state.json`. A conta é fictícia e local; não utiliza as credenciais ou a economia da conta original.

Verificações reexecutáveis, a partir desta pasta:

```powershell
npm run verify
npm test
```

`verify` confere os arquivos capturados contra o manifesto. `test` exercita o protocolo e alguns fluxos locais com o codec e os validadores do cliente. Nenhum desses comandos comprova equivalência integral ao servidor original.

## Evidência disponível

- Cliente capturado em 23/10/2026: `main-MUNRWAJS.js`, `styles-UOXUFPLO.css` e dependências.
- Todas as 4.171 folhas de sprites do catálogo `things/1332` e o arquivo de appearances foram capturados.
- Auditoria estática de recursos: 4.275 arquivos únicos conferidos por tamanho/SHA-256; 258 referências JS/worker/CSS resolvidas. Isso verifica a captura, não a equivalência de gameplay.
- Seleção de personagem e entrada no mundo local observadas no navegador. O console não apresentou erros nesse fluxo após a correção dos contratos HTTP.
- Ao abrir painéis e transitar para uma caçada, foi observado um erro `ResizeObserver loop completed with undelivered notifications` no cliente capturado. A causa ainda precisa ser verificada.
- O backend usa o envelope binário e os opcodes reconhecidos pelo cliente capturado. Testes de compatibilidade usam o decoder e os validadores reais desse cliente.
- Layout das 18 janelas reconhecidas e favoritos de caçadas agora são gravados e restaurados entre sessões e reinícios. A normalização segue o cliente capturado; a política local de armazenamento por personagem e seus limites estão em [preferências locais](docs/preferencias-locais.md).
- O catálogo de caçadas tem dados observados nas 83 telas: descrições, nomes das dificuldades, 251 composições de pull, ordem e raridade do loot e 774 nomes de itens. `data/hunts-observed-current.json` conserva essas observações. As quantidades de monstros por pull não aparecem na interface e continuam desconhecidas.
- A Cyclopedia recebeu fichas observadas de 192 criaturas. O teste usa a função real do cliente para conferir a conversão entre resistência e dano recebido (Amazon: 105% físico/morte; Flimsy Lost Soul: 0% morte).
- Cinco retratos receberam representantes visuais comparados com a referência: Adult Goanna, Arachnophobica, Blood Crab, Blood Priest e Bog Raider. A seleção usa a aparência ao sul e poses amostradas; os IDs canônicos do servidor e as cores continuam desconhecidos. A proveniência está em `data/outfit-render-representatives-observed.json`. O diagnóstico distingue 191 IDs canônicos desconhecidos de 186 retratos ainda sem representante. Outras direções, o ciclo inteiro e seu uso nos monstros do mundo ainda não foram validados.
- O catálogo completo de itens foi percorrido pela interface: 1.070 IDs únicos em 134 páginas, com nomes, categorias e slots exibidos. `data/item-catalog-observed-current.json` conserva os textos originais e campos desconhecidos. Foram observados 1.069 pesos, 187 ataques, 193 defesas, 156 armaduras, 74 alcances, 14 bônus de velocidade e 26 danos elementais. Campos ausentes continuam desconhecidos; zeros obrigatórios do protocolo são apenas valores neutros de transporte. Atributos anteriores de tooltip só são reaproveitados quando a identidade e os valores em comum conferem.
- O loot visível das 192 fichas do Bestiary foi capturado diretamente: 2.779 entradas, 803 IDs distintos e 660 máximos de quantidade exibidos. `data/bestiary-loot-observed-current.json` conserva raridades, ordem, duplicatas e notas originais. Isso não fornece probabilidades de drop. Retratos e propriedades de itens ainda não confirmados continuam sendo lacunas.

## Limites que continuam abertos

Esta entrega conserva o cliente de 23/10 e os catálogos observados até 24/10, com revisão de cinco retratos até 26/10. Na referência autenticada de 26/10, `main-DJ6ZN7HP.js` e depois `main-WHI3EZUB.js`, já foram observadas 195 criaturas; o enum passou a 84 caçadas com Rotten Wasteland. Esses acréscimos ainda não estão integrados. Foram conferidos o mesmo DAT e a compatibilidade dos helpers dos retratos nessas versões; isso não comprova equivalência do cliente inteiro.

O código do servidor original não foi recuperado. Fórmulas de combate e progressão, RNG, probabilidades de loot, IA, mapas de caçadas, banco de dados e regras transacionais continuam sem prova de equivalência. As rotinas locais correspondentes são simulações explícitas para permitir o teste do cliente.

O catálogo possui 83 caçadas com dados visíveis conferidos, mas não recupera probabilidades de drop, pesos de spawn ou os mapas. Retratos de criaturas sem representante selecionado ficam sem imagem. Loja, mercado, guildas, quests, bosses, arena, treino, prey, forja e outros sistemas ainda têm contratos parciais ou não estão implementados no servidor local. A simples presença desses painéis no cliente não significa que estejam completos.

O objetivo continua sendo a reprodução integral pedida. Esta versão é uma etapa verificável de captura e compatibilidade, não uma declaração de conclusão.

A [auditoria de conclusão](docs/estado-da-reconstrucao.md), a [análise de fontes e limites](docs/fontes-e-limites.md) e a [comparação entre versões capturadas](docs/analise-versoes.md) detalham a evidência e o trabalho que falta.
