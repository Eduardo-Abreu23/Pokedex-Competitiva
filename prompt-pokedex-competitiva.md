# Prompt — Pokédex Competitiva + Team Builder

## ▶ Instruções de arranque (leia primeiro)

Você está rodando dentro de um projeto local (Vite + React + TypeScript). Antes de escrever qualquer código:

1. **Leia este arquivo inteiro.** Ele é a especificação completa do projeto.
2. **Não tente construir tudo de uma vez.** Implemente por fases (ver §3). Comece pela **Fase 1 (MVP)** e só avance quando ela estiver funcional.
3. **Antes de codar, me apresente:** (a) a stack final que vai usar, (b) a estrutura de pastas proposta, e (c) qualquer decisão em aberto que dependa de mim — em especial o **dilema de SEO** descrito na §5 (SPA vs SSR/SSG). Espere meu OK antes de seguir.
4. **Camada de dados:** leia a §2 com atenção. A PokéAPI **não** tem dados competitivos; estes vêm do ecossistema `@pkmn`/Smogon. Não invente fontes nem assuma campos — se algo não existir na fonte, trate como estado vazio.
5. **Ambiente real:** aqui você **pode** instalar pacotes npm e usar LocalStorage/IndexedDB (diferente do sandbox de artefato do chat). Use isso.
6. **Decisões fora deste arquivo:** considere apenas o que está escrito neste documento. Em caso de dúvida, pergunte antes de assumir.

Sugestão de primeira mensagem minha: *"Leia este arquivo e comece pela Fase 1. Antes de codar, me mostre a stack e a estrutura de pastas, e me pergunte sobre o SEO."*

---

## 0. Objetivo

Criar uma **Pokédex competitiva** moderna que sirva tanto para jogadores casuais quanto competitivos. O app deve permitir (1) consultar informações detalhadas de qualquer Pokémon e (2) montar e analisar equipes completas. Foco em ser rápido, profissional, responsivo e instalável (PWA).

> **Importante:** dados competitivos ("melhores golpes", "melhores EVs/IVs", "melhores natures", builds) **não são fatos absolutos** — eles dependem sempre de uma **geração + formato/tier** (ex.: Gen 9 OU, Gen 9 VGC). O app deve ter um **seletor de formato** e exibir os dados competitivos sempre atrelados ao formato escolhido. Quando não houver dado competitivo para um Pokémon naquele formato, mostrar estado vazio elegante ("sem dados competitivos para este formato").

---

## 1. Stack técnica

- **Framework:** React + TypeScript
- **Build:** Vite
- **Estilo:** Tailwind CSS (tema claro/escuro via `class` strategy, com tokens de cor por tipo de Pokémon)
- **Roteamento:** React Router
- **Data fetching + cache:** TanStack Query (React Query) — obrigatório para cachear e desduplicar chamadas à PokéAPI
- **Estado global leve:** Zustand (ou Context) para tema, favoritos, times e formato selecionado
- **Persistência local:**
  - **LocalStorage** para favoritos, times e histórico (dados pequenos e estruturados)
  - **IndexedDB** (ex.: via `idb` ou persistência do React Query) para **cachear respostas da API** — LocalStorage não é adequado pra isso (limite ~5MB, síncrono)
- **PWA:** `vite-plugin-pwa` (manifesto + service worker + cache offline dos assets e dados)
- **Gráficos:** Recharts (ou Chart.js) para stats e análise de time
- **Validação de tipos de dados externos:** Zod (validar respostas de API antes de usar)

---

## 2. Arquitetura de dados (LEIA COM ATENÇÃO)

Cada tipo de informação vem de uma fonte diferente. **Não assuma que a PokéAPI tem dados competitivos — ela não tem.**

### 2.1. Dados base → **PokéAPI** (`https://pokeapi.co`)
- Stats base (HP, Atk, Def, SpA, SpD, Spe)
- Tipos
- Habilidades normais + habilidade oculta (campo `is_hidden`)
- Lista de golpes que o Pokémon aprende (e como aprende)
- Linha evolutiva completa e condições de evolução (`evolution-chain`)
- Egg Groups (`pokemon-species` → `egg_groups`)
- Imagens oficiais (`sprites.other['official-artwork'].front_default`)
- Localizações/encontros (`pokemon/{id}/encounters`) — **disponível só para alguns jogos/Pokémon**, tratar ausência
- Geração (`pokemon-species` → `generation`)
- Relações de dano por tipo (`type/{id}` → `damage_relations`) para calcular fraquezas/resistências

> A PokéAPI pede que você **cacheie localmente** e não faça chamadas excessivas. Use React Query + IndexedDB e evite buscar os ~1300 Pokémon de uma vez.

### 2.2. Dados competitivos → **ecossistema @pkmn / Smogon**
A Smogon **não oferece API pública oficial**. A forma estável de acessar é o ecossistema `@pkmn`, que processa os dados da Smogon e do Pokémon Showdown:
- **`@pkmn/smogon`** (com `fetch`) + **`data.pkmn.cc`**: sets competitivos, análises, movesets recomendados, EVs/IVs/natures/itens/Tera sugeridos, usage stats — **por geração e formato**. Dados atualizados ~a cada 24h.
- **`@smogon/sets`**: alternativa mais simples (atualiza ~mensalmente, empacotado).
- **`@pkmn/data`** / **`@pkmn/dex`**: data layer do Pokémon Showdown (tabela de tipos, mecânicas, dados competitivamente relevantes) — útil para a análise de time.
- **`@pkmn/sets`**: parsing de **import/export no formato Pokémon Showdown** (não reinventar esse parser).
- *(Opcional)* **`@smogon/calc`** ou **`@pkmn/dmg`**: cálculo de dano, se quiser cobertura ofensiva mais precisa.

