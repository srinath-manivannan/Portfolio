import { supabase } from '@/integrations/supabase/client';

export async function triggerWebhook(eventType: string, payload: any) {
  try {
    // Get active webhooks for this event type
    const { data: webhooks, error } = await supabase
      .from('n8n_webhooks')
      .select('*')
      .eq('event_type', eventType)
      .eq('is_active', true);

    if (error || !webhooks || webhooks.length === 0) {
      console.log(`No active webhooks found for event: ${eventType}`);
      return;
    }

    // Trigger all webhooks for this event
    const results = await Promise.allSettled(
      webhooks.map(async (webhook) => {
        const startTime = Date.now();
        
        try {
          const response = await fetch(webhook.webhook_url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: eventType,
              timestamp: new Date().toISOString(),
              payload,
            }),
          });

          const executionTime = Date.now() - startTime;

          // Log success
          await supabase.from('automation_logs').insert({
            webhook_id: webhook.id,
            event_type: eventType,
            status: 'success',
            execution_time_ms: executionTime,
            payload,
          });

          // Update webhook stats
          await supabase
            .from('n8n_webhooks')
            .update({
              last_triggered_at: new Date().toISOString(),
              trigger_count: webhook.trigger_count + 1,
            })
            .eq('id', webhook.id);

          return { success: true, webhook: webhook.name };
        } catch (error: any) {
          const executionTime = Date.now() - startTime;
          
          // Log failure
          await supabase.from('automation_logs').insert({
            webhook_id: webhook.id,
            event_type: eventType,
            status: 'failure',
            error_message: error.message,
            execution_time_ms: executionTime,
            payload,
          });

          return { success: false, webhook: webhook.name, error: error.message };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`Triggered ${successCount}/${webhooks.length} webhooks for event: ${eventType}`);
    
    return results;
  } catch (error) {
    console.error('Error triggering webhooks:', error);
  }
}

// Helper to trigger common events
export const WebhookEvents = {
  BLOG_PUBLISHED: 'blog_published',
  CONTACT_FORM: 'contact_form',
  PROJECT_ADDED: 'project_added',
  RESUME_DOWNLOADED: 'resume_downloaded',
  DOCUMENT_UPLOADED: 'document_uploaded',
  USER_REGISTRATION: 'user_registration',
};
