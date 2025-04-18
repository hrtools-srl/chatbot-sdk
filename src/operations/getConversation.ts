import ChatbotSDK from "$src"
import { Conversation } from "$types/index"

export type Request = {
  conversationId: number
}

export type Response = Conversation

export default (sdk: ChatbotSDK) => (request: Request): Promise<Response> => (
  sdk.call({
    method: "get",
    url: `/public/conversations/${request.conversationId}`
  })
)
