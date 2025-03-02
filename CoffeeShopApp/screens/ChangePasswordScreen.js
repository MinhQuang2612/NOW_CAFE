import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector } from 'react-redux';
import axios from 'axios';

const { width, height } = Dimensions.get("window");

export default function ChangePasswordScreen({ navigation }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const user = useSelector((state) => state.user.user);
  const userId = user?.userId;

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Vui lòng đăng nhập trước khi đổi mật khẩu!</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Đi đến Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFormValid =
    oldPassword &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    newPassword.length >= 8;

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải ít nhất 8 ký tự.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5001/api/change-password/${userId}`,
        { oldPassword, newPassword }
      );

      if (response.data.success) {
        setModalVisible(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
      }
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Đã có lỗi xảy ra khi đổi mật khẩu"
      );
      console.error("Lỗi API:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color="#230C02" />
      </TouchableOpacity>

      <View style={styles.changePasswordContainer}>
        <Text style={styles.title}>Thay Đổi Mật Khẩu</Text>
        <Text style={styles.subTitle}>Mật khẩu cần ít nhất 8 ký tự</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập Mật Khẩu Cũ"
            secureTextEntry={!showOldPassword}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholderTextColor="#B5B5B5"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowOldPassword(!showOldPassword)}
          >
            <Feather
              name={showOldPassword ? "eye" : "eye-off"}
              size={24}
              color="#230C02"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật Khẩu Mới"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor="#B5B5B5"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Feather
              name={showNewPassword ? "eye" : "eye-off"}
              size={24}
              color="#230C02"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Xác Nhận Mật Khẩu"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#B5B5B5"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Feather
              name={showConfirmPassword ? "eye" : "eye-off"}
              size={24}
              color="#230C02"
            />
          </TouchableOpacity>
        </View>

        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          disabled={!isFormValid}
          onPress={handlePasswordChange}
        >
          <Text style={styles.buttonText}>THAY ĐỔI MẬT KHẨU</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Feather name="check-circle" size={50} color="#4CAF50" />
            <Text style={styles.modalTitle}>Thành Công</Text>
            <Text style={styles.modalMessage}>
              Mật khẩu của bạn đã được thay đổi.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F0",
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  changePasswordContainer: {
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderRadius: 8,
    outlineStyle: "none",
  },
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: "#D83C3D",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#F71515",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginVertical: 15,
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
    fontWeight: "600",
  },
});