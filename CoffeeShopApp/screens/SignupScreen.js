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
  StatusBar
} from "react-native";
import { Feather } from "@expo/vector-icons"; // Import Feather icons
import { get, set } from "mongoose";

const { width, height } = Dimensions.get("window");
const scale = Math.min(width, height) / 375;

const normalize = (size) => {
  const newSize = size * scale;
  if (width > 550) {
    return Math.round(newSize * 0.8);
  }
  return Math.round(newSize);
};

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
    
    
    navigation.navigate('OTP',{username, email, phone, password,otp: data.otp});
} catch (error) {
    console.error("Error during register:", error);
    throw error;
}
}
const isValidGmail = (email) => {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const cleanedEmail = email.trim().toLowerCase();
  return gmailRegex.test(cleanedEmail);
};
function isValidPassword(password) {
  const regex = /^[A-Za-z0-9]{8,}$/;
  return regex.test(password);
}


  const handleVerify = async () => {
    if(!username || !email || !phone || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    } 
    if (!isValidGmail(email)) {
      alert("Please enter a valid Gmail address.");
      return;
    }
    
    if (!isValidPassword(password)) {
      alert("Password must be 8 characters long and contain only letters and numbers.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    await getOTP(email);
    
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.container}
        bounces={false}
      >
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
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Number Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={24} 
                    color="#230C02" 
                    style={styles.eyeIcon} 
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Feather 
                    name={showConfirmPassword ? "eye" : "eye-off"} 
                    size={24} 
                    color="#230C02" 
                    style={styles.eyeIcon} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={() =>{ handleVerify(); }
           }>
              <Text style={styles.buttonText}>Authenticate with gmail OTP</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>I have an account already? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
                <Text style={styles.signupLink}>Login</Text>
              </TouchableOpacity>
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
    backgroundColor: '#EEDDC9',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  container: {
    flexGrow: 1,
  },
  background: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
    marginTop: normalize(280),
  },
  textContainer: {
    alignItems: 'flex-start', 
    width: '100%',
    marginBottom: normalize(20),
    marginTop: normalize(280),
  },
  title: {
    fontSize: normalize(32),
    fontWeight: "bold",
    color: "#230C02",
    lineHeight: normalize(40),
  },
  inputContainer: {
    width: '100%',
    alignItems: 'flex-start', 
  },
  inputLabel: {
    color: '#230C02',
    fontSize: normalize(15),
    marginBottom: normalize(8),
    fontWeight: "bold",
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#230C02',
    outlineStyle: 'none',
    fontSize: normalize(16),
    color: '#230C02',
    marginBottom: normalize(20),
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: normalize(0), 
    bottom: normalize(20), 
  },
  eyeIcon: {
    width: normalize(24), 
    height: normalize(24), 
    tintColor: '#230C02',
  },
  button: {
    width: '100%',
    backgroundColor: "#3B2F2F",
    paddingVertical: normalize(15),
    borderRadius: normalize(30),
    alignItems: 'center',
    marginBottom: normalize(30),
  },
  buttonText: {
    color: "#EEDDC9",
    fontWeight: "600",
    fontSize: normalize(16),
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: "#230C02",
    fontSize: normalize(14),
    fontWeight: "bold",
  },
  signupLink: {
    color: "#834D1E",
    fontSize: normalize(14),
    fontWeight: "bold",
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;