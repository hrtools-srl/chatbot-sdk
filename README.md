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

const sdk = new ChatbotSDK({
  authToken: "your-auth-token"
})
```

## Refresh token

If you need to refresh the token, you can do so by calling the `refreshToken` method.

```ts
sdk.refreshToken("your-refresh-token")
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

## Method chatCompletion (WORK IN PROGRESS)

Send a prompt to the chatbot and receive a response as [AsyncIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator).

```ts
const stream = await sdk.chatCompletion({
  conversationId: 123,
  prompt: "Hello world!"
})

for await (const event of stream) {
  console.log(event)
}
```

## Error Handling

All SDK methods throw API errors directly if available in the response.

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

### Custom axios request configuration

You can pass an optional Axios request configuration as additional parameters to the SDK methods.

```ts
const conversation = await sdk.getConversation({ conversationId: 123 }, { timeout: 5000 })

console.log("Conversation:", conversation)
```

### Custom axios instance configuration

You can pass an optional Axios instance configuration as the second parameter to the SDK constructor.

```ts
const sdk = new ChatbotSDK(
  { authToken: "your-auth-token" },
  { timeout: 5000 } // Axios config
)
```
