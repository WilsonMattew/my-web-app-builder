import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ASSISTANT_PROMPTS: Record<string, string> = {
  oracle: `You are Oracle, a strategic advisor AI assistant at SkyBeam Studio. Your expertise includes:
- Executive summaries and business insights
- Data analysis and interpretation
- Strategic recommendations and planning
- Risk assessment and mitigation
You provide thoughtful, data-driven advice to help leadership make informed decisions.`,
  
  aether: `You are Aether, a technical expert AI assistant at SkyBeam Studio. Your expertise includes:
- Code review and best practices
- Software architecture advice
- Bug analysis and debugging
- Performance optimization
You help developers write better code and solve technical challenges.`,
  
  muse: `You are Muse, a creative director AI assistant at SkyBeam Studio. Your expertise includes:
- Campaign concepts and creative ideas
- Content writing and copywriting
- Visual direction and brand consistency
- Social media strategy
You inspire creative solutions and help craft compelling content.`,
  
  ascend: `You are Ascend, a growth strategist AI assistant at SkyBeam Studio. Your expertise includes:
- Lead scoring and qualification
- Sales outreach strategies
- Funnel optimization
- Conversion analysis
You help optimize sales processes and drive business growth.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, assistant_type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = ASSISTANT_PROMPTS[assistant_type] || ASSISTANT_PROMPTS.oracle;

    console.log(`AI Chat request for assistant: ${assistant_type}`);
    console.log(`Messages count: ${messages.length}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
