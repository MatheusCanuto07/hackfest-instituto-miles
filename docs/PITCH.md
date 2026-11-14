# Pitch · Hackfest MILES 2026 · Trilha Faturamento

Guia do que precisa estar no pitch, com base no **Edital**, na **Retificação nº 01** e nos **Critérios de Avaliação** (pasta `docs/`). Trechos marcados com **[PREENCHER]** dependem de informação da equipe, principalmente da visita técnica.

---

## 1. Regras do pitch (o que o edital exige)

| Regra | Item do edital |
|---|---|
| Desenvolvimento das 06h30 às 18h30; **18h30–19h00** para preparar a apresentação; pitch a partir das **19h00** | 5.3.2, 5.3.3, Tabela 2 |
| Pitch de **no máximo 5 minutos**, no palco, diante da banca da trilha | 5.3.3, 8.1 |
| **Os 5 integrantes da saúde precisam estar presentes no pitch**, senão a equipe é desclassificada | 4.6, 5.4.4 |
| A banca pode pedir **demonstração ao vivo** para verificar a autoria | 8.2 |
| Banca com profissionais de saúde, tecnologia e inovação, **incluindo FHEMIG e FELUMA** | 9.4 |
| **Declarar o uso de IA generativa**: ferramenta e finalidade | 7.3 |
| **Citar todas as fontes**: bibliotecas, APIs, bases públicas. Omitir fonte desclassifica | 7.2 |
| **Proibido usar dados reais de pacientes**: só dados fictícios | 7.4 |
| Proibido mostrar fotos de telas, prontuários ou pacientes das instituições visitadas | 5.2.7, 11.5.2 |
| Mostrar detalhes técnicos no pitch pode impedir patente futura. Decidir o nível de detalhe | 11.1.8, 11.5.3 |
| Não cabe recurso contra a nota da banca | 12.4 |

> ⚠️ **Não usar a foto da tela do faturamento tirada na visita** (tem nomes de pacientes e tela do sistema). O protótipo foi feito só com dados fictícios.

---

## 2. Critérios de avaliação e como responder a cada um

| # | Critério | Peso | O que a banca quer ver | Nossa resposta |
|---|---|---|---|---|
| 1 | **Impacto em Saúde e Relevância Social** | **25%** | Benefício concreto à população, melhora de processos assistenciais, equidade, acesso | Procedimento não lançado é receita que o SUS deixa de repassar ao hospital, ou seja, menos recurso para atender. O médico não é mais interrompido pelo faturamento e ganha tempo com o paciente. Os procedimentos ficam registrados de forma estruturada, o que gera indicadores (ex.: exames de glaucoma e retinopatia diabética realizados) |
| 2 | **Inovação e Originalidade** | **20%** | Grau de inovação, novas tecnologias/abordagens | As soluções do mercado **corrigem a conta depois** (auditoria, glosa). A nossa **evita o erro na origem**, no momento em que o médico registra, e é focada no **SUS ambulatorial (BPA)** |
| 3 | **Viabilidade Técnica e Econômica** | **20%** | Plano de execução claro, recursos disponíveis, implementação realista | **Funciona com qualquer sistema** de prontuário e faturamento (MV, Tasy ou outro): não exige trocar de sistema nem esperar o fornecedor mudar o produto (seção 5.1). Sem IA, então é previsível e barato. Implantação em fases, começando por um ambulatório piloto (oftalmologia) |
| 4 | **Sustentabilidade e Escalabilidade** | **15%** | Se mantém no longo prazo, adapta a outros contextos, expande | A tabela **SIGTAP é nacional** e a solução **independe do sistema** do hospital, então serve para qualquer hospital SUS, use ele MV, Tasy ou outro. Para outra especialidade basta trocar o catálogo de exames. O ganho de receita paga a manutenção |
| 5 | **Clareza, Coerência e Estrutura da Submissão Final** | **10%** | Organização do documento final, consistência objetivo → método → resultado, **adequação às normas do edital** | Pitch com começo, meio e fim (problema → solução → demo → impacto → próximos passos). Slide de fontes e declaração de IA. **[CONFIRMAR com a organização se há "documento final" a entregar além do pitch]** |
| 6 | **Integração Multidisciplinar e Colaboração** | **10%** | Interação entre áreas e formações | A saúde definiu os exames, o vocabulário clínico e os casos de teste. A tecnologia construiu o protótipo. **Dividir a fala do pitch entre os integrantes** |

**Prioridade:** os critérios 1, 2 e 3 somam **65%** da nota. O impacto em saúde (25%) é o mais pesado e o mais difícil para uma solução de faturamento, então ele precisa estar explícito.

