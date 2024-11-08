import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import request from "@/utility/request";
import { useRouter } from "expo-router";

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
  status: string;
}

interface UserContextType {
  userInfo: UserInfo | null;
  setUserInfo: (user: UserInfo | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        const response = await request<{ data: UserInfo }>(
          "http://160.30.168.228:8080/it4788/get_user_info",
          {
            method: "POST",
            body: { token },
          }
        );
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
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
    <UserContext.Provider value={{ userInfo, setUserInfo, loading, logout }}>
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
