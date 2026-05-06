# FiaesPsychology — Roadmap de Desenvolvimento

Sistema de Gestão para Clínicas de Psicologia  
Stack: Node.js + Express · React + Vite · Supabase (PostgreSQL)

---

## Como usar este documento

- `[ ]` — pendente
- `[x]` — concluído
- Cada tarefa deve ter **testes escritos antes ou junto com a implementação**
- Ao concluir uma tarefa: marque `[x]`, faça `git commit` e `git push`

---

## FASE 0 — Infraestrutura e Configuração ✅

- [x] Inicializar repositório Git
- [x] Estrutura de pastas do projeto (monorepo backend + frontend)
- [x] Backend: Node.js + Express com ES Modules
- [x] Frontend: React + Vite
- [x] Integração com Supabase (`@supabase/supabase-js`)
- [x] `.gitignore` configurado (node_modules, .env, dist)
- [x] Arquivos `.env.example` para backend e frontend
- [x] Middleware de autenticação JWT (Supabase Auth)
- [x] Middleware de RBAC (Admin, Psicólogo, Paciente)
- [x] Middleware de tratamento global de erros
- [x] Esqueleto de todos os módulos backend (routes, service, controller)
- [x] Esqueleto de todas as páginas frontend por role
- [x] Schema SQL inicial com RLS (`supabase/migrations/001_initial_schema.sql`)

---

## FASE 1 — Banco de Dados e Autenticação

### 1.1 Supabase — Schema e RLS

- [x] Executar `supabase/migrations/001_initial_schema.sql` no SQL Editor do Supabase
- [x] Verificar criação das tabelas: `users`, `patients`, `rooms`, `appointments`, `medical_records`, `transactions`, `insurance_plans`
- [x] Validar políticas RLS (Row Level Security) por role
- [x] Criar usuário admin inicial via Supabase Dashboard + definir `role` em `auth.users.raw_user_meta_data`

**Testes:**
- [ ] Testar que psicólogo **não consegue** acessar dados de outro psicólogo via SQL direto
- [ ] Testar que paciente **não consegue** ver prontuários via RLS
- [ ] Testar que admin consegue ver todos os registros

### 1.2 Autenticação

- [x] Configurar variáveis de ambiente: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` no backend
- [x] Configurar variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` no frontend
- [x] Implementar `POST /api/auth/signin` — login com email/senha
- [x] Implementar `POST /api/auth/signout` — logout
- [x] Implementar `GET /api/auth/me` — retorna usuário logado
- [x] Implementar `AuthContext` no frontend (sessão global + role + função `signOut`)
- [x] Implementar `ProtectedRoute` com redirecionamento por role
- [x] Implementar página de Login (`/login`) com redirecionamento automático por role
- [x] Implementar página de Cadastro de paciente (`/register`)
- [x] Implementar `App.jsx` com roteamento completo (BrowserRouter + todas as rotas protegidas)

**Testes:**
- [x] Login com credenciais válidas redireciona para dashboard correto por role
- [x] Login com credenciais inválidas exibe mensagem de erro real do Supabase
- [x] Usuário sem `role` no metadata recebe mensagem específica
- [ ] Rota protegida sem token retorna `401`
- [ ] Rota protegida com role errado retorna `403`
- [ ] Logout invalida a sessão
- [ ] Refresh de página mantém sessão ativa

---

## FASE 2 — Módulos Backend

### 2.1 Módulo de Usuários (`/api/users`)

- [x] `GET /api/users` — listar todos os usuários (admin)
- [x] `GET /api/users/:id` — buscar usuário por ID (admin)
- [x] `PUT /api/users/:id` — atualizar usuário (admin)
- [x] `DELETE /api/users/:id` — remover usuário (admin) — deleta de `auth.users` + tabela `users`
- [x] Criar usuário psicólogo via Supabase Auth Admin API (`email_confirm: true`, `user_metadata.role`)
- [x] Rollback no Auth se inserção na tabela `users` falhar
- [x] Tela admin: tabela com role badge e CRP, modal create com senha + role selector + campo CRP condicional

**Testes:**
- [ ] Psicólogo não acessa `GET /api/users` (retorna `403`)
- [ ] Admin acessa `GET /api/users` com sucesso
- [ ] `DELETE` de usuário inexistente retorna `404`

### 2.2 Módulo de Pacientes (`/api/patients`)

- [x] `GET /api/patients` — listar pacientes (admin + psicólogo)
- [x] `GET /api/patients/:id` — buscar paciente (admin + psicólogo)
- [x] `POST /api/patients` — cadastrar paciente (admin)
- [x] `PUT /api/patients/:id` — atualizar paciente (admin + psicólogo)
- [x] `DELETE /api/patients/:id` — remover paciente (admin)
- [x] Validação de CPF único (erro 409 via constraint unique no banco)
- [x] Join com `insurance_plans(nome)` no select
- [ ] Associação com plano de convênio via select na tela (dropdown de convênios no modal)
- [x] Tela admin: tabela com busca por nome/CPF, modal create/edit

