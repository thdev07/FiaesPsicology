Documentação de Requisitos: Sistema de Gestão Psicológica (PsyManager Clone)
1. Visão Geral
Sistema Web integrado para gestão de clínicas de psicologia, focado em automação de processos clínicos (prontuários), administrativos (agenda/salas) e financeiros (fluxo de caixa/convênios).

2. Perfis de Acesso (RBAC)
Administrador: Acesso total (financeiro, relatórios, gestão de profissionais e salas).

Psicólogo: Acesso à sua própria agenda, prontuários de seus pacientes e seus repasses financeiros.

Paciente: Acesso ao portal para agendamento, visualização de débitos e download de documentos/recibos.

3. Arquitetura de Dados (Entidades Principais)
Para o Claude criar o sistema, ele precisará entender os relacionamentos:

Users: (id, nome, email, senha, role, registro_profissional).

Patients: (id, nome, CPF, data_nasc, histórico_clinico, plano_id).

Appointments: (id, data, hora, status[confirmado, pendente, cancelado], tipo[particular, convenio], sala_id, paciente_id, psicologo_id).

MedicalRecords (Prontuários): (id, consulta_id, evolucao, anamnese, arquivos_anexos) -> Criptografado.

Transactions: (id, valor, tipo[receita, despesa], categoria, consulta_id, status_pagamento).

Rooms: (id, nome, recursos).

4. Requisitos Funcionais por Módulo (Resumo para o Prompt)
Agenda: Calendário Drag-and-drop com cores por status; integração via Webhook com Google Calendar.

Prontuário: Editor de texto rico com salvamento automático e versionamento de evolução clínica.

Financeiro: Cálculo automático de repasse (Clínica vs. Psicólogo) e integração com API de Pix (ex: EFI ou Stripe).

Comunicação: Disparo automático de WhatsApp/E-mail 24h antes da sessão.

Convênios: Regras de coparticipação e faturamento de guias.

🚀 Proposta de Infraestrutura "Foda" (Enterprise & Secure)
Para um sistema de saúde, não basta "funcionar"; ele precisa ser inexpugnável e resiliente. Esqueça o básico, aqui está uma arquitetura de nível profissional:

1. Stack Tecnológica de Elite
Frontend: Next.js 14+ (App Router) com Tailwind CSS e Shadcn/UI. (Velocidade de renderização e SEO excelentes).

Backend: NestJS (Node.js framework). É modular, usa TypeScript rigoroso e é preferido para sistemas complexos que exigem alta manutenibilidade.

Banco de Dados: PostgreSQL com Row Level Security (RLS). Isso garante que, a nível de banco, um psicólogo nunca consiga ver o dado de outro, mesmo se houver bug no código.

Cache/Real-time: Redis para gerenciar as sessões e as travas de agendamento de salas (evita "double booking").

2. Infraestrutura Cloud (AWS/GCP Style)
Em vez de um servidor simples, utilize Arquitetura de Containers e Serverless:

Orquestração: AWS ECS (Fargate). Roda seus containers Docker sem que você precise gerenciar servidores. Escala automaticamente se o número de acessos subir.

Storage (Documentos/Laudos): AWS S3 com Criptografia AES-256 no lado do servidor. Os documentos dos pacientes ficam isolados e protegidos.

Segurança (Auth): Clerk ou Auth0. Delegar a autenticação para especialistas garante MFA (Autenticação de dois fatores) e proteção contra ataques de força bruta.

Banco de Dados Gerenciado: AWS RDS (Postgres) com backups automatizados em múltiplas zonas de disponibilidade (se um datacenter cair, o outro assume).

3. Segurança e Conformidade (LGPD/HIPAA)
Criptografia de Ponta a Ponta: Dados sensíveis de prontuário devem ser criptografados no banco com uma chave mestra (AWS KMS).

Logs de Auditoria: Cada clique ou visualização de prontuário deve ser registrado num log imutável (quem viu o quê e quando?).

API Gateway: Uso de um WAF (Web Application Firewall) para barrar ataques de SQL Injection e DDoS.

🤖 Como pedir para o Claude criar o sistema?
Copie e cole o seguinte comando (Prompt) no Claude 3.5 Sonnet:

"Claude, aja como um Engenheiro de Software Senior. Preciso que você desenvolva a estrutura inicial de um sistema de gestão para clínicas de psicologia baseado na seguinte especificação: [COLE O TEXTO DO USUÁRIO AQUI].

Gostaria que você:

Defina o Schema do banco de dados (Prisma/PostgreSQL) garantindo as relações entre Pacientes, Psicólogos, Agendas e Financeiro.

Crie a lógica do Backend (NestJS ou Node.js) para o módulo de Agendamento, garantindo que não haja conflito de salas.

Implemente a lógica de permissões (RBAC) onde Psicólogos veem apenas seus pacientes e Admins veem o financeiro global.

Sugira a estrutura de pastas seguindo os princípios de Clean Architecture."