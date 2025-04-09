import { FromSchema } from 'json-schema-to-ts';
import { Axios, CreateAxiosDefaults, AxiosRequestConfig } from 'axios';

declare const conversationSchema: {
    readonly type: "object";
    readonly properties: {
        readonly id: {
            readonly type: "number";
        };
        readonly userId: {
            readonly type: "string";
        };
        readonly creationTimestamp: {
            readonly type: "string";
        };
        readonly messages: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly status: {
                        readonly type: "string";
                    };
                    readonly text: {
                        readonly type: "string";
                    };
                    readonly response: {
                        readonly type: ["string", "null"];
                    };
                    readonly error: {
                        readonly type: ["string", "null"];
                    };
                    readonly id: {
                        readonly type: "number";
                    };
                };
                readonly required: ["status", "text", "response", "error", "id"];
            };
        };
    };
    readonly additionalProperties: false;
    readonly required: ["id", "userId", "creationTimestamp", "messages"];
};

type ChatbotSDKBaseConfig = {
  authToken: string,
  baseUrl?: string,
}

type Conversation = FromSchema<typeof conversationSchema>

type Response$2 = Conversation[];

type Request$1 = {
    conversationId: number;
};
type Response$1 = Conversation;

type Request = {
    prompt: string;
    conversationId: number;
};
type Response = unknown;

declare class ChatbotSDK {
    axios: Axios;
    constructor(config: ChatbotSDKBaseConfig, axiosConfig?: CreateAxiosDefaults);
    setAuthToken(token: string): void;
    call: <T>(request: AxiosRequestConfig) => Promise<T>;
    chatCompletion: (_request: Request, _options?: AxiosRequestConfig) => Promise<Response>;
    getConversation: (request: Request$1, options?: AxiosRequestConfig) => Promise<Response$1>;
    listConversations: (options?: AxiosRequestConfig) => Promise<Response$2>;
}

export { ChatbotSDK as default };
