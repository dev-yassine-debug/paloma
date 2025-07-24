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

    const { event_type, user_id, session_id, metadata, ip_address, user_agent } = await req.json()

    if (!event_type) {
      return new Response(
        JSON.stringify({ error: 'Event type is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert analytics event
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        user_id: user_id || null,
        session_id: session_id || null,
        metadata: metadata || {},
        ip_address: ip_address || null,
        user_agent: user_agent || null
      })

    if (error) {
      console.error('Error inserting analytics event:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to record analytics event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Analytics event recorded:', { event_type, user_id, session_id })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analytics event recorded successfully',
        event_id: data?.[0]?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error recording analytics:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})