import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import request from "@/utility/request";
import { SERVER_URL } from "@/utility/env";
import { useSocket } from "@/hooks/useSocket";
import {
  ChatConversation,
  ConversationResponse,
} from "@/app/interfaces/chat/chat.interface";
import { useUser } from "./UserContext";
import { SocketInterface } from "../interfaces/common.interface";

interface MessageContextProps {
  unreadMessagesCount: number;
  setUnreadMessagesCount: React.Dispatch<React.SetStateAction<number>>;
  fetchConversations: () => Promise<void>;
  conversations: ChatConversation[];
  setConversations: React.Dispatch<React.SetStateAction<ChatConversation[]>>;
  socket: SocketInterface;
}

const MessageContext = createContext<MessageContextProps | undefined>(
  undefined
);

interface MessageProviderProps {
  children: React.ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
}) => {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [socket, setSocket] = useState<SocketInterface | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const { userInfo, token } = useUser();

  const fetchConversations = async () => {
    if (!token) {
      return;
    }

    try {
      const res: ConversationResponse = await request<any>(
        `${SERVER_URL}/it5023e/get_list_conversation`,
        {
          method: "POST",
          body: {
            token: token,
            index: 0,
            count: 20,
          },
        }
      );

      if (res.meta.code === "1000") {
        setUnreadMessagesCount(Number(res.data.num_new_message));
        setConversations(res.data.conversations);
      } else {
        console.log(
          "Failed to fetch unread messages and conversations",
          res.meta.message
        );
      }
    } catch (error) {
      console.log("Error fetching unread messages and conversations:", error);
    }
  };

  const socketInit: SocketInterface = useSocket(
    userInfo?.id || "",
    fetchConversations
  );
  useEffect(() => {
    fetchConversations();
    setSocket(socketInit);
  }, [token]);

  return (
    <MessageContext.Provider
      value={{
        unreadMessagesCount,
        setUnreadMessagesCount,
        fetchConversations,
        conversations,
        setConversations,
        socket: socket || {
          isConnected: false,
          sendMessage: () => {},
          addMessageListener: () => {},
          removeMessageListener: () => {},
        },
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }
  return context;
};
