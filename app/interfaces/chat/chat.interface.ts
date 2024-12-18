import { BaseResponse } from "../common.interface";

export interface ChatConversation {
  id: string;
  partner: Partner;
  last_message?: Message;
}

export interface Partner {
  id: any;
  name: string;
  avatar: string;
}

export interface Message {
  sender: Partner;
  message: string;
  created_at: string;
  unread: number;
  message_id?: string;
}

export enum messageStatus {
  UNREAD,
  READ,
}

export interface ConversationResponse extends BaseResponse {
  data: {
    conversations: ChatConversation[];
    num_new_message: string;
  };
}

export interface MessageResponse extends BaseResponse {
  data: {
    conversation: Message[];
    blocked: boolean;
  };
}

export interface SocketMessageResponse {
  sender: any;
  id: number;
  receiver?: Partner;
  conversation_id: string;
  content: string;
  created_at: string;
  message_status?: string;
}

export interface SendMessageRequest {
  token: string;
  sender: any;
  receiver: Partner;
  conversation_id?: string;
  content: string;
}
