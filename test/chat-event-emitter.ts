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

  const evt = await client.getConversationEventEmitter({
    conversationId: +CONVERSATION_ID
  })

  evt.on("chunk", (data) => {
    process.stdout.write(data.content)
  })

  evt.on("end", () => {
    console.log("\n")
    console.log("Stream ended")
    process.exit(0)
  })

  await client.sendMessage({
    conversationId: +CONVERSATION_ID,
    prompt: "Say 3 words about the weather",
  })
})()
  .catch((e) => {
    console.log(e)
  })
