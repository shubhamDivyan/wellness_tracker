"use server"

import { generateText } from "ai"
import { z } from "zod"

const suggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      habit: z.string().describe("Name of the suggested habit"),
      description: z.string().describe("Brief description of the habit"),
      reason: z.string().describe("Why this habit is suggested based on user data"),
      difficulty: z.enum(["easy", "medium", "hard"]).describe("Difficulty level"),
      timeCommitment: z.string().describe('Estimated time per day (e.g., "10 minutes")'),
      category: z.string().describe('Category of the habit (e.g., "Health", "Productivity", "Wellness")'),
    }),
  ),
})

export async function generateHabitSuggestions(userContext: string) {
  try {
    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      prompt: `Based on the following user habit data and preferences, suggest 3-4 new habits that would complement their routine and help them achieve better wellness. Be specific and personalized.

User Context:
${userContext}

Generate suggestions that are:
1. Complementary to existing habits
2. Realistic and achievable
3. Varied in difficulty levels
4. Focused on overall wellness improvement

Format your response as a JSON object with a "suggestions" array containing habit objects with: habit, description, reason, difficulty, timeCommitment, and category fields.`,
      maxOutputTokens: 1000,
      temperature: 0.7,
    })

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Could not parse AI response")
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.suggestions
  } catch (error) {
    console.error("Error generating habit suggestions:", error)
    // Return mock suggestions as fallback
    return [
      {
        habit: "Stretching Routine",
        description: "Gentle stretching exercises to improve flexibility",
        reason: "Complements your exercise routine and improves recovery",
        difficulty: "easy",
        timeCommitment: "10 minutes",
        category: "Health",
      },
      {
        habit: "Gratitude Journaling",
        description: "Write down 3 things you are grateful for each day",
        reason: "Enhances mental wellness and pairs well with meditation",
        difficulty: "easy",
        timeCommitment: "5 minutes",
        category: "Wellness",
      },
      {
        habit: "Cold Water Exposure",
        description: "Brief cold shower or ice bath for resilience",
        reason: "Boosts immunity and complements your health-focused routine",
        difficulty: "hard",
        timeCommitment: "5 minutes",
        category: "Health",
      },
    ]
  }
}
