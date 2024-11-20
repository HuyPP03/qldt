import { BaseResponse } from "../common.interface";

export interface ChatConversation {
  id: string;
  partner: Partner;
  last_message?: Message;
}

export interface Partner {
  id: string;
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
