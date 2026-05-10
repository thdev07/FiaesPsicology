const TIPO_LABELS = {
  laudo: 'Laudo Psicológico',
  atestado: 'Atestado Psicológico',
  relatorio: 'Relatório Psicológico',
  declaracao: 'Declaração',
};

export function viewDocument(doc) {
  const dataEmissao = new Date(doc.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const tipo = TIPO_LABELS[doc.tipo] ?? doc.tipo;
  const psicologo = doc.users?.nome ?? '—';
  const numero = String(doc.id).slice(0, 8).toUpperCase();
  const conteudo = (doc.conteudo ?? '').replace(/\n/g, '<br/>');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${tipo} — ${doc.titulo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 48px; max-width: 680px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-dot { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #6366f1); }
    .brand-name { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
    .brand-sub { font-size: 0.75rem; color: #64748b; }
    .doc-meta { text-align: right; }
    .doc-meta .label { font-size: 0.7rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .doc-meta .value { font-size: 0.875rem; color: #475569; margin-top: 2px; }
    h1 { font-size: 1.4rem; font-weight: 800; color: #1e293b; text-align: center; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
    .subtitle { text-align: center; font-size: 0.85rem; color: '#64748b'; margin-bottom: 32px; color: #64748b; }
    .content { font-size: 0.95rem; line-height: 1.8; color: #334155; min-height: 200px; margin-bottom: 48px; white-space: pre-wrap; }
    .signature { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .sig-line { width: 220px; border-top: 1px solid #94a3b8; margin-bottom: 6px; }
    .sig-text { font-size: 0.8rem; color: #64748b; text-align: center; }
    .footer { text-align: center; font-size: 0.72rem; color: #94a3b8; margin-top: 40px; }
    @media print { body { padding: 24px; } @page { margin: 1cm; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-dot"></div>
      <div>
        <div class="brand-name">FiaesPsychology</div>
        <div class="brand-sub">Clínica de Psicologia</div>
      </div>
    </div>
    <div class="doc-meta">
      <div class="label">Nº do documento</div>
      <div class="value">#${numero}</div>
      <div class="label" style="margin-top:8px">Data de emissão</div>
      <div class="value">${dataEmissao}</div>
    </div>
  </div>

  <h1>${tipo}</h1>
  <p class="subtitle">${doc.titulo}</p>

  <div class="content">${conteudo}</div>

  <div class="signature">
    <div class="sig-line"></div>
    <div class="sig-text">${psicologo}</div>
    <div class="sig-text">Psicólogo(a) Responsável</div>
  </div>

  <div class="footer">
    FiaesPsychology — Documento emitido em ${dataEmissao}
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) setTimeout(() => URL.revokeObjectURL(url), 10000);
}
