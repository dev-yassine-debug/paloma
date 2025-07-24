import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  is_active: boolean;
  address?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, is_active, address }: LocationUpdateRequest = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Vérifier que l'utilisateur est un vendeur
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'seller') {
      return new Response(
        JSON.stringify({ error: "Only sellers can update location" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validation des coordonnées
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Vérifier s'il existe déjà une localisation pour ce vendeur
    const { data: existingLocation, error: fetchError } = await supabase
      .from('seller_locations')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing location:', fetchError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let result;

    if (existingLocation) {
      // Mettre à jour la localisation existante
      const { data: updatedLocation, error: updateError } = await supabase
        .from('seller_locations')
        .update({
          latitude: latitude,
          longitude: longitude,
          is_active: is_active,
          address: address,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLocation.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating location:', updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update location" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      result = updatedLocation;
    } else {
      // Créer une nouvelle localisation
      const { data: newLocation, error: insertError } = await supabase
        .from('seller_locations')
        .insert({
          seller_id: user.id,
          latitude: latitude,
          longitude: longitude,
          is_active: is_active,
          address: address
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating location:', insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create location" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      result = newLocation;
    }

    // Mettre à jour également les coordonnées dans les produits du vendeur (pour compatibilité)
    if (is_active) {
      await supabase
        .from('products')
        .update({
          latitude: latitude,
          longitude: longitude
        })
        .eq('seller_id', user.id)
        .eq('status', 'approved');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        location: result,
        message: is_active ? "Location updated and activated" : "Location deactivated"
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in update-seller-location function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);