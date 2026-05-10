export function generateReceipt(debt, patientName) {
  const appt = debt.appointments ?? {};
  const dataConsulta = appt.data
    ? new Date(`${appt.data}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';
  const dataEmissao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const valor = Number(debt.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const psicologo = appt.users?.nome ?? '—';
  const numero = String(debt.id).slice(0, 8).toUpperCase();

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Recibo ${numero}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 48px; max-width: 680px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-dot { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #6366f1); }
    .brand-name { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
    .brand-sub { font-size: 0.75rem; color: #64748b; }
    .receipt-meta { text-align: right; }
    .receipt-meta .label { font-size: 0.7rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .receipt-meta .value { font-size: 0.875rem; color: #475569; margin-top: 2px; }
    h1 { font-size: 1.5rem; font-weight: 800; color: #1e293b; text-align: center; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    .subtitle { text-align: center; font-size: 0.85rem; color: #64748b; margin-bottom: 36px; }
    .declaration { background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 20px 24px; font-size: 1rem; line-height: 1.7; color: #334155; margin-bottom: 32px; }
    .declaration strong { color: #1e293b; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 40px; }
    .detail-box { background: #f8fafc; border-radius: 6px; padding: 14px 18px; }
    .detail-box .label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .detail-box .val { font-size: 0.9rem; color: #334155; font-weight: 600; }
    .amount-box { background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 6px; padding: 14px 18px; }
    .amount-box .label { font-size: 0.7rem; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .amount-box .val { font-size: 1.25rem; color: #1d4ed8; font-weight: 800; }
    .signature { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    .sig-line { text-align: center; }
    .sig-line .line { width: 200px; border-top: 1px solid #94a3b8; margin-bottom: 6px; }
    .sig-line .text { font-size: 0.75rem; color: #64748b; }
    .footer { text-align: center; font-size: 0.72rem; color: #94a3b8; margin-top: 40px; }
    @media print {
      body { padding: 24px; }
      @page { margin: 1cm; }
    }
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
    <div class="receipt-meta">
      <div class="label">Número do recibo</div>
      <div class="value">#${numero}</div>
      <div class="label" style="margin-top:8px">Data de emissão</div>
      <div class="value">${dataEmissao}</div>
    </div>
  </div>

  <h1>Recibo de Pagamento</h1>
  <p class="subtitle">Comprovante de pagamento de serviço psicológico</p>

  <div class="declaration">
    Recebemos de <strong>${patientName}</strong> a quantia de <strong>${valor}</strong>,
    referente a <strong>${debt.categoria ?? 'Consulta'}</strong>
    realizada em <strong>${dataConsulta}</strong>, sob responsabilidade do(a) psicólogo(a)
    <strong>${psicologo}</strong>.
  </div>

  <div class="details">
    <div class="detail-box">
      <div class="label">Paciente</div>
      <div class="val">${patientName}</div>
    </div>
    <div class="detail-box">
      <div class="label">Psicólogo(a)</div>
      <div class="val">${psicologo}</div>
    </div>
    <div class="detail-box">
      <div class="label">Serviço</div>
      <div class="val">${debt.categoria ?? 'Consulta'}</div>
    </div>
    <div class="detail-box">
      <div class="label">Data da consulta</div>
      <div class="val">${dataConsulta}</div>
    </div>
    <div class="amount-box" style="grid-column: span 2">
      <div class="label">Valor pago</div>
      <div class="val">${valor}</div>
    </div>
  </div>

  <div class="signature">
    <div class="sig-line">
      <div class="line"></div>
      <div class="text">Assinatura do(a) Psicólogo(a)</div>
      <div class="text">${psicologo}</div>
    </div>
    <div class="sig-line">
      <div class="line"></div>
      <div class="text">Assinatura do(a) Paciente</div>
      <div class="text">${patientName}</div>
    </div>
  </div>

  <div class="footer">
    Este recibo é válido como comprovante de pagamento de serviço psicológico.<br/>
    FiaesPsychology — Emitido em ${dataEmissao}
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) setTimeout(() => URL.revokeObjectURL(url), 10000);
}
