import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ImageBackground, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Image,
  Alert,
  Platform,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as Google from "expo-auth-session/providers/google";
import { auth } from "../config"; // Import đúng từ file cấu hình
import { signInWithCredential } from "firebase/auth";
import { getAuth,GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";




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
  const [userInfo, setUserInfo] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);


 
  GoogleSignin.configure({
    webClientId: "843660951518-c702nqvtd7q27j3aa18ddi3npjrcboq3.apps.googleusercontent.com", // Thay thế bằng Web Client ID từ Firebase Console
    iosClientId: "843660951518-t66vdll10vmboev9j3tkfbnknv7coi2b.apps.googleusercontent.com",
  });
  
  async function onGoogleButtonPress() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
  
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Đăng nhập thành công:", result.user.email,result.user.displayName);
      navigation.navigate("Home");
    } catch (error) {
      console.error("❌ Lỗi đăng nhập Google:", error);
    }
  }
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: "2670594856469458",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      const facebookCredential = FacebookAuthProvider.credential(access_token);
      signInWithCredential(getAuth(), facebookCredential).then((userCredential) => {
        navigation.navigate("Home", { email: userCredential.user.email, displayName: userCredential.user.displayName });
      });
    }
  }, [response]);

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      bounces={false}
    >
      <ImageBackground
        source={require("../assets/images/bg-welcome.png")} 
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image 
              source={require("../assets/icons/back-arrow.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <View style={styles.innerContainer}>
            <View style={styles.textContainer}>
                <Text style={styles.title1}>Welcome</Text>
                <Text style={styles.title2}>Back!</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.navigate('Signin')}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.navigate('Signup')}
              >
                <Text style={styles.buttonText}>Create an account</Text>
              </TouchableOpacity>
            </View>

            <OrDivider />

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}
                onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
                
               >
                <Image 
                  source={require("../assets/icons/google.png")}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}
                onPress={() => promptAsync()}
              >
                <Image 
                  source={require("../assets/icons/facebook.png")}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image 
                  source={require("../assets/icons/apple.png")}
                  style={styles.socialIcon}
                />
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