**Testes:**
- [x] Cadastro com CPF duplicado retorna `409`
- [ ] Campos obrigatórios ausentes retornam `400`
- [ ] Paciente criado retorna status `201`

### 2.3 Módulo de Salas (`/api/rooms`)

- [x] `GET /api/rooms` — listar salas
- [x] `GET /api/rooms/:id` — detalhes da sala
- [x] `POST /api/rooms` — criar sala (admin)
- [x] `PUT /api/rooms/:id` — atualizar sala (admin)
- [x] `DELETE /api/rooms/:id` — remover sala (admin)
- [x] Tela admin: listagem em cards com recursos como tags, modal de cadastro/edição

**Testes:**
- [ ] Sala criada com sucesso retorna `201`
- [ ] Paciente não acessa `POST /api/rooms` (retorna `403`)

### 2.4 Módulo de Agendamentos (`/api/appointments`)

- [x] `GET /api/appointments` — listar com join de paciente, psicólogo e sala
- [x] `GET /api/appointments/:id` — detalhes do agendamento
- [x] `POST /api/appointments` — criar agendamento **com validação de conflito de sala**
- [x] `PUT /api/appointments/:id` — atualizar agendamento
- [x] `PATCH /api/appointments/:id/cancel` — cancelar agendamento
- [x] `PATCH /api/appointments/:id/conclude` — concluir sessão (status `concluido`)
- [x] Validação: não permitir dois agendamentos na mesma sala, data e hora (retorna 409)
- [x] Tela admin: tabela com filtro por status, formulário completo, botão de cancelamento
- [x] Painel psicólogo: botão "Concluir" por sessão, badge de status `concluido`

**Testes:**
- [ ] Criação de agendamento sem conflito retorna `201`
- [x] Criação com conflito de sala retorna `409 "Sala já ocupada neste horário"`
- [ ] Cancelamento atualiza status para `cancelado`
- [ ] Agendamento cancelado libera a sala para novo agendamento

### 2.5 Módulo de Prontuários (`/api/medical-records`)

- [x] `GET /api/medical-records/:consultaId` — buscar prontuário da consulta
- [x] `POST /api/medical-records` — criar prontuário (psicólogo)
- [x] `PUT /api/medical-records/:id` — atualizar prontuário (psicólogo)
- [x] Versionamento automático (campo `versao` incrementado a cada update)
- [x] Criptografia dos campos `evolucao` e `anamnese` (LGPD) — AES-256-GCM via `src/utils/crypto.js`

**Testes:**
- [ ] Psicólogo não acessa prontuário de paciente de outro psicólogo (retorna `403`)
- [ ] Atualização incrementa `versao`
- [ ] Admin consegue acessar qualquer prontuário

### 2.6 Módulo Financeiro (`/api/financial`)

- [x] `GET /api/financial` — listar transações com join de paciente/psicólogo (admin)
- [x] `GET /api/financial/summary` — resumo: receitas, despesas, saldo
- [x] `POST /api/financial` — registrar transação manualmente (admin)
- [x] `PUT /api/financial/:id` — editar transação (valor, categoria, status_pagamento)
- [ ] Cálculo automático de repasse ao criar transação de consulta
- [x] Geração de transação automática ao confirmar agendamento (receita R$0/pendente, editável)

**Testes:**
- [ ] Psicólogo não acessa `GET /api/financial` (retorna `403`)
- [ ] Summary retorna `receitas`, `despesas` e `saldo` corretos
- [ ] Repasse calculado corretamente (% clínica vs % psicólogo)

### 2.7 Módulo de Convênios (`/api/insurance`)

- [x] `GET /api/insurance` — listar planos de convênio
- [x] `POST /api/insurance` — criar plano (admin)
- [x] `PUT /api/insurance/:id` — atualizar plano (admin)
- [x] `DELETE /api/insurance/:id` — remover plano (admin)
- [x] Campos: `nome`, `codigo`, `taxa_reembolso` (%), `observacoes`
- [x] Tela admin: tabela com badge de taxa, modal create/edit completo
- [ ] Regras de coparticipação aplicadas no agendamento (cálculo automático)
- [ ] Faturamento de guias

**Testes:**
- [ ] Plano criado corretamente com percentual de coparticipação
- [ ] Paciente associado ao plano tem coparticipação calculada no agendamento

---

## FASE 3 — Frontend

### 3.1 Autenticação

