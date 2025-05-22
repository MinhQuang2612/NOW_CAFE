import React, { useEffect, useState } from "react";
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Facebook from "expo-auth-session/providers/facebook";
import { auth } from "../config"; // Import đúng từ file cấu hình
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithCredential } from "firebase/auth";
import { firebase } from "../firebaseConfig";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useDispatch } from "react-redux"; // Import useDispatch
import { setUser } from "../redux/userSlice"; // Import setUser action

WebBrowser.maybeCompleteAuthSession();

// Lấy kích thước màn hình
const { width, height } = Dimensions.get("window");

// Tính toán tỷ lệ scale dựa trên màn hình chuẩn (ví dụ: iPhone 8)
const baseWidth = 375;
const baseHeight = 667;

const scaleWidth = width / baseWidth;
const scaleHeight = height / baseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

// Hàm để tính toán kích thước responsive
const normalize = (size) => {
  return Math.round(scale * size);
};

const OrDivider = () => {
  return (
    <View style={styles.orDividerContainer}>
      <View style={styles.orDividerLine} />
      <Text style={styles.orDividerText}>Or continue with</Text>
      <View style={styles.orDividerLine} />
    </View>
  );
};

const LoginScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const dispatch = useDispatch(); // Initialize dispatch
  const CLIENT_ID = "843660951518-c702nqvtd7q27j3aa18ddi3npjrcboq3.apps.googleusercontent.com"; // Web Client ID từ Firebase

  const [request1, response1, promptAsync1] = Google.useAuthRequest({
    clientId: CLIENT_ID,
    redirectUri: makeRedirectUri({ useProxy: true }),
    prompt: "select_account",
  });

  useEffect(() => {
    if (response1?.type === "success") {
      const { authentication } = response1;
      handleGoogleSignIn(authentication.accessToken);
    }
  }, [response1]);

  const handleGoogleSignIn = async (accessToken) => {
    try {
      const credential = GoogleAuthProvider.credential(null, accessToken);
      const userCredential = await signInWithCredential(getAuth(), credential);
      const user = userCredential.user;
      console.log("✅ Đăng nhập Google thành công:", user.email, user.displayName, user.uid);
  
      // Gọi API để lấy userId từ backend
      const bodyData = JSON.stringify({
        gmail: user.email,
        username: user.displayName,
        uid: user.uid,
      });
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: bodyData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Phản hồi từ API:", result);
  
      if (result.success) {
        // Lưu userId từ API vào Redux
        dispatch(setUser({
          userId: result.userId, // Lưu userId từ backend (userID0001)
          email: user.email,
          name: user.displayName,
        }));
        console.log("✅ User data saved to Redux with userId:", result.userId);
  
        Alert.alert("Thành công", "Đăng nhập thành công!");
        navigation.navigate("Home", { user: result.user });
      } else {
        Alert.alert("Thất bại", result.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("❌ Lỗi xác thực Firebase:", error.message);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra khi đăng nhập Google.");
    }
  };
  
  // Xóa hàm handleLogin vì đã tích hợp vào handleGoogleSignIn

  

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: "2775336932652829",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      const facebookCredential = FacebookAuthProvider.credential(access_token);
      signInWithCredential(getAuth(), facebookCredential).then((userCredential) => {
        setData(userCredential.user);
      }).catch((error) => {
        console.error("❌ Lỗi đăng nhập Facebook:", error.message);
        Alert.alert("Lỗi", "Đã có lỗi xảy ra khi đăng nhập Facebook.");
      });
    }
  }, [response]);

  useEffect(() => {
    if (data) {
      console.log("Dữ liệu user sau khi cập nhật (Facebook):", data.email, data.displayName, data.uid);
      handleLoginFaceBook(data.uid);
    }
  }, [data]);

  const handleLoginFaceBook = async (uid) => {
    try {
      if (!data) {
        throw new Error("Không tìm thấy thông tin tài khoản!");
      }
      const bodyData = JSON.stringify({
        email: data.email,
        username: data.displayName,
        uid: uid,
      });
      console.log("Gửi dữ liệu đến API:", bodyData);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/facebook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: bodyData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Phản hồi từ API:", result);
  
      if (result.success) {
        // Lưu userId từ API vào Redux
        dispatch(setUser({
          userId: result.userId, // Lưu userId từ backend (userID0001)
          email: data.email,
          name: data.displayName,
        }));
        console.log("✅ User data saved to Redux with userId:", result.userId);
  
        Alert.alert("Thành công", "Đăng nhập thành công!");
        navigation.navigate("Home", { user: result.user });
      } else {
        Alert.alert("Thất bại", result.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error.message);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      <ImageBackground
        source={require("../assets/images/bg-welcome.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require("../assets/icons/back-arrow.png")} style={styles.backIcon} />
          </TouchableOpacity>

          <View style={styles.innerContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.title1}>Welcome</Text>
              <Text style={styles.title2}>Back!</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Signin")}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.buttonText}>Create an account</Text>
              </TouchableOpacity>
            </View>

            <OrDivider />

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton} onPress={() => promptAsync1()}>
                <Image source={require("../assets/icons/google.png")} style={styles.socialIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={() => promptAsync()}>
                <Image source={require("../assets/icons/facebook.png")} style={styles.socialIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} disabled={true}>
                <Image source={require("../assets/icons/apple.png")} style={styles.socialIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    minHeight: height,
  },
  background: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: normalize(40),
    paddingHorizontal: normalize(20),
  },
  backButton: {
    position: 'absolute',
    top: normalize(30),
    left: normalize(20),
  },
  backIcon: {
    width: normalize(15),
    height: normalize(15),
    tintColor: "#230C02",
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    marginTop: normalize(250),
    marginRight: normalize(100),
  },
  title1: {
    fontSize: normalize(30),
    fontWeight: "bold",
    color: "#230C02",
  },
  title2: {
    fontSize: normalize(30),
    fontWeight: "bold",
    color: "#230C02",
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: normalize(30),
  },
  button: {
    width: normalize(250),
    backgroundColor: "#3B2F2F",
    paddingVertical: normalize(13),
    borderRadius: normalize(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: normalize(10),
  },
  buttonText: {
    color: "#EEDDC9",
    fontWeight: "bold",
    fontSize: normalize(16),
    textAlign: 'center',
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    marginVertical: normalize(20),
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#000000',
    marginHorizontal: normalize(10),
  },
  orDividerText: {
    color: "#000000",
    fontSize: normalize(14),
    fontWeight: "bold",
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButton: {
    backgroundColor: "#EEDDC9",
    padding: normalize(10),
    borderRadius: normalize(50),
    margin: normalize(5),
    width: normalize(50),
    height: normalize(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: normalize(30),
    height: normalize(30),
    resizeMode: 'contain',
  },
});

export default LoginScreen;