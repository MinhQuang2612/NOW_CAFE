import React, { useState, useEffect } from "react";
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
import { Feather } from "@expo/vector-icons";
import { get, set } from "mongoose";
import e from "cors";

const { width, height } = Dimensions.get("window");
const scale = Math.min(width, height) / 375;

const normalize = (size) => {
  const newSize = size * scale;
  if (width > 550) {
    return Math.round(newSize * 0.8);
  }
  return Math.round(newSize);
};

const OTPScreen = ({route, navigation }) => {
  const [timer, setTimer] = useState(60);
  const { username, email, phone, password, otp } = route.params;
  console.log("OTP from params:", otp);
  const [otpp, setOtp] = useState("");
  const [isOtpValid, setIsOtpValid] = useState(otp);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }else {
      setIsOtpValid(null);
      setOtp("");
    }
  }, [timer]);

  const handleVerify = () => {
    // Xử lý xác thực OTP tại đây
    if (isOtpValid.length === 6) {
        if(isOtpValid === otpp) {
          alert("OTP verified successfully!");
          createAccount();
        } else {
          alert("Invalid OTP. Please try again.");
        }
    } else {
      alert("Please enter a valid 6-digit OTP.");
    }
  };

 const getOTP = async (email) =>{
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/send-otp`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
        email: email
    }),
    });
    
    if (!response.ok) {
    throw new Error("Network response was not ok");
    }
    const data = await response.json();
    setIsOtpValid(data.otp);
} catch (error) {
    console.error("Error during register:", error);
    throw error;
}
}

const createAccount = async () =>{
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/create-account`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      userName:username, 
      passWord:password, 
        email: email,
        phone: phone,
    }),
    });
    
    if (!response.ok) {
    throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("Account created successfully:", data);
    navigation.navigate("Login");
} catch (error) {
    console.error("Error during register:", error);
    throw error;
}
}

  const handleResend = () => {
    if (timer === 0) {
      setTimer(60);
      // Gửi lại OTP tại đây
      getOTP(email);
      alert("OTP resent!");
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
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subText}>
              We have sent a 6-digit code to your phone.
            </Text>

           <TextInput
                style={[styles.otpInput, {
                    fontSize: 24,               // tăng kích thước chữ
                    letterSpacing: 12,          // khoảng cách giữa các ký tự để nhìn rõ từng số
                    borderBottomWidth: 2,       // viền dưới đậm hơn
                    borderColor: '#007AFF',     // màu viền xanh cho nổi bật
                    color: '#000',              // màu chữ đen rõ hơn
                    paddingVertical: 10,        // tăng padding trên dưới để dễ bấm
                }]}
                value={otpp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
                placeholder="------"
                placeholderTextColor="#999"
                textAlign="center"
                />

            <TouchableOpacity style={styles.button} onPress={handleVerify}>
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>
                  Resend OTP in {timer}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
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
  otpInput: {
    width: "60%",
    borderBottomWidth: 2,
    borderBottomColor: "#230C02",
    fontSize: normalize(24),
    letterSpacing: 12,
    color: "#230C02",
    marginBottom: normalize(40),
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
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: normalize(10),
  },
  timerText: {
    color: "#230C02",
    fontSize: normalize(14),
  },
  resendText: {
    color: "#834D1E",
    fontSize: normalize(14),
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default OTPScreen;
