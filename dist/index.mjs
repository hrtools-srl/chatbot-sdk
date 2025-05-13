import axios from 'axios';
import { match } from 'ts-pattern';
import { EventEmitter } from 'events';

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var __await = function(promise, isYieldStar) {
  this[0] = promise;
  this[1] = isYieldStar;
};
var __asyncGenerator = (__this, __arguments, generator) => {
  var resume = (k, v, yes, no) => {
    try {
      var x = generator[k](v), isAwait = (v = x.value) instanceof __await, done = x.done;
      Promise.resolve(isAwait ? v[0] : v).then((y) => isAwait ? resume(k === "return" ? k : "next", v[1] ? { done: y.done, value: y.value } : y, yes, no) : yes({ value: y, done })).catch((e) => resume("throw", e, yes, no));
    } catch (e) {
      no(e);
    }
  }, method = (k) => it[k] = (x) => new Promise((yes, no) => resume(k, x, yes, no)), it = {};
  return generator = generator.apply(__this, __arguments), it[__knownSymbol("asyncIterator")] = () => it, method("next"), method("throw"), method("return"), it;
};
var parseEventMessage = (event) => {
  try {
    if (event.type === "message" && event.data) {
      const data = JSON.parse(event.data);
      return data;
    }
  } catch (_) {
  }
  return null;
};
var conversationEventSourceToEventEmitter = (eventSource) => {
  const emitter = new EventEmitter();
  const processMessage = (event) => {
    emitter.emit("data", event);
    match(event).with({ type: "DOCUMENT_CONTEXT" }, (value) => emitter.emit("document-context", value)).with({ type: "ERROR" }, (value) => emitter.emit("error", value)).with({ type: "END" }, (value) => emitter.emit("end", value)).with({ type: "CHUNK" }, (value) => emitter.emit("chunk", value)).with({ type: "CHUNK_AGGREGATE" }, (value) => emitter.emit("chunk-aggregate", value)).with({ type: "TOOL_CALL_START" }, (value) => emitter.emit("tool-call-start", value)).with({ type: "TOOL_CALL_END" }, (value) => emitter.emit("tool-call-end", value)).exhaustive();
  };
  eventSource.onmessage = (event) => {
    const data = parseEventMessage(event);
    if (data) {
      processMessage(data);
    }
  };
  eventSource.onerror = (error) => {
    emitter.emit("error", error);
  };
  return emitter;
};
var Queue = class {
  constructor() {
    this.done = false;
    this.queue = [];
    this.waitForChunkResolveFunction = void 0;
  }
  waitForChunk() {
    return new Promise((resolve) => this.waitForChunkResolveFunction = resolve);
  }
};
var messageEventSourceToAsyncIterable = (eventSource, messageId) => {
  const chunksQueue = new Queue();
  const completeQueue = new Queue();
  function end() {
    var _a2, _b2;
    chunksQueue.done = true;
    completeQueue.done = true;
    (_a2 = chunksQueue.waitForChunkResolveFunction) == null ? void 0 : _a2.call(chunksQueue);
    chunksQueue.waitForChunkResolveFunction = void 0;
    (_b2 = completeQueue.waitForChunkResolveFunction) == null ? void 0 : _b2.call(completeQueue);
    completeQueue.waitForChunkResolveFunction = void 0;
    eventSource.close();
  }
  const parsedEmitter = conversationEventSourceToEventEmitter(eventSource);
  const processMessage = (event) => {
    var _a2;
    if (event.messageId !== messageId) {
      return;
    }
    completeQueue.queue.push(event);
    (_a2 = completeQueue.waitForChunkResolveFunction) == null ? void 0 : _a2.call(completeQueue);
    completeQueue.waitForChunkResolveFunction = void 0;
    match(event).with({ type: "DOCUMENT_CONTEXT" }, (value) => {
      out.documents = value.documents;
    }).with({ type: "ERROR" }, (value) => {
      out.error = {
        code: value.code,
        message: value.message
      };
      end();
    }).with({ type: "CHUNK" }, (event2) => {
      var _a3;
      const value = {
        content: event2.content,
        index: event2.index,
        iteration: event2.iteration
      };
      out._chunks.push(value);
      chunksQueue.queue.push(value);
      (_a3 = chunksQueue.waitForChunkResolveFunction) == null ? void 0 : _a3.call(chunksQueue);
      chunksQueue.waitForChunkResolveFunction = void 0;
    }).with({ type: "CHUNK_AGGREGATE" }, () => {
    }).with({ type: "TOOL_CALL_START" }, (event2) => {
      out.toolCalls.push({
        iteration: event2.iteration,
        toolCallIndex: event2.toolCallIndex,
        tool: event2.tool,
        finished: false
      });
    }).with({ type: "TOOL_CALL_END" }, (event2) => {
      const toolCall = out.toolCalls.find((call) => call.toolCallIndex === event2.toolCallIndex);
      if (toolCall) {
        toolCall.finished = true;
      }
    }).with({ type: "END" }, () => end()).exhaustive();
  };
  parsedEmitter.on("data", (event) => {
    processMessage(event);
  });
  const out = {
    messageId,
    documents: null,
    error: null,
    _chunks: [],
    toolCalls: [],
    emitter: parsedEmitter,
    get partial() {
      return this._chunks.sort((a, b) => a.index - b.index).map((chunk) => chunk.content).join("");
    },
    [Symbol.asyncIterator]() {
      return __asyncGenerator(this, null, function* () {
        while (true) {
          const value = chunksQueue.queue.shift();
          if (value) {
            yield value;
          } else {
            if (chunksQueue.done) {
              return;
            }
            yield new __await(chunksQueue.waitForChunk());
          }
        }
      });
    },
    complete: {
      [Symbol.asyncIterator]() {
        return __asyncGenerator(this, null, function* () {
          while (true) {
            const value = completeQueue.queue.shift();
            if (value) {
              yield value;
            } else {
              if (completeQueue.done) {
                return;
              }
              yield new __await(completeQueue.waitForChunk());
            }
          }
        });
      }
    }
  };
  return out;
};
var messageEventSourceToSyncResponse = (eventSource, messageId) => __async(void 0, null, function* () {
  let resolve;
  let reject;
  const mainPromise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const processMessage = (event) => {
    if (event.messageId !== messageId) {
      return;
    }
    if (event.type === "END") {
      if (event.data) {
        resolve({
          messageId: event.messageId,
          content: event.data.content,
          documents: event.data.documents
        });
      }
      if (event.error) {
        reject({
          code: event.error.code,
          message: event.error.message
        });
      }
      reject();
    }
    if (event.type === "ERROR") {
      reject({
        code: event.code,
        message: event.message
      });
    }
  };
  eventSource.onerror = (error) => {
    reject(error);
  };
  eventSource.onmessage = (event) => {
    const data = parseEventMessage(event);
    if (data) {
      processMessage(data);
    }
  };
  return mainPromise;
});

