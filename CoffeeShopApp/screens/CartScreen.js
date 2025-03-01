import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart } from "../redux/cartSlice";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AntDesign } from "@expo/vector-icons";

export default function CartScreen({ navigation }) {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.cartList}>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <View key={item.sanpham_id} style={styles.itemContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.details}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>${item.price} x {item.quantity}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.quantityButton}>
                    <AntDesign name="minus" size={18} color="black" />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.quantityButton}>
                    <AntDesign name="plus" size={18} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => dispatch(removeFromCart(item.sanpham_id))}>
                    <AntDesign name="delete" size={22} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyCart}>Giỏ hàng trống</Text>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Tổng cộng: ${totalAmount}</Text>
          <TouchableOpacity style={styles.checkoutButton} onPress={() => alert("Thanh toán thành công!")}> 
            <Text style={styles.checkoutText}>Thanh toán</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => dispatch(clearCart())}>
            <Text style={styles.clearCartText}>Xóa giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      )}
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF5E9", padding: 10 },
  cartList: { paddingVertical: 10 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5EDE0",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: { width: 80, height: 80, borderRadius: 10 },
  details: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  price: { fontSize: 14, color: "#834D1E" },
  actions: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  quantityButton: {
    backgroundColor: "#E0C3A4",
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantity: { fontSize: 16, fontWeight: "bold", color: "#333" },
  emptyCart: { textAlign: "center", marginTop: 20, fontSize: 18 },
  footer: { paddingVertical: 15, alignItems: "center" },
  totalText: { fontSize: 18, fontWeight: "bold" },
  checkoutButton: {
    backgroundColor: "#AE0B0B",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  checkoutText: { color: "white", fontSize: 18, fontWeight: "bold" },
  clearCartText: { color: "red", marginTop: 10 },
});
