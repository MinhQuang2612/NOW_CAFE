import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";

const { width, height } = Dimensions.get("window");
const scale = Math.min(width, height) / 375;

const normalize = (size) => {
  const newSize = size * scale;
  if (width > 550) {
    return Math.round(newSize * 0.8);
  }
  return Math.round(newSize);
};


const ChanePasswordScreen = ({ route,navigation }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
   const { username } = route.params;
 function isValidPassword(password) {
  const regex = /^[A-Za-z0-9]{8,}$/;
  return regex.test(password);
}
   const handleResetPass = async () =>{
  try {
    const response = await fetch("http://localhost:5001/api/user/reset-password", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
        username: username,
        newPassword: newPassword
    }),
    });
    if (!response.ok) {
    throw new Error("Network response was not ok");
    }
    const data = await response.json();
    
    return data;
  
} catch (error) {
    console.error("Error during register:", error);
    throw error;
}}
  
  const handleResetPassword = async() => {
    if (!newPassword || !confirmPassword) {
      alert("Please enter both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!isValidPassword(newPassword)) {
        alert("Password must be at least 8 characters long and contain only letters and numbers.");
        return;
    }
    const kq = await handleResetPass();
    if (kq.success){
            alert(kq.message);
            navigation.navigate("Login");
    } else {
        alert(kq.message);  
    }
    
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <ImageBackground
          source={require("../assets/images/bg-welcome.png")}
          style={styles.background}
          resizeMode="cover"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../assets/icons/back-arrow.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subText}>
              Please enter your new password and confirm it below.
            </Text>

            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              placeholderTextColor="#999"
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry
            />

            <TouchableOpacity onPress={handleResetPassword} style={styles.button}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEDDC9",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flexGrow: 1,
  },
  background: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: normalize(30),
    left: normalize(20),
    zIndex: 1,
  },
  backIcon: {
    width: normalize(20),
    height: normalize(20),
    tintColor: "#230C02",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: normalize(20),
    marginTop: normalize(280),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: "bold",
    color: "#230C02",
    marginBottom: normalize(10),
  },
  subText: {
    fontSize: normalize(14),
    color: "#230C02",
    marginBottom: normalize(30),
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderBottomWidth: 2,
    borderColor: "#007AFF",
    fontSize: 18,
    color: "#000",
    paddingVertical: 10,
    marginBottom: normalize(30),
  },
  button: {
    width: "100%",
    backgroundColor: "#3B2F2F",
    paddingVertical: normalize(15),
    borderRadius: normalize(30),
    alignItems: "center",
    marginBottom: normalize(20),
  },
  buttonText: {
    color: "#EEDDC9",
    fontWeight: "600",
    fontSize: normalize(16),
  },
});

export default ChanePasswordScreen;
