# Plano de Implementação — Fatia 1
## Prontuários + Dashboard Psicólogo

**Stack:** Node.js + Express · React + Vite · Supabase  
**Estimativa:** 4 blocos de trabalho sequenciais  
**Objetivo:** Psicólogo consegue logar, ver sua agenda, abrir uma consulta e escrever/salvar o prontuário.

---

## Estado atual

| Arquivo | Estado |
|---------|--------|
| `backend/modules/medical-records/*.js` | Skeleton funcional — falta criptografia, versionamento e join |
| `frontend/pages/psychologist/Dashboard.jsx` | Placeholder `<div>` |
| `frontend/pages/psychologist/Agenda.jsx` | Placeholder — FullCalendar não instalado |
| `frontend/pages/psychologist/Records.jsx` | Placeholder — Tiptap não instalado |
| `frontend/pages/psychologist/Patients.jsx` | Placeholder `<div>` |
| `frontend/components/calendar/AgendaCalendar.jsx` | Skeleton sem implementação |
| `frontend/components/medical-records/RichTextEditor.jsx` | `<textarea>` simples |

---

## Bloco 1 — Backend: Prontuários (2.5)

### 1.1 Nova variável de ambiente

Adicionar em `backend/.env` e `backend/.env.example`:

```
ENCRYPTION_KEY=chave_hex_64_caracteres_aqui
```

Gerar com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 1.2 Utilitário de criptografia

Criar `backend/src/utils/crypto.js`:

- Algoritmo: **AES-256-GCM** (autenticado — detecta adulteração)
- Formato armazenado: `base64(iv):base64(authTag):base64(ciphertext)`
- Funções exportadas: `encrypt(text)` e `decrypt(stored)`
- Usar `crypto` nativo do Node.js (sem dependências externas)
- Se `ENCRYPTION_KEY` não estiver definido → lançar erro na inicialização

### 1.3 Atualizar `medical-records.service.js`

**`getRecordByConsultaService(consultaId)`**
- Select com join: `*, appointments(data, hora, status, patients(nome, cpf), users(nome))`
- Após busca: descriptografar `evolucao` e `anamnese` antes de retornar
- Se prontuário não existir (`.single()` retorna null): retornar `null` sem erro (controller trata como 404)

**`createRecordService(data)`**
- Validar campos obrigatórios: `consulta_id` é required
- Criptografar `evolucao` e `anamnese` antes do insert
- Setar `versao: 1` explicitamente

**`updateRecordService(id, data)`**
- Criptografar `evolucao` e `anamnese` antes do update
- Incrementar `versao` via `.select('versao').eq('id', id)` + `versao + 1`
- Atualizar `updated_at: new Date().toISOString()`
- Descriptografar antes de retornar

### 1.4 Atualizar `medical-records.controller.js`

**`getRecord`**
- Se `data === null`: `res.status(404).json({ error: 'Prontuário não encontrado' })`

**`createRecord`**
- Validar `req.body.consulta_id` presente — se não: `res.status(400)`

**`updateRecord`**
- Sem mudanças estruturais além da delegação ao service

### 1.5 Checklist Backend

- [ ] `ENCRYPTION_KEY` no `.env` e `.env.example`
- [ ] `src/utils/crypto.js` implementado e testado manualmente
- [ ] Service: encrypt no create/update, decrypt no get
- [ ] Service: versionamento automático no update
- [ ] Service: join com appointments → patients e users
- [ ] Controller: 404 quando prontuário não existe
- [ ] Controller: 400 quando `consulta_id` ausente no POST

---

## Bloco 2 — Frontend: Instalar Dependências

Executar na pasta `frontend/`:

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

**Por que essas versões:**
- FullCalendar: daygrid (visão mensal), timegrid (visão semanal/diária), interaction (drag-and-drop)
- Tiptap: starter-kit já inclui Bold, Italic, Heading, BulletList, Paragraph

---

## Bloco 3 — Frontend: Componentes Base

### 3.1 `AgendaCalendar.jsx`

Props: `{ appointments, onEventClick, onEventDrop }`

**Implementação:**
- Usar `<FullCalendar>` com plugins: `dayGridPlugin`, `timeGridPlugin`, `interactionPlugin`
- `initialView`: `timeGridWeek` (visão padrão: semana com horários)
- `locale`: `pt-br`
- Mapear `appointments` para eventos FullCalendar:
  ```js
  { id, title: paciente.nome, start: `${data}T${hora}`, color: corPorStatus(status) }
  ```
- Cores por status:
  - `confirmado` → `#22c55e` (verde)
  - `pendente` → `#f59e0b` (amarelo)
  - `cancelado` → `#ef4444` (vermelho)
- `eventClick`: chamar `onEventClick(event.id)`
- `eventDrop`: chamar `onEventDrop(event.id, novaData, novaHora)` → dispara `PUT /api/appointments/:id`
- `editable: true`, `selectable: true`
- Header toolbar: botões prev/next/today + views (month/week/day)

### 3.2 `RichTextEditor.jsx`

Props: `{ value, onChange, readOnly }`

