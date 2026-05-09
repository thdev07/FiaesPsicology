import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

function getClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
}

/**
 * Cria pagamento PIX + preferência de cartão para uma transação da clínica.
 * Retorna: { pixPaymentId, qr_code, qr_code_base64, checkout_url }
 */
export async function createMercadoPagoPayment({ transactionId, amount, description, patientEmail, patientName, patientCpf }) {
  const client = getClient();
  const baseUrl = process.env.FRONTEND_URL ?? process.env.APP_BASE_URL ?? '';
  const webhookUrl = `${process.env.API_BASE_URL ?? ''}/api/financial/payment/webhook`;

  const cpfDigits = patientCpf?.replace(/\D/g, '') ?? '';
  const identification = cpfDigits.length === 11
    ? { type: 'CPF', number: cpfDigits }
    : undefined;

  // 1. Pagamento PIX (QR Code in-app)
  const pixPayment = new Payment(client);
  let pixResult;
  try {
    pixResult = await pixPayment.create({
      body: {
        transaction_amount: Number(amount),
        description,
        payment_method_id: 'pix',
        payer: {
          email: patientEmail,
          first_name: patientName?.split(' ')[0] ?? 'Paciente',
          last_name: patientName?.split(' ').slice(1).join(' ') || 'Paciente',
          ...(identification ? { identification } : {}),
        },
        notification_url: webhookUrl,
        external_reference: transactionId,
      },
    });
  } catch (err) {
    const detail = err?.cause?.[0]?.description ?? err?.message ?? 'Erro ao criar pagamento PIX';
    throw { status: 502, message: `Mercado Pago: ${detail}` };
  }

  const qrData = pixResult.point_of_interaction?.transaction_data;

  // 2. Preferência de checkout (cartão) — opcional; exige back_urls com HTTPS
  let checkout_url = null;
  const isValidBaseUrl = baseUrl.startsWith('https://');
  if (isValidBaseUrl) {
    try {
      const preference = new Preference(client);
      const prefResult = await preference.create({
        body: {
          items: [{ title: description, quantity: 1, unit_price: Number(amount) }],
          payer: { email: patientEmail, name: patientName },
          back_urls: {
            success: `${baseUrl}/paciente/pagamento/sucesso`,
            failure: `${baseUrl}/paciente/agendamentos`,
            pending: `${baseUrl}/paciente/agendamentos`,
          },
          auto_return: 'approved',
          notification_url: webhookUrl,
          external_reference: transactionId,
        },
      });
      checkout_url = prefResult.sandbox_init_point ?? prefResult.init_point ?? null;
    } catch (_) {
      // card checkout indisponível — PIX segue normalmente
    }
  }

  return {
    pixPaymentId: String(pixResult.id),
    qr_code: qrData?.qr_code ?? null,
    qr_code_base64: qrData?.qr_code_base64 ? `data:image/png;base64,${qrData.qr_code_base64}` : null,
    checkout_url,
  };
}

/** Busca status de um pagamento PIX no Mercado Pago. */
export async function getMercadoPagoPaymentStatus(pixPaymentId) {
  const client = getClient();
  const payment = new Payment(client);
  const result = await payment.get({ id: pixPaymentId });
  return result.status; // 'pending', 'approved', 'rejected', etc.
}
