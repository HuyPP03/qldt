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
  ActivityIndicator,
  Image,
  Animated,
} from "react-native";
import { useRoute, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import React, { useRef, useState, useEffect } from "react";
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
import { getGoogleDriveDirectLink } from "@/utility/helper";
import { defaultAvatar } from "@/constants/Image";

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

  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const isFocused = useIsFocused();
  const { userInfo } = useUser();
  const {
    socket: { sendMessage, addMessageListener, removeMessageListener },
    fetchConversations,
  } = useMessageContext();
  const flatListRef = useRef<FlatList>(null);
  const numberPerPage = 20;

  const fetchMessages = async (page: number) => {
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
            index: page,
            count: numberPerPage,
            conversation_id: conversationId,
            mark_as_read: true,
          },
        }
      );

      if (res.meta.code === "1000") {
        if (page === 0) {
          setMessages(res.data.conversation);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            ...res.data.conversation,
          ]);
        }
        await fetchConversations();
      } else {
        console.error("Failed to fetch conversations", res.meta.message);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
  }, [conversationId, page]);

  const scrollToBottomNoAnimation = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
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
    if (isFocused && message.sender.id != userInfo?.id) {
      setMessages((prevMessages) => [receivedMessage, ...prevMessages]);
      scrollToBottomNoAnimation();
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
    if (isFocused) {
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      scrollToBottomNoAnimation();
    }
  };

  const Toast = ({ message }: { message: string }) => {
    const translateY = new Animated.Value(100);

    React.useEffect(() => {
      // Animation hiện lên
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();

      // Animation ẩn đi sau 3 giây
      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: 150,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2700);

      return () => {
        clearTimeout(timer);
        setError(null);
      };
    }, []);

    return (
      <Animated.View
        style={[
          styles.toastContainer,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={styles.toastText}>{message}</Text>
      </Animated.View>
    );
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

  useEffect(() => {
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
      };
      sendMessage(message);
      handleNewSendMessage(message);
      setNewMessage("");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const token = await AsyncStorage.getItem("userToken");
    const data = {
      token: token as string,
      message_id: messageId,
      partner_id: partnerId,
    };

    try {
      const res: any = await request(`${SERVER_URL}/it5023e/delete_message`, {
        body: data,
      });
      if (res.meta.code === "1000") {
        console.log("Message deleted successfully");
        // setMessages((prevMessages) =>
        //   prevMessages.map((message: Message) => {
        //     if (message.message_id === messageId) {
        //       return { ...message, content: null };
        //     }
        //     return message;
        //   })
        // );
        setPage(0);
        fetchMessages(0);
      } else {
        setError(`Failed to delete message ${res.meta.message}`);
      }
    } catch (error: any) {
      setError(`Error deleting message: ${error?.data || error}`);
    } finally {
      setIsModalVisible(false);
    }
  };

  const handleLoadMore = () => {
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      setPage((prevPage) => prevPage + numberPerPage);
    }
  };

  const handleLongPress = (messageId: string, content: string) => {
    if (content == null) return;
    setSelectedMessageId(messageId);
    setIsModalVisible(true);
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => {
    const isSent = item.sender.id == userInfo?.id;
    const isDeleted = item.message == null;

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item.message_id!, item.message)}
        style={[styles.messageRow, isSent && styles.userMessageRow]}
        key={item.message_id}
      >
        <View
          style={
            isDeleted
              ? styles.deleteMessage
              : isSent
              ? styles.sentMessage
              : styles.receivedMessage
          }
        >
          <Text
            style={
              isDeleted
                ? styles.deletedMessageText
                : isSent
                ? styles.messageSendText
                : styles.messageReceiveText
            }
          >
            {isDeleted ? "Tin nhắn này đã bị xóa" : item.message}
          </Text>
          <Text style={styles.messageTime}>
            {carbon.formatDate(item.created_at, "HH:mm DD/MM/YYYY")}
          </Text>
        </View>
      </TouchableOpacity>
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
        <TouchableOpacity
          onPress={async () => {
            await fetchMessages(0);
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Image
              source={
                avatar
                  ? { uri: getGoogleDriveDirectLink(avatar) }
                  : defaultAvatar
              }
              style={styles.avatar}
            />
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
        {loading && (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#ff0000" />
          </View>
        )}
        {!loading ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            style={styles.messageList}
            renderItem={renderMessage}
            keyExtractor={(item) => item.message_id || getRandomString(10)}
            onEndReached={messages.length >= 20 ? handleLoadMore : null}
            onEndReachedThreshold={0.1}
            inverted={true}
            ListFooterComponent={
              isFetchingMore ? (
                <ActivityIndicator size="small" color="#ff0000" />
              ) : null
            }
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

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        style={styles.bottomModal}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => handleDeleteMessage(selectedMessageId!)}
          >
            <Text style={styles.modalButtonText}>Delete Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {error ? <Toast message={error} /> : null}
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
  deleteMessage: {
    backgroundColor: "#fff",
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
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
  },
  modalButton: {
    padding: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 18,
    color: "#CC0000",
  },
  toastContainer: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CC0000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  toastText: {
    color: "#CC0000",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  deletedMessageText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
    lineHeight: 20,
  },
});
