import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user is a seller
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'seller') {
      return new Response(
        JSON.stringify({ error: 'Only sellers can request product updates' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { product_id, updates } = await req.json()

    if (!product_id || !updates) {
      return new Response(
        JSON.stringify({ error: 'Product ID and updates are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the product belongs to the seller
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, seller_id')
      .eq('id', product_id)
      .eq('seller_id', user.id)
      .single()

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate YouTube URL if provided
    if (updates.video_url) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/
      if (!youtubeRegex.test(updates.video_url)) {
        return new Response(
          JSON.stringify({ error: 'Invalid YouTube URL format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create the update request
    const { data: updateRequest, error: updateError } = await supabase
      .from('product_updates')
      .insert({
        product_id: product_id,
        seller_id: user.id,
        name: updates.name,
        description: updates.description,
        price: updates.price ? parseFloat(updates.price) : null,
        quantity: updates.quantity ? parseInt(updates.quantity) : null,
        category: updates.category,
        image_url: updates.image_url,
        video_url: updates.video_url,
        status: 'pending'
      })
      .select()
      .single()

    if (updateError) {
      console.error('Error creating update request:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to create update request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Product update request created:', updateRequest)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Update request submitted successfully. Waiting for admin approval.',
        request_id: updateRequest.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error requesting product update:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})