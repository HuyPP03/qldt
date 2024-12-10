import FileItem from "@/components/FileItem";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";

export default function Files(){
    return (
        <View>
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  /* Logic thêm file */
                }}
              >
                <Ionicons name="add" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[
                {
                  fileName: "File 1.pdf",
                  fileSize: "2MB",
                  uploadTime: "1 ngày trước",
                  fileType: "pdf",
                },
                {
                  fileName: "File 2.jpg",
                  fileSize: "3MB",
                  uploadTime: "2 ngày trước",
                  fileType: "image",
                },
                {
                  fileName: "File 3.mp4",
                  fileSize: "5MB",
                  uploadTime: "3 ngày trước",
                  fileType: "video",
                },
                {
                  fileName: "File 4.mp3",
                  fileSize: "4MB",
                  uploadTime: "4 ngày trước",
                  fileType: "audio",
                },
                {
                  fileName: "File 5.docx",
                  fileSize: "1MB",
                  uploadTime: "5 ngày trước",
                  fileType: "word",
                },
                {
                  fileName: "File 6.xlsx",
                  fileSize: "6MB",
                  uploadTime: "6 ngày trước",
                  fileType: "excel",
                },
                {
                  fileName: "File 7.pptx",
                  fileSize: "7MB",
                  uploadTime: "7 ngày trước",
                  fileType: "powerpoint",
                },
                {
                  fileName: "File 8.zip",
                  fileSize: "8MB",
                  uploadTime: "8 ngày trước",
                  fileType: "zip",
                },
                {
                  fileName: "File 9.txt",
                  fileSize: "9MB",
                  uploadTime: "9 ngày trước",
                  fileType: "text",
                },
              ].map((file, index) => (
                <FileItem
                  key={index}
                  fileName={file.fileName}
                  fileSize={file.fileSize}
                  uploadTime={file.uploadTime}
                  fileType={file.fileType}
                />
              ))}
            </ScrollView>
          </View>
    )
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
})