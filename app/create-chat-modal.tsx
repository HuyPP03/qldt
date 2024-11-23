import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { UserAccount } from "./interfaces/common.interface";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";

interface CreateChatModalProps {
  visible: boolean;
  onClose: () => void;
  contacts: UserAccount[];
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({
  visible,
  onClose,
  contacts,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const renderContact = ({ item }: { item: UserAccount }) => (
    <TouchableOpacity style={styles.contactContainer}>
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
