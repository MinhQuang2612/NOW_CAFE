import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import store from "./redux/store";
import HomeScreen from "./screens/HomeScreen.js";
import CartScreen from "./screens/CartScreen.js";
import FavoritesScreen from "./screens/FavoritesScreen.js";
import OptionScreen from "./screens/OptionScreen.js";
import WelcomeScreen from "./screens/WelcomeScreen.js";
import LoginScreen from "./screens/LoginScreen.js";
import SigninScreen from "./screens/SigninScreen.js";
import SignupScreen from "./screens/SignupScreen.js";
import ProfileScreen from "./screens/ProfileScreen.js";
import ProductDetailScreen from "./screens/ProductDetailScreen.js";
import SettingScreen from "./screens/SettingScreen.js";
import ChangePasswordScreen from "./screens/ChangePasswordScreen.js";
import TermsScreen from "./screens/TermsScreen.js";
import PolicyScreen from "./screens/PolicyScreen.js";
import QuestionScreen from "./screens/QuestionScreen.js";
import ContactScreen from "./screens/ContactScreen.js";
import DeliveryScreen from "./screens/DeliveryScreen.js";
import AddLocationScreen from "./screens/AddLocationScreen.js";
import VoucherScreen from "./screens/VoucherScreen.js";
import RecentlyOrderScreen from "./screens/RecentlyOtherScreen.js";
import OrderDetailScreens from "./screens/OderDetailScreen.js";
import ReviewScreens from "./screens/ReviewScreen.js";
import ReviewDetailScreen from "./screens/ReviewDetailScreen.js";
import BillScreen from "./screens/BillScreen.js";

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>

        <Stack.Navigator initialRouteName="Cart">

          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Option"
            component={OptionScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Signin"
            component={SigninScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Setting"
            component={SettingScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Terms"
            component={TermsScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Policy"
            component={PolicyScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Question"
            component={QuestionScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Contact"
            component={ContactScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Delivery"
            component={DeliveryScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="AddLocation"
            component={AddLocationScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Voucher"
            component={VoucherScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="RecentlyOrder"
            component={RecentlyOrderScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="OrderDetail"
            component={OrderDetailScreens}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Review"
            component={ReviewScreens}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ReviewDetail"
            component={ReviewDetailScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Bill"
            component={BillScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
