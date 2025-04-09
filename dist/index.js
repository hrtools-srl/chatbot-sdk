'use strict';

var axios = require('axios');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var axios__default = /*#__PURE__*/_interopDefault(axios);

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
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

// src/operations/chatCompletion.ts
var chatCompletion_default = (_sdk) => (_request, _options) => {
  throw new Error("Not implemented");
};

// src/operations/getConversation.ts
var getConversation_default = (sdk) => (request, options) => {
  return sdk.call(__spreadValues({
    method: "get",
    url: `/get_conversation/${request.conversationId}`
  }, options));
};

// src/operations/listConversations.ts
var listConversations_default = (sdk) => (options) => {
  return sdk.call(__spreadValues({
    method: "get",
    url: "/list_conversations"
  }, options));
};

// src/index.ts
var ChatbotSDK = class {
  constructor(config, axiosConfig) {
    this.call = (request) => __async(this, null, function* () {
      try {
        const { data } = yield this.axios.request(request);
        return data;
      } catch (error) {
        if (axios__default.default.isAxiosError(error)) {
          const { response } = error;
          if (response == null ? void 0 : response.data) {
            throw response.data;
          }
        }
        throw error;
      }
    });
    this.chatCompletion = chatCompletion_default();
    this.getConversation = getConversation_default(this);
    this.listConversations = listConversations_default(this);
    this.axios = axios__default.default.create(__spreadValues({
      baseURL: config.baseUrl || "https://api.hrtools.it"
    }, axiosConfig || {}));
    this.setAuthToken(config.authToken);
  }
  setAuthToken(token) {
    this.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

module.exports = ChatbotSDK;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map