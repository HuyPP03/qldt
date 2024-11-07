import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { RadioButton } from "react-native-paper";
import React, { useState } from "react";

export default function SearchScreen() {
  const [searchType, setSearchType] = useState("gv");

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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Tìm kiếm</Text>

            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="Nhập họ và tên" />
            </View>

            {/* Radio Buttons */}
            <View style={styles.radioGroup}>
              <RadioButton.Group
                onValueChange={(value) => setSearchType(value)}
                value={searchType}
              >
                <View style={styles.radioButtonContainer}>
                  <View style={styles.radioButton}>
                    <RadioButton value="gv" color="#CC0000" />
                    <Text>GV</Text>
                  </View>

                  <View style={styles.radioButton}>
                    <RadioButton value="sv" color="#CC0000" />
                    <Text>SV</Text>
                  </View>

                  <View style={styles.radioButton}>
                    <RadioButton value="hp" color="#CC0000" />
                    <Text>Học phần</Text>
                  </View>

                  <View style={styles.radioButton}>
                    <RadioButton value="lop" color="#CC0000" />
                    <Text>Lớp</Text>
                  </View>
                </View>
              </RadioButton.Group>
            </View>
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
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
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
});
