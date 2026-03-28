const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

export type AIAction = 'improve' | 'shorten' | 'expand' | 'fix-grammar' | 'make-professional' | 'custom'

type AIResponse = {
  success: boolean
  content?: string
  error?: string
}

export const useAI = () => {
  const isConfigured = (): boolean => {
    return !!OPENAI_API_KEY && OPENAI_API_KEY.length > 0
  }

  const improveText = async (
    text: string,
    action: AIAction,
    customPrompt?: string
  ): Promise<AIResponse> => {
    if (!isConfigured()) {
      return { success: false, error: 'OpenAI API key not configured. Add VITE_OPENAI_API_KEY to .env file.' }
    }

    const prompts: Record<AIAction, string> = {
      'improve': 'Improve this resume text to be more impactful and professional. Keep the same structure and facts, but enhance the language:',
      'shorten': 'Make this resume text more concise while keeping the key information. Remove filler words and be direct:',
      'expand': 'Expand this resume text with more detail and specific achievements. Add quantifiable metrics where appropriate:',
      'fix-grammar': 'Fix any grammar, spelling, or punctuation errors in this resume text. Keep the meaning unchanged:',
      'make-professional': 'Rewrite this resume text to sound more professional and suitable for a senior-level position:',
      'custom': customPrompt || 'Improve this text:'
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a professional resume writer. Return only the improved text without any explanations or markdown formatting unless the input already has markdown.'
            },
            {
              role: 'user',
              content: `${prompts[action]}\n\n${text}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        const error = await response.json()
        return { success: false, error: error.error?.message || 'API request failed' }
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        return { success: false, error: 'No response from AI' }
      }

      return { success: true, content }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const suggestLayout = async (markdown: string): Promise<AIResponse> => {
    if (!isConfigured()) {
      return { success: false, error: 'OpenAI API key not configured' }
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a resume layout expert. Analyze the resume content and suggest which template would work best: classic, sidebar, modern, minimal, or executive. Return JSON with format: {"template": "name", "reason": "brief explanation"}'
            },
            {
              role: 'user',
              content: `Analyze this resume and suggest the best template:\n\n${markdown}`
            }
          ],
          temperature: 0.5,
          max_tokens: 200
        })
      })

      if (!response.ok) {
        return { success: false, error: 'API request failed' }
      }

      const data = await response.json()
      return { success: true, content: data.choices?.[0]?.message?.content }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  return { isConfigured, improveText, suggestLayout }
}
