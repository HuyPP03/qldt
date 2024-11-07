import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
      <Stack.Screen name="class-management" options={{ headerShown: false }} />
      <Stack.Screen name="create-class" options={{ headerShown: false }} />
      <Stack.Screen name="edit-class" options={{ headerShown: false }} />
      <Stack.Screen name="classes" options={{ headerShown: false }} />
      <Stack.Screen name="class-detail" options={{ headerShown: false }} />
    </Stack>
  );
}
