import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, TextInput } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useRoute } from "@react-navigation/native";
import useAddToCart from "../hooks/useAddToCart";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "../redux/favoritesSlice";
import { rateLimit } from '../utils/rateLimiter';
import { retryApiCall } from '../utils/retryApiCall';

const { width } = Dimensions.get("window");

export default function ProductDetail() {
  const route = useRoute();
  const product = route.params.product;
  const addToCart = useAddToCart(product);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("350 ml");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [note, setNote] = useState("");

  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites);
  const isFavorite = favorites.some((item) => item.sanpham_id === product.sanpham_id);

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(product));
  };

  const reviews = [
    { username: "NguyenVanA", comment: "Trà rất ngon, thơm và mát!", rating: 5, date: "02/20/2025" },
    { username: "TranThiB", comment: "Vị rất vừa miệng, sẽ mua lại!", rating: 4.8, date: "02/18/2025" },
    { username: "User123", comment: "Thức uống này rất tuyệt!", rating: 4.5, date: "02/15/2025" },
    { username: "TranThiB", comment: "Vị rất vừa miệng, sẽ mua lại!", rating: 4.8, date: "02/18/2025" },
    { username: "User123", comment: "Thức uống này rất tuyệt!", rating: 4.5, date: "02/15/2025" }
  ];

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  const renderStars = (rating) => (
    <View style={styles.starContainer}>
      {[...Array(5)].map((_, i) => (
        <FontAwesome
          key={i}
          name={i + 1 <= rating ? "star" : i + 0.5 === rating ? "star-half" : "star-o"}
          size={18}
          color="gold"
        />
      ))}
    </View>
  );

  const fetchProductDetail = async (productId) => {
    if (!rateLimit('product-service', 10, 60 * 1000)) {
      alert('Bạn gọi API sản phẩm quá nhanh, vui lòng thử lại sau!');
      console.warn('Rate limit client: Blocked product-service API call');
      return;
    }
    try {
      const response = await retryApiCall(() =>
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/products/${productId}`)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res;
          })
      );
      const data = await response.json();
      console.log('Phản hồi từ product-service:', data);
      // ... xử lý data
      return data;
    } catch (error) {
      console.error('❌ Lỗi lấy chi tiết sản phẩm:', error);
      alert('Lỗi lấy chi tiết sản phẩm: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Navbar  />
      <Image source={{ uri: product.image }} style={styles.productImage} />
      
      <View style={styles.contentContainer}>
        <View style={styles.productCard}>
          <View style={styles.headerRow}>
            <Text style={styles.productTitle}>{product.category} - {product.name}</Text>
            <TouchableOpacity onPress={handleToggleFavorite}>
              <FontAwesome name={isFavorite ? "heart" : "heart-o"} size={24} color="#e5b788" />
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.price}>${(product.price ).toFixed(2)}</Text>
            <Text style={styles.sold}>Sold: {product.quantity}</Text>
          </View>
          
          <Text style={styles.label}>Size</Text>
          <View style={styles.sizeContainer}>
            {[
              { size: "250 ml", icon: "coffee" },
              { size: "350 ml", icon: "coffee" },
              { size: "450 ml", icon: "coffee" }
            ].map(({ size, icon }) => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeButton, selectedSize === size && styles.selectedSize]}
                onPress={() => setSelectedSize(size)}
              >
                <FontAwesome name={icon} size={16} color="white" style={styles.sizeIcon} />
                <Text style={styles.sizeText}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Thêm ghi chú..."
            value={note}
            onChangeText={setNote}
          />

          <View style={styles.cartContainer}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.quantityButton}>
                <FontAwesome name="minus" size={9} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.quantityButton}>
                <FontAwesome name="plus" size={9} color="#FFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(quantity)}>
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerRow}><Text style={styles.reviewHeader}>Đánh giá khách hàng ({reviews.length})</Text>
        <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
          <Text style={{ color: "#E5B788", textAlign: 'right', fontSize: 16 }}>
            {showAllReviews ? "Ẩn" : "Hiện thêm"}
          </Text>
        </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer} nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}> 
          <View style={styles.reviewHeaderContainer}>
            {visibleReviews.map((user, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewUserRow}>
                  <FontAwesome name="user-circle" size={20} color="#E5B788" />
                  <Text style={styles.reviewUser}>{user.username}</Text>
                </View>
                {renderStars(user.rating)}
                <Text style={styles.reviewComment}>{user.comment}</Text>
                <Text style={styles.reviewDate}>{user.date}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      
      <Footer />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {  flex: 1, minHeight: '100%',backgroundColor: "#F5EBDC" },
  productImage: { width: "100%", height: 280, resizeMode: "cover"},
  contentContainer: { backgroundColor: "#3B2211", paddingHorizontal: 16, paddingTop: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 20, borderBottomColor: "#E5B788", borderBottomWidth: 2, },
  productCard: { paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productTitle: { fontSize: 22, fontWeight: "bold", color: "white" },
  description: { fontSize: 14, color: "#ccc", marginVertical: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 10 },
  price: { fontSize: 20, fontWeight: "bold", color: "white",  },
  sold: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  sizeContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10, color: "#fff" },
  label: { fontSize: 16, color: "#fff", fontWeight: "bold", marginTop: 10 },
  sizeButton: { flexDirection: "row", borderWidth: 2,
    borderColor: "#E5B788",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#3B2211",},
  sizeIcon: { marginRight: 5 },
  selectedSize: { backgroundColor: "#E5B788" },
  sizeText: { color: "white" },
  noteInput: { backgroundColor: "#FFF", padding: 10, borderRadius: 5, marginVertical: 10,marginHorizontal: 10 },
  cartContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 5, marginHorizontal: 10 },
  quantityContainer: { flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5B788",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#3B2211", },
  quantityButton: { padding: 10,
    backgroundColor: "transparent", },
  quantityText: { fontSize: 18, marginHorizontal: 10, color: "white" },
  addToCartButton: { alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5B788",
    borderRadius: 25,
    padding: 10,
    backgroundColor: "#3B2211",  },
  addToCartText: { color: "white" , fontSize: 18,},
  scrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    flexGrow: 1,
    minHeight: '100%',
    paddingBottom: 200,
  },
  reviewHeaderContainer: {
    marginBottom: 10,
    
  },
  reviewHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
   
  },
  headerRow: {  
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
    
    
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#555',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
});
