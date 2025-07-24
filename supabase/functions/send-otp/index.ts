
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  phone: string;
  role: string;
}

// Fonction pour normaliser le numéro de téléphone
function normalizePhoneNumber(phone: string): string {
  // Nettoyer le numéro
  let cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  console.log(`Normalizing phone: original="${phone}", cleaned="${cleanPhone}"`);
  
  // Si commence déjà par +, le retourner tel quel
  if (cleanPhone.startsWith('+')) {
    console.log(`Phone already starts with +: ${cleanPhone}`);
    return cleanPhone;
  }
  
  // Si commence par 0, remplacer par +212 (Maroc par défaut)
  if (cleanPhone.startsWith('0')) {
    const normalized = `+212${cleanPhone.substring(1)}`;
    console.log(`Phone starts with 0, normalized to: ${normalized}`);
    return normalized;
  }
  
  // Si commence par un code pays sans +, ajouter le +
  if (cleanPhone.startsWith('212') || cleanPhone.startsWith('966') || 
      cleanPhone.startsWith('971') || cleanPhone.startsWith('965') || 
      cleanPhone.startsWith('974')) {
    const normalized = `+${cleanPhone}`;
    console.log(`Phone starts with country code, normalized to: ${normalized}`);
    return normalized;
  }
  
  // Par défaut, ajouter +212
  console.log(`Default case, adding +212 to: ${cleanPhone}`);
  return `+212${cleanPhone}`;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`Received ${req.method} request to send-otp`);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);
    
    let parsedBody: SendOTPRequest;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const { phone, role } = parsedBody;
    
    if (!phone || !role) {
      console.error('Missing required fields:', { phone: !!phone, role: !!role });
      return new Response(
        JSON.stringify({ error: "Phone and role are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Normaliser le numéro de téléphone
    const normalizedPhone = normalizePhoneNumber(phone);
    console.log(`Processing OTP request: phone="${normalizedPhone}", role="${role}"`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Marquer tous les anciens OTP comme utilisés pour ce numéro
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('phone', normalizedPhone)
      .eq('used', false);
    
    if (updateError) {
      console.error('Error updating old OTPs:', updateError);
    }

    // Générer toujours un nouveau OTP (4 chiffres)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Stocker le nouveau OTP dans la base de données
    const { error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        phone: normalizedPhone,
        otp_code: otp,
        role: role,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      });
    
    if (otpError) {
      console.error('Error storing OTP:', otpError);
      return new Response(
        JSON.stringify({ error: 'Failed to store OTP' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log(`New OTP ${otp} generated and stored for phone: ${normalizedPhone}`);
    
    const ultraMsgApiKey = Deno.env.get("ULTRAMSG_API_KEY");
    const ultraMsgInstanceId = Deno.env.get("ULTRAMSG_INSTANCE_ID");
    
    if (!ultraMsgApiKey || !ultraMsgInstanceId) {
      console.log("UltraMsg credentials not configured, simulating OTP send");
      console.log(`OTP for ${normalizedPhone}: ${otp}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP sent successfully (development mode)",
          phone: normalizedPhone,
          // For development, we return the OTP (remove in production)
          otp: otp 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Real UltraMsg API call
    const message = `رمز التحقق الخاص بك في سوق المحلي: ${otp}\n\nلا تشارك هذا الرمز مع أحد.\n\nصالح لمدة 10 دقائق.`;
    
    // Format phone number correctly - remove + and use the full number
    const formattedPhone = normalizedPhone.replace('+', '');
    
    console.log(`Attempting to send OTP ${otp} via UltraMsg to: ${formattedPhone}`);
    
    try {
      const ultraMsgResponse = await fetch(`https://api.ultramsg.com/${ultraMsgInstanceId}/messages/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: ultraMsgApiKey,
          to: formattedPhone,
          body: message,
        }),
      });

      const responseData = await ultraMsgResponse.text();
      console.log('UltraMsg API Response Status:', ultraMsgResponse.status);
      console.log('UltraMsg API Response Data:', responseData);

      // Même si l'envoi SMS échoue, on considère que l'OTP est généré avec succès
      // pour permettre aux utilisateurs de continuer (utile pour les tests)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP sent successfully",
          phone: normalizedPhone,
          smsStatus: ultraMsgResponse.ok ? 'sent' : 'failed',
          // Pour les tests, inclure l'OTP si l'envoi SMS a échoué
          ...(ultraMsgResponse.ok ? {} : { otp: otp })
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      
      // En cas d'erreur d'envoi, on retourne quand même le succès avec l'OTP pour les tests
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP generated successfully (SMS failed)",
          phone: normalizedPhone,
          smsStatus: 'failed',
          otp: otp, // Pour les tests
          error: 'SMS service temporarily unavailable'
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error("Unexpected error in send-otp function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
