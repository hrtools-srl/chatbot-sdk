import NodeEventSource from 'eventsource';
import { FromSchema } from 'json-schema-to-ts';
import { EventEmitter } from 'events';
import { Axios, CreateAxiosDefaults, AxiosRequestConfig } from 'axios';

declare const conversationSchema: {
    readonly type: "object";
    readonly properties: {
        readonly id: {
            readonly type: "number";
        };
        readonly title: {
            readonly type: "string";
        };
        readonly creationTimestamp: {
            readonly type: "string";
            readonly format: "date-time";
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
                    readonly chunks: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly id: {
                                    readonly type: "number";
                                };
                                readonly documentId: {
                                    readonly type: "number";
                                };
                            };
                            readonly required: ["id", "documentId"];
                        };
                    };
                    readonly assistantResponses: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly id: {
                                    readonly type: "number";
                                };
                                readonly response: {
                                    readonly type: "string";
                                };
                                readonly iteration: {
                                    readonly type: "number";
                                };
                                readonly creationTimestamp: {
                                    readonly type: "string";
                                    readonly format: "date-time";
                                };
                                readonly toolCalls: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "object";
                                        readonly additionalProperties: false;
                                        readonly properties: {
                                            readonly id: {
                                                readonly type: "number";
                                            };
                                            readonly tool: {
                                                readonly type: "object";
                                                readonly additionalProperties: false;
                                                readonly properties: {
                                                    readonly id: {
                                                        readonly type: "number";
                                                    };
                                                    readonly name: {
                                                        readonly type: "string";
                                                    };
                                                };
                                                readonly required: ["id", "name"];
                                            };
                                            readonly status: {
                                                readonly type: "string";
                                            };
                                        };
                                        readonly required: ["id", "tool", "status"];
                                    };
                                };
                            };
                        };
                    };
                };
                readonly required: ["status", "text", "response", "error", "id", "chunks", "assistantResponses"];
            };
        };
    };
    readonly additionalProperties: false;
    readonly required: ["id", "title", "creationTimestamp", "messages"];
};

type ChatbotSDKBaseConfig = {
  authToken?: string,
  baseUrl?: string,
  EventSource?: ConversationEventSourceClass
}

type Conversation = FromSchema<typeof conversationSchema>

type ConversationListItem = Pick<
  Conversation,
  "id" | "title" | "creationTimestamp"
>

type ConversationUpdate = ConversationListItem

type ConversationEventSourceClass = typeof NodeEventSource | typeof EventSource
type ConversationEventSourceInstance = InstanceType<ConversationEventSourceClass>

type Request$4 = {
    conversationId: number;
    updates: {
        title?: Conversation["title"];
    };
};
type Response$5 = ConversationUpdate;

type CommonStreamData = {
    messageId: number;
};
type StreamDocumentChunk = {
    id: number;
    content: string;
};
type StreamDocument = {
    id: number;
    name: string;
    chunks: StreamDocumentChunk[];
};
type ErrorStreamData = CommonStreamData & {
    type: "ERROR";
    code: string;
    message: string;
};
type EndStreamData = CommonStreamData & {
    type: "END";
    iteration: number;
    data: {
        content: string;
        documents: StreamDocument[];
    } | null;
    error: {
        code: string;
        message: string;
    } | null;
};
type ChunkStreamData = CommonStreamData & {
    type: "CHUNK";
    content: string;
    index: number;
    iteration: number;
};
type ChunkAggregateStreamData = CommonStreamData & {
    type: "CHUNK_AGGREGATE";
    fromIndex: number;
    toIndex: number;
    content: string;
    iteration: number;
};
type ToolCallStartStreamData = CommonStreamData & {
    type: "TOOL_CALL_START";
    iteration: number;
    toolCallIndex: number;
    tool: {
        id: number;
        name: string;
    };
};
type ToolCallEndStreamData = CommonStreamData & {
    type: "TOOL_CALL_END";
    iteration: number;
    toolCallIndex: number;
};
type StreamData = (ErrorStreamData | EndStreamData | ChunkStreamData | ChunkAggregateStreamData | ToolCallStartStreamData | ToolCallEndStreamData);
type IterableChunkData = {
    content: string;
    index: number;
    iteration: number;
};
type ConversationEventEmitterMap = {
    data: [StreamData];
    chunk: [ChunkStreamData];
    "chunk-aggregate": [ChunkAggregateStreamData];
    end: [EndStreamData];
    error: [unknown];
    "tool-call-start": [ToolCallStartStreamData];
    "tool-call-end": [ToolCallEndStreamData];
};
type ConversationEventEmitter = EventEmitter<ConversationEventEmitterMap>;
type CompletionAsyncIterable = AsyncIterable<IterableChunkData> & {
    messageId: number;
    documents: StreamDocument[] | null;
    error: {
        code: string;
        message: string;
    } | null;
    partial: string;
    _chunks: {
        content: string;
        index: number;
    }[];
    toolCalls: {
        iteration: number;
        toolCallIndex: number;
        tool: {
            id: number;
            name: string;
        };
        finished: boolean;
    }[];
    emitter: ConversationEventEmitter;
    complete: AsyncIterable<StreamData>;
};
type SyncResponse = {
    messageId: number;
    content: string;
    documents: StreamDocument[];
};

type Request$3 = {
    conversationId: number;
};
type Response$4 = ConversationEventEmitter;

type Request$2 = {
    prompt: string;
    conversationId: number;
};
type Response$3 = {
    messageId: number;
};

type Response$2 = ConversationListItem[];

type Request$1 = {
    conversationId: number;
};
type Response$1 = Conversation;

type Request<STREAM extends boolean> = {
    prompt: string;
    conversationId: number;
    stream?: STREAM;
};
type Response<STREAM extends boolean> = STREAM extends true ? CompletionAsyncIterable : Promise<SyncResponse>;

declare class ChatbotSDK {
    axios: Axios;
    private EventSource;
    private authToken?;
    private baseURL;
    constructor(config?: ChatbotSDKBaseConfig, axiosConfig?: CreateAxiosDefaults);
    setAuthToken(token?: string): void;
    call: <T>(request: AxiosRequestConfig) => Promise<T>;
    chat: <STREAM extends boolean>(request: Request<STREAM>) => Promise<Response<STREAM>>;
    getConversation: (request: Request$1) => Promise<Response$1>;
    listConversations: () => Promise<Response$2>;
    sendMessage: (request: Request$2) => Promise<Response$3>;
    getConversationEventEmitter: (request: Request$3) => Promise<Response$4>;
    updateConversation: (request: Request$4) => Promise<Response$5>;
    _getConversationStream: (conversationId: number) => Promise<ConversationEventSourceInstance>;
}

export { ChatbotSDK as default };
