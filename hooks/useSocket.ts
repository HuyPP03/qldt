import { CompatClient, Stomp } from "@stomp/stompjs";
import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { SERVER_URL } from "@/utility/env";
import {
  SendMessageRequest,
  SocketMessageResponse,
} from "@/app/interfaces/chat/chat.interface";

export const useSocket = (
  user: string,
  onReceiveMessage: (message: SocketMessageResponse) => void,
  onSendMessage: (message: SendMessageRequest) => void
) => {
  const url = `${SERVER_URL}/ws`;
  const [stompClient, setStompClient] = useState<CompatClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [sendMessage, setSendMessage] = useState<Function | null>(null);

  useEffect(() => {
    const tmpStompClient = Stomp.over(() => new SockJS(url));
    setStompClient(tmpStompClient);
    console.log("connecting...");

    return () => {
      if (stompClient) {
        stompClient.unsubscribe(`/user/${user}/inbox`);
        stompClient.disconnect(() => {
          console.log("Disconnect ...");
        });
      }
      setStompClient(null);
    };
  }, [user]);

  const onMessageReceive = (payload: any) => {
    try {
      const messageReceived = JSON.parse(payload.body) as SocketMessageResponse;
      onReceiveMessage(messageReceived);
    } catch (error) {
      console.log("error");
      console.error(error);
    }
  };

  const onConnected = () => {
    if (stompClient) {
      stompClient.subscribe(`/user/${user}/inbox`, onMessageReceive);
      console.log("connected");
      setIsConnected(true);
    }
  };

  const onError = (error: any) => {
    console.log("Connecting Error", error);
    setIsConnected(false);
  };

  useEffect(() => {
    if (stompClient) {
      stompClient.connect({}, onConnected, onError);
    }
  }, [stompClient]);

  useEffect(() => {
    if (isConnected && stompClient) {
      const onSendSocketMessage = (message: SendMessageRequest) => {
        if (stompClient.connected) {
          stompClient.send("/chat/message", {}, JSON.stringify(message));
          console.log(JSON.stringify(message));
          onSendMessage(message);
        } else {
          console.error("STOMP client is not connected");
        }
      };
      setSendMessage(() => onSendSocketMessage);
    } else {
      setSendMessage(null);
    }
  }, [isConnected]);

  return sendMessage;
};