---

## 3. Roteiro de 5 minutos

| Tempo | Bloco | Quem fala | Conteúdo |
|---|---|---|---|
| 0:00–0:40 | **Gancho + problema** | Saúde | Uma frase de impacto + a dor vista na visita. Ex.: *"Hoje, para cada paciente atendido, uma faturista lê o prontuário em texto livre e lança à mão, exame por exame, o código do SUS."* **[PREENCHER com o que viram na visita: tempo por conta, contas por dia, papéis impressos]** |
| 0:40–1:20 | **Por que isso importa** | Saúde | Exame não lançado = dinheiro do SUS que não entra = menos recurso para atender. Médico interrompido para tirar dúvida do faturamento. Dados de mercado (seção 7) |
| 1:20–1:50 | **A solução em uma frase** | Saúde ou Tecnologia | *"O médico registra a anamnese como sempre, mas lança os exames realizados em poucos cliques; o faturamento recebe os lançamentos prontos e só revisa e aprova. E funciona com qualquer sistema que o hospital já usa."* |
| 1:50–3:50 | **Demonstração** (seção 4) | Tecnologia + Saúde | Sistema atual × com a solução, nas visões do médico e do faturamento |
| 3:50–4:30 | **Viabilidade e escala** | Tecnologia | **Funciona com qualquer sistema** (como, em 1 frase: seção 5.1); implantação em fases; SIGTAP nacional; diferencial frente ao mercado |
| 4:30–5:00 | **Impacto + fechamento** | Saúde | Resultado esperado + frase final. Ex.: *"Menos tempo no faturamento, mais recurso para o SUS e mais tempo do médico com o paciente."* |

> Ensaiar com cronômetro. Se passar de 5 min, cortar da demonstração, nunca do problema e do impacto.

---

## 4. Roteiro da demonstração (protótipo)

Protótipo: `npm run dev`, abrir `http://localhost:5173`. **Antes de subir ao palco, clicar em "Restaurar dados de demonstração"** na página inicial.

### Sistema atual (30–40 s)
1. **Visão Médico:** um único campo de texto livre ("Evolução e exames realizados").
2. **Visão Faturamento:** a faturista abre o **Consulta Prontuário**, lê o texto ("Feito tono", "FO: escavação 0,7", "Solicito campo visual e OCT"), volta para o **Lançamento de BPA** e lança procedimento por procedimento. Buscar "campo visual" ou "FO" (como o médico escreve) na lista de valores **não encontra**; só o nome oficial ("campimetria", "fundoscopia") funciona. Mostrar o cronômetro **"Tempo de lançamento"**.

### Com a solução (60–80 s)
3. **Visão Médico, aba Anamnese:** preencher QP/HMA rapidamente, adicionar 2–3 exames no seletor de **Exames complementares** (digitar "tono", "oct", "campo") e escrever um detalhe em cada um. Mostrar o painel **"Vai para o faturamento"** e o **"Texto gravado no prontuário"**. Clicar em **Assinar**.
4. **Visão Faturamento:** a página da paciente já aparece com a **consulta e os exames gerados automaticamente**, status **"Pendente de revisão"**, código SIGTAP, quantidade, prestador, CBO e CID preenchidos. Mostrar a **"Origem no prontuário"**, depois **Aprovar todos deste paciente**. Mostrar também um item **"Devolvido ao médico"** com o motivo.
5. Comparar o **"Tempo de revisão"** com o **"Tempo de lançamento"** do sistema atual.

> Plano B: gravar um vídeo curto da demonstração durante o dia, para o caso de o notebook ou o projetor falharem.

---

## 5. A solução: o que dizer

- **Para o médico:** a aba Anamnese tem Queixa atual, História da moléstia atual (HMA) e **Exames complementares** (no sistema atual, só os dois primeiros, em texto livre). Em Exames complementares, ele busca o exame (catálogo oftalmológico com códigos SIGTAP) e escreve os detalhes de cada um.
- **O registro continua sendo texto:** tudo é gravado no mesmo campo do prontuário, com linhas `[EXAME]` padronizadas. O prontuário não perde nada.
- **Para o faturamento:** ao assinar, o sistema cria a **consulta** e um **procedimento por exame** na página do paciente, com status:
  - **Pendente de revisão**: gerado automaticamente, aguarda conferência.
  - **Aprovado**: liberado para faturar (BPA).
  - **Devolvido ao médico**: dúvida registrada com motivo. Substitui o telefonema.
- **Rastreabilidade:** cada lançamento mostra de qual registro veio, quem assinou e o texto original.

