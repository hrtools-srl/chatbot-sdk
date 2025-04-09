import ChatbotSDK from "$src"
import { Conversation } from "$types/index"
import { AxiosRequestConfig } from "axios"

export type Response = Conversation[]

export default (sdk: ChatbotSDK) => (options?: AxiosRequestConfig): Promise<Response> => {
  return sdk.call({
    method: "get",
    url: "/list_conversations",
    ...options
  })
}
