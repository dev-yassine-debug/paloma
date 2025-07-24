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

    // Verify user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can manage promotions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Get all promotions
      const { data: promotions, error } = await supabase
        .from('promotions')
        .select(`
          *,
          promo_codes(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching promotions:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch promotions' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, promotions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { 
        title, 
        description, 
        discount_type, 
        discount_value, 
        min_purchase_amount, 
        max_discount_amount,
        start_date, 
        end_date, 
        usage_limit,
        applicable_categories,
        promo_codes 
      } = await req.json()

      if (!title || !discount_type || !discount_value || !start_date || !end_date) {
        return new Response(
          JSON.stringify({ error: 'Required fields: title, discount_type, discount_value, start_date, end_date' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create promotion
      const { data: promotion, error: promotionError } = await supabase
        .from('promotions')
        .insert({
          title,
          description,
          discount_type,
          discount_value: parseFloat(discount_value),
          min_purchase_amount: min_purchase_amount ? parseFloat(min_purchase_amount) : 0,
          max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
          start_date,
          end_date,
          usage_limit: usage_limit ? parseInt(usage_limit) : null,
          applicable_categories: applicable_categories || [],
          created_by: user.id
        })
        .select()
        .single()

      if (promotionError) {
        console.error('Error creating promotion:', promotionError)
        return new Response(
          JSON.stringify({ error: 'Failed to create promotion' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create promo codes if provided
      if (promo_codes && promo_codes.length > 0) {
        const codesData = promo_codes.map((code: any) => ({
          code: code.code.toUpperCase(),
          promotion_id: promotion.id,
          usage_limit: code.usage_limit ? parseInt(code.usage_limit) : null
        }))

        const { error: codesError } = await supabase
          .from('promo_codes')
          .insert(codesData)

        if (codesError) {
          console.error('Error creating promo codes:', codesError)
          // Continue even if codes creation fails
        }
      }

      console.log('Promotion created:', promotion)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Promotion created successfully',
          promotion 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'PUT') {
      const url = new URL(req.url)
      const promotionId = url.pathname.split('/').pop()

      if (!promotionId) {
        return new Response(
          JSON.stringify({ error: 'Promotion ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { is_active } = await req.json()

      const { data: promotion, error } = await supabase
        .from('promotions')
        .update({ is_active })
        .eq('id', promotionId)
        .select()
        .single()

      if (error) {
        console.error('Error updating promotion:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to update promotion' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Promotion updated successfully',
          promotion 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error managing promotions:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})