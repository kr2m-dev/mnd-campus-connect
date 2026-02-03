import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerificationRequest {
  phone: string;
}

const SUPABASE_URL = "https://zdvemexeuorsbcermvqr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdmVtZXhldW9yc2JjZXJtdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Mjk3ODQsImV4cCI6MjA3NDQwNTc4NH0.MPlRgtLwczGoIo8K6_Sn0zpk2yjZqT-GsNI9IUSjRJQ";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Create Supabase client with user's token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const { phone }: VerificationRequest = await req.json();

    if (!phone) {
      throw new Error("Phone number is required");
    }

    // Format phone number for WhatsApp (remove + and spaces)
    const formattedPhone = phone.replace(/\D/g, "");

    // Generate verification code using database function
    const { data: verificationData, error: verificationError } = await supabase
      .rpc("create_whatsapp_verification", { phone_number: formattedPhone });

    if (verificationError) {
      console.error("Verification creation error:", verificationError);
      throw new Error("Failed to create verification code");
    }

    const code = verificationData?.[0]?.code;
    if (!code) {
      throw new Error("Failed to generate verification code");
    }

    // Create WhatsApp message
    const message = `🔐 *SenCampusLink - Code de vérification*\n\nVotre code de vérification est: *${code}*\n\nCe code expire dans 15 minutes.\n\n⚠️ Ne partagez jamais ce code avec personne.`;

    // Check if WhatsApp Business API is configured
    const whatsappToken = Deno.env.get("WHATSAPP_TOKEN");
    const whatsappPhoneId = Deno.env.get("WHATSAPP_PHONE_ID");

    if (whatsappToken && whatsappPhoneId) {
      // Send via WhatsApp Business API
      const whatsappResponse = await fetch(
        `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: formattedPhone,
            type: "text",
            text: { body: message },
          }),
        }
      );

      if (!whatsappResponse.ok) {
        const errorData = await whatsappResponse.text();
        console.error("WhatsApp API error:", errorData);
        // Fall back to returning the code for manual sending
        return new Response(
          JSON.stringify({
            success: true,
            method: "manual",
            message: "WhatsApp API non disponible. Code généré pour envoi manuel.",
            whatsappUrl: `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`,
            expiresAt: verificationData[0].expires_at,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          method: "api",
          message: "Code de vérification envoyé par WhatsApp",
          expiresAt: verificationData[0].expires_at,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      // No WhatsApp API configured - return URL for manual click-to-send
      // This opens WhatsApp with the message pre-filled
      return new Response(
        JSON.stringify({
          success: true,
          method: "click_to_send",
          message: "Cliquez pour envoyer le code par WhatsApp",
          whatsappUrl: `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`,
          expiresAt: verificationData[0].expires_at,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-whatsapp-verification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
