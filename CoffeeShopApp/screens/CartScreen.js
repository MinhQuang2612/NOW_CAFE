import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,

} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart, fetchCartItems, addToCart, updateCartItems } from "../redux/cartSlice";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AntDesign } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import Checkbox from "expo-checkbox";

export default function CartScreen({ navigation }) {
  const cartItems = useSelector((state) => state.cart.cartItems);
  // const totalAmount = useSelector((state) => state.cart.totalAmount);
  const dispatch = useDispatch();
  const [numberItem, setNumberItem] = useState(0); // Số lượng sản phẩm da checked
  const [dataCheck, setDataCheck] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [checkAll, setCheckAll] = useState(false);
  const user = useSelector((state) => state.user.user); // Get user from Redux
  const userId = user?.userId || "guest"; // Use guest as fallback
  const prevCartItems = useRef(cartItems); // Lưu giá trị cartItems trước đó

  useEffect(() => {
    dispatch(fetchCartItems({ userId }));
  }, [userId, dispatch]);
// Đồng bộ dataCheck với cartItems
useEffect(() => {
  if (cartItems.length === 0) {
    setDataCheck([]);
    setNumberItem(0);
    setTotalAmount(0);
    setCheckAll(false);
    return;
  }

  setDataCheck((prevDataCheck) => {
    const updatedDataCheck = cartItems.map((item) => {
      const existingCheck = prevDataCheck.find((check) => check.id === item.sanpham_id);
      return {
        id: item.sanpham_id,
        price: item.price,
        quantity: item.quantity,
        checked: existingCheck ? existingCheck.checked : false,
      };
    });
    return updatedDataCheck;
  });
  setNumberItem(cartItems.length);
}, [cartItems]);

// Tính toán totalAmount và checkAll dựa trên dataCheck
useEffect(() => {
  const total = dataCheck.reduce((acc, item) => (item.checked ? acc + item.price * item.quantity : acc), 0);
  setTotalAmount(total);
  const checkedCount = dataCheck.filter((item) => item.checked).length;
  setNumberItem(checkedCount);
  setCheckAll(dataCheck.length > 0 && dataCheck.every((item) => item.checked));
  // Chỉ log khi cần thiết để debug
  // console.log("🛒 Data Check:", dataCheck);
}, [dataCheck]);

// Update cartItems lên server khi có thay đổi thực sự
useEffect(() => {
  if (JSON.stringify(cartItems) !== JSON.stringify(prevCartItems.current) && cartItems.length > 0) {
    dispatch(updateCartItems({ userId, cartItems }));
    prevCartItems.current = cartItems;
  }
}, [cartItems, userId, dispatch]);

const Item = ({ item }) => {
  const dataCheckItem = dataCheck.find((check) => check.id === item.sanpham_id);
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetailContainer}>
        <Checkbox
          value={dataCheckItem?.checked || false}
          onValueChange={(value) =>
            setDataCheck((prev) =>
              prev.map((check) =>
                check.id === item.sanpham_id ? { ...check, checked: value } : check
              )
            )
          }
        />
        <Image source={{ uri: item.image }} style={styles.image} />
        <View>
          <Text style={styles.categoryText}>Category</Text>
          <Text style={styles.name}>
            {item.name.length > 15 ? item.name.slice(0, 15) + "..." : item.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${item.price}</Text>
            <Text>Size: 350ml</Text>
          </View>
        </View>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleDecreaseQuantity(item)}
          >
            <Text style={styles.textQuantityButton}>-</Text>
          </TouchableOpacity>
          <Text>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleIncreaseQuantity(item)}
          >
            <Text style={styles.quantity}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text>Note</Text>
        <TextInput placeholder="Aaabbcc" style={styles.input} />
        <TouchableOpacity>
          <AntDesign name="edit" size={22} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const handleDecreaseQuantity = (item) => {
  dispatch(addToCart({ product: { ...item, userId }, quantity: -1 }));
};

const handleIncreaseQuantity = (item) => {
  dispatch(addToCart({ product: { ...item, userId }, quantity: 1 }));
};

const handleCheckAll = (value) => {
  setCheckAll(value);
  setDataCheck((prev) => prev.map((check) => ({ ...check, checked: value })));
};

return (
  <View style={styles.container}>
    <Navbar />
    <SearchBar />
    <ScrollView contentContainerStyle={styles.cartList}>
      <View style={styles.titleContainer}>
        <AntDesign name="shoppingcart" size={40} color="black" />
        <Text style={styles.title}>Cart({numberItem})</Text>
      </View>
      {cartItems.length > 0 ? (
        cartItems.map((item) => <Item key={item.sanpham_id} item={item} />)
      ) : (
        <Text style={styles.emptyCart}>Cart is empty</Text>
      )}
      <View style={styles.totalContainer}>
        <View style={styles.checkContainer}>
          <Checkbox value={checkAll} onValueChange={handleCheckAll} />
          <Text>All</Text>
        </View>
        <View>
          <Text>
            Total payment: <Text style={styles.textTotal}>${totalAmount}</Text>
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.checkoutButton}
        onPress={() => {
          const selectedItems = dataCheck
            .filter((item) => item.checked)
            .map((item) => {
              const fullItem = cartItems.find((cartItem) => cartItem.sanpham_id === item.id);
              return { ...fullItem, quantity: item.quantity }; // Lấy thêm `image`, `name`
            });
        
          if (selectedItems.length === 0) return; // Nếu không có sản phẩm nào, không làm gì cả
        
          navigation.navigate("Bill", { selectedItems, totalAmount });
        }}>
        <Text style={styles.checkoutText}>
          Buy Now! ({dataCheck.filter((item) => item.checked).length})
        </Text>
      </TouchableOpacity>
      {/* Giữ nguyên phần gợi ý sản phẩm khác nếu có */}
    </ScrollView>
    <Footer />
  </View>
);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEDCC6", paddingTop: 100 },
  cartList: {
    padding: 20,
    backgroundColor: "#FFF5E9",
    marginVertical: 10,
  },
  itemDetailContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemContainer: {
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
  image: { width: 70, height: 70, borderRadius: 10 },
  details: { flex: 1, marginLeft: 15 },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textTransform: "uppercase",
  },
  price: { fontSize: 14, color: "#834D1E" },
  actions: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  quantityButton: {
    backgroundColor: "#E0C3A4",
    width: 20,
    height: 20,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutText: { color: "white", fontSize: 18, fontWeight: "bold" },
  clearCartText: { color: "red", marginTop: 10 },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  price: {
    color: "#AE0B0B",
    fontWeight: "bold",
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  textQuantityButton: {
    fontSize: 14,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#FFF5E9",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: 200,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  checkContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  textTotal: {
    color: "#AE0B0B",
    fontWeight: "bold",
    fontSize: 16,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  otherText: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  otherItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  imageOther: {
    width: 160,
    height: 160,
    borderRadius: 10,
  },
  otherItem: {
    position: "absolute",
    bottom: 10,
    left: 10,
  },
  otherContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
});