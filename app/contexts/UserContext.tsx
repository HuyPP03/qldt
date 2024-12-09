import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import request from "@/utility/request";
import { useRouter } from "expo-router";
import { SERVER_URL } from "@/utility/env";

export interface UserInfo {
  id: string;
  ho: string;
  ten: string;
  name: string;
  email: string;
  role: "STUDENT" | "LECTURER";
  avatar: string;
  status: string;
}

interface UserContextType {
  token: string | null;
  userInfo: UserInfo | null;
  setUserInfo: (user: UserInfo | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      setToken(token);
      if (token) {
        try {
          const response = await request<{ data: UserInfo }>(
            `${SERVER_URL}/it4788/get_user_info`,
            {
              method: "POST",
              body: { token },
            }
          );
          setUserInfo(response.data);
        } catch (error) {
          await AsyncStorage.removeItem("userToken");
          setToken(null);
          setUserInfo(null);
          router.replace("/sign-up");
        }
      }
    } catch (error) {
      console.error("Lỗi khi đọc token:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      setUserInfo(null);
      router.replace("/sign-up");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{ userInfo, setUserInfo, loading, logout, token }}
    >
      {children}
    </UserContext.Provider>
  );
}
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser phải được sử dụng trong UserProvider");
  }
  return context;
}
