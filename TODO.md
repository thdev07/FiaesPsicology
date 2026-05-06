# PsyManager — Roadmap de Desenvolvimento

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

- [ ] Executar `supabase/migrations/001_initial_schema.sql` no SQL Editor do Supabase
- [ ] Verificar criação das tabelas: `users`, `patients`, `rooms`, `appointments`, `medical_records`, `transactions`, `insurance_plans`
- [ ] Validar políticas RLS (Row Level Security) por role
- [ ] Criar usuário admin inicial via Supabase Dashboard

**Testes:**
- [ ] Testar que psicólogo **não consegue** acessar dados de outro psicólogo via SQL direto
- [ ] Testar que paciente **não consegue** ver prontuários via RLS
- [ ] Testar que admin consegue ver todos os registros

### 1.2 Autenticação

- [ ] Configurar variáveis de ambiente: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` no backend
- [ ] Configurar variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` no frontend
- [ ] Implementar `POST /api/auth/signin` — login com email/senha
- [ ] Implementar `POST /api/auth/signout` — logout
- [ ] Implementar `GET /api/auth/me` — retorna usuário logado
- [ ] Implementar `AuthContext` no frontend (sessão global + role)
- [ ] Implementar `ProtectedRoute` com redirecionamento por role
- [ ] Implementar página de Login (`/login`)
- [ ] Implementar página de Cadastro de paciente (`/register`)

**Testes:**
- [ ] Login com credenciais válidas retorna token JWT
- [ ] Login com credenciais inválidas retorna `401`
- [ ] Rota protegida sem token retorna `401`
- [ ] Rota protegida com role errado retorna `403`
- [ ] Logout invalida a sessão
- [ ] Refresh de página mantém sessão ativa

---

## FASE 2 — Módulos Backend

### 2.1 Módulo de Usuários (`/api/users`)

- [ ] `GET /api/users` — listar todos os usuários (admin)
- [ ] `GET /api/users/:id` — buscar usuário por ID (admin)
- [ ] `PUT /api/users/:id` — atualizar usuário (admin)
- [ ] `DELETE /api/users/:id` — remover usuário (admin)
- [ ] Criar usuário psicólogo via Supabase Auth Admin API

**Testes:**
- [ ] Psicólogo não acessa `GET /api/users` (retorna `403`)
- [ ] Admin acessa `GET /api/users` com sucesso
- [ ] `DELETE` de usuário inexistente retorna `404`

### 2.2 Módulo de Pacientes (`/api/patients`)

- [ ] `GET /api/patients` — listar pacientes (admin + psicólogo)
- [ ] `GET /api/patients/:id` — buscar paciente (admin + psicólogo)
- [ ] `POST /api/patients` — cadastrar paciente (admin)
- [ ] `PUT /api/patients/:id` — atualizar paciente (admin + psicólogo)
- [ ] `DELETE /api/patients/:id` — remover paciente (admin)
- [ ] Validação de CPF único
- [ ] Associação com plano de convênio (`plano_id`)

**Testes:**
- [ ] Cadastro com CPF duplicado retorna `409`
- [ ] Campos obrigatórios ausentes retornam `400`
- [ ] Paciente criado retorna status `201`

### 2.3 Módulo de Salas (`/api/rooms`)

- [ ] `GET /api/rooms` — listar salas
- [ ] `GET /api/rooms/:id` — detalhes da sala
- [ ] `POST /api/rooms` — criar sala (admin)
- [ ] `PUT /api/rooms/:id` — atualizar sala (admin)
- [ ] `DELETE /api/rooms/:id` — remover sala (admin)

**Testes:**
- [ ] Sala criada com sucesso retorna `201`
- [ ] Paciente não acessa `POST /api/rooms` (retorna `403`)

### 2.4 Módulo de Agendamentos (`/api/appointments`)

- [ ] `GET /api/appointments` — listar (filtros por data, psicólogo, status)
- [ ] `GET /api/appointments/:id` — detalhes do agendamento
- [ ] `POST /api/appointments` — criar agendamento **com validação de conflito de sala**
- [ ] `PUT /api/appointments/:id` — atualizar agendamento
- [ ] `PATCH /api/appointments/:id/cancel` — cancelar agendamento
- [ ] Validação: não permitir dois agendamentos na mesma sala, data e hora

