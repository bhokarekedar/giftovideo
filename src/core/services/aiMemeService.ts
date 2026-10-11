export interface MemeReaction {
  emotion: string;
  searchQueries: string[];
}

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
// The user mentioned "qwen/qwen3.8-27b", but ensure you use a valid Groq model string here.
// Common Groq models: llama-3.1-70b-versatile, mixtral-8x7b-32768, gemma-7b-it.
// We'll use the user-provided string or fallback.
const MODEL = "qwen/qwen3.8-27b"; // Note: Adjust if Groq API rejects this exact string.

const SYSTEM_PROMPT = `You are an expert viral meme curator and GIF matcher.
Your job is to analyze any quote, joke, story, or text message and identify the best reaction GIFs to pair with it.

Guidelines:
1. VIBE & CONTEXT:
   - Match the true comedic vibe, mood, and subtext of the message (e.g., unbothered/sassy, corporate panic, deadpan/disappointed, clumsiness/disaster, getting old/exhaustion, relief, sarcasm).
   - DO NOT default or restrict to a "mom" persona unless the message is specifically about parenting or motherhood. Be versatile across adulting, work, dating, aging, and internet humor.

2. GIPHY SEARCH OPTIMIZATION (CRITICAL):
   - Giphy search queries MUST be SHORT (1 to 3 words MAX). Longer phrases return 0 results.
   - Use high-hit-rate meme reaction tropes, emotions, and pop-culture icons that actually yield great GIFs on Giphy.
   - Mix:
     a) Reaction emotions (e.g. "unbothered", "side eye", "deadpan", "panic", "guilty", "phew", "fake smile", "crying laughing")
     b) Famous reaction meme characters / shows (e.g. "stanley eyeroll", "kris jenner shrug", "michael scott cringe", "judge judy", "schitts creek ew", "steve harvey")
     c) Relatable actions / visuals (e.g. "hair flip", "sipping tea", "bedtime", "hiding face", "disappearing", "slow blink")

3. QUANTITY:
   - Generate 6 to 8 short, punchy search queries for Giphy.

Output ONLY a raw JSON object (no markdown, no backticks):
{
  "emotion": "A concise 1-2 word description of the core emotion (e.g., 'unbothered sassy', 'corporate relief', 'elderly tired', 'guilty panic', 'deadpan')",
  "searchQueries": [
    "query 1",
    "query 2",
    "query 3",
    "query 4",
    "query 5",
    "query 6",
    "query 7"
  ]
}`;

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
