import { conversationSchema } from "$schemas"
import type NodeEventSource from "eventsource"
import { FromSchema } from "json-schema-to-ts"

export type ChatbotSDKBaseConfig = {
  authToken?: string,
  baseUrl?: string,
  EventSource?: ConversationEventSourceClass
}

export type Conversation = FromSchema<typeof conversationSchema>

export type ConversationListItem = Pick<
  Conversation,
  "id" | "title" | "creationTimestamp"
>

export type ConversationUpdate = ConversationListItem

export type ConversationEventSourceClass = typeof NodeEventSource | typeof EventSource
export type ConversationEventSourceInstance = InstanceType<ConversationEventSourceClass>
