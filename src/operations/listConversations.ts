import ChatbotSDK from "$src"
import { ConversationListItem } from "$types/index"

export type Response = ConversationListItem[]

export default (sdk: ChatbotSDK) => (): Promise<Response> => (
  sdk.call({
    method: "get",
    url: "/public/conversations"
  })
)
