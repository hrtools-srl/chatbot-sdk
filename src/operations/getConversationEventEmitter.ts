import ChatbotSDK from "$src"
import { ConversationEventEmitter, conversationEventSourceToEventEmitter } from "$utils/index"

export type Request = {
  conversationId: number
}

export type Response = ConversationEventEmitter

export default (sdk: ChatbotSDK) => async(request: Request): Promise<Response> => {
  const evt = await sdk._getConversationStream(request.conversationId)
  return conversationEventSourceToEventEmitter(evt)
}
