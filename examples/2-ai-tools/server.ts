/* eslint-disable no-console */
import {
  action,
  createRouter,
  defineClientActionsSchema,
  m,
} from '../../src/index'

// Define client actions schema (tools that the AI can use)
const clientActions = defineClientActionsSchema({
  searchWeb: {
    params: m.object({ query: m.string() }),
    return: m.object({
      results: m.array(
        m.object({
          title: m.string(),
          url: m.string(),
          snippet: m.string(),
        }),
      ),
    }),
  },
  getWeather: {
    params: m.object({ location: m.string() }),
    return: m.object({
      temperature: m.number(),
      condition: m.string(),
      humidity: m.number(),
    }),
  },
  sendEmail: {
    params: m.object({
      to: m.string().isEmail(),
      subject: m.string(),
      body: m.string(),
    }),
    return: m.object({
      success: m.boolean(),
      messageId: m.string(),
    }),
  },
})

type ClientActions = typeof clientActions

// AI action that uses client tools
const aiAssistant = action(
  m.object({ question: m.string() }),
  async ({
    params,
    clientActions: clientActionsParameter,
  }) => {
    const { searchWeb, getWeather, sendEmail } =
      clientActionsParameter<ClientActions>()

    // Simulate AI deciding which tools to use
    if (params.question.includes('weather')) {
      const location =
        new RegExp(/weather in (.+)/i).exec(
          params.question,
        )?.[1] || 'NYC'
      const weatherResult = await getWeather?.({ location })
      if (
        weatherResult?.status === 'ok' &&
        weatherResult.data
      ) {
        return {
          answer: `The weather in ${location} is ${weatherResult.data.condition} with a temperature of ${weatherResult.data.temperature}°C and humidity of ${weatherResult.data.humidity}%.`,
          toolsUsed: ['getWeather'],
        }
      }
    }

    if (params.question.includes('search')) {
      const query = params.question
        .replace(/search for/i, '')
        .trim()
      const searchResult = await searchWeb?.({ query })
      if (
        searchResult?.status === 'ok' &&
        searchResult.data
      ) {
        return {
          answer: `Found ${searchResult.data.results.length} results for "${query}". First result: ${searchResult.data.results[0]?.title}`,
          toolsUsed: ['searchWeb'],
        }
      }
    }

    if (params.question.includes('email')) {
      const emailMatch = new RegExp(
        /send email to (.+?) with subject (.+?) and body (.+)/i,
      ).exec(params.question)
      if (emailMatch) {
        const emailResult = await sendEmail?.({
          to: emailMatch[1]!,
          subject: emailMatch[2]!,
          body: emailMatch[3]!,
        })
        if (
          emailResult?.status === 'ok' &&
          emailResult.data
        ) {
          return {
            answer: `Email sent successfully! Message ID: ${emailResult.data.messageId}`,
            toolsUsed: ['sendEmail'],
          }
        }
      }
    }

    return {
      answer:
        "I'm not sure how to help with that. Try asking about weather, search, or sending emails.",
      toolsUsed: [],
    }
  },
)

// Create router
const router = createRouter({
  serverActions: { aiAssistant },
  clientActions,
})

export type Router = typeof router

// Start server
Bun.serve({
  port: 4001,
  async fetch(request) {
    return router.onRequest({
      request,
      ctx: {},
      type: 'http',
    })
  },
})

console.log('AI Server running on http://localhost:4001')
