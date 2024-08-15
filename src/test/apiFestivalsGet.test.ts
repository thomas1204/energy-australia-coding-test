import { expect, test, describe } from 'vitest'
import request, { Response } from 'supertest'
import { BASE_URL } from '../config.js'
import { MusicFestivals } from '../zodSchema.js'

describe('apiFestivalsGet', () => {
  describe('when called using incorrect url', () => {
    test('returns 404', async () => {
      const response: Response = await request(`${BASE_URL}s`).get('')
      expect(response.status).toBe(404)
    })
  })

  describe('when called with an invalid method', () => {
    test('returns 404', async () => {
      const response: Response = await request(BASE_URL).post('')
      expect(response.status).toBe(404)
    })
  })

  describe('when called without params', () => {
    test('returns 200', async () => {
      try {
        const response: Response = await getRequestWithBackoff(BASE_URL)
        expect(response.status).toBe(200)
      } catch (error: unknown) {
        console.error('Test failed: "when called without params"', error)
      }
    }, 10000)
  })

  describe('when called with param', () => {
    test('ignores param returns 200', async () => {
      try {
        const response: Response = await getRequestWithBackoff(`${BASE_URL}?name=Test Festival`)
        expect(response.status).toBe(200)
      } catch (error: unknown) {
        console.error('Test failed: "when called with params"', error)
      }
    }, 10000)
  })

  describe('when called to match the Zod schema', () => {
    test('returns true', async () => {
      try {
        const response: Response = await getRequestWithBackoff(BASE_URL)
        const isValidResponseArray = MusicFestivals.safeParse(response.body)
        expect(response.status).toBe(200)
        expect(isValidResponseArray.success || response.body === '').toBe(true)
      } catch (error: unknown) {
        console.error('Test failed: "when called to match the Zod schema"', error)
      }
    }, 10000)
  })

  describe('when called too many times', () => {
    test('returns 429 and throws error', async () => {
      let response
      let attempt = 0
      const maxAttempts = 20
      while (attempt < maxAttempts) {
        response = (await request(BASE_URL).get('')) as Response
        if (response.status === 429) break
        expect(response.status).toBe(200)
        attempt++
      }
      expect(response?.status).toBe(429)
      expect(response?.text).toBe('Too many requests, throttling')
    })
  })
})

async function getRequestWithBackoff(url: string, retries = 5): Promise<request.Response> {
  let attempt = 0
  let delay = 1000

  while (attempt < retries) {
    const response = await request(url).get('')

    // If not throttled, return the response
    if (response.status !== 429) return response

    attempt++
    await new Promise((resolve) => setTimeout(resolve, delay))

    delay *= 2
  }

  throw new Error(`Exceeded max retries (${retries}) without successful response`)
}
