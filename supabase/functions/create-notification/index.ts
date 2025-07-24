
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

    const { user_id, title, message, type, metadata } = await req.json()

    console.log('Creating notification:', { user_id, title, message, type })

    // Créer la notification
    const { data: notification, error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        type: type || 'info',
        metadata: metadata || {}
      })
      .select()
      .single()

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      throw new Error(`Erreur lors de la création de la notification: ${notificationError.message}`)
    }

    console.log('Notification created successfully:', notification.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification créée avec succès',
        data: {
          notification_id: notification.id,
          user_id,
          title,
          message
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-notification function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur lors de la création de la notification',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
