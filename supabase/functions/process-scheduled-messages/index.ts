import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting scheduled messages processing...');

    // Get messages scheduled for now or in the past
    const now = new Date().toISOString();
    console.log('Current time:', now);

    const { data: scheduledMessages, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('is_scheduled', true)
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(50); // Process max 50 messages at a time

    if (fetchError) {
      console.error('Error fetching scheduled messages:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${scheduledMessages?.length || 0} messages to process`);

    if (!scheduledMessages || scheduledMessages.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No scheduled messages to process',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const message of scheduledMessages) {
      try {
        console.log(`Processing message ID: ${message.id}, scheduled for: ${message.scheduled_for}`);

        // Check if message has been paid (for scheduled messages that require payment)
        if (message.price > 0 && !message.paid_at) {
          console.log(`Message ${message.id} requires payment but hasn't been paid yet, skipping...`);
          continue;
        }

        // Prepare webhook payload
        const webhookPayload = {
          phoneNumber: message.phone_number,
          messageText: message.message_text,
          mediaType: message.media_type,
          mediaFileUrl: message.media_file_url,
          mediaFileName: message.media_file_name,
          messageId: message.id
        };

        // Send to webhook (replace with your actual webhook URL)
        const webhookUrl = 'https://webhook.site/your-webhook-url'; // You'll need to replace this
        
        console.log('Sending to webhook:', webhookUrl);
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });

        if (webhookResponse.ok) {
          // Update message status to sent
          const { error: updateError } = await supabase
            .from('messages')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              processed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', message.id);

          if (updateError) {
            console.error(`Error updating message ${message.id}:`, updateError);
            results.push({ messageId: message.id, success: false, error: updateError.message });
          } else {
            console.log(`Message ${message.id} sent successfully`);
            results.push({ messageId: message.id, success: true });
          }
        } else {
          const errorText = await webhookResponse.text();
          console.error(`Webhook failed for message ${message.id}:`, errorText);
          
          // Update message status to failed
          await supabase
            .from('messages')
            .update({
              status: 'failed',
              processed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', message.id);

          results.push({ messageId: message.id, success: false, error: `Webhook failed: ${errorText}` });
        }

      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
        results.push({ messageId: message.id, success: false, error: error.message });
        
        // Update message status to failed
        await supabase
          .from('messages')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', message.id);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Processing complete. Success: ${successCount}, Failures: ${failureCount}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${results.length} messages`,
      processed: results.length,
      successCount,
      failureCount,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-scheduled-messages function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});