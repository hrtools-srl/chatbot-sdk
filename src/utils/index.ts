import { match } from "ts-pattern"
import { EventSource } from "eventsource"
import { EventEmitter } from "events"

export type CommonStreamData = {
  messageId: number
}

export type StreamDocumentChunk = {
  id: number,
  content: string
}

export type StreamDocument = {
  id: number,
  name: string,
  chunks: StreamDocumentChunk[]
}

export type ErrorStreamData = CommonStreamData & {
  type: "ERROR",
  code: string,
  message: string
}

export type EndStreamData = CommonStreamData & {
  type: "END",
  iteration: number,
  data: {
    content: string,
    documents: StreamDocument[]
  } | null,
  error: {
    code: string,
    message: string
  } | null
}

export type DocumentContextStreamData = CommonStreamData & {
  type: "DOCUMENT_CONTEXT",
  documents: StreamDocument[]
}

export type ChunkStreamData = CommonStreamData & {
  type: "CHUNK",
  content: string,
  index: number,
  iteration: number,
}

export type ChunkAggregateStreamData = CommonStreamData & {
  type: "CHUNK_AGGREGATE",
  fromIndex: number,
  toIndex: number,
  content: string,
  iteration: number,
}

export type StreamData = (
  DocumentContextStreamData |
  ErrorStreamData |
  EndStreamData |
  ChunkStreamData |
  ChunkAggregateStreamData
)

export type IterableChunkData = {
  content: string,
  index: number,
  iteration: number,
}

export type ConversationEventEmitterMap = {
  data: [StreamData],
  chunk: [ChunkStreamData],
  "chunk-aggregate": [ChunkAggregateStreamData],
  "document-context": [DocumentContextStreamData],
  end: [EndStreamData],
  error: [unknown],
}

export type ConversationEventEmitter = EventEmitter<ConversationEventEmitterMap>

export type CompletionAsyncIterable = AsyncIterable<IterableChunkData> & {
  messageId: number,
  documents: StreamDocument[] | null,
  error: {
    code: string,
    message: string
  } | null,
  partial: string,
  _chunks: { content: string, index: number }[]
}

export const parseEventMessage = (event: MessageEvent) => {
  try {
    if (event.type === "message" && event.data) {
      const data = JSON.parse(event.data) as StreamData
      return data
    }
  } catch (_) {}

  return null
}

export const conversationEventSourceToEventEmitter = (eventSource: EventSource): ConversationEventEmitter => {
  const emitter = new EventEmitter<ConversationEventEmitterMap>()

  const processMessage = (event: StreamData) => {
    emitter.emit("data", event)

    match(event)
      .with({ type: "DOCUMENT_CONTEXT" }, (value) => emitter.emit("document-context", value))
      .with({ type: "ERROR" }, (value) => emitter.emit("error", value))
      .with({ type: "END" }, (value) => emitter.emit("end", value))
      .with({ type: "CHUNK" }, (value) => emitter.emit("chunk", value))
      .with({ type: "CHUNK_AGGREGATE" }, (value) => emitter.emit("chunk-aggregate", value))
      .exhaustive()
  }

  eventSource.onmessage = (event: MessageEvent) => {
    const data = parseEventMessage(event)

    if (data) {
      processMessage(data)
    }
  }

  eventSource.onerror = (error: unknown) => {
    emitter.emit("error", error)
  }

  return emitter
}

export const messageEventSourceToAsyncIterable = (
  eventSource: EventSource,
  messageId: number
) => {
  let done = false
  const queue: IterableChunkData[] = []
  let waitForChunkResolveFunction: any = undefined

  const waitForChunk = () => (
    new Promise((resolve) => waitForChunkResolveFunction = resolve)
  )

  function end() {
    done = true
    waitForChunkResolveFunction?.()
    waitForChunkResolveFunction = undefined
    eventSource.close()
  }

  const processMessage = (event: StreamData) => {
    if (event.messageId !== messageId) {
      return
    }

    match(event)
      .with({ type: "DOCUMENT_CONTEXT" }, (value) => {
        out.documents = value.documents
      })
      .with({ type: "ERROR" }, (value) => {
        out.error = {
          code: value.code,
          message: value.message
        }

        end()
      })
      .with({ type: "CHUNK" }, (event) => {
        const value = {
          content: event.content,
          index: event.index,
          iteration: event.iteration
        }

        out._chunks.push(value)
        queue.push(value)

        waitForChunkResolveFunction?.()
        waitForChunkResolveFunction = undefined
      })
      .with({ type: "CHUNK_AGGREGATE" }, () => {})
      .with({ type: "END" }, () => end())
      .exhaustive()
  }

  eventSource.onerror = (error: any) => {}
  eventSource.onmessage = (event: MessageEvent) => {
    const data = parseEventMessage(event)

    if (data) {
      processMessage(data)
    }
  }

  const out: CompletionAsyncIterable = {
    messageId,
    documents: null,
    error: null,
    _chunks: [],

    get partial() {
      return (
        this._chunks
          .sort((a, b) => a.index - b.index)
          .map(chunk => chunk.content)
          .join("")
      )
    },

    async *[Symbol.asyncIterator]() {
      while (true) {
        const value = queue.shift()

        if (value) {
          yield value
        } else {
          // end() has been called. The queue is empty and no more chunks will be added
          if (done) {
            return
          }

          // No more chunks in the queue, wait for a new chunk
          await waitForChunk()
        }
      }
    }
  }

  return out
}

export type SyncResponse = {
  messageId: number,
  content: string,
  documents: StreamDocument[]
}

export const messageEventSourceToSyncResponse = async (
  eventSource: EventSource,
  messageId: number
): Promise<SyncResponse> =>  {
  let resolve: any
  let reject: any

  const mainPromise = new Promise<SyncResponse>((res, rej) => {
    resolve = res
    reject = rej
  })

  const processMessage = (event: StreamData) => {
    if (event.messageId !== messageId) {
      return
    }

    if (event.type === "END") {
      if (event.data) {
        resolve({
          messageId: event.messageId,
          content: event.data.content,
          documents: event.data.documents
        })
      }

      if (event.error) {
        reject({
          code: event.error.code,
          message: event.error.message
        })
      }

      reject()
    }

    if (event.type === "ERROR") {
      reject({
        code: event.code,
        message: event.message
      })
    }
  }

  eventSource.onerror = (error: unknown) => {
    reject(error)
  }

  eventSource.onmessage = (event: MessageEvent) => {
    const data = parseEventMessage(event)

    if (data) {
      processMessage(data)
    }
  }

  return mainPromise
}
