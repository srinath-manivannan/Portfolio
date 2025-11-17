import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, operation, provider, model } = await req.json();

    if (!text || !operation) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's AI settings
    const { data: settings } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const selectedProvider = provider || settings?.preferred_provider || 'gemini';
    const selectedModel = model || settings?.default_model || 'gemini-pro';

    let enhancedText = '';
    let tokensUsed = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    let cost = 0;

    // Build prompt based on operation
    const prompts: Record<string, string> = {
      improve: 'Improve the following text while maintaining its core message. Make it more engaging and clear:',
      professional: 'Rewrite the following text in a professional tone suitable for business communication:',
      simplify: 'Simplify the following text to make it easier to understand:',
      expand: 'Expand the following text with more details and explanation:',
      shorten: 'Shorten the following text while keeping the key points:',
    };

    const systemPrompt = prompts[operation] || prompts.improve;

    // Call AI provider
    if (selectedProvider === 'openai') {
      const apiKey = settings?.openai_api_key;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API key not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: settings?.temperature || 0.7,
          max_tokens: settings?.max_tokens || 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        return new Response(
          JSON.stringify({ error: 'OpenAI API error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      enhancedText = data.choices[0].message.content;
      tokensUsed = data.usage.total_tokens;
      promptTokens = data.usage.prompt_tokens;
      completionTokens = data.usage.completion_tokens;
      
      // Estimate cost (GPT-4: $0.03/1K prompt, $0.06/1K completion)
      cost = (promptTokens / 1000 * 0.03) + (completionTokens / 1000 * 0.06);

    } else if (selectedProvider === 'gemini') {
      const apiKey = settings?.gemini_api_key;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'Gemini API key not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemPrompt}\n\n${text}` }]
            }],
            generationConfig: {
              temperature: settings?.temperature || 0.7,
              maxOutputTokens: settings?.max_tokens || 2000,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Gemini API error:', error);
        return new Response(
          JSON.stringify({ error: 'Gemini API error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      enhancedText = data.candidates[0].content.parts[0].text;
      tokensUsed = data.usageMetadata?.totalTokenCount || 0;
      promptTokens = data.usageMetadata?.promptTokenCount || 0;
      completionTokens = data.usageMetadata?.candidatesTokenCount || 0;
      
      // Estimate cost (Gemini Pro: ~$0.0005/1K tokens)
      cost = (tokensUsed / 1000 * 0.0005);

    } else if (selectedProvider === 'ollama') {
      const baseUrl = settings?.ollama_base_url || 'http://localhost:11434';
      
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `${systemPrompt}\n\n${text}`,
          stream: false,
        }),
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 'Ollama API error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      enhancedText = data.response;
      tokensUsed = 0; // Ollama doesn't provide token counts
      cost = 0; // Local, no cost
    }

    // Log AI usage
    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      provider: selectedProvider,
      model: selectedModel,
      operation,
      tokens_used: tokensUsed,
      estimated_cost: cost,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      content_type: 'text_enhancement',
    });

    return new Response(
      JSON.stringify({
        original: text,
        enhanced: enhancedText,
        provider: selectedProvider,
        model: selectedModel,
        tokens_used: tokensUsed,
        cost,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-enhance function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
