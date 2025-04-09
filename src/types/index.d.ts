import { conversationSchema } from "$schemas"
import { FromSchema } from "json-schema-to-ts"

export type ChatbotSDKBaseConfig = {
  authToken: string,
  baseUrl?: string,
}

export type Conversation = FromSchema<typeof conversationSchema>