**Testes:**
- [ ] Criação de agendamento sem conflito retorna `201`
- [ ] Criação com conflito de sala retorna `409 "Sala já ocupada neste horário"`
- [ ] Cancelamento atualiza status para `cancelado`
- [ ] Agendamento cancelado libera a sala para novo agendamento

### 2.5 Módulo de Prontuários (`/api/medical-records`)

- [ ] `GET /api/medical-records/:consultaId` — buscar prontuário da consulta
- [ ] `POST /api/medical-records` — criar prontuário (psicólogo)
- [ ] `PUT /api/medical-records/:id` — atualizar prontuário (psicólogo)
- [ ] Versionamento automático (campo `versao` incrementado a cada update)
- [ ] Criptografia dos campos `evolucao` e `anamnese` (LGPD)

**Testes:**
- [ ] Psicólogo não acessa prontuário de paciente de outro psicólogo (retorna `403`)
- [ ] Atualização incrementa `versao`
- [ ] Admin consegue acessar qualquer prontuário

### 2.6 Módulo Financeiro (`/api/financial`)

- [ ] `GET /api/financial` — listar transações (admin)
- [ ] `GET /api/financial/summary` — resumo: receitas, despesas, saldo
- [ ] `POST /api/financial` — registrar transação manualmente (admin)
- [ ] Cálculo automático de repasse ao criar transação de consulta
- [ ] Geração de transação automática ao confirmar agendamento

**Testes:**
- [ ] Psicólogo não acessa `GET /api/financial` (retorna `403`)
- [ ] Summary retorna `receitas`, `despesas` e `saldo` corretos
- [ ] Repasse calculado corretamente (% clínica vs % psicólogo)

### 2.7 Módulo de Convênios (`/api/insurance`)

- [ ] `GET /api/insurance` — listar planos de convênio
- [ ] `POST /api/insurance` — criar plano (admin)
- [ ] `PUT /api/insurance/:id` — atualizar plano (admin)
- [ ] Regras de coparticipação por plano
- [ ] Faturamento de guias

**Testes:**
- [ ] Plano criado corretamente com percentual de coparticipação
- [ ] Paciente associado ao plano tem coparticipação calculada no agendamento

---

## FASE 3 — Frontend

### 3.1 Autenticação

- [ ] Página de Login com validação de formulário
- [ ] Página de Cadastro (paciente)
- [ ] Redirecionamento automático por role após login:
  - Admin → `/admin`
  - Psicólogo → `/psicologo`
  - Paciente → `/paciente`
- [ ] Persistência de sessão com Supabase Auth
- [ ] Botão de logout no Header

**Testes:**
- [ ] Login com email inválido mostra mensagem de erro
- [ ] Usuário não autenticado é redirecionado para `/login`
- [ ] Logout limpa a sessão e redireciona para `/login`

### 3.2 Layout Base

- [ ] `Layout.jsx` — wrapper com Sidebar + Header + conteúdo
- [ ] `Sidebar.jsx` — navegação dinâmica por role
- [ ] `Header.jsx` — nome do usuário + botão logout
- [ ] `ProtectedRoute.jsx` — guarda de rotas por role

**Testes:**
- [ ] Admin vê menu de admin na Sidebar
- [ ] Psicólogo vê apenas seu menu
- [ ] Acesso direto a rota de admin por psicólogo redireciona para `/unauthorized`

### 3.3 Dashboard Admin

- [ ] Cards de resumo: total de receitas, despesas, saldo do mês
- [ ] Tabela dos últimos agendamentos
- [ ] Lista de psicólogos ativos
- [ ] Página de gestão de usuários (`/admin/users`)
- [ ] Página financeira com tabela de transações (`/admin/financial`)
- [ ] Página de relatórios por período (`/admin/reports`)

**Testes:**
- [ ] Cards de resumo exibem valores corretos vindos de `/api/financial/summary`
- [ ] Tabela de usuários lista todos os psicólogos
- [ ] Filtro de datas no financeiro funciona corretamente

### 3.4 Dashboard Psicólogo

- [ ] Cards: sessões do dia, próximas sessões
- [ ] Calendário drag-and-drop (`AgendaCalendar`) com `@fullcalendar/react`
- [ ] Cores por status: verde=confirmado, amarelo=pendente, vermelho=cancelado
- [ ] Página de pacientes: listagem + busca por nome/CPF
- [ ] Página de prontuário: editor rich text com `@tiptap/react` + salvamento automático

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

*Última atualização: 2026-05-05*
