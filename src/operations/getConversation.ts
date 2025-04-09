import ChatbotSDK from "$src"
import { Conversation } from "$types/index"
import { AxiosRequestConfig } from "axios"

export type Request = {
  conversationId: number
}

export type Response = Conversation

export default (sdk: ChatbotSDK) => (request: Request, options?: AxiosRequestConfig): Promise<Response> => {
  return sdk.call({
    method: "get",
    url: `/get_conversation/${request.conversationId}`,
    ...options
  })
}
