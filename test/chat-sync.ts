/* eslint-disable no-console */

import { EventSource } from "eventsource"
import sdk from "../src/index"

const {
  AUTH_TOKEN = "123",
  BASE_URL = "http://localhost:3000/api",
  CONVERSATION_ID = "1",
} = process.env

void(async() => {
  const client = new sdk({
    authToken: AUTH_TOKEN,
    baseUrl: BASE_URL,
    EventSource
  })

  const response = await client.chat({
    prompt: "Say 3 words about the weather",
    conversationId: +CONVERSATION_ID,
    stream: false
  })

  console.log(response)

})()
  .catch((e) => {
    console.log(e)
  })
