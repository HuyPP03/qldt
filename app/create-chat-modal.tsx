import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  GestureResponderEvent,
} from "react-native";
import { UserAccount } from "./interfaces/common.interface";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import request from "@/utility/request";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL } from "@/utility/env";
import { useRouter } from "expo-router";

interface CreateChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({
  visible,
  onClose,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [contacts, setContacts] = React.useState<UserAccount[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const res = await request<any>(`${SERVER_URL}/it5023e/search_account`, {
          method: "POST",
          body: {
            search: searchTerm,
          },
        });

        if (res.meta.code === "1000") {
          setContacts(res.data.page_content.reverse());
        } else {
          console.log("Failed to fetch conversations", res.meta.message);
        }
      } catch (error) {
        console.log("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [searchTerm]);

  const handleContactPress = (contact: UserAccount) => {
    onClose();
    router.push({
      pathname: "/chat",
      params: {
        partnerId: contact.account_id,
        partnerName: contact.first_name + " " + contact.last_name,
        partnerAvatar: "",
      },
    });
  };

  const renderContact = ({ item }: { item: UserAccount }) => (
    <TouchableOpacity
      style={styles.contactContainer}
      onPress={() => handleContactPress(item)}
    >
      <Text style={styles.contactName}>
        {item.first_name + " " + item.last_name}
      </Text>
    </TouchableOpacity>
  );

  const handleGesture = ({
    nativeEvent,
  }: {
    nativeEvent: { translationY: number };
  }) => {
    if (nativeEvent.translationY > 100) {
      onClose();
    }
    return true;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.modalContainer}>
        <PanGestureHandler onGestureEvent={handleGesture}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Tin nhắn mới</Text>
              <View style={styles.leftButton} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <FlatList
              style={styles.flatList}
              data={contacts}
              renderItem={renderContact}
              keyExtractor={(item) => item.account_id}
            />
          </View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 10,
  },
  leftButton: {
    padding: 10,
    width: 32,
  },
  closeButtonText: {
    color: "#CC0000",
    fontSize: 16,
  },
  searchInput: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 20,
  },
  flatList: {
    width: "100%",
    flex: 1,
  },
  contactContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  contactName: {
    fontSize: 16,
    textAlign: "left",
    paddingVertical: 5,
  },
});

export default CreateChatModal;
