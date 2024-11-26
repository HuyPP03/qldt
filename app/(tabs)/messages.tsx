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
  RefreshControl,
  Modal,
} from "react-native";
import React, { useContext } from "react";
import { useRouter } from "expo-router";
import request from "@/utility/request";
import { SERVER_URL } from "@/utility/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChatConversation,
  ConversationResponse,
} from "../interfaces/chat/chat.interface";
import { Ionicons } from "@expo/vector-icons";
import CreateChatModal from "../create-chat-modal";
import { useMessageContext } from "../contexts/MessageContext";

export default function MessagesScreen() {
  const router = useRouter();

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const { conversations, fetchConversations } = useMessageContext();

  React.useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = React.useCallback(() => {
    console.log("Refreshing...");
    setRefreshing(true);
    fetchConversations().then(() => {
      setRefreshing(false);
      console.log("Refresh complete");
    });
  }, []);

  const handleChatPress = (
    conversationId: string,
    partner: { id: string; name: string; avatar: string }
  ) => {
    router.push({
      pathname: "/chat",
      params: {
        id: conversationId,
        partnerId: partner.id,
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
          {item.last_message?.unread ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.last_message?.unread}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContact = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.contactContainer}>
      <Text style={styles.contactName}>{item.name}</Text>
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
        <View style={styles.headerLeft} />
        <Text style={styles.headerText}>Tin nhắn</Text>
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
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
          refreshing={refreshing}
          onRefresh={onRefresh}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>

      <CreateChatModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        contacts={[
          { account_id: "1", first_name: "John", last_name: "Doe", email: "" },
          { account_id: "2", first_name: "Jane", last_name: "Doe", email: "" },
        ]} // Replace with your contacts data
      />
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
    justifyContent: "space-between",
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
  headerLeft: {
    width: 24,
  },
  plusButton: {},
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  contactContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  contactName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#CC0000",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});
