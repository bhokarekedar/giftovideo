export interface MemeReaction {
  emotion: string;
  searchQueries: string[];
}

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
// The user mentioned "qwen/qwen3.8-27b", but ensure you use a valid Groq model string here.
// Common Groq models: llama-3.1-70b-versatile, mixtral-8x7b-32768, gemma-7b-it.
// We'll use the user-provided string or fallback.
const MODEL = "qwen/qwen3.8-27b"; // Note: Adjust if Groq API rejects this exact string.

const SYSTEM_PROMPT = `You are a viral meme curator for an audience that is 90% moms. 
Your goal is to analyze the user's input (a joke, quote, or thought) and figure out the best reaction GIF to pair with it.
The vibe should strongly resonate with moms: relatable chaos, exhaustion, parenting struggles, wine/coffee survival, or general adulting. It shouldn't always be explicitly about parenting, but it MUST match the chaotic/exhausted/relatable "mom vibe" (e.g., reality TV drama, tired actresses, sassy kids, dramatic eye-rolls).
You must return a raw JSON object (and nothing else) matching this exact schema:
{
  "emotion": "A short description of the core emotion or mood (e.g., 'exhausted sigh', 'holding back tears', 'judging you')",
  "searchQueries": ["3 highly optimized, short search queries for Giphy (e.g., 'tired mom wine', 'toddler tantrum', 'kris jenner eyeroll')"]
}
Do not include markdown blocks, just the JSON string. Ensure the search queries are funny, visceral, and highly likely to yield great GIF results for a mom audience.`;

export class AiMemeService {
  /**
   * Analyzes text and returns optimal GIF search queries.
   */
  static async analyzeTextForReaction(text: string): Promise<MemeReaction> {
    if (!GROQ_API_KEY) {
      throw new Error("Groq API key is not configured in .env");
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return JSON.parse(content) as MemeReaction;
    } catch (error) {
      console.error("AI Meme Service Error:", error);
      throw error;
    }
  }

  /**
   * Extracts raw text from an image using Groq's Vision LLM.
   */
  static async extractTextFromImage(base64Image: string): Promise<string> {
    if (!GROQ_API_KEY) {
      throw new Error("Groq API key is not configured in .env");
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'user',
              content: [
                { type: "text", text: "Extract all the text from this image. Do not include any conversational text, descriptions, or markdown formatting. Just return the raw extracted text exactly as it appears." },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
              ]
            }
          ],
          temperature: 0.1,
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Groq Vision API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI Vision Service Error:", error);
      throw error;
    }
  }
}