> Deixe claro na implementação uma camada de **serviços/adapters** (`/services/pokeapi.ts`, `/services/smogon.ts`) que normaliza tudo para os tipos internos do app. A UI nunca fala direto com a API.

---

## 3. Funcionalidades por fase

Implementar em fases para evitar um resultado raso. Entregar cada fase funcional antes de avançar.

### Fase 1 — MVP (Pokédex de consulta)
- Busca instantânea por nome (com debounce)
- Página de detalhes do Pokémon com:
  - Imagem oficial, tipos, número, geração
  - Stats base com **gráfico interativo** (radar ou barras)
  - Habilidades normais + habilidade oculta destacada
  - Egg Group
  - Linha evolutiva completa com condições de evolução
  - Fraquezas e resistências (calculadas pela tabela de tipos)
  - Localizações de encontro (quando disponível)
- Lista/grid inicial com paginação e lazy loading
- Tema claro/escuro com cores inspiradas no universo Pokémon (paleta por tipo)
- Totalmente responsivo (mobile-first)

### Fase 2 — Camada competitiva
- Seletor de **geração + formato** (Gen 9 OU, VGC, etc.)
- Melhores golpes competitivos (do formato selecionado)
- Melhores Natures, IVs e EVs recomendados
- Builds competitivas sugeridas (sets da Smogon)
- Itens sugeridos para equipar
- Sugestão de Tera Type (quando aplicável à geração)
- Estados vazios quando não houver dado para o formato

### Fase 3 — Filtros e descoberta
- Filtrar por tipo, geração, Egg Group e por faixa de status base
- Comparação entre dois Pokémon (lado a lado, stats e tipos)
- Favoritar Pokémon (persistido)
- Histórico de pesquisas
- Página inicial com Pokémon populares e **ranking dos mais pesquisados** (contagem local)

### Fase 4 — Criador de Times (Team Builder)
Seção "Criador de Times" onde o usuário pode:
- Criar até 6 Pokémon por time
- Pesquisar e adicionar Pokémon
- Definir Nature, EVs (com limites: 252 por stat, 510 no total), IVs (0–31)
- Escolher habilidade, item, golpes (até 4) e Tera Type
- Salvar localmente, editar, excluir e **duplicar** times
- **Exportar** no formato Pokémon Showdown
- **Importar** times do Pokémon Showdown (usar `@pkmn/sets`)

### Fase 5 — Análise de Time
Após montar o time, mostrar:
- Cobertura ofensiva (tipos que o time bate forte)
- Cobertura defensiva
- Fraquezas repetidas (alertar quando vários membros compartilham a mesma fraqueza)
- Resistências importantes
- Velocidade média do time
- Tipos que estão faltando na equipe
- Sugestões de substituições
- Avaliação geral do time (nota/resumo)

### Fase 6 — Extras / Polimento
- Animações suaves (Framer Motion ou transições CSS)
- PWA instalável + offline
- SEO otimizado (ver §5)
- Gráficos interativos de estatísticas
- Estrutura de código preparada para futura integração com login e sincronização em nuvem (camada de persistência abstrata, ex.: interface `StorageProvider` com implementação local hoje e remota depois)

---

## 4. Design / UI

- Estilo moderno, limpo e responsivo. Referência visual: PokéAPI, Pokémon Showdown, Smogon e Pokédex moderna.
- Paleta inspirada no universo Pokémon, com **cor por tipo** aplicada a badges/cards.
- Modo claro e escuro completos.
- Mobile e desktop igualmente cuidados.
- Skeleton loaders durante o carregamento (sem flashes/layout shift).
- Acessibilidade: contraste adequado, navegação por teclado, `aria-label` nos controles.

---

## 5. Requisitos não-funcionais

- **Performance:** code splitting por rota, lazy loading de imagens, virtualização em listas grandes, cache agressivo de API (React Query + IndexedDB). Não carregar todos os Pokémon de uma vez.
- **PWA:** manifesto, ícones, service worker, funcionamento offline para dados já cacheados.
- **SEO — atenção à contradição:** um SPA puro client-side tem SEO fraco. Se SEO for requisito real (indexação das páginas de Pokémon), considerar **SSR/SSG** (Next.js ou Astro) em vez de SPA Vite puro. Se SEO for "nice to have", manter Vite + React e aplicar pelo menos `react-helmet`/meta tags dinâmicas, mas sabendo da limitação. **Decida isso antes de começar.**
- **Responsividade:** breakpoints mobile-first.

---

## 6. Restrições e decisões já tomadas

- Sem backend nesta versão. Tudo client-side + APIs públicas.
- Favoritos/times/histórico → LocalStorage. Cache de API → IndexedDB.
- Dados competitivos sempre atrelados a (geração + formato).
- Camada de serviços isola a UI das APIs externas.
- Validar respostas externas com Zod antes de usar.

---

## 7. Critérios de aceitação (exemplos)

- Buscar "Garchomp" abre a página de detalhes com stats, tipos, habilidades (incluindo oculta), evolução, fraquezas e, no formato Gen 9 OU, ao menos um set competitivo.
- Montar um time de 6, exportar, copiar pro Showdown e o formato ser válido; reimportar o mesmo texto reconstrói o time.
- A análise aponta corretamente uma fraqueza repetida (ex.: 3 membros fracos a Terra).
- App instala como PWA e abre offline mostrando dados já visitados.
