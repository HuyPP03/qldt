import { Tabs } from "expo-router";
import React from "react";
import { View, Text } from "react-native";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMessageContext } from "../contexts/MessageContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { unreadMessagesCount } = useMessageContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#CC0000",
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].text,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#CC0000",
          borderWidth: 1,
          borderColor: "#CC0000",
          borderRadius: 100,
          marginBottom: 20,
          marginHorizontal: 20,
          paddingTop: 15,
          paddingBottom: 15,
          height: 75,
          position: "absolute",
          backgroundColor: "white",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <TabBarIcon
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                color={color}
              />
              {unreadMessagesCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    right: -6,
                    top: -3,
                    backgroundColor: "#CC0000",
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 12 }}>
                    {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "search" : "search-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