**Implementação:**
- Usar `useEditor` do Tiptap com `StarterKit`
- Toolbar simples com botões: **Negrito**, *Itálico*, H2, H3, Lista
- `onUpdate`: chamar `onChange(editor.getHTML())` com debounce de 2s
- `readOnly`: setar `editor.setEditable(false)` quando `true`
- Estilo inline simples: borda, padding, min-height 300px
- Inicializar conteúdo via `content: value` no `useEditor`

---

## Bloco 4 — Frontend: Páginas do Psicólogo

### 4.1 `Dashboard.jsx` (Psicólogo)

**Dados buscados:**
- `GET /api/appointments?psicologo_id={userId}` — ou filtro via RLS automático
- Filtrar localmente: sessões de hoje, próximas 7 dias

**Cards:**
1. Sessões hoje (count por data === hoje)
2. Semana atual (count por semana)
3. Total de pacientes únicos (set de paciente_id)
4. Próxima sessão: nome + hora (primeira futura com status !== cancelado)

**Lista "Próximas Sessões":**
- Tabela com: paciente, data, hora, status badge
- Botão "Abrir Prontuário" → navega para `/psicologo/prontuario/:consultaId`

### 4.2 `Agenda.jsx` (Psicólogo)

**Dados:**
- `useEffect` → `GET /api/appointments` (RLS filtra automaticamente pelo psicólogo logado)
- Estado: `appointments`, `loading`

**Fluxo:**
1. Renderiza `<AgendaCalendar appointments={appointments} onEventClick={...} onEventDrop={...} />`
2. `onEventClick(id)` → navega para `/psicologo/prontuario/:consultaId`
3. `onEventDrop(id, novaData, novaHora)` → `api.put('/appointments/${id}', { data: novaData, hora: novaHora })` + refetch

### 4.3 `Records.jsx` (Prontuário)

**Rota:** `/psicologo/prontuario/:consultaId`

**Dados:**
- `GET /api/medical-records/:consultaId`
- Se 404: estado "novo prontuário" (form em branco)
- Se 200: popular editor com `evolucao` e `anamnese`

**Layout:**
- Header: nome do paciente, data da consulta, versão atual
- Duas abas: "Evolução" e "Anamnese"
- Cada aba renderiza `<RichTextEditor>`
- Botão "Salvar" (manual) + autosave 2s após parar de digitar
- Se POST (novo): `api.post('/medical-records', { consulta_id, evolucao, anamnese })`
- Se PUT (existente): `api.put('/medical-records/${record.id}', { evolucao, anamnese })`
- Mostrar `versao` e `updated_at` no rodapé

### 4.4 `Patients.jsx` (Psicólogo)

**Dados:**
- `GET /api/patients` (RLS + join com appointments filtra por psicólogo no futuro; por ora retorna todos)

**Layout:**
- Busca por nome ou CPF (filtro local)
- Tabela: nome, CPF, data nascimento, plano de saúde
- Botão "Ver Consultas" → navega para `/psicologo/agenda` com filtro pelo paciente

### 4.5 Atualizar `App.jsx` — Novas Rotas

```jsx
/psicologo/prontuario/:consultaId  →  Records
```

Verificar se a rota já existe; se não, adicionar dentro do `ProtectedRoute role="psicologo"`.

---

## Ordem de execução recomendada

```
1. Bloco 1 (backend prontuários) — pode testar via curl/Postman
2. Bloco 2 (npm install)
3. Bloco 3 (componentes base — sem dados reais ainda)
4. Bloco 4.3 (Records.jsx — integra componente + backend)
5. Bloco 4.1 (Dashboard.jsx)
6. Bloco 4.2 (Agenda.jsx — integra AgendaCalendar)
7. Bloco 4.4 (Patients.jsx)
```

---

## Riscos e decisões

| Risco | Decisão |
|-------|---------|
| FullCalendar drag-and-drop pode conflitar com agendamento de sala | Ao soltar: chamar `PUT /appointments/:id`; se retornar 409, reverter o evento visualmente com `revert()` |
| Tiptap retorna HTML — banco armazena HTML criptografado | Aceitável; na leitura o editor inicializa com HTML diretamente |
| RLS filtra prontuários por psicólogo via `appointments.psicologo_id` | Já configurado no schema; o service backend usa `service_role` que bypassa RLS — **atenção**: validar manualmente que `psicologo_id === req.user.id` antes de retornar |
| `ENCRYPTION_KEY` perdida = dados inacessíveis | Documentar no `.env.example`; fazer backup da chave fora do repositório |

---

## Testes a cobrir (do TODO.md)

- [ ] Psicólogo não acessa prontuário de paciente de outro psicólogo (403)
- [ ] Atualização incrementa `versao`
- [ ] Admin consegue acessar qualquer prontuário
- [ ] Calendário exibe apenas agendamentos do psicólogo logado
- [ ] Drag-and-drop atualiza data/hora no banco
- [ ] Editor salva automaticamente após 2s de inatividade

---

## Commits esperados (Conventional Commits)

```
feat(medical-records): implementar criptografia AES-256-GCM nos campos sensíveis
feat(medical-records): adicionar versionamento automático e join com paciente
feat(agenda): integrar FullCalendar com drag-and-drop e cores por status
feat(prontuario): implementar editor Tiptap com autosave por debounce
feat(psicologo): implementar dashboard com cards e lista de próximas sessões
feat(psicologo): implementar página de pacientes com busca
```

---

*Criado em: 2026-05-06*
