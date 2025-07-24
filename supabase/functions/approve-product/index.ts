
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { productId, action, adminId } = await req.json()
    
    console.log(`Admin ${adminId} attempting to ${action} product ${productId}`)

    if (!productId || !action || !['approve', 'reject'].includes(action)) {
      return Response.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verify admin authorization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single()

    if (!profile || profile.role !== 'admin') {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 403, headers: corsHeaders }
      )
    }

    // Get current product data
    const { data: product, error: fetchError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (fetchError || !product) {
      console.error('Product fetch error:', fetchError)
      return Response.json(
        { success: false, error: 'Product not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    console.log('Current product status:', product.status)
    console.log('Product type:', product.type)
    console.log('Product data:', product)

    // Validate service data if it's a service
    if (product.type === 'service') {
      console.log('Validating service fields:', {
        duration_hours: product.duration_hours,
        available_days: product.available_days,
        start_time: product.start_time,
        end_time: product.end_time
      })

      // Services need at least duration_hours and available_days
      if (!product.duration_hours || !product.available_days || product.available_days.length === 0) {
        console.log('Service validation failed - missing required fields')
        return Response.json(
          { success: false, error: 'Service missing required fields (duration_hours, available_days)' },
          { status: 400, headers: corsHeaders }
        )
      }
    }

    // Validate product data
    if (product.type === 'product' || !product.type) {
      if (!product.quantity || product.quantity <= 0) {
        console.log('Product validation failed - invalid quantity')
        return Response.json(
          { success: false, error: 'Product must have valid quantity' },
          { status: 400, headers: corsHeaders }
        )
      }
    }

    // Update product status using the service role key for admin permissions
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    
    const { data: updatedProduct, error: updateError } = await supabaseClient
      .from('products')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()

    if (updateError) {
      console.error('Product update error:', updateError)
      return Response.json(
        { success: false, error: `Failed to ${action} product: ${updateError.message}` },
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('Product updated successfully:', updatedProduct)

    // Log the action for analytics
    await supabaseClient
      .from('analytics_events')
      .insert({
        event_type: 'admin_product_action',
        user_id: adminId,
        metadata: {
          product_id: productId,
          action: action,
          previous_status: product.status,
          new_status: newStatus,
          product_type: product.type || 'product',
          product_name: product.name
        }
      })

    return Response.json(
      { 
        success: true, 
        message: `${product.type === 'service' ? 'Service' : 'Product'} ${action}d successfully`,
        product: updatedProduct?.[0] || null
      },
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Approve product error:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders }
    )
  }
})
