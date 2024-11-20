import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import request from "@/utility/request";
import { SERVER_URL } from "@/utility/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChatConversation,
  ConversationResponse,
} from "../interfaces/chat/chat.interface";

export default function MessagesScreen() {
  const router = useRouter();

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [conversations, setConversations] = React.useState<ChatConversation[]>(
    []
  );

  React.useEffect(() => {
    const fetchConversations = async () => {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        setError("Token is missing");
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
              count: 2,
            },
          }
        );

        if (res.meta.code === 1000) {
          setConversations(res.data.conversations);
        } else {
          console.error("Failed to fetch conversations", res.meta.message);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const handleChatPress = (
    conversationId: string,
    partner: { name: string; avatar: string }
  ) => {
    router.push({
      pathname: "/chat",
      params: {
        id: conversationId,
        partnerName: partner.name,
        partnerAvatar: partner.avatar,
      },
    });
  };

  const renderChatUser = ({ item }: { item: ChatConversation }) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => handleChatPress(item.id, item.partner)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{item.partner.avatar}</Text>
      </View>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.partner.name}</Text>
          <Text style={styles.timestamp}>
            {new Date(
              item.last_message?.created_at as string
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.messagePreview}>
          <Text numberOfLines={1} style={styles.lastMessage}>
            {item.last_message?.message}
          </Text>
          {/* {item.last_message?.unread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.last_message?.unread}
              </Text>
            </View>
          )} */}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.header}>
        <Text style={styles.headerText}>Tin nhắn</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tin nhắn..."
            placeholderTextColor="#666"
          />
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={conversations}
          renderItem={renderChatUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.usersList}
        />
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  userContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    cursor: "pointer",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  messagePreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  unreadBadge: {
    backgroundColor: "#CC0000",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  usersList: {
    backgroundColor: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});
