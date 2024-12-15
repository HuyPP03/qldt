import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  ListRenderItem,
} from "react-native";
import { useRoute, RouteProp, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useRef } from "react";
import {
  Message,
  MessageResponse,
  messageStatus,
  Partner,
  SendMessageRequest,
  SocketMessageResponse,
} from "./interfaces/chat/chat.interface";
import request from "@/utility/request";
import { SERVER_URL } from "@/utility/env";
import { useUser } from "./contexts/UserContext";
import { carbon } from "@/utility/carbon";
import { useMessageContext } from "./contexts/MessageContext";

interface chatParams {
  id?: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
}

export default function Chat() {
  const route = useRoute();
  const router = useRouter();
  const {
    id: conversationId,
    partnerAvatar: avatar,
    partnerName: name,
    partnerId,
  } = route.params as chatParams;

  const [error, setError] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [messageChange, setMessageChange] = React.useState<boolean>(false);
  const [newMessage, setNewMessage] = React.useState<string>("");
  const isFocused = useIsFocused();
  const { userInfo } = useUser();
  const {
    socket: { sendMessage, addMessageListener, removeMessageListener },
    fetchConversations,
  } = useMessageContext();
  const flatListRef = useRef<FlatList>(null);

  React.useEffect(() => {
    const fetchMessages = async (count: number) => {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        setError("Token is missing");
        return;
      }

      try {
        const res: MessageResponse = await request<any>(
          `${SERVER_URL}/it5023e/get_conversation`,
          {
            method: "POST",
            body: {
              token: token,
              index: 0,
              count: count,
              conversation_id: conversationId,
              mark_as_read: true,
            },
          }
        );

        if (res.meta.code === "1000") {
          setMessages(res.data.conversation.reverse());
          await fetchConversations();
        } else {
          console.error("Failed to fetch conversations", res.meta.message);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages(200);
    scrollToBottomNoAnimation();
  }, [conversationId, messageChange]);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const scrollToBottomNoAnimation = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  };

  const handleNewReceiveMessage = (message: SocketMessageResponse) => {
    const receivedMessage: Message = {
      sender: message.sender,
      message: message.content,
      created_at: message.created_at,
      unread: messageStatus.UNREAD,
      message_id: message.id.toString(),
    };
    // if (message.sender.id != userInfo?.id) {
    //   setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    // }
    if (isFocused && message.sender.id != userInfo?.id) {
      setMessageChange(!messageChange);
    }
  };

  const handleNewSendMessage = (message: SendMessageRequest) => {
    const newMessage: Message = {
      sender: userInfo as Partner,
      message: message.content,
      created_at: new Date().toISOString(),
      unread: messageStatus.READ,
      message_id: getRandomString(10),
    };
    // setMessages((prevMessages) => [...prevMessages, newMessage]);
    if (isFocused) setMessageChange(!messageChange);
  };

  const getRandomString = (length: number) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  React.useEffect(() => {
    addMessageListener(handleNewReceiveMessage);
    return () => {
      removeMessageListener(handleNewReceiveMessage);
    };
  }, [addMessageListener, removeMessageListener]);

  const handleSendMessage = async () => {
    if (sendMessage && newMessage.trim()) {
      const token = await AsyncStorage.getItem("userToken");
      const message: SendMessageRequest = {
        token: token as string,
        sender: userInfo?.email,
        receiver: {
          id: Number(partnerId),
          name,
          avatar,
        },
        content: newMessage,
        // conversation_id: conversationId,
      };
      sendMessage(message);
      handleNewSendMessage(message);
      setNewMessage("");
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.message_id !== messageId)
    );
    // Not implement
    console.log("Delete message", messageId);
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => {
    const isSent = item.sender.id == userInfo?.id;

    return (
      <View
        style={[styles.messageRow, isSent && styles.userMessageRow]}
        key={item.message_id}
      >
        <View style={isSent ? styles.sentMessage : styles.receivedMessage}>
          <Text
            style={isSent ? styles.messageSendText : styles.messageReceiveText}
          >
            {item.message}
          </Text>
          <Text style={styles.messageTime}>
            {carbon.formatDate(item.created_at, "HH:mm DD/MM/YYYY")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="white" />
          </View>
          <View style={styles.userTextInfo}>
            <Text style={styles.userName}>{name}</Text>
            <View style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Đang hoạt động</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.chatContainer}>
        {loading && <Text>Loading...</Text>}
        {!loading ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            style={styles.messageList}
            renderItem={renderMessage}
            keyExtractor={(item) => item.message_id || getRandomString(10)}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
          />
        ) : null}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={24} color="#666" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={newMessage}
              onChange={(e) => setNewMessage(e.nativeEvent.text)}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#666"
              multiline
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Ionicons name="send" size={24} color="#CC0000" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#CC0000",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  userTextInfo: {
    flex: 1,
  },
  userName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  statusText: {
    color: "white",
    fontSize: 12,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  messageList: {
    flex: 1,
    padding: 15,
    marginVertical: 15,
  },
  messageRow: {
    marginBottom: 15,
    flexDirection: "row",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  receivedMessage: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 20,
    borderTopLeftRadius: 5,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  sentMessage: {
    backgroundColor: "#CC0000",
    padding: 12,
    borderRadius: 20,
    borderTopRightRadius: 5,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  messageSendText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 20,
  },
  messageReceiveText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  attachButton: {
    padding: 5,
  },
  sendButton: {
    padding: 5,
  },
});
