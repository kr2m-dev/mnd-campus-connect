import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerifyRequest {
  code: string;
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

    const { code }: VerifyRequest = await req.json();

    if (!code || code.length !== 6) {
      throw new Error("Invalid verification code format");
    }

    // Verify the code using database function
    const { data: isValid, error: verifyError } = await supabase
      .rpc("verify_whatsapp_code", { verification_code: code });

    if (verifyError) {
      console.error("Verification error:", verifyError);
      throw new Error("Failed to verify code");
    }

    if (isValid) {
      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          message: "Numéro de téléphone vérifié avec succès!",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          verified: false,
          message: "Code invalide ou expiré. Veuillez réessayer.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in verify-whatsapp-code:", error);
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
