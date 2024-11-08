import { Stack, useRouter } from "expo-router";
import { UserProvider } from "./contexts/UserContext";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/sign-up");
      } else {
        router.replace("/");
      }
      console.log(token);
    };

    checkToken();
  }, []);

  return (
    <UserProvider>
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
      </Stack>
    </UserProvider>
  );
}
