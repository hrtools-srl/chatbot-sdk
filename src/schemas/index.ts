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
        },
        required: ["status", "text", "response", "error", "id"],
      },
    },
  },
  additionalProperties: false,
  required: ["id", "title", "creationTimestamp", "messages"],
} as const satisfies JSONSchema7
