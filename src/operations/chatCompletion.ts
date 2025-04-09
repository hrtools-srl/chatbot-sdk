import ChatbotSDK from "$src"
import { AxiosRequestConfig } from "axios"

export type Request = {
  prompt: string,
  conversationId: number,
}

export type Response = unknown

export default (_sdk: ChatbotSDK) => (_request: Request, _options?: AxiosRequestConfig): Promise<Response> => {
  throw new Error("Not implemented")
}
