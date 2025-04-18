import ChatbotSDK from "$src"
import { Conversation } from "$types/index"

export type Response = Conversation[]

export default (sdk: ChatbotSDK) => (): Promise<Response> => (
  sdk.call({
    method: "get",
    url: "/public/conversations"
  })
)
