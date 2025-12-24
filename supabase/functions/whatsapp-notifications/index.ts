import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  phone: string;
  message: string;
  type: 'fee_reminder' | 'class_reminder' | 'homework' | 'report' | 'general';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { phone, message, type } = payload;

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phone and message' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // In production, integrate with WhatsApp Business API or services like Twilio
    // For now, this is a placeholder that logs the notification
    console.log(`[WhatsApp Notification] Type: ${type}`);
    console.log(`Phone: ${phone}`);
    console.log(`Message: ${message}`);

    // Simulate sending notification
    // In production, replace with actual WhatsApp API call:
    // Example with Twilio:
    // const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     From: 'whatsapp:+14155238886',
    //     To: `whatsapp:${phone}`,
    //     Body: message,
    //   }),
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully (simulated)',
        details: {
          phone,
          type,
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing notification:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
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