### 5.1 Funciona com qualquer sistema: como

Frase para o pitch:
> *"A nossa solução não substitui o sistema do hospital e não depende de o fornecedor mudar o produto. Ela se acopla ao prontuário e ao faturamento que já existem, seja MV, Tasy ou qualquer outro."*

Como isso é possível, em três partes:

1. **Do lado do médico, um módulo acoplável.** A tela de exames complementares (busca de exames + detalhes) roda como um **componente web** que se encaixa sobre o prontuário que o hospital já usa: por exemplo, uma **extensão de navegador** ou um painel lateral nos sistemas web (MV, Tasy e a maioria dos prontuários atuais rodam no navegador). Ela escreve o resultado **no campo de texto que já existe**.
2. **O registro é texto padronizado.** O que vai para o prontuário é texto comum, com linhas como `[EXAME] Tonometria (SIGTAP 02.11.06.025-9) - PIO OD 24 mmHg`. **Qualquer sistema que guarda texto guarda isso**, sem mudança no banco de dados. Se o hospital trocar de sistema, nada se perde.
3. **Do lado do faturamento, entrega em formatos padrão.** O leitor das linhas `[EXAME]` gera os lançamentos com status de revisão e entrega ao faturamento por **padrões abertos**: importação de arquivo (BPA, planilha), API ou padrões de interoperabilidade em saúde (**HL7/FHIR**). Ou a própria fila de revisão web, ao lado do sistema atual.

**Seja honesto se a banca perguntar:** no protótipo, isso é **simulado** dentro de um prontuário de demonstração. Na implantação real, cada hospital exige uma configuração de integração (ler o texto do registro assinado e entregar os lançamentos ao faturamento), mas **é a mesma solução para todos os sistemas**, sem desenvolver um produto novo para cada fornecedor.

---

## 6. Soluções parecidas e nosso diferencial

