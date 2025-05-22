import e from "cors";
import React, { useState } from "react";
import { use } from "react";
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

const ResetPasswordScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const isValidGmail = (email) => {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const cleanedEmail = email.trim().toLowerCase();
  return gmailRegex.test(cleanedEmail);
};
  
  const handlecheckAccount = async () =>{
    if (!username || !email) {
      alert("Please enter both username and email.");
      return;
    }
    if (!isValidGmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/check-account`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
        email: email,
        username: username
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
const checkAccount = async () => {
  const kq = await handlecheckAccount();
 
  if (kq.success){
    navigation.navigate("OTPRessPass", {data:kq,username,email});
  } else {
    alert(kq.message);
  }
}

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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subText}>
              Please enter your username and email to receive a verification code.
            </Text>

            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity onPress={checkAccount} style={styles.button}>
              <Text style={styles.buttonText}>Send Verification Code</Text>
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

export default ResetPasswordScreen;
