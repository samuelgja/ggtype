/* eslint-disable no-console */
import {
  createRouterClient,
  isSuccess,
} from '../../src/index'
import type { Router } from './server'

// Create client with tool implementations
const client = createRouterClient<Router>({
  httpURL: 'http://localhost:4001',
  defineClientActions: {
    searchWeb: async (params) => {
      console.log(
        `[Tool] Searching web for: "${params.query}"`,
      )
      // Simulate web search
      return {
        results: [
          {
            title: `Results for ${params.query}`,
            url: `https://example.com/search?q=${encodeURIComponent(params.query)}`,
            snippet: `This is a search result for ${params.query}`,
          },
          {
            title: `More results for ${params.query}`,
            url: `https://example.com/more?q=${encodeURIComponent(params.query)}`,
            snippet: `Additional information about ${params.query}`,
          },
        ],
      }
    },
    getWeather: async (params) => {
      console.log(
        `[Tool] Getting weather for: "${params.location}"`,
      )
      // Simulate weather API
      return {
        temperature: 22,
        condition: 'Sunny',
        humidity: 65,
      }
    },
    sendEmail: async (params) => {
      console.log(`[Tool] Sending email to: ${params.to}`)
      console.log(`  Subject: ${params.subject}`)
      console.log(`  Body: ${params.body}`)
      // Simulate email sending
      return {
        success: true,
        messageId: `msg-${Date.now()}`,
      }
    },
  },
})

// Test AI assistant with different questions
const questions = [
  'What is the weather in London?',
  'Search for TypeScript tutorials',
  'Send email to user@example.com with subject Hello and body This is a test',
  'What time is it?',
]

for (const question of questions) {
  console.log(`\n🤖 Question: ${question}`)
  const result = await client.fetchActions.aiAssistant({
    question,
  })

  if (isSuccess(result)) {
    console.log(`✅ Answer: ${result.data.answer}`)
    console.log(
      `   Tools used: ${result.data.toolsUsed.join(', ') || 'none'}`,
    )
  } else {
    console.error('❌ Error:', result.error?.message)
  }
}
