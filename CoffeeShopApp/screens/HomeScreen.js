import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView, 
  TouchableWithoutFeedback, Keyboard, Alert 
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems, updateCartItems } from "../redux/cartSlice"; // Import Redux action
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import CoffeeTypeTabs from "../components/CategoryCoffee";
import Product from "../components/Product"; // Import ProductCard


const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const cartItems = useSelector((state) => state.cart.cartItems);
  const user = useSelector((state) => state.user.user); // Get user from Redux
  const userId = user?.userId || "guest"; // Use guest as fallback if no user is logged in
  const prevCartItems = useRef(cartItems); // Lưu giá trị cartItems trước đó


  const handlePressOutside = () => {
    Keyboard.dismiss();
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/products"); // Đổi IP nếu chạy trên thiết bị thật
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

   fetchProducts();
    dispatch(fetchCartItems({ userId }));
  }, [userId, dispatch]);

useEffect(() => {
    // Chỉ update khi cartItems thực sự thay đổi
    if (JSON.stringify(cartItems) !== JSON.stringify(prevCartItems.current) && cartItems.length > 0) {
      dispatch(updateCartItems({ userId, cartItems }));
      prevCartItems.current = cartItems; // Cập nhật ref sau khi dispatch
    }
  }, [cartItems, userId, dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ 
      product: {
        ...product,
        userId // Include userId with the product
      }, 
      quantity: 1 
    }));
    Alert.alert("Success", `${product.name} has been added to cart!`);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    handlePressOutside();
  };
  const handleSelectType = (type) => {
    setSelectedType((prevType) => (prevType === type ? null : type));
    handlePressOutside();
  };

  // 🔍 Lọc sản phẩm theo danh mục và tìm kiếm
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedType ? product.category === selectedType : true;
    const regex = new RegExp(searchQuery.trim(), "i");
    const matchesSearch = searchQuery
      ? regex.test(product.name) || regex.test(product.description)
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside} accessible={false}>
      <SafeAreaView style={styles.container}>
        <Navbar />
        <Text style={styles.title}>What would you like to drink today?</Text>
        <SearchBar onSearch={handleSearch} />
        <View style={styles.type}>
          <CoffeeTypeTabs onSelect={handleSelectType} />
        </View>

        <View style={styles.productContainer}>
          <ScrollView contentContainerStyle={styles.productList} showsVerticalScrollIndicator={false}>
            {loading ? (
              <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
            ) : (
              filteredProducts.map((product) => (
                <Product
                  key={product.sanpham_id} 
                  product={product} 
                  onAddToCart={() => handleAddToCart(product)} 
                />
              ))
            )}
          </ScrollView>
        </View>

        <Footer />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start", alignItems: "center" },
  type: { height: 70 },
  title: { fontSize: 20, marginBottom: 10, paddingTop: 50, color: "#3D1B00" },
  productContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 5,
    backgroundColor: "#3D1B00",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  productList: { width: "100%", paddingBottom: 200 },
  loadingText: { textAlign: "center", fontSize: 18, color: "#FFF", marginTop: 20 },
});

export default HomeScreen;
