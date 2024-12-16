import FileItem from "@/components/FileItem";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useEffect, useState } from "react";
import request from "@/utility/request";
import { SERVER_URL } from "@/utility/env";
import { useUser } from "./contexts/UserContext";

interface MaterialType {
  id: string;
  material_name: string;
  description: string;
  material_type: string;
  material_link: string;
}

export default function Files() {
  const router = useRouter();
  const route = useRoute();
  const { token } = useUser();
  const { id, name } = route.params as { id: string; name: string };
  const [materials, setMaterials] = useState<MaterialType[]>([]);

  const getListMaterial = async () => {
    try {
      const response: any = await request(
        `${SERVER_URL}/it5023e/get_material_list`,
        {
          method: "POST",
          body: {
            token,
            class_id: id,
          },
        }
      );
      setMaterials(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      await request(`${SERVER_URL}/it5023e/delete_material`, {
        method: "POST",
        body: {
          token,
          material_id: id,
        },
      });
      setMaterials(materials.filter((file) => file.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa tài liệu:", error);
    }
  };

  useEffect(() => {
    getListMaterial();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View>
        <ScrollView>
          {materials &&
            materials.length > 0 &&
            materials.map((file, index) => (
              <FileItem
                key={index}
                id={file.id}
                classId={id}
                link={file.material_link}
                fileName={file.material_name}
                fileType={file.material_type}
                description={file.description}
                deleteFile={deleteFile}
              />
            ))}
        </ScrollView>
      </View>
      <FloatingActionButton
        onPress={() =>
          router.push({
            pathname: "/upload-file",
            params: { classId: id },
          })
        }
        iconName="add"
      />
    </View>
  );
}
const styles = StyleSheet.create({
  addButtonContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton: {
    marginRight: 10,
  },
});
