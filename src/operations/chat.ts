import ChatbotSDK from "$src"
import { CompletionAsyncIterable, messageEventSourceToAsyncIterable, messageEventSourceToSyncResponse, SyncResponse } from "$utils"

export type Request<STREAM extends boolean> = {
  prompt: string,
  conversationId: number,
  stream?: STREAM
}

export type Response<STREAM extends boolean> = STREAM extends true ? CompletionAsyncIterable : Promise<SyncResponse>

export default (sdk: ChatbotSDK) => async <STREAM extends boolean>(request: Request<STREAM>): Promise<Response<STREAM>> => {
  const evt = await sdk._getConversationStream(request.conversationId)
  const { messageId } = await sdk.sendMessage({ conversationId: request.conversationId, prompt: request.prompt })

  if (request.stream) {
    return messageEventSourceToAsyncIterable(evt, messageId) as Response<STREAM>
  } else {
    return messageEventSourceToSyncResponse(evt, messageId) as Response<STREAM>
  }
}