- [x] Página de Login com validação de formulário e mensagem de erro real
- [x] Página de Cadastro (paciente) com confirmação de senha
- [x] Redirecionamento automático por role após login:
  - Admin → `/admin`
  - Psicólogo → `/psicologo`
  - Paciente → `/paciente`
- [x] Persistência de sessão com Supabase Auth (`onAuthStateChange`)
- [x] Botão de logout no Header (usa `signOut` do `AuthContext`)

**Testes:**
- [x] Login com email inválido mostra mensagem de erro
- [x] Usuário sem role definida recebe aviso específico
- [ ] Usuário não autenticado é redirecionado para `/login`
- [ ] Logout limpa a sessão e redireciona para `/login`

### 3.2 Layout Base

- [x] `Layout.jsx` — wrapper com Sidebar + Header + `<Outlet />`
- [x] `Sidebar.jsx` — navegação dinâmica por role com `NavLink` + active state
- [x] `Header.jsx` — nome do usuário, role label e botão logout
- [x] `ProtectedRoute.jsx` — guarda de rotas por role, redireciona para `/unauthorized`

**Testes:**
- [ ] Admin vê menu de admin na Sidebar
- [ ] Psicólogo vê apenas seu menu
- [ ] Acesso direto a rota de admin por psicólogo redireciona para `/unauthorized`

### 3.0 Landing Page (`/`)

- [x] Página de apresentação do sistema (`LandingPage.jsx`) substituindo o redirect `/` → `/login`
- [x] Navbar fixa com scroll suave e botão "Entrar no sistema"
- [x] Seção Hero com gradiente escuro, headline com gradiente azul/roxo e imagem mockup
- [x] Barra de métricas (3 Perfis, 7 Módulos, 100% Digital, Tempo Real)
- [x] Grid de 9 cards de funcionalidades com hover effects
- [x] Seção de 3 perfis de acesso (Admin, Psicólogo, Paciente) com listas de funcionalidades
- [x] CTA final com gradiente azul/índigo
- [x] Footer com copyright © 2025 thdev07
- [x] Responsividade via hook `useIsMobile()` (mobile < 768px)
- [x] `index.html` com título e meta description atualizados
- [ ] **Refatorar ícones com biblioteca (ex: Lucide React ou React Icons)** — atualmente usa emojis como placeholder
- [ ] Adicionar animações de entrada (fade-in ao scroll) com Intersection Observer ou Framer Motion
- [ ] Adicionar screenshot real do sistema no Hero após interface finalizada

**Nota técnica:** A landing page usa 100% inline styles e emojis como ícones temporários.
Quando a interface estiver mais madura, integrar uma biblioteca de ícones (Lucide React, React Icons ou Heroicons) e
revisar a iconografia para maior consistência visual em toda a aplicação (landing + painel interno).

### 3.3 Dashboard Admin

- [x] Cards de resumo: total de pacientes, psicólogos, salas, agendamentos do mês, confirmados e cancelados
- [x] Tabela dos últimos agendamentos com status badge
- [x] Botões de ação rápida (Novo agendamento, Novo paciente, Nova sala)
- [x] Página de gestão de usuários (`/admin/usuarios`) — criar/remover psicólogos e admins
- [x] Página de convênios (`/admin/convenios`) — CRUD completo
- [x] Cards de resumo financeiro (receitas/despesas/saldo) no Dashboard Admin
- [x] Página financeira com tabela de transações, filtros, modal criar/editar (`/admin/financeiro`)
- [ ] Página de relatórios por período (`/admin/relatorios`)

**Testes:**
- [ ] Cards de resumo exibem valores corretos vindos de `/api/financial/summary`
- [ ] Tabela de usuários lista todos os psicólogos
- [ ] Filtro de datas no financeiro funciona corretamente

### 3.4 Dashboard Psicólogo

- [x] Cards: sessões do dia, próximos 7 dias, total de pacientes
- [x] Calendário drag-and-drop (`AgendaCalendar`) com `@fullcalendar/react`
- [x] Cores por status: verde=confirmado, amarelo=pendente, vermelho=cancelado, roxo=concluido
- [x] Página de pacientes: listagem + busca por nome/CPF
- [x] Página de prontuário: editor rich text com `@tiptap/react` + salvamento automático (2s debounce)
- [x] Botão "Concluir sessão" no painel — atualiza status para `concluido`

**Testes:**
- [ ] Calendário exibe apenas agendamentos do psicólogo logado
- [ ] Drag-and-drop atualiza data/hora no banco
- [ ] Editor de prontuário salva automaticamente após 2s de inatividade
- [ ] Psicólogo não vê pacientes de outro psicólogo

### 3.5 Dashboard Paciente

- [ ] Cards: próxima sessão, débitos pendentes
- [ ] Portal de agendamento online
- [ ] Histórico de consultas
- [ ] Download de recibos e laudos liberados

