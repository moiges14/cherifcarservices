import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, bookingData } = await req.json();

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Template HTML pour l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981, #3B82F6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 20px; border: 1px solid #e5e7eb; }
            .booking-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Terranga VTC Services</h1>
              <p>${subject}</p>
            </div>
            <div class="content">
              <p>${message.replace(/\n/g, '<br>')}</p>
              
              ${bookingData ? `
                <div class="booking-details">
                  <h3>Détails de la réservation</h3>
                  <p><strong>Référence:</strong> ${bookingData.booking_reference}</p>
                  <p><strong>Date:</strong> ${bookingData.date} à ${bookingData.time}</p>
                  <p><strong>Départ:</strong> ${bookingData.pickup}</p>
                  <p><strong>Destination:</strong> ${bookingData.dropoff}</p>
                  <p><strong>Client:</strong> ${bookingData.user_email}</p>
                  <p><strong>Téléphone:</strong> ${bookingData.contact_phone || 'Non renseigné'}</p>
                  <p><strong>Passagers:</strong> ${bookingData.passengers || 1}</p>
                  ${bookingData.special_requests ? `<p><strong>Demandes spéciales:</strong> ${bookingData.special_requests}</p>` : ''}
                </div>
                
                <p>
                  <a href="https://www.terrangavtc.fr" class="button">
                    Voir dans l'application
                  </a>
                </p>
              ` : ''}
            </div>
            <div class="footer">
              <p>Terranga VTC Services - Service de transport professionnel</p>
              <p>Téléphone: 07 74 68 38 00 | Email: terrangavtcservices@outlook.fr</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Terranga VTC <notifications@terrangavtc.fr>',
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});