import axios, { Axios, AxiosRequestConfig, CreateAxiosDefaults } from "axios"
import { ChatbotSDKBaseConfig, ConversationEventSourceClass, ConversationEventSourceInstance } from "./types"

import chat from "$src/operations/chat"
import getConversation from "$operations/getConversation"
import listConversations from "$operations/listConversations"
import getConversationEventEmitter from "$operations/getConversationEventEmitter"
import sendMessage from "$operations/sendMessage"
import updateConversation from "./operations/updateConversation"

export default class ChatbotSDK {
  axios: Axios

  private EventSource: ConversationEventSourceClass
  private authToken?: string
  private baseURL: string

  constructor(config?: ChatbotSDKBaseConfig, axiosConfig?: CreateAxiosDefaults) {
    if (config?.EventSource) {
      this.EventSource = config.EventSource
    } else {
      const EventSource = window.EventSource

      if (!EventSource) {
        throw new Error("EventSource is not available. Please provide an eventsource instance.")
      }

      this.EventSource = EventSource
    }

    this.baseURL = config?.baseUrl || "https://chatbot.hrtools.it"
    this.axios = axios.create({
      baseURL: this.baseURL,
      ...(axiosConfig || {}),
    })

    this.setAuthToken(config?.authToken)
  }

  setAuthToken(token?: string) {
    if (token) {
      this.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      this.authToken = token
    } else {
      delete this.axios.defaults.headers.common["Authorization"]
      this.authToken = undefined
    }

    this.authToken = token
  }

  call = async <T>(request: AxiosRequestConfig): Promise<T> => {
    try {
      const { data } = await this.axios.request<T>(request)
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const { response } = error

        if (response?.data) {
          throw response.data
        }
      }

      throw error
    }
  }

  chat = chat(this)
  getConversation = getConversation(this)
  listConversations = listConversations(this)
  sendMessage = sendMessage(this)
  getConversationEventEmitter = getConversationEventEmitter(this)
  updateConversation = updateConversation(this)

  _getConversationStream = async(conversationId: number): Promise<ConversationEventSourceInstance> => {
    const url = new URL(`${this.baseURL}/public/conversations/${conversationId}/stream`)

    if (this.authToken) {
      url.searchParams.append("authToken", this.authToken)
    }

    return new this.EventSource(url)
  }
}