**Testes:**
- [ ] Paciente vê apenas seus próprios agendamentos
- [ ] Agendamento online valida disponibilidade em tempo real
- [ ] Download de documento retorna arquivo correto

### 3.6 Calendário Interativo

- [ ] Instalar `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/interaction`
- [ ] Implementar drag-and-drop de consultas entre horários
- [ ] Cores dinâmicas por status de agendamento
- [ ] Modal de detalhes ao clicar em evento
- [ ] Modal de criação ao clicar em horário vazio

**Testes:**
- [ ] Arrastar consulta atualiza `data` e `hora` via `PUT /api/appointments/:id`
- [ ] Soltar consulta em horário ocupado mostra alerta e reverte
- [ ] Modal de criação preenche `sala_id`, `paciente_id`, `psicologo_id`

---

## FASE 4 — Integrações Externas

### 4.1 Google Calendar

- [ ] Configurar credenciais OAuth2 Google Calendar API
- [ ] Webhook: ao criar agendamento → criar evento no Google Calendar
- [ ] Webhook: ao cancelar → deletar evento do Google Calendar
- [ ] Sincronização bidirecional (evento criado no Google reflete no sistema)

**Testes:**
- [ ] Agendamento criado aparece no Google Calendar do psicólogo
- [ ] Cancelamento remove o evento do Google Calendar

### 4.2 Notificações Automáticas

- [ ] Configurar cron job: 24h antes de cada sessão
- [ ] Envio de e-mail de lembrete ao paciente (Resend ou SendGrid)
- [ ] Envio de WhatsApp via Twilio ou Z-API
- [ ] Template de mensagem configurável por clínica

**Testes:**
- [ ] E-mail disparado 24h antes com dados corretos da consulta
- [ ] WhatsApp enviado com link de confirmação/cancelamento

### 4.3 Pagamento via Pix

- [ ] Integrar EFI Bank (Gerencianet) ou Stripe
- [ ] Geração de QR Code Pix ao confirmar consulta
- [ ] Webhook de confirmação de pagamento → atualiza `status_pagamento`
- [ ] Recibo gerado automaticamente após pagamento confirmado

**Testes:**
- [ ] QR Code gerado corretamente com valor da consulta
- [ ] Webhook de pagamento atualiza status para `pago`
- [ ] Recibo PDF gerado e disponível para download

---

## FASE 5 — Segurança e Conformidade (LGPD)

### 5.1 Logs de Auditoria

- [ ] Registrar em tabela `audit_logs`: quem, o quê, quando, IP
- [ ] Log imutável: sem UPDATE ou DELETE na tabela de logs
- [ ] Registrar todo acesso a prontuários (visualização, edição)
- [ ] Interface admin para consultar logs de auditoria

**Testes:**
- [ ] Acesso a prontuário gera entrada no `audit_log`
- [ ] Tentativa de deletar log é bloqueada por RLS
- [ ] Log contém: `user_id`, `action`, `resource`, `timestamp`, `ip`

### 5.2 Conformidade LGPD

- [ ] Tela de consentimento no cadastro de paciente (LGPD)
- [ ] Funcionalidade de exportação de dados do paciente (formato JSON)
- [ ] Funcionalidade de anonimização/exclusão de dados do paciente
- [ ] Política de retenção de dados configurável
- [ ] Criptografia dos campos sensíveis de prontuário no banco

**Testes:**
- [ ] Exportação retorna todos os dados do paciente em JSON válido
- [ ] Anonimização substitui CPF, nome e dados sensíveis por hashes
- [ ] Dados criptografados no banco não são legíveis sem a chave

---

## Padrões de Commit

Usar o formato **Conventional Commits**:

```
feat(modulo): descrição curta do que foi feito
fix(modulo): descrição do bug corrigido
test(modulo): testes adicionados ou corrigidos
docs: atualização de documentação
refactor(modulo): refatoração sem mudança de comportamento
chore: configuração, build, dependências
```

**Exemplos:**
```
feat(auth): implementar login e logout com Supabase Auth
test(appointments): adicionar teste de conflito de sala
fix(financial): corrigir cálculo de repasse para convênio
```

---

## Checklist antes de cada Push

- [ ] Código sem `console.log` de debug
- [ ] Variáveis de ambiente não commitadas (`.env` no `.gitignore`)
- [ ] Testes da funcionalidade passando
- [ ] TODO.md atualizado com tarefas concluídas marcadas com `[x]`
- [ ] Commit com mensagem no padrão Conventional Commits

---

*Última atualização: 2026-05-06 — Prontuários (criptografia AES-256-GCM + versionamento), Dashboard Psicólogo (FullCalendar + Tiptap + status concluido), Módulo Financeiro completo (backend + frontend), cards financeiros no Dashboard Admin, Landing Page completa (seção 3.0)*
