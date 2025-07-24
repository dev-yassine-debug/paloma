
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
        JSON.stringify({ error: 'Only admins can approve product updates' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { update_id, action, notes } = await req.json()

    if (!update_id || !action || !['approve', 'reject'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Update ID and valid action (approve/reject) are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing update request:', { update_id, action, admin_id: user.id })

    // Get the update request
    const { data: updateRequest, error: updateError } = await supabase
      .from('product_updates')
      .select('*')
      .eq('id', update_id)
      .eq('status', 'pending')
      .single()

    if (updateError || !updateRequest) {
      console.error('Update request not found:', updateError)
      return new Response(
        JSON.stringify({ error: 'Update request not found or already processed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'approve') {
      // Apply the updates to the product
      const updateData: any = {
        updated_at: new Date().toISOString()
      }
      
      if (updateRequest.name !== null) updateData.name = updateRequest.name
      if (updateRequest.description !== null) updateData.description = updateRequest.description
      if (updateRequest.price !== null) updateData.price = updateRequest.price
      if (updateRequest.quantity !== null) updateData.quantity = updateRequest.quantity
      if (updateRequest.category !== null) updateData.category = updateRequest.category
      if (updateRequest.image_url !== null) updateData.image_url = updateRequest.image_url
      if (updateRequest.video_url !== null) updateData.video_url = updateRequest.video_url

      console.log('Updating product with data:', updateData)

      // Update the product
      const { error: productUpdateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', updateRequest.product_id)

      if (productUpdateError) {
        console.error('Error updating product:', productUpdateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update product', details: productUpdateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Product updated successfully')
    }

    // Update the request status
    const { error: statusUpdateError } = await supabase
      .from('product_updates')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        notes: notes || null
      })
      .eq('id', update_id)

    if (statusUpdateError) {
      console.error('Error updating request status:', statusUpdateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update request status', details: statusUpdateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Product update request ${action}d successfully:`, { update_id, action, user_id: user.id })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Update request ${action}d successfully`,
        action: action,
        update_id: update_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing product update:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
