import { JSONSchema7 } from "json-schema"

export const conversationSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    title: { type: "string" },
    creationTimestamp: { type: "string", format: "date-time" },
    messages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          status: { type: "string" },
          text: { type: "string" },
          response: { type: ["string", "null"] },
          error: { type: ["string", "null"] },
          id: { type: "number" },
          chunks: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "number" },
                documentId: { type: "number" },
              },
              required: ["id", "documentId"],
            },
          },
          assistantResponses: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                id: { type: "number" },
                response: { type: "string" },
                iteration: { type: "number" },
                creationTimestamp: { type: "string", format: "date-time" },
                toolCalls: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: { type: "number" },
                      tool: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                          id: { type: "number" },
                          name: { type: "string" },
                        },
                        required: ["id", "name"],
                      },
                      status: { type: "string" },
                    },
                    required: ["id", "tool", "status"],
                  },
                },
              },
            },
          },
        },
        required: [
          "status",
          "text",
          "response",
          "error",
          "id",
          "chunks",
          "assistantResponses",
        ],
      },
    },
  },
  additionalProperties: false,
  required: ["id", "title", "creationTimestamp", "messages"],
} as const satisfies JSONSchema7
