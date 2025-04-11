import ChatbotSDK from "$src"

export type Request = {
  prompt: string,
  conversationId: number
}

export type Response = {
  messageId: number
}

export default (sdk: ChatbotSDK) => async (request: Request): Promise<Response> => (
  sdk.call({
    method: "post",
    url: "/send_message",
    data: request
  })
)
