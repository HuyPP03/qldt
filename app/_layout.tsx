import { Stack, useRouter } from "expo-router";
import { UserProvider } from "./contexts/UserContext";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MessageProvider } from "./contexts/MessageContext";
import "text-encoding-polyfill";

export default function RootLayout() {
  const router = useRouter();

  const checkToken = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      router.replace("/sign-up");
    } else {
      router.replace("/");
    }

    console.log(token);
  };
  useEffect(() => {
    checkToken();
  }, []);

  return (
    <UserProvider>
      <MessageProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="sign-up" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="get-code" options={{ headerShown: false }} />
          <Stack.Screen name="verify-code" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen
            name="register-for-class"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="class-management"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="create-class" options={{ headerShown: false }} />
          <Stack.Screen name="edit-class" options={{ headerShown: false }} />
          <Stack.Screen name="classes" options={{ headerShown: false }} />
          <Stack.Screen name="class-detail" options={{ headerShown: false }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="chat" options={{ headerShown: false }} />
          <Stack.Screen
            name="teacher-survey-detail"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="create-survey" options={{ headerShown: false }} />
          <Stack.Screen name="edit-survey" options={{ headerShown: false }} />
          <Stack.Screen name="upload-file" options={{ headerShown: false }} />
          <Stack.Screen name="edit-file" options={{ headerShown: false }} />
          <Stack.Screen name="review-absent" options={{ headerShown: false }} />
          <Stack.Screen name="absent-tab" options={{ headerShown: false }} />
        </Stack>
      </MessageProvider>
    </UserProvider>
  );
}
