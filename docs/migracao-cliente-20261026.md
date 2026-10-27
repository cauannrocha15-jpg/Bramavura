# Migração do cliente observado em 26/10

O conjunto ativo é `main-WHI3EZUB.js` com `styles-R5EQY622.css`, observados na mesma sessão. O baseline MUNRWAJS rejeitava a nova ID de Rotten Wasteland; por isso a migração troca a closure completa, os bindings de codec/schema e o catálogo, sem patch isolado no enum ou mistura de chunks ativos. Este registro delimita verificações executadas; não declara aprovação da release inteira nem fidelidade integral ao servidor.

## Perfil e recursos

O [perfil de evidência capturado](evidencias/perfil-cliente-WHI3EZUB.json) foi copiado sem alterar bytes: SHA-256 `32e5fa8efdf1ce81deee938384cd0cfb6153d016dc30424a74771c9c92f0c25c`. Seu `migrationReady:false` conserva o estado histórico da análise em quarentena. Não é uma flag operacional nem o status atual de publicação. Os caminhos de pesquisa dentro dele registram proveniência; não são dependências para executar o pacote.

| Verificação | Resultado e escopo |
| --- | --- |
| Manifesto de captura | 4.429 arquivos, incluindo históricos; não significa 4.429 recursos ativos ou cobertura integral do jogo |
| Imports literais | 82 scripts WHI, 670 referências na travessia independente, incluindo efeito colateral, nenhum alvo faltante; não cobre templates dinâmicos |
| Worker | `worker-OU3KHZRC.js` verificado separadamente, byte a byte igual ao anterior |
| Recursos concretos derivados | 96 caminhos capturados e verificados por PIL: 22 wheel, 72 spells, duas bordas de proficiency; 94 eram novos |
| CSS e entrada | 17 caminhos de arquivos locais do CSS, sem URLs externas; SVGs `data:` inline. Evidência de entrada com 20 registros: consulta HTML, CSS, worker e os 17 arquivos |

A auditoria antiga de 258 vínculos JS/worker/CSS tinha escopo menor e deixou 24 imports lazy fora da cobertura. A comparação posterior do baseline encontrou 55 scripts presentes, 226 referências ES e 24 alvos faltantes. A auditoria inicial WHI contava 367 referências somente de `from`/`import()`; a travessia independente ampliou a cobertura a 670, incluindo efeito colateral. A alegação anterior não deve ser lida como closure completa; arquivos capturados agora não são automaticamente funcionalidades novas.

O HTML público consultado já carregava `main-6YGHWJTK.js`, diferente do WHI da sessão. O HTML histórico WHI não foi recuperado. O `public/index.html` é um shell local próprio que referencia WHI/R5. Esse limite continua explícito no manifesto.

O campo `scope` de `derived-resources-capture.json` foi herdado do plano e contém `no remote downloads`: descreve a derivação dos caminhos, antes da coleta. A fase seguinte realmente baixou os recursos: `capturedResources:96`, 96 `records`, zero falhas e respostas HTTP de sucesso. O código de captura exige resposta bem-sucedida do domínio original e conteúdo de imagem; o JSON não guarda o status numérico individual. A prova congelada foi conservada sem alteração.

As famílias dependentes de dados do servidor continuam abertas: configurações de perks/proficiency, receitas de imbuements e IDs de blessings. O plano de 96 caminhos concretos não foi expandido por combinações adivinhadas e não prova cobertura de todas essas famílias.

## Contratos e conteúdo

As tabelas literais WHI têm 193 mensagens servidor → cliente e 213 cliente → servidor. Os códigos dos 192/211 nomes comuns foram preservados; `hunt-report:199`, `bosstiary-pattern:216` e `hunt-report-request:217` são adições observadas, sem inferência por ordem. Os testes usam encoder `Je`, decoder `Qe` e schema `Fc` originais. Envelope, versão `0.3.0+e0`, ping de 5 segundos e admissão normal mantêm os contratos examinados.

O catálogo combina 83 caçadas/251 pulls preservados com Rotten Wasteland/3 pulls, totalizando **84/254**. Cada novo pull conserva três espécies e 27 loots na ordenação visual Peso. A moeda sem ID no DOM resolve no DAT por nome exato, crystal coin → 3043. Fontes inválidas rejeitam a nova caça inteira e preservam a base anterior. Quantidades de spawn usam a sentinela desconhecida 0, sem inventar pesos ou probabilidades.

Continuam **195 criaturas, 1.070 itens, 2.815 entradas de loot individual e 662 máximos**. As fontes de 192+3 criaturas são separadas; os outfits das três novas e os IDs canônicos permanecem desconhecidos.

## Verificação local e pendências

`npm run verify` confere os bytes contra o manifesto; `npm test` exercita os codecs/schema WHI, catálogo, favoritos, nova scenarioId, rejeições de fontes, inventário e persistência. Esses testes demonstram os contratos cobertos, não equivalência dos algoritmos do servidor.

O [registro do navegador](evidencias/navegador-WHI3EZUB.json), de 27/10 às 00:16:58 UTC, tem SHA-256 `6af4a3ebf0c0ef406a62ca30fd69f1250ddacfbe8b19d6643d19bd9aecea15df`. Observou personagens → cidade, `HUNT 84`, três dificuldades/27 linhas de loot, entrada na instância local, carregamento concluído e retorno à cidade. O console conservou `ResizeObserver` e `unknown outfit 0`; a UI indicou `daily-boss-open` não implementado.

Mapas e combate dessa instância são simulações locais. `hunt-report`, `hunt-report-request`, regras de Bosstiary e outros sistemas avançados seguem incompletos. O aviso de outfit 0 corresponde à arte desconhecida e não foi ocultado. A [revisão independente](evidencias/revisao-migracao-WHI3EZUB.md) aprovou esta fatia de compatibilidade, sem bloqueadores de código; sua [conferência](evidencias/conferencia-migracao-WHI3EZUB.json) registra os hashes, mapas e imports. Esse parecer não certifica equivalência integral do jogo. **A cópia 100% fiel ainda não foi alcançada.**
