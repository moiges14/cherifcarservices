import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message } = await req.json();

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: to,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send SMS: ${error}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, sid: result.sid }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending SMS:', error);
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