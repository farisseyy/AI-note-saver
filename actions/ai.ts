'use server'

import OpenAI from 'openai'

// Initialize OpenAI client only when needed to prevent potential client-side bundling issues in Turbopack
function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key'
  })
}

/**
 * High-Density Intelligence Synthesis (Summarization)
 */
export async function summarizeNote(content: string, format: 'short' | 'medium' | 'detailed' = 'medium') {
  if (!process.env.OPENAI_API_KEY) {
    // Dynamic Mock based on content keywords
    const plainText = content.replace(/<[^>]*>/g, '')
    const words = plainText.split(/\s+/).filter(w => w.length > 5)
    const keywords = [...new Set(words)].slice(0, 3).join(', ')
    
    return `[MOCK AI SUMMARY]\n\nThis intelligence focus centers on ${keywords || 'core concepts'}. The text explores architectural patterns and strategic implications within the digital workspace. It emphasizes the need for streamlined synthesis and automated capture protocols.\n\nKey Outcome: Enhanced cognitive clarity through intelligence-first archival.`
  }

  const openai = getOpenAI()
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional assistant. Summarize the following note in a ${format} format using clear bullet points and a concluding synthesis.`
        },
        { role: 'user', content }
      ],
      temperature: 0.7
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('AI Summary Error:', error)
    return 'Failed to generate summary. Please check your AI quota or connection.'
  }
}

/**
 * Key Insight Extraction
 */
export async function generateKeyPoints(content: string) {
  if (!process.env.OPENAI_API_KEY) {
    const rawText = content.replace(/<[^>]*>/g, '')
    const words = rawText.split(/\s+/).filter(w => w.length > 6)
    const uniqueKeywords = [...new Set(words)].slice(0, 5)
    
    return uniqueKeywords.length > 0 
      ? uniqueKeywords.map(k => `Strategic analysis: ${k}`)
      : ['Critical Intelligence Synthesis', 'Automated Capture Protocol', 'Systemic Knowledge Architecture']
  }

  const openai = getOpenAI()
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Extract the top 5 key highlights or action items from the text. Return a JSON object with a "points" property containing an array of strings.'
        },
        { role: 'user', content }
      ],
      response_format: { type: 'json_object' }
    })
    const data = JSON.parse(response.choices[0].message.content || '{"points": []}')
    return data.points || []
  } catch (error) {
    console.error('AI Key Points Error:', error)
    return ['Failed to extract key points.']
  }
}

// Keep stubs for removed features if needed by existing imports elsewhere, 
// though we cleaned up AIPanel.tsx.
export async function generateQuiz() { return 'Feature removed.' }
export async function translateText() { return 'Feature removed.' }
export async function generateMindMap() { return 'Feature removed.' }
