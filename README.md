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

- Perfil ativo observado em 26/10/2026: `main-WHI3EZUB.js`, `styles-R5EQY622.css` e suas dependências. Os arquivos históricos de 23/10 foram conservados.
- Todas as 4.171 folhas de sprites do catálogo `things/1332` e o arquivo de appearances foram capturados.
- O manifesto contém 4.429 arquivos capturados, incluindo históricos. A travessia independente da closure ativa tem 82 scripts e 670 referências literais, incluindo imports por efeito colateral, sem alvo faltante; o worker foi conferido separadamente e é byte a byte igual ao anterior. Foram capturados os 96 recursos concretos derivados do código/metadados (94 novos), com verificação das imagens por PIL, além dos 17 caminhos locais referidos pelo CSS, sem URLs externas. Isso não cobre todas as famílias dinâmicas dependentes do servidor.
- A auditoria antiga de 258 referências JS/worker/CSS tinha escopo menor: 24 imports lazy ficaram fora da cobertura. Ela não comprovava uma closure completa. A comparação atual registra essa lacuna histórica explicitamente. A contagem inicial WHI de 367 cobria somente `from`/`import()`, antes da verificação independente de 670.
- No navegador local foram observados personagens → cidade, catálogo `HUNT 84`, três dificuldades/27 linhas de loot de Rotten Wasteland, entrada na instância local, término do carregamento e retorno à cidade.
- Permanecem o erro `ResizeObserver loop completed with undelivered notifications` e o aviso `unknown outfit 0`, ligado à arte ainda desconhecida. A UI também informou `daily-boss-open` não implementado. Esses registros não foram ocultados.
- O backend usa o envelope binário e os 193 opcodes servidor → cliente / 213 cliente → servidor extraídos das tabelas WHI. Os testes usam o decoder e os validadores reais; a presença de um opcode não significa funcionalidade implementada.
- Layout das 18 janelas reconhecidas e favoritos de caçadas agora são gravados e restaurados entre sessões e reinícios. A normalização segue o cliente capturado; a política local de armazenamento por personagem e seus limites estão em [preferências locais](docs/preferencias-locais.md).
- O catálogo tem 84 caçadas e 254 pulls: as 83/251 da fonte anterior, preservada em `data/hunts-observed-current.json`, mais Rotten Wasteland e seus três pulls em `data/hunt-rotten-wasteland-observed-20261026.json`. Cada novo pull conserva três espécies e 27 loots na ordem visual Peso. Quantidades de monstros, probabilidades, pesos de spawn e mapas continuam desconhecidos.
- A Cyclopedia recebeu fichas observadas de 195 criaturas: as 192 da captura anterior e Branchy Crawler, Mould Phantom e Rotten Golem observados em 26/10. Os textos e o loot dessas três estão em `data/new-monsters-observed-20261026.json`. O teste usa a função real do cliente para conferir a conversão entre resistência e dano recebido (Amazon: 105% físico/morte; Flimsy Lost Soul: 0% morte).
- Cinco retratos receberam representantes visuais comparados com a referência: Adult Goanna, Arachnophobica, Blood Crab, Blood Priest e Bog Raider. A seleção usa a aparência ao sul e poses amostradas; os IDs canônicos do servidor e as cores continuam desconhecidos. A proveniência está em `data/outfit-render-representatives-observed.json`. O diagnóstico distingue 194 IDs canônicos desconhecidos de 189 retratos ainda sem representante. Outras direções, o ciclo inteiro e seu uso nos monstros do mundo ainda não foram validados.
- O catálogo completo de itens foi percorrido pela interface: 1.070 IDs únicos em 134 páginas, com nomes, categorias e slots exibidos. `data/item-catalog-observed-current.json` conserva os textos originais e campos desconhecidos. Foram observados 1.069 pesos, 187 ataques, 193 defesas, 156 armaduras, 74 alcances, 14 bônus de velocidade e 26 danos elementais. Campos ausentes continuam desconhecidos; zeros obrigatórios do protocolo são apenas valores neutros de transporte. Atributos anteriores de tooltip só são reaproveitados quando a identidade e os valores em comum conferem.
- O loot visível das 195 fichas do Bestiary foi capturado diretamente: 2.815 entradas e 662 máximos de quantidade exibidos. `data/bestiary-loot-observed-current.json` conserva a captura anterior de 192 fichas/2.779 entradas; a fonte adicional de 26/10 acrescenta três fichas/36 entradas. Raridades, ordem, duplicatas e notas são preservadas, com as duas fontes explicitadas nos diagnósticos. Isso não fornece probabilidades de drop. Retratos e propriedades de itens ainda não confirmados continuam sendo lacunas.

## Limites que continuam abertos

O cliente foi migrado como conjunto WHI/R5, com contratos e catálogo de 84 IDs. O HTML público consultado já apontava para `main-6YGHWJTK.js`, diferente da sessão observada; o HTML histórico WHI não foi recuperado. Por isso `public/index.html` é um shell local próprio, que carrega o main e o CSS observados. A [migração do cliente](docs/migracao-cliente-20261026.md) registra a evidência e seus limites; o [conteúdo de 26/10](docs/conteudo-20261026.md) distingue as fontes dos catálogos.

O código do servidor original não foi recuperado. Fórmulas de combate e progressão, RNG, probabilidades de loot, IA, mapas de caçadas, banco de dados e regras transacionais continuam sem prova de equivalência. As rotinas locais correspondentes são simulações explícitas para permitir o teste do cliente.

O catálogo possui 84 caçadas com dados visíveis conferidos, mas não recupera probabilidades de drop, pesos de spawn ou os mapas. Os retratos das três novas criaturas permanecem desconhecidos. Loja, mercado, guildas, quests, bosses, arena, treino, prey, forja e outros sistemas ainda têm contratos parciais ou não estão implementados no servidor local. `hunt-report` e `bosstiary-pattern` também continuam incompletos. A simples presença desses painéis no cliente não significa que estejam completos.

O objetivo continua sendo a reprodução integral pedida. Esta versão é uma etapa verificável de captura e compatibilidade, não uma declaração de conclusão.

A [auditoria de conclusão](docs/estado-da-reconstrucao.md), a [análise de fontes e limites](docs/fontes-e-limites.md) e a [comparação entre versões capturadas](docs/analise-versoes.md) detalham a evidência e o trabalho que falta.
