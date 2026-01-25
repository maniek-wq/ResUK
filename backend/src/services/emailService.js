const { Resend } = require('resend');

// Inicjalizacja Resend
let resend = null;

const initializeResend = () => {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend email service zainicjalizowany');
    return true;
  } else {
    console.warn('⚠️ RESEND_API_KEY nie ustawione - emaile nie będą wysyłane');
    return false;
  }
};

const isInitialized = () => {
  return resend !== null;
};

/**
 * Generuje HTML szablonu emaila potwierdzenia rezerwacji
 */
const generateReservationEmailHtml = (reservation, location) => {
  const dateStr = new Date(reservation.date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const customerName = reservation.customer?.firstName || 'Gościu';
  const guestsText = reservation.guests === 1 ? '1 osoba' : `${reservation.guests} osób`;
  
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potwierdzenie rezerwacji - U Kelnerów</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); padding: 40px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 1px;">
                U Kelnerów
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; letter-spacing: 2px;">
                RESTAURACJA
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #8B4513; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                Dziękujemy za rezerwację!
              </h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Drogi/a <strong>${customerName}</strong>,<br><br>
                Twoja rezerwacja została przyjęta i oczekuje na potwierdzenie przez nasz zespół. 
                Otrzymasz osobną wiadomość, gdy rezerwacja zostanie potwierdzona.
              </p>
              
              <!-- Reservation Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f5; border-radius: 8px; border-left: 4px solid #8B4513;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #8B4513; margin: 0 0 20px 0; font-size: 18px;">
                      📋 Szczegóły rezerwacji
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">
                          📅 Data:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                          ${dateStr}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          🕐 Godzina:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                          ${reservation.timeSlot?.start || 'Do ustalenia'}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          👥 Liczba gości:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                          ${guestsText}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          📍 Lokalizacja:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                          ${location?.name || 'U Kelnerów'}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          🏠 Adres:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                          ${location?.address || 'al. Wyzwolenia 41/u3a, 70-206 Szczecin'}
                        </td>
                      </tr>
                      ${reservation.notes ? `
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          📝 Uwagi:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">
                          ${reservation.notes}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Status Badge -->
              <div style="margin: 30px 0; text-align: center;">
                <span style="display: inline-block; background-color: #FEF3C7; color: #92400E; padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                  ⏳ Status: Oczekuje na potwierdzenie
                </span>
              </div>
              
              <!-- Contact Info -->
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                W razie pytań lub zmian, prosimy o kontakt:<br>
                📞 <a href="tel:+48734213403" style="color: #8B4513; text-decoration: none;">+48 734 213 403</a><br>
                ✉️ <a href="mailto:info@ukelnerow.pl" style="color: #8B4513; text-decoration: none;">info@ukelnerow.pl</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2d2d2d; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                Do zobaczenia!
              </p>
              <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 13px;">
                Zespół U Kelnerów
              </p>
              <p style="color: rgba(255,255,255,0.5); margin: 20px 0 0 0; font-size: 12px;">
                al. Wyzwolenia 41/u3a, 70-206 Szczecin
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Generuje HTML emaila o potwierdzeniu rezerwacji przez restaurację
 */
const generateConfirmationEmailHtml = (reservation, location) => {
  const dateStr = new Date(reservation.date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const customerName = reservation.customer?.firstName || 'Gościu';
  const guestsText = reservation.guests === 1 ? '1 osoba' : `${reservation.guests} osób`;
  
  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rezerwacja potwierdzona - U Kelnerów</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 40px 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                Rezerwacja potwierdzona!
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Drogi/a <strong>${customerName}</strong>,<br><br>
                Z przyjemnością informujemy, że Twoja rezerwacja została <strong>potwierdzona</strong>!
                Czekamy na Ciebie w naszej restauracji.
              </p>
              
              <!-- Reservation Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #166534;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #166534; margin: 0 0 20px 0; font-size: 18px;">
                      📋 Szczegóły rezerwacji
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">
                          📅 Data:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                          ${dateStr}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          🕐 Godzina:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                          ${reservation.timeSlot?.start || 'Do ustalenia'}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          👥 Liczba gości:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                          ${guestsText}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          📍 Lokalizacja:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                          ${location?.name || 'U Kelnerów'}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666; font-size: 14px;">
                          🏠 Adres:
                        </td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: 600;">
                          ${location?.address || 'al. Wyzwolenia 41/u3a, 70-206 Szczecin'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Status Badge -->
              <div style="margin: 30px 0; text-align: center;">
                <span style="display: inline-block; background-color: #DCFCE7; color: #166534; padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                  ✓ Status: Potwierdzona
                </span>
              </div>
              
              <!-- Google Maps Link -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.google.com/maps/dir/?api=1&destination=al.+Wyzwolenia+41,+70-206+Szczecin,+Poland" 
                   style="display: inline-block; background-color: #8B4513; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  🗺️ Wyznacz trasę do restauracji
                </a>
              </div>
              
              <!-- Contact Info -->
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                W razie pytań lub konieczności anulowania, prosimy o kontakt:<br>
                📞 <a href="tel:+48734213403" style="color: #8B4513; text-decoration: none;">+48 734 213 403</a><br>
                ✉️ <a href="mailto:info@ukelnerow.pl" style="color: #8B4513; text-decoration: none;">info@ukelnerow.pl</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #2d2d2d; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                Do zobaczenia!
              </p>
              <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 13px;">
                Zespół U Kelnerów
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Wysyła email potwierdzenia rezerwacji do klienta
 */
const sendReservationConfirmationEmail = async (reservation, location) => {
  if (!resend) {
    console.warn('[EmailService] ❌ Resend nie zainicjalizowany - email nie wysłany');
    return { success: false, error: 'Email service not initialized' };
  }
  
  const customerEmail = reservation.customer?.email;
  
  if (!customerEmail) {
    console.warn('[EmailService] ❌ Brak adresu email klienta');
    return { success: false, error: 'No customer email' };
  }
  
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'rezerwacje@ukelnerow.pl';
    const fromName = process.env.RESEND_FROM_NAME || 'U Kelnerów';
    
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: customerEmail,
      subject: 'Potwierdzenie rezerwacji - U Kelnerów',
      html: generateReservationEmailHtml(reservation, location)
    });
    
    if (error) {
      console.error('[EmailService] ❌ Błąd wysyłania emaila:', error);
      return { success: false, error };
    }
    
    console.log(`[EmailService] ✅ Email wysłany do ${customerEmail}, ID: ${data?.id}`);
    return { success: true, data };
    
  } catch (error) {
    console.error('[EmailService] ❌ Wyjątek przy wysyłaniu emaila:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Wysyła email o potwierdzeniu rezerwacji przez restaurację
 */
const sendReservationApprovedEmail = async (reservation, location) => {
  if (!resend) {
    console.warn('[EmailService] Resend nie zainicjalizowany - email nie wysłany');
    return { success: false, error: 'Email service not initialized' };
  }
  
  const customerEmail = reservation.customer?.email;
  if (!customerEmail) {
    console.warn('[EmailService] Brak adresu email klienta');
    return { success: false, error: 'No customer email' };
  }
  
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'rezerwacje@ukelnerow.pl';
    const fromName = process.env.RESEND_FROM_NAME || 'U Kelnerów';
    
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: customerEmail,
      subject: '✓ Rezerwacja potwierdzona - U Kelnerów',
      html: generateConfirmationEmailHtml(reservation, location)
    });
    
    if (error) {
      console.error('[EmailService] ❌ Błąd wysyłania emaila:', error);
      return { success: false, error };
    }
    
    console.log(`[EmailService] ✅ Email potwierdzenia wysłany do ${customerEmail}, ID: ${data?.id}`);
    return { success: true, data };
    
  } catch (error) {
    console.error('[EmailService] ❌ Wyjątek przy wysyłaniu emaila:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeResend,
  isInitialized,
  sendReservationConfirmationEmail,
  sendReservationApprovedEmail
};
