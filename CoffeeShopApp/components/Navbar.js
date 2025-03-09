import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Image, Modal, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setForceBlur } from "../redux/useSlice";
import { setUser } from "../redux/userSlice"; // Để đảm bảo có thể sử dụng setUser

const DEFAULT_AVATAR = "https://i.pravatar.cc/150";
const { width } = Dimensions.get("window");

export default function Navbar() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [menuVisible, setMenuVisible] = useState(false);
  const user = useSelector((state) => state.user.user); // Lấy thông tin người dùng từ Redux
  const [userDetails, setUserDetails] = useState(null); // Lưu thông tin chi tiết người dùng

  // Log để kiểm tra xem user từ Redux có chứa userId không
  useEffect(() => {
    console.log("User từ Redux:", user);
    if (user && user.userId) { // Sử dụng userId thay vì userID
      console.log("userId từ Redux:", user.userId);
      fetchUserById(user.userId); // Gọi API với userId
    } else {
      console.log("Không tìm thấy user hoặc userId trong Redux");
    }
  }, [user]);

  // Hàm giả lập gọi API để tìm thông tin người dùng theo userId
  const fetchUserById = async (userId) => {
    try {
      console.log("Gọi API với userId:", userId); // Log khi gọi API
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log("Dữ liệu trả về từ API:", data); // Log dữ liệu từ API
      if (data.success) {
        setUserDetails(data.user);
      } else {
        console.log("Không tìm thấy thông tin người dùng từ API");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.userInfo}>
        <TouchableOpacity onPress={() => dispatch(setForceBlur(true))}>
          <Image
            source={{ uri: userDetails?.avatarUrl || DEFAULT_AVATAR }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.greeting}>
          Good day, {userDetails?.name || "Guest"}!
        </Text>
      </View>
      <View style={styles.navIcons}>
        <TouchableOpacity onPress={() => dispatch(setForceBlur(true))}>
          <Feather name="bell" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            dispatch(setForceBlur(true));
            setMenuVisible(true);
          }}
        >
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Menu Popup */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("Option")}
            >
              <Image
                source={{ uri: userDetails?.avatarUrl || DEFAULT_AVATAR }}
                style={styles.menuAvatar}
              />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("Contact")}
            >
              <Feather name="help-circle" size={24} color="black" />
              <Text style={styles.menuText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                dispatch(setUser(null)); // Xóa thông tin người dùng khi logout
                navigation.navigate("Login");
              }}
            >
              <Feather name="log-out" size={24} color="black" />
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    top: 0,
    position: "absolute",
    backgroundColor: "#EADCC6",
    height: 100,
    width: width,
    paddingTop: 35,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3D1B00",
  },
  navIcons: {
    flexDirection: "row",
    gap: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-start",
    paddingTop: 100,
    alignItems: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#F5EDE0",
    padding: 10,
    borderRadius: 10,
    width: 180,
    marginRight: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  menuAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});