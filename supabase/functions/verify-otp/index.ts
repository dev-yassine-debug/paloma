
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  phone: string;
  otp: string;
  role: string;
}

// Fonction pour normaliser le numéro de téléphone
function normalizePhoneNumber(phone: string): string {
  // Nettoyer le numéro
  let cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Si commence déjà par +, le retourner tel quel
  if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }
  
  // Si commence par 0, remplacer par +212 (Maroc par défaut)
  if (cleanPhone.startsWith('0')) {
    return `+212${cleanPhone.substring(1)}`;
  }
  
  // Si commence par un code pays sans +, ajouter le +
  if (cleanPhone.startsWith('212') || cleanPhone.startsWith('966') || 
      cleanPhone.startsWith('971') || cleanPhone.startsWith('965') || 
      cleanPhone.startsWith('974')) {
    return `+${cleanPhone}`;
  }
  
  // Par défaut, ajouter +212
  return `+212${cleanPhone}`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, role }: VerifyOTPRequest = await req.json();
    
    // Normaliser le numéro de téléphone
    const normalizedPhone = normalizePhoneNumber(phone);
    console.log(`Verifying OTP: phone=${phone}, normalized=${normalizedPhone}, otp=${otp}, role=${role}`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify OTP format
    if (otp.length !== 4 || !/^\d+$/.test(otp)) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if OTP exists and is valid
    console.log(`Searching for OTP: phone=${normalizedPhone}, otp=${otp}, time=${new Date().toISOString()}`);
    
    const { data: otpRecord, error: otpFetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('otp_code', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log(`OTP search result:`, { otpRecord, otpFetchError });

    if (otpFetchError) {
      console.error('Error fetching OTP:', otpFetchError);
      return new Response(
        JSON.stringify({ error: "Database error while verifying OTP" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!otpRecord) {
      console.log(`No valid OTP found for phone=${normalizedPhone}, otp=${otp}`);
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Valid OTP found: ${otpRecord.id}`);
    
    // Check if profile already exists
    const { data: existingProfile, error: getProfileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('phone', normalizedPhone)
      .maybeSingle();
    
    if (getProfileError) {
      console.error('Error checking profile:', getProfileError);
      throw new Error('Failed to check profile existence');
    }
    
    let userId = null;
    const email = `${normalizedPhone.replace('+', '').replace(/\D/g, '')}@temp.local`;
    const password = `pwd${otp}${Date.now().toString().slice(-6)}`;
    
    if (!existingProfile) {
      console.log(`New user registration for phone: ${normalizedPhone} with role: ${role}`);
      
      // Vérifier que les admins ne peuvent pas s'inscrire via mobile
      if (role === 'admin') {
        return new Response(
          JSON.stringify({ 
            error: "المديرون لا يمكنهم التسجيل عبر التطبيق المحمول. يرجى استخدام لوحة التحكم الإدارية." 
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          phone: normalizedPhone,
          role: role,
          name: `User_${normalizedPhone.replace('+', '')}`
        }
      });

      console.log(`Create user result:`, { data: newUser, error: createError });

      if (createError) {
        console.error('Error creating user:', createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      userId = newUser.user?.id;
      console.log(`New user created with ID: ${userId}`);

      if (userId) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            phone: normalizedPhone,
            role: role,
            name: `User_${normalizedPhone.replace('+', '')}`,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error('Failed to create profile');
        }

        // Create wallet
        const { error: walletError } = await supabase
          .from('wallets')
          .insert({
            user_id: userId,
            balance: 0,
          });

        if (walletError) {
          console.error('Error creating wallet:', walletError);
          throw new Error('Failed to create wallet');
        }
        
        console.log(`New user created successfully: ${userId}`);
      }
    } else {
      console.log(`Existing user login for phone: ${normalizedPhone}`);
      userId = existingProfile.id;
      
      // Vérifier que les admins tentent de se connecter depuis l'interface web uniquement
      if (existingProfile.role === 'admin') {
        return new Response(
          JSON.stringify({ 
            error: "المديرون لا يمكنهم الدخول عبر التطبيق المحمول. يرجى استخدام لوحة التحكم الإدارية.",
            redirectToWeb: true
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      // Vérifier la cohérence du rôle pour les utilisateurs existants
      if (existingProfile.role !== role && role !== 'admin') {
        const currentRoleText = existingProfile.role === 'seller' ? 'بائع' : 'مشتري';
        const requestedRoleText = role === 'seller' ? 'بائع' : 'مشتري';
        return new Response(
          JSON.stringify({ 
            error: `هذا الرقم مسجل بالفعل كـ ${currentRoleText}. يرجى اختيار الدور الصحيح للدخول.` 
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      // Update password for existing user
      try {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          { password: password }
        );
        
        if (updateError) {
          console.error('Error updating user password:', updateError);
        }
      } catch (updateErr) {
        console.error('Error updating password:', updateErr);
      }
      
      console.log(`Existing user password updated: ${userId}`);
    }

    // Mark OTP as used
    const { error: markUsedError } = await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id);

    if (markUsedError) {
      console.error('Error marking OTP as used:', markUsedError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP verified successfully",
        email: email,
        password: password,
        phone: normalizedPhone
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
