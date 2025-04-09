import axios, { Axios, AxiosRequestConfig, CreateAxiosDefaults } from "axios"
import { ChatbotSDKBaseConfig } from "./types"

import chatCompletion from "$operations/chatCompletion"
import getConversation from "$operations/getConversation"
import listConversations from "$operations/listConversations"

export default class ChatbotSDK {
  axios: Axios

  constructor(config: ChatbotSDKBaseConfig, axiosConfig?: CreateAxiosDefaults) {
    this.axios = axios.create({
      baseURL: config.baseUrl || "https://api.hrtools.it",
      ...(axiosConfig || {}),
    })

    this.setAuthToken(config.authToken)
  }

  setAuthToken(token: string) {
    this.axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
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

  chatCompletion = chatCompletion(this)
  getConversation = getConversation(this)
  listConversations = listConversations(this)
}
