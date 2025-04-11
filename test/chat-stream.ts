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

  const stream = await client.chat({
    prompt: "Say 3 words about the weather",
    conversationId: +CONVERSATION_ID,
    stream: true
  })

  console.log("Message ID", stream.messageId)

  console.log("Assistant response:")
  for await (const chunk of stream) {
    process.stdout.write(chunk.content)
  }

  console.log("\n")
  console.log("Documents:", stream.documents)

})()
  .catch((e) => {
    console.log(e)
  })
