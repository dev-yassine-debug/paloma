
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const transactionId = url.searchParams.get("transaction_id");
    const securityToken = url.searchParams.get("token");
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let webhookData = {};
    
    // Handle both GET (redirect) and POST (webhook) requests
    if (req.method === "POST") {
      webhookData = await req.json();
      console.log("Telr POST webhook received:", webhookData);
    } else {
      // Handle GET redirect with query parameters
      console.log("Telr GET redirect received:", { status, transactionId, securityToken });
      webhookData = { status, transaction_id: transactionId, token: securityToken };
    }

    if (!transactionId) {
      console.error("No transaction ID provided");
      return new Response(
        JSON.stringify({ error: "ID de transaction manquant" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find the transaction in database
    const { data: transaction, error: findError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (findError || !transaction) {
      console.error("Transaction not found:", findError);
      return new Response(
        JSON.stringify({ error: "Transaction non trouvée" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Found transaction:", transaction);

    // Verify security token to prevent fraudulent calls
    const expectedToken = transaction.metadata?.security_token;
    if (!expectedToken || expectedToken !== securityToken) {
      console.error("Security token mismatch or missing");
      return new Response(
        JSON.stringify({ error: "Token de sécurité invalide" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if transaction is already processed to prevent duplicates
    if (transaction.status === 'completed') {
      console.log("Transaction already processed:", transactionId);
      if (req.method === "GET") {
        return new Response(null, {
          status: 302,
          headers: {
            "Location": `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/payment-success?transaction_id=${transactionId}`,
            ...corsHeaders
          }
        });
      }
      return new Response(
        JSON.stringify({ success: true, message: "Transaction déjà traitée" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Process the webhook based on transaction status
    if (status === "success" || status === "paid" || status === "authorised") {
      console.log("Processing successful payment for transaction:", transactionId);
      
      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from("payment_transactions")
        .update({
          status: "completed",
          metadata: { 
            ...transaction.metadata, 
            webhook_data: webhookData,
            completed_at: new Date().toISOString()
          }
        })
        .eq("id", transaction.id);

      if (updateError) {
        console.error("Error updating transaction:", updateError);
        throw updateError;
      }

      // Update user wallet balance if it's a wallet recharge
      if (transaction.type === "wallet_recharge") {
        console.log("Updating wallet balance for user:", transaction.user_id);
        
        // First, get or create wallet
        const { data: wallet, error: walletError } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", transaction.user_id)
          .maybeSingle();

        if (walletError) {
          console.error("Error finding wallet:", walletError);
          throw walletError;
        }

        if (!wallet) {
          // Create wallet if it doesn't exist
          const { error: createWalletError } = await supabase
            .from("wallets")
            .insert({
              user_id: transaction.user_id,
              balance: transaction.amount,
              total_earned: transaction.amount
            });
            
          if (createWalletError) {
            console.error("Error creating wallet:", createWalletError);
            throw createWalletError;
          }
        } else {
          // Update existing wallet
          const { error: updateWalletError } = await supabase
            .from("wallets")
            .update({ 
              balance: (wallet.balance || 0) + transaction.amount,
              total_earned: (wallet.total_earned || 0) + transaction.amount,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", transaction.user_id);

          if (updateWalletError) {
            console.error("Error updating wallet:", updateWalletError);
            throw updateWalletError;
          }
        }

        console.log("Wallet updated successfully for user:", transaction.user_id);
        
        // Create a success transaction record for wallet credit
        await supabase
          .from("payment_transactions")
          .insert({
            user_id: transaction.user_id,
            amount: transaction.amount,
            type: "wallet_credit",
            status: "completed",
            description_ar: `شحن محفظة نجح - مرجع: ${transactionId}`,
            description_en: `Wallet credit successful - Ref: ${transactionId}`,
            metadata: {
              source_transaction_id: transaction.id,
              telr_reference: transactionId,
              credited_at: new Date().toISOString()
            }
          });
      }

      // Redirect to success page for GET requests
      if (req.method === "GET") {
        return new Response(null, {
          status: 302,
          headers: {
            "Location": `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/payment-success?transaction_id=${transactionId}`,
            ...corsHeaders
          }
        });
      }

      console.log("Payment processed successfully for user:", transaction.user_id);
      
    } else if (status === "declined" || status === "failed") {
      console.log("Processing failed payment for transaction:", transactionId);
      
      // Update transaction status to failed
      const { error: updateError } = await supabase
        .from("payment_transactions")
        .update({
          status: "failed",
          metadata: { 
            ...transaction.metadata, 
            webhook_data: webhookData,
            failed_at: new Date().toISOString()
          }
        })
        .eq("id", transaction.id);

      if (updateError) {
        console.error("Error updating failed transaction:", updateError);
        throw updateError;
      }

      // Redirect to failure page for GET requests
      if (req.method === "GET") {
        return new Response(null, {
          status: 302,
          headers: {
            "Location": `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/payment-failed?transaction_id=${transactionId}`,
            ...corsHeaders
          }
        });
      }
      
    } else if (status === "cancelled") {
      console.log("Processing cancelled payment for transaction:", transactionId);
      
      // Update transaction status to cancelled
      const { error: updateError } = await supabase
        .from("payment_transactions")
        .update({
          status: "cancelled",
          metadata: { 
            ...transaction.metadata, 
            webhook_data: webhookData,
            cancelled_at: new Date().toISOString()
          }
        })
        .eq("id", transaction.id);

      if (updateError) {
        console.error("Error updating cancelled transaction:", updateError);
        throw updateError;
      }

      // Redirect to cancelled page for GET requests
      if (req.method === "GET") {
        return new Response(null, {
          status: 302,
          headers: {
            "Location": `${Deno.env.get("FRONTEND_URL") || "http://localhost:3000"}/payment-cancelled?transaction_id=${transactionId}`,
            ...corsHeaders
          }
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook traité avec succès",
        status: status,
        transaction_id: transactionId
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error processing Telr webhook:", error);
    return new Response(
      JSON.stringify({ error: `Erreur serveur: ${error.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