// src/operations/chat.ts
var chat_default = (sdk) => (request) => __async(void 0, null, function* () {
  const evt = yield sdk._getConversationStream(request.conversationId);
  const { messageId } = yield sdk.sendMessage({ conversationId: request.conversationId, prompt: request.prompt });
  if (request.stream) {
    return messageEventSourceToAsyncIterable(evt, messageId);
  } else {
    return messageEventSourceToSyncResponse(evt, messageId);
  }
});

// src/operations/getConversation.ts
var getConversation_default = (sdk) => (request) => sdk.call({
  method: "get",
  url: `/public/conversations/${request.conversationId}`
});

// src/operations/listConversations.ts
var listConversations_default = (sdk) => () => sdk.call({
  method: "get",
  url: "/public/conversations"
});

// src/operations/getConversationEventEmitter.ts
var getConversationEventEmitter_default = (sdk) => (request) => __async(void 0, null, function* () {
  const evt = yield sdk._getConversationStream(request.conversationId);
  return conversationEventSourceToEventEmitter(evt);
});

// src/operations/sendMessage.ts
var sendMessage_default = (sdk) => (request) => __async(void 0, null, function* () {
  return sdk.call({
    method: "post",
    url: "/public/messages",
    data: request
  });
});

// src/operations/updateConversation.ts
var updateConversation_default = (sdk) => (request) => sdk.call({
  method: "patch",
  url: `/public/conversations/${request.conversationId}`,
  data: {
    updates: request.updates
  }
});

// src/index.ts
var ChatbotSDK = class {
  constructor(config, axiosConfig) {
    this.call = (request) => __async(this, null, function* () {
      try {
        const { data } = yield this.axios.request(request);
        return data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const { response } = error;
          if (response == null ? void 0 : response.data) {
            throw response.data;
          }
        }
        throw error;
      }
    });
    this.chat = chat_default(this);
    this.getConversation = getConversation_default(this);
    this.listConversations = listConversations_default(this);
    this.sendMessage = sendMessage_default(this);
    this.getConversationEventEmitter = getConversationEventEmitter_default(this);
    this.updateConversation = updateConversation_default(this);
    this._getConversationStream = (conversationId) => __async(this, null, function* () {
      const url = new URL(`${this.baseURL}/public/conversations/${conversationId}/stream`);
      if (this.authToken) {
        url.searchParams.append("authToken", this.authToken);
      }
      return new this.EventSource(url);
    });
    if (config == null ? void 0 : config.EventSource) {
      this.EventSource = config.EventSource;
    } else {
      const EventSource = window.EventSource;
      if (!EventSource) {
        throw new Error("EventSource is not available. Please provide an eventsource instance.");
      }
      this.EventSource = EventSource;
    }
    this.baseURL = (config == null ? void 0 : config.baseUrl) || "https://chatbot.hrtools.it";
    this.axios = axios.create(__spreadValues({
      baseURL: this.baseURL
    }, axiosConfig || {}));
    this.setAuthToken(config == null ? void 0 : config.authToken);
  }
  setAuthToken(token) {
    if (token) {
      this.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      this.authToken = token;
    } else {
      delete this.axios.defaults.headers.common["Authorization"];
      this.authToken = void 0;
    }
    this.authToken = token;
  }
};

export { ChatbotSDK as default };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map