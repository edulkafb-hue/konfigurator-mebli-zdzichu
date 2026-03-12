// ============================================================================
// API ROUTE: /api/order
// Wysyła email z zamówieniem do Ciebie
// 
// KONFIGURACJA:
// 1. Załóż konto na Resend.com (darmowe do 3000 emaili/mies.)
// 2. Dodaj zmienne środowiskowe w Vercel:
//    - RESEND_API_KEY = twój klucz z Resend
//    - ORDER_EMAIL = twój email na zamówienia
// ============================================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customer, config, breakdown, total, date } = req.body;

  // Walidacja
  if (!customer?.name || !customer?.email || !customer?.phone) {
    return res.status(400).json({ error: 'Brakuje danych klienta' });
  }

  // Przygotuj treść emaila
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #92400e 0%, #78350f 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🪑 Nowe zamówienie szafki</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">${date}</p>
      </div>
      
      <div style="background: #fafaf9; padding: 24px; border: 1px solid #e7e5e4;">
        <h2 style="color: #44403c; margin-top: 0;">Dane klienta</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #78716c;">Imię i nazwisko:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #1c1917;">${customer.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #78716c;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${customer.email}" style="color: #92400e;">${customer.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #78716c;">Telefon:</td>
            <td style="padding: 8px 0;"><a href="tel:${customer.phone}" style="color: #92400e;">${customer.phone}</a></td>
          </tr>
          ${customer.notes ? `
          <tr>
            <td style="padding: 8px 0; color: #78716c;">Uwagi:</td>
            <td style="padding: 8px 0; color: #1c1917;">${customer.notes}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none;">
        <h2 style="color: #44403c; margin-top: 0;">Konfiguracja szafki</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #fafaf9;">
            <td style="padding: 12px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Typ</td>
            <td style="padding: 12px; font-weight: bold; color: #1c1917; border-bottom: 1px solid #e7e5e4;">${config.type}</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Wymiary</td>
            <td style="padding: 12px; font-weight: bold; color: #1c1917; border-bottom: 1px solid #e7e5e4;">${config.dimensions}</td>
          </tr>
          <tr style="background: #fafaf9;">
            <td style="padding: 12px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Materiał korpusu</td>
            <td style="padding: 12px; font-weight: bold; color: #1c1917; border-bottom: 1px solid #e7e5e4;">${config.material}</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Materiał frontu</td>
            <td style="padding: 12px; font-weight: bold; color: #1c1917; border-bottom: 1px solid #e7e5e4;">${config.frontMaterial}</td>
          </tr>
          <tr style="background: #fafaf9;">
            <td style="padding: 12px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Półki</td>
            <td style="padding: 12px; color: #1c1917; border-bottom: 1px solid #e7e5e4;">${config.shelves} szt.</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Plecy</td>
            <td style="padding: 12px; color: #1c1917; border-bottom: 1px solid #e7e5e4;">${config.backType}</td>
          </tr>
          <tr style="background: #fafaf9;">
            <td style="padding: 12px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Obrzeża</td>
            <td style="padding: 12px; color: #1c1917; border-bottom: 1px solid #e7e5e4;">${config.edgeType}</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #78716c; border-bottom: 1px solid #e7e5e4;">Nóżki</td>
            <td style="padding: 12px; color: #1c1917; border-bottom: 1px solid #e7e5e4;">${config.legs}</td>
          </tr>
          <tr style="background: #fafaf9;">
            <td style="padding: 12px; color: #78716c;">Zawiasy</td>
            <td style="padding: 12px; color: #1c1917;">${config.hinges}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: white; padding: 24px; border: 1px solid #e7e5e4; border-top: none;">
        <h2 style="color: #44403c; margin-top: 0;">Wycena</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${Object.entries(breakdown).filter(([,v]) => v > 0).map(([key, value]) => `
          <tr>
            <td style="padding: 8px 0; color: #78716c; text-transform: capitalize;">${key}</td>
            <td style="padding: 8px 0; text-align: right; color: #1c1917;">${value} zł</td>
          </tr>
          `).join('')}
        </table>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #92400e; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; color: #44403c;">RAZEM NETTO:</span>
          <span style="font-size: 28px; font-weight: bold; color: #92400e;">${total} zł</span>
        </div>
      </div>
      
      <div style="background: #44403c; color: white; padding: 16px 24px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="margin: 0; opacity: 0.8; font-size: 14px;">
          Odpowiedz na tego emaila lub zadzwoń do klienta: 
          <a href="tel:${customer.phone}" style="color: #fbbf24;">${customer.phone}</a>
        </p>
      </div>
    </div>
  `;

  // Wyślij email przez Resend
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ORDER_EMAIL = process.env.ORDER_EMAIL;

  if (!RESEND_API_KEY || !ORDER_EMAIL) {
    console.error('Brak konfiguracji email - sprawdź RESEND_API_KEY i ORDER_EMAIL');
    return res.status(500).json({ error: 'Błąd konfiguracji serwera' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Konfigurator Mebli <onboarding@resend.dev>', // Zmień po weryfikacji domeny
        to: ORDER_EMAIL,
        reply_to: customer.email,
        subject: `🪑 Nowe zamówienie: ${config.type} - ${customer.name}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Błąd wysyłania emaila' });
    }

    // Wyślij też potwierdzenie do klienta
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Konfigurator Mebli <onboarding@resend.dev>',
        to: customer.email,
        subject: `Potwierdzenie zamówienia - ${config.type}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h1 style="color: #92400e;">Dziękujemy za zamówienie!</h1>
            <p>Cześć ${customer.name.split(' ')[0]},</p>
            <p>Otrzymaliśmy Twoje zamówienie na <strong>${config.type}</strong> o wymiarach <strong>${config.dimensions}</strong>.</p>
            <p>Skontaktujemy się z Tobą w ciągu 24 godzin, aby potwierdzić szczegóły.</p>
            <p style="margin-top: 24px; padding: 16px; background: #fafaf9; border-radius: 8px;">
              <strong>Wartość zamówienia:</strong> ${total} zł netto
            </p>
            <p style="color: #78716c; font-size: 14px; margin-top: 24px;">
              Pozdrawiamy,<br>
              Zespół Meble Na Wymiar
            </p>
          </div>
        `,
      }),
    });

    return res.status(200).json({ success: true, message: 'Zamówienie wysłane!' });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
}
