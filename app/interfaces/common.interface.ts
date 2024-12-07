import {
  SendMessageRequest,
  SocketMessageResponse,
} from "./chat/chat.interface";

export class BaseResponse {
  data: Record<string, any>;
  meta: {
    code: string;
    message: string;
  };
}

export interface UserAccount {
  account_id: string;
  last_name: string;
  first_name: string;
  email: string;
}

export interface SocketInterface {
  isConnected: boolean;
  addMessageListener: (
    listener: (message: SocketMessageResponse) => void
  ) => void;
  removeMessageListener: (
    listener: (message: SocketMessageResponse) => void
  ) => void;
  sendMessage: (message: SendMessageRequest) => void;
}
