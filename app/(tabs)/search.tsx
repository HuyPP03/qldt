import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Button,
  Image,
} from "react-native";
import { RadioButton } from "react-native-paper";
import React, { useState } from "react";
import request from "@/utility/request";
import { SERVER_URL } from "@/utility/env";
import { TouchableOpacity } from "react-native";
import { defaultAvatar } from "@/constants/Image";
import { getGoogleDriveDirectLink } from "@/utility/helper";
interface ResultAccount {
  account_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ResultAccount[]>([]);

  const handleSearch = async () => {
    try {
      const response: any = await request(
        `${SERVER_URL}/it5023e/search_account`,
        {
          method: "POST",
          body: {
            search: search,
            pageable_request: {
              page: "0",
              page_size: "100",
            },
          },
        }
      );

      if (response) {
        setResults(response.data.page_content);
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Tra cứu thông tin</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <Text style={styles.label}>Tìm kiếm</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.createButton} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Form */}
          <View style={styles.form}>
            <ScrollView>
              {/* Kết quả tìm kiếm */}
              <View style={styles.resultsContainer}>
                {results &&
                  results.length > 0 &&
                  results.map((account: ResultAccount) => (
                    <View key={account.account_id} style={styles.resultItem}>
                      <View style={styles.avatarContainer}>
                        <Image
                          source={
                            account.avatar
                              ? {
                                  uri: getGoogleDriveDirectLink(
                                    account.avatar || ""
                                  ),
                                }
                              : defaultAvatar
                          }
                          style={styles.avatar}
                        />
                      </View>
                      <Text style={styles.resultEmail}>{account.email}</Text>
                      <Text style={styles.resultName}>
                        {account.first_name} {account.last_name}
                      </Text>
                    </View>
                  ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#CC0000",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  form: {
    padding: 20,
  },
  label: {
    marginLeft: 28,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
    marginLeft: 28,
    marginRight: 28,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
    flex: 1,
    height: 50,
  },
  radioGroup: {
    marginTop: 10,
  },
  radioButtonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  resultsContainer: {
    padding: 10,
  },
  resultItem: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  resultEmail: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  resultName: {
    fontSize: 14,
    color: "#666",
  },
  createButton: {
    backgroundColor: "#CC0000",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
