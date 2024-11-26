import { CompatClient, Stomp } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { SERVER_URL } from "@/utility/env";
import {
  SendMessageRequest,
  SocketMessageResponse,
} from "@/app/interfaces/chat/chat.interface";

export const useSocket = (user: string) => {
  const url = `${SERVER_URL}/ws`;
  const [stompClient, setStompClient] = useState<CompatClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const listenersRef = useRef<((message: SocketMessageResponse) => void)[]>([]);

  // Function to add a listener
  const addMessageListener = (
    listener: (message: SocketMessageResponse) => void
  ) => {
    listenersRef.current.push(listener);
  };

  // Function to remove a listener
  const removeMessageListener = (
    listener: (message: SocketMessageResponse) => void
  ) => {
    listenersRef.current = listenersRef.current.filter((l) => l !== listener);
  };

  useEffect(() => {
    const tmpStompClient = Stomp.over(() => new SockJS(url));
    setStompClient(tmpStompClient);
    console.log("Connecting...");

    return () => {
      if (stompClient) {
        stompClient.unsubscribe(`/user/${user}/inbox`);
        stompClient.disconnect(() => {
          console.log("Disconnecting...");
        });
      }
      setStompClient(null);
    };
  }, [user]);

  const onMessageReceive = (payload: any) => {
    try {
      const messageReceived = JSON.parse(payload.body) as SocketMessageResponse;

      // Notify all listeners about the new message
      listenersRef.current.forEach((listener) => listener(messageReceived));
    } catch (error) {
      console.error("Error parsing received message:", error);
    }
  };

  const onConnected = () => {
    if (stompClient) {
      stompClient.subscribe(`/user/${user}/inbox`, onMessageReceive);
      console.log("Connected");
      setIsConnected(true);
    }
  };

  const onError = (error: any) => {
    console.error("Connection error:", error);
    setIsConnected(false);
  };

  useEffect(() => {
    if (stompClient) {
      stompClient.connect({}, onConnected, onError);
    }
  }, [stompClient]);

  const sendMessage = (message: SendMessageRequest) => {
    if (stompClient && stompClient.connected) {
      stompClient.send("/chat/message", {}, JSON.stringify(message));
      console.log("Message sent:", JSON.stringify(message));
    } else {
      console.error("STOMP client is not connected");
    }
  };

  return {
    isConnected,
    sendMessage,
    addMessageListener,
    removeMessageListener,
  };
};
