import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Keyboard, Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "../redux/favoritesSlice";
import { useNavigation } from "@react-navigation/native";
import useAddToCart from "../hooks/useAddToCart";
import { setForceBlur } from "../redux/useSlice";

export default function Product({ product }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const favorites = useSelector((state) => state.favorites);
  const isFavorite = favorites.some((item) => item.sanpham_id === product.sanpham_id);
  const addToCart = useAddToCart(product);

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(product));
  };

  const handleAddToCart = () => {
    // console.log('Toi day roi:');
    Keyboard.dismiss();
    dispatch(setForceBlur(true));
    addToCart();
    // Alert.alert("Thành công", `${product.name} đã được thêm vào giỏ hàng!`);
  };

  return (
    <TouchableOpacity onPress={() => navigation.navigate("ProductDetail", { product })}>
      <View style={styles.card}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.oldPrice}>${(product.price * 1.2).toFixed(2)}</Text>
            <Text style={styles.newPrice}>${product.price.toFixed(2)}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.buyButton} onPress={() => navigation.navigate("ProductDetail", { product })}>
              <Text style={styles.buyText}>Buy now!</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleAddToCart()}>
              <AntDesign name="shoppingcart" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <AntDesign name={isFavorite ? "heart" : "hearto"} size={24} color={isFavorite ? "#D7263D" : "black"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row-reverse",
    backgroundColor: "#F5EDE0",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
    elevation: 3, // Hiệu ứng đổ bóng trên Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    marginLeft: 15,
  },
  category: {
    fontSize: 14,
    color: "#7A5C3D",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 12,
    color: "#555",
    marginVertical: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  oldPrice: {
    textDecorationLine: "line-through",
    color: "#999",
    marginRight: 5,
  },
  newPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D7263D",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginRight: 10,
  },
  buyButton: {
    backgroundColor: "#D7263D",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buyText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
