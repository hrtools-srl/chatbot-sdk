# Chatbot SDK Documentation

A lightweight SDK to interact with the HRTools chatbot API.

## Introduction

This SDK provides a simple interface to interact with the HRTools chatbot backend. It wraps common operations such as:

- Listing conversations
- Fetching a single conversation
- Sending messages and receiving completions

The SDK is built using [Axios](https://axios-http.com/).

## Setup

This SDK is not published on the npm registry but can be installed directly from GitHub [hrtools-srl/chatbot-sdk](https://github.com/hrtools-srl/chatbot-sdk) repository. Make sure you have access to that repository.

### Installation

Using HTTPS:

```bash
npm install git+https://github.com/hrtools-srl/chatbot-sdk.git
```

Using SSH:

```bash
npm install git+ssh://git@github.com/hrtools-srl/chatbot-sdk.git
```

The package will be installed in your codebase as `@hrtools/chatbot-sdk`.

### Usage

Then, import and initialize the SDK:

```ts
import ChatbotSDK from "@hrtools/chatbot-sdk"

const sdk = new ChatbotSDK()


// or

const sdk = new ChatbotSDK({
  authToken: "your-token"
})
```

## Refresh token

If you need to refresh (or set) the token, you can do so by calling the `setAuthToken` method.

```ts
sdk.setAuthToken("your-token")
```

## Method getConversation

Fetch a specific conversation by ID.

```ts
const conversation = await sdk.getConversation({ conversationId: 123 })

console.log("Conversation:", conversation)
```

## Method listConversations

List conversations for the authenticated user.

```ts
const conversations = await sdk.listConversations()

console.log("Conversations:", conversations)
```

## Method updateConversation

Update conversation for the authenticated user.

```ts
const conversation = await sdk.updateConversation({
  conversationId: 123,
  updates: {
    title: "New title"
  }
})

console.log("Conversation:", conversation)
```

## Method chat - without streaming

Send a prompt to the chatbot and receive a response.

```ts
const response = await sdk.chat({
  conversationId: 123,
  prompt: "Hello world!",
  stream: false // default
})

console.log("Assistant message:", response.content)
console.log("RAG documents", response.documents)
console.log("Message ID:", response.messageId)
```

## Method chat - with streaming

Send a prompt to the chatbot and receive a response as [AsyncIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator) with additional properties.

This method permits streaming responses, allowing you to process the response as it arrives. You can also access the assistant response with `getConversationEventEmitter` method.

```ts
const stream = await sdk.chat({
  conversationId: 123,
  prompt: "Hello world!",
  stream: true
})

console.log("Message ID:", stream.messageId)

console.log("Assistant message:")
for await (const chunk of stream) {
  process.stdout.write(chunk.content)
  // The partial response is also available in the stream.partial
}

console.log("RAG documents", stream.documents)
console.log("Tool calls", stream.toolCalls)

```

You can also retrieve all the data using the complete stream object:

```ts
const stream = await sdk.chat({
  conversationId: 123,
  prompt: "Hello world!",
  stream: true
})

for await (const item of stream.complete) {
  const { item, ...rest } = item
  console.log(`Received item of type ${item.type}:`, rest)
}

```

## Method getConversationEventEmitter

The `getConversationEventEmitter` method returns an [`EventEmitter`](https://nodejs.org/api/events.html) instance, allowing you to listen to events from a streaming conversation. This is useful when you need real-time handling of chatbot responses and related events.

```ts
const emitter = sdk.getConversationEventEmitter({
  conversationId: 123
})

// "data" event includes all the data received from the chatbot, more granular events are also available above
// emitter.on("data", (data) => {
//   console.log("Received data:", data.content)
// })

emitter.on("chunk", (data) => {
  console.log("Received chunk:", data.content)
})

emitter.on("chunk-aggregate", (data) => {
  console.log("Aggregated content from chunks:", data.content)
})

emitter.on("tool-call-start", (data) => {
  console.log("Tool call started:", data)
})

emitter.on("tool-call-end", (data) => {
  console.log("Tool call ended:", data)
})

emitter.on("end", () => {
  console.log("Streaming ended")
})

emitter.on("error", (err) => {
  console.error("Error occurred:", err)
})
```

### Available Events

The emitter provides the following events, corresponding to different types of streamed responses:

| Event                | Description                                                          | Payload                                |
|----------------------|----------------------------------------------------------------------|----------------------------------------|
| `data`               | Fired for every received stream data (raw event).                    | `StreamData`                           |
| `chunk`              | Fired for each content chunk received from the chatbot.              | `ChunkStreamData`                      |
| `chunk-aggregate`    | Fired when multiple chunks are aggregated into a single message.     | `ChunkAggregateStreamData`             |
| `tool-call-start`    | Fired when a tool call starts.                                       | `ToolCallStartStreamData`              |
| `tool-call-end`      | Fired when a tool call ends.                                         | `ToolCallEndStreamData`                |
| `end`                | Fired when the stream finishes successfully.                         | `EndStreamData`                        |
| `error`              | Fired when an error occurs during streaming or connection.           | `unknown`                              |

### Event Payload Types

- **ChunkStreamData**

```ts
{
  type: "CHUNK",
  messageId: number,
  content: string,
  index: number
}
```

- **ChunkAggregateStreamData**

```ts
{
  type: "CHUNK_AGGREGATE",
  messageId: number,
  fromIndex: number,
  toIndex: number,
  content: string
}
```

- **ToolCallStartStreamData**

```ts
{
    type: "TOOL_CALL_START",
    messageId: number,
    iteration: number,
    toolCallIndex: number,
    tool: {
        id: number;
        name: string;
    }
}
```

- **ToolCallEndStreamData**

```ts
{
  type: "TOOL_CALL_END",
  messageId: number,
  iteration: number,
  toolCallIndex: number
}
```

- **EndStreamData**

```ts
{
  type: "END",
  messageId: number,
  data: {
    content: number,
    documents: Array<{
      id: number,
      name: string,
      chunks: Array<{ id: number, content: string }>
    }>
  } | null,
  error: {
    code: string,
    message: string
  } | null
}
```

## Error Handling

`getConversation` and `listConversations` methods throw API errors directly if available in the response.

```ts
try {
  const conversation = await sdk.getConversation({ conversationId: -1 })
} catch (err) {
  console.log("Error:", err)
}
```

## Custom configuration

### Custom base URL

You can set a custom base URL for the SDK by passing it as an option when initializing the SDK. By default, the SDK uses the base URL `https://api.hrtools.it` (WIP)

```ts
const sdk = new ChatbotSDK({
  authToken: "your-auth-token",
  baseUrl: "https://custom.it"
})
```
