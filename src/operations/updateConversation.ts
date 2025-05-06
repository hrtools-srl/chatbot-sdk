import ChatbotSDK from "$src"
import { Conversation, ConversationUpdate } from "$types/index"

export type Request = {
  conversationId: number
  updates: {
    title?: Conversation["title"]
  }
}

export type Response = ConversationUpdate

export default (sdk: ChatbotSDK) => (request: Request): Promise<Response> => (
  sdk.call({
    method: "patch",
    url: `/public/conversations/${request.conversationId}`,
    data: {
      updates: request.updates
    }
  })
)
