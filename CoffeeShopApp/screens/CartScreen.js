import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import Footer from '../components/Footer';

const CartScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart Screen</Text>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});

export default CartScreen;