### Sistemas hospitalares (já automatizam parte do processo)
- **MV:** procedimentos pedidos pela prescrição eletrônica e com laudo registrado entram automaticamente na conta. ([MV](https://mv.com.br/blog/4-resultados-do-uso-do-prontuario-eletronico-no-fechamento-das-contas-medicas))
- **Tasy (Philips):** integra prescrição, prontuário, farmácia e faturamento. ([Philips](https://www.philips.com.br/c-dam/b2bhc/br/resource-catalog/landing/tasy_category/folder-tasy-prestador-br.pdf))
- **Vitai One:** conta pronta na alta, críticas SIGTAP/CNES para AIH, BPA e APAC. ([Vitai](https://vitai.com.br/vitai-one/faturamento/))

> **Pergunta provável:** *"O MV já não faz isso?"* **Resposta:** faz quando o exame passa por pedido e laudo formais. Na oftalmologia, os exames são feitos no consultório e registrados em **texto livre**, então ficam fora desse fluxo. Levamos o mesmo princípio para o registro do consultório, e **de forma independente do sistema**: funciona no MV, no Tasy ou em qualquer outro.

### Startups brasileiras de ciclo de receita
- **Rivio:** IA que cruza prontuário e conta para achar o que não foi cobrado (foco em planos de saúde). Avaliada em mais de R$ 500 mi em menos de 1 ano. ([Rivio](https://www.rivio.com.br/produtos), [Exame](https://exame.com/negocios/esta-empresa-brasileira-tem-menos-de-um-ano-e-ja-vale-meio-bilhao/))
- **Vesalius:** gestão de glosas TISS; auditoria de prontuário com IA "em breve". ([Vesalius](https://vesalius.med.br/))
- **UpFlux:** IA para revisar contas no Tasy/MV antes do fechamento. ([UpFlux](https://upflux-site.lovable.app/blog/ia-no-tasy-auditoria-de-contas))
- **FaturaIA:** audita BPA/APAC/AIH do SUS antes do envio, com base no SIGTAP/CNES, mas sobre a produção **já lançada**. ([FaturaIA](https://www.faturaia.com.br/))

### Internacionais ("autonomous coding")
- **Solventum 360 Encompass** (ex-3M), **Innovaccer Flow Capture**, **Commure**, **MediMobile Genesis**, **Medmio CodeSight**. Leem a nota assinada, geram os códigos e mandam **só as exceções** para revisão humana. A Innovaccer afirma codificar cerca de 80% dos atendimentos sozinha. ([Solventum](https://www.solventum.com/en-us/home/health-information-technology/solutions/360-encompass-autonomous/), [Innovaccer](https://www.businesswire.com/news/home/20260309523268/en/Innovaccer-Launches-Flow-Capture-Bringing-Autonomous-Coding-to-the-Frontlines-of-American-Healthcare), [Commure](https://www.commure.com/))

### Nosso diferencial (frase para o pitch)
> *"As soluções do mercado corrigem a conta depois que o erro aconteceu e focam em planos de saúde. A nossa evita o erro na origem, no momento em que o médico registra, para o SUS, sem IA, sem mudar a rotina do médico e **funcionando com qualquer sistema que o hospital já usa**."*

Os prontuários específicos de oftalmologia que fazem isso (Epic Kaleidoscope, ModMed EMA, Eyecare BI) exigem **trocar o sistema inteiro**. A nossa solução leva o mesmo resultado **para dentro do sistema que já existe**.

O padrão internacional (gerar automaticamente + revisão humana das exceções + rastreabilidade) **valida o nosso desenho** com status de revisão.

---

## 7. Números para o pitch

| Dado | Fonte |
|---|---|
| Hospitais gastam **4% a 6% da receita** com o processo de faturamento e perdem **5% a 8% por subfaturamento** (itens não cobrados) | Rivio, citada pela [Exame (15/01/2026)](https://exame.com/negocios/esta-empresa-brasileira-tem-menos-de-um-ano-e-ja-vale-meio-bilhao/). É dado da empresa, então citar como tal |
| Valores SIGTAP de exemplo: OCT **R$ 48,00**; campimetria **R$ 40,00**; mapeamento de retina **R$ 24,24**; tonometria **R$ 6,74** (competência 10/2026) | [Tabela SIGTAP, grupo 02.11.06](https://sigtap.atomiccodes.com.br/navegar/02/11/06) |
| **[PREENCHER]** Tempo médio para lançar uma conta hoje | Visita técnica |
| **[PREENCHER]** Contas/atendimentos por dia no ambulatório | Visita técnica |
| **[PREENCHER]** Exemplos de exames que deixam de ser lançados ou geram dúvida | Visita técnica |
| **[PREENCHER]** Tempo com a solução (cronometrar no protótipo) | Ensaio da demo |

**Conta de impacto (modelo):** *se X exames de R$ Y deixam de ser lançados por mês → R$ X·Y/mês que o hospital deixa de receber do SUS.* Usar números da visita sempre que possível; números reais valem mais que dados de mercado.

---

## 8. Viabilidade: plano de implantação

1. **Fase 1, piloto (1 ambulatório: oftalmologia):** acoplar o módulo de exames complementares ao prontuário em uso, com o catálogo da especialidade, e configurar a entrega dos lançamentos à fila de revisão do faturamento.
2. **Fase 2, medir:** tempo por conta, procedimentos não lançados, devoluções ao médico e glosas/rejeições do BPA.
3. **Fase 3, expandir:** outros ambulatórios (cada especialidade = um catálogo SIGTAP), depois AIH (internação).

**Recursos:** usa o prontuário e o faturamento que já existem, **seja qual for o sistema**. O trabalho é acoplar o módulo, configurar a integração e manter o catálogo SIGTAP. Não exige trocar de sistema nem equipamento novo.

**Riscos e respostas:**

| Risco | Resposta |
|---|---|
| Depender do fornecedor (MV) para alterar o sistema | A solução **não exige alterar o produto do fornecedor**: o módulo se acopla por fora e o registro é texto comum. A integração usa padrões abertos (arquivo, API, HL7/FHIR). Piloto pequeno antes |
| Médico não usar os campos | Busca rápida por apelido ("tono", "oct"); o texto continua livre |
| Lançamento errado gerar glosa | Nada é faturado sem **aprovação** da faturista; "Devolver ao médico" para dúvidas; origem visível |
| LGPD | Os dados não saem do sistema do hospital; não há envio a terceiros nem IA externa |

---

## 9. Sustentabilidade e escalabilidade

- **Escala nacional:** SIGTAP e BPA são padrões do SUS em todo o país.
- **Outras especialidades:** basta trocar o catálogo de exames (o protótipo começa com oftalmologia: 22 exames do grupo 02.11.06).
- **Qualquer sistema:** o módulo se acopla ao prontuário existente e o registro é texto padronizado, então a solução funciona com MV, Tasy ou qualquer outro, sem precisar trocar de sistema (seção 5.1). Isso amplia muito o mercado: hospitais com sistemas diferentes podem usar a mesma solução.
- **Se paga:** o ganho com procedimentos que deixam de ser perdidos e o tempo de faturista economizado cobrem a manutenção.

---

## 10. Perguntas prováveis da banca

| Pergunta | Resposta curta |
|---|---|
| O MV já não faz isso? | Faz para pedido + laudo formais; exames de consultório registrados em texto livre ficam de fora. Levamos o princípio para o registro do consultório, funcionando com qualquer sistema |
| Funciona mesmo com qualquer sistema? Como? | Sim: o módulo do médico se acopla ao prontuário que já existe (ex.: extensão de navegador nos sistemas web), o registro é **texto comum** que qualquer sistema guarda, e os lançamentos chegam ao faturamento por formatos padrão (arquivo, API, HL7/FHIR). Na implantação, cada hospital exige configurar essa integração, mas a solução é a mesma |
| Por que não trocar por um prontuário de oftalmologia pronto? | Trocar de sistema é caro, demorado e exige licitação num hospital público. A nossa solução entrega o mesmo resultado sem trocar nada |
| E se o médico não preencher? | O texto continua livre e o faturamento continua podendo lançar à mão |
| Quem garante que o lançamento está certo? | A faturista aprova cada um; vê a origem no prontuário; pode devolver ao médico com motivo |
| Quanto custa? | Acoplamento e integração com o sistema existente; sem trocar de sistema nem comprar hardware. **[PREENCHER estimativa se tiverem]** |
| Os códigos estão certos? | Catálogo baseado na tabela SIGTAP oficial (grupo 02.11.06), competência 10/2026 |
| Funciona fora da oftalmologia? | Sim, trocando o catálogo. A oftalmologia é o piloto |
| E a LGPD? | Os dados ficam no sistema do hospital; o protótipo usa só dados fictícios (item 7.4) |
| Qual o impacto para o paciente? | Mais recurso para o SUS atender; médico com menos interrupções; dados estruturados de exames para gestão e indicadores |

---

## 11. Sugestão de slides (máx. 6–7)

1. **Título:** nome da solução **[PREENCHER]**, equipe, trilha Faturamento.
2. **Problema:** a dor vista na visita, com 1 número.
3. **Solução:** fluxo em 3 passos: médico registra → sistema gera os lançamentos → faturamento revisa e aprova. Selo: **"funciona com qualquer sistema"**, com o desenho das 3 partes da seção 5.1 (módulo acoplável → texto padronizado → entrega em formato padrão).
4. **Demo:** ao vivo (ou vídeo de reserva).
5. **Diferencial e viabilidade:** mercado corrige depois × nós evitamos na origem; implantação em fases.
6. **Impacto e escala:** números + SUS nacional + outras especialidades.
7. **Fontes e declaração de IA** (obrigatório, itens 7.2 e 7.3).

---

## 12. Fontes e declaração de IA (slide obrigatório)

**Fontes:**
- Tabela de Procedimentos do SUS (**SIGTAP/DATASUS**), grupo 02.11.06, competência 10/2026, consultada via [sigtap.atomiccodes.com.br](https://sigtap.atomiccodes.com.br/navegar/02/11/06) e [cid10brasil.com.br](https://www.cid10brasil.com.br/procedimentos/forma/021106).
- Classificação Brasileira de Ocupações (**CBO**): 225265 Médico oftalmologista.
- Bibliotecas: **SvelteKit / Svelte 5**, **Tailwind CSS**, **Lucide** (ícones). Todas de licença livre.
- Dados de mercado: Exame (15/01/2026) e sites das empresas citadas na seção 6.
- Todos os dados de pacientes do protótipo são **fictícios** (item 7.4).

**Declaração de uso de IA generativa (item 7.3):**
- **Cursor** (assistente de programação com IA): usado no desenvolvimento do protótipo e na pesquisa de soluções semelhantes e fontes. **[COMPLETAR com outras ferramentas que a equipe usou: ChatGPT, Gemini etc., e para quê]**
- A solução em si **não usa IA**: a geração dos lançamentos é feita por regras.

---

## 13. Checklist final (antes das 19h00)

- [ ] Os **5 integrantes da saúde** presentes no palco (item 4.6).
- [ ] Pitch ensaiado com cronômetro, **≤ 5 min**.
- [ ] Cada integrante sabe sua parte (critério 6: multidisciplinar).
- [ ] Números da visita técnica no slide do problema.
- [ ] Slide de **fontes** e **declaração de IA**.
- [ ] Nenhuma foto do hospital, de tela do sistema ou de dados reais.
- [ ] Protótipo aberto, **"Restaurar dados de demonstração"** clicado, navegador em tela cheia.
- [ ] Vídeo de reserva da demo.
- [ ] Confirmado com a organização se há **documento final** a entregar (critério 5).
- [ ] Decidido quanto de detalhe técnico mostrar (item 11.1.8, patente).
