import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TextInput,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice";

const { width } = Dimensions.get("window");

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    address: "",
    phoneNumber: "",
    email: "",
    points: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (user && user.userId) {
      fetchUserDetails(user.userId);
    }
  }, [user]);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/${userId}`);
      const data = await response.json();
      if (data.success) {
        const { name, phoneNumber, address, points, email } = data.user;
        const [firstName, ...rest] = name.split(" ");
        setFormData({
          name: rest.join(" ") || "",
          firstName: firstName || "",
          address: address || "",
          phoneNumber: phoneNumber || "",
          points: points || "",
          email: email || "",
        });
      } else {
        setModalMessage(data.message);
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      setModalMessage("Không thể lấy thông tin người dùng.");
      setModalVisible(true);
    }
  };

  const handleSave = async () => {
    const fullName = `${formData.firstName} ${formData.name}`.trim();
    const updatedData = {
      user_id: user.userId,
      name: fullName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      points: formData.points,
      email: formData.email,
    };

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/${user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();
      if (data.success) {
        setModalMessage("Thông tin đã được cập nhật thành công!");
        setModalVisible(true);
        setIsEditing(false);
        dispatch(setUser({ ...user, ...updatedData }));
      } else {
        setModalMessage(data.message);
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Lỗi khi lưu thông tin:", error);
      setModalMessage("Không thể lưu thông tin.");
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={24} color="#230C02" />
      </TouchableOpacity>

      <View style={styles.mainContainer}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <Text style={styles.memberStatus}>THÀNH VIÊN</Text>
            <View style={styles.balanceContainer}>
              <View style={styles.balanceItem}>
                <Image source={require("../assets/icons/drips.png")} style={styles.icon} />
                <Text style={styles.balanceText}>DRIPS: 0</Text>
              </View>
              <View style={styles.balanceItem}>
                <Image source={require("../assets/icons/prepay.png")} style={styles.icon} />
                <Text style={styles.balanceText}>Trả trước: 0đ</Text>
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Thông Tin Chung</Text>
              <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                <Text style={styles.editLink}>{isEditing ? "Hủy" : "Sửa"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Họ và Tên:</Text>
            <TextInput
              style={[styles.input, isEditing && styles.editableInput]}
              value={`${formData.firstName} ${formData.name}`}
              onChangeText={(text) => {
                const [firstName, ...rest] = text.split(" ");
                setFormData({ ...formData, firstName, name: rest.join(" ") });
              }}
              editable={isEditing}
            />

            <Text style={styles.label}>Địa chỉ:</Text>
            <TextInput
              style={[styles.input, isEditing && styles.editableInput]}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              editable={isEditing}
            />

            <Text style={styles.label}>Số Điện Thoại:</Text>
            <TextInput
              style={[styles.input, isEditing && styles.editableInput]}
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              editable={isEditing}
            />

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={[styles.input, isEditing && styles.editableInput]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              editable={isEditing}
            />

            <Text style={styles.label}>Điểm tích lũy:</Text>
            <TextInput
              style={[styles.input, isEditing && styles.editableInput]}
              keyboardType="numeric"
              value={formData.points.toString()}
              onChangeText={(text) => setFormData({ ...formData, points: text })}
              editable={isEditing}
            />

            {isEditing && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Lưu</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#F9F6F0" },
  backButton: { top: 20, left: 15, zIndex: 1 },
  mainContainer: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 12 },
  scrollContent: { paddingBottom: 10 },
  profileSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  memberStatus: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  balanceContainer: {
    marginTop: 5,
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  balanceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 5,
    padding: 20,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  editLink: {
    color: "#D83C3D",
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9F6F0",
    padding: 13,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  editableInput: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: "#D83C3D",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#D83C3D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});