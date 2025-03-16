// import React, { useState } from "react";
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   StyleSheet, 
//   Switch 
// } from "react-native";
// import Footer from "../components/Footer";
// import { Feather } from "@expo/vector-icons";

// export default function AddDeliveryLocationScreen({ navigation }) {
//   const [isDefault, setIsDefault] = useState(false);
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");

//   return (
//     <View style={styles.mainContainer}>
//       {/* Thanh điều hướng */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Feather name="arrow-left" size={24} color="#000" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>New address</Text>
//       </View>

//       {/* Form nhập địa chỉ */}
//       <View style={styles.formContainer}>
//         <Text style={styles.label}>Address</Text>
//         <View style={styles.inputContainer}>
//           <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
//           <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
//           <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
//         </View>

//         {/* Chọn làm địa chỉ mặc định */}
//         <View style={styles.switchContainer}>
//           <Text style={styles.switchLabel}>Set as default address</Text>
//           <Switch value={isDefault} onValueChange={setIsDefault} />
//         </View>

//         {/* Nút hoàn thành */}
//         <TouchableOpacity style={styles.completeButton}>
//           <Text style={styles.completeText}>HOÀN THÀNH</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Footer */}
//       <Footer selected="cart" navigation={navigation} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     backgroundColor: "#F9E8D9",
//     paddingHorizontal: 16,
//     paddingTop: 20,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginLeft: 12,
//   },
//   formContainer: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 10,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   inputContainer: {
//     marginBottom: 12,
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 6,
//     marginBottom: 8,
//     borderColor: "#E0C3A5",
//     borderWidth: 1,
//   },
//   switchContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   switchLabel: {
//     fontSize: 14,
//   },
//   completeButton: {
//     backgroundColor: "#E0C3A5",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 12,
//   },
//   completeText: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import Footer from "../components/Footer";
import { Feather } from "@expo/vector-icons";
import { useDispatch } from "react-redux";

export default function AddDeliveryLocationScreen({ navigation, route }) {
  const [isDefault, setIsDefault] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const dispatch = useDispatch();
  const { onSave } = route.params || {};

  // Hàm xử lý khi nhấn "Complete"
  const handleComplete = () => {
    // Validation cơ bản
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Error", "Please fill in all fields (Full name, Phone number, Address).");
      return;
    }

    // Định dạng địa chỉ mới
    const newAddress = address; // Chỉ lấy địa chỉ vì BillDetail chỉ cần address
    const userInfo = { name, phoneNumber: phone, address: newAddress };

    // Gửi dữ liệu về BillDetailScreen
    if (onSave) {
      onSave(newAddress, isDefault);
    }

    // Nếu chọn làm mặc định, cập nhật vào Redux store
    if (isDefault) {
      dispatch({ type: "user/updateUserInfo", payload: userInfo });
    }

    // Quay lại màn hình trước
    navigation.goBack();
  };

  return (
    <View style={styles.mainContainer}>
      {/* Thanh điều hướng */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Address</Text>
      </View>

      {/* Form nhập địa chỉ */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Address</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Chọn làm địa chỉ mặc định */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Set as default address</Text>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: "#E0C3A5", true: "#D4A373" }}
            thumbColor={isDefault ? "#FFF" : "#FFF"}
          />
        </View>

        {/* Nút hoàn thành */}
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeText}>Complete</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Footer selected="cart" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F9E8D9",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FFF5E9",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderColor: "#E0C3A5",
    borderWidth: 1,
    fontSize: 14,
    color: "#333",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 14,
    color: "#333",
  },
  completeButton: {
    backgroundColor: "#D4A373", // Màu nâu nhạt giống hình
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  completeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
});