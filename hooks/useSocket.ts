import { useEffect, useRef, useState } from "react";
import { CompatClient, Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { SERVER_URL } from "@/utility/env";
import {
  SendMessageRequest,
  SocketMessageResponse,
} from "@/app/interfaces/chat/chat.interface";

export const useSocket = (user: string, fetchConversation: () => void) => {
  const url = `${SERVER_URL}/ws`;
  const stompClientRef = useRef<CompatClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const listenersRef = useRef<((message: SocketMessageResponse) => void)[]>([]);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addMessageListener = (
    listener: (message: SocketMessageResponse) => void
  ) => {
    listenersRef.current.push(listener);
  };

  const removeMessageListener = (
    listener: (message: SocketMessageResponse) => void
  ) => {
    listenersRef.current = listenersRef.current.filter((l) => l !== listener);
  };

  useEffect(() => {
    const stompClient = Stomp.over(() => new SockJS(url));
    stompClientRef.current = stompClient;

    const onConnected = () => {
      stompClient.subscribe(`/user/${user}/inbox`, onMessageReceive);
      setIsConnected(true);

      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }
    };

    const onMessageReceive = (payload: any) => {
      try {
        const messageReceived = JSON.parse(
          payload.body
        ) as SocketMessageResponse;
        console.log("Message received:", messageReceived);
        fetchConversation();
        // Notify all listeners about the new message
        listenersRef.current.forEach((listener) => listener(messageReceived));
      } catch (error) {
        console.error("Error parsing received message:", error);
      }
    };

    const onError = (error: any) => {
      console.error("Connection error:", error);
      setIsConnected(false);

      if (!reconnectIntervalRef.current) {
        reconnectIntervalRef.current = setInterval(() => {
          console.log("Attempting to reconnect...");
          stompClient.connect({}, onConnected, onError);
        }, 3000);
      }
    };

    stompClient.connect({}, onConnected, onError);

    return () => {
      stompClient.disconnect(() => console.log("Disconnected"));
      stompClientRef.current = null;
      setIsConnected(false);
    };
  }, [user, url]);

  const sendMessage = (message: SendMessageRequest) => {
    const stompClient = stompClientRef.current;

    if (stompClient && stompClient.connected) {
      try {
        stompClient.send("/chat/message", {}, JSON.stringify(message));
        console.log("Message sent:", message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.error("STOMP client is not connected.");
    }
  };

  return {
    isConnected,
    sendMessage,
    addMessageListener,
    removeMessageListener,
  };
};
