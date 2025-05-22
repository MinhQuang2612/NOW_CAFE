import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  clearCart,
  fetchCartItems,
  addToCart,
  updateCartItems,
  addToSelectedItem,
} from "../redux/cartSlice";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AntDesign } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import Checkbox from "expo-checkbox";
import { rateLimit } from '../utils/rateLimiter';
import { retryApiCall } from '../utils/retryApiCall';

export default function CartScreen({ navigation }) {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const [numberItem, setNumberItem] = useState(0);
  const [dataCheck, setDataCheck] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [checkAll, setCheckAll] = useState(false);
  const user = useSelector((state) => state.user.user);
  const userId = user?.userId || "guest"; // Sửa userId thành user_id
  const prevCartItems = useRef(cartItems);

  useEffect(() => {
    dispatch(fetchCartItems({ userId }));
  }, [userId, dispatch]);

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
          category: item.category,
          quantity: item.quantity,
          checked: existingCheck ? existingCheck.checked : false,
        };
      });
      return updatedDataCheck;
    });
    setNumberItem(cartItems.length);
  }, [cartItems]);

  useEffect(() => {
    const total = dataCheck.reduce((acc, item) => (item.checked ? acc + item.price * item.quantity : acc), 0);
    setTotalAmount(total);
    const checkedCount = dataCheck.filter((item) => item.checked).length;
    setNumberItem(checkedCount);
    setCheckAll(dataCheck.length > 0 && dataCheck.every((item) => item.checked));
  }, [dataCheck]);

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
            <Text style={styles.categoryText}>{item.category}</Text>
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
          <TextInput placeholder="note" style={styles.input} />
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

  const fetchCart = async (userId) => {
    if (!rateLimit('cart-service', 10, 60 * 1000)) {
      alert('Bạn gọi API giỏ hàng quá nhanh, vui lòng thử lại sau!');
      console.warn('Rate limit client: Blocked cart-service API call');
      return;
    }
    try {
      const response = await retryApiCall(() =>
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cart/${userId}`)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res;
          })
      );
      const data = await response.json();
      console.log('Phản hồi từ cart-service:', data);
      // ... xử lý data
      return data;
    } catch (error) {
      console.error('❌ Lỗi lấy giỏ hàng:', error);
      alert('Lỗi lấy giỏ hàng: ' + error.message);
    }
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
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => {
            const selectedItems = dataCheck
              .filter((item) => item.checked)
              .map((item) => {
                const fullItem = cartItems.find((cartItem) => cartItem.sanpham_id === item.id);
                return { ...fullItem, quantity: item.quantity };
              });

            if (selectedItems.length === 0) {
              Alert.alert("Lỗi", "Vui lòng chọn ít nhất một sản phẩm để đặt hàng!");
              return;
            }
            if (userId === "guest") {
              Alert.alert("Lỗi", "Vui lòng đăng nhập để tiếp tục!", [
                { text: "OK", onPress: () => navigation.navigate("Login") },
              ]);
              return;
            }
            dispatch(addToSelectedItem({ listItem: selectedItems }));
            navigation.navigate("BillDetail", { totalAmount });
          }}
        >
          <Text style={styles.checkoutText}>
            Buy Now! ({dataCheck.filter((item) => item.checked).length})
          </Text>
        </TouchableOpacity>
        <View style={styles.otherContainer}>
          <Text style={styles.otherText}>Other drinks you may like</Text>
        </View>
        <View style={styles.otherItemContainer}>
          <View>
            <Image
              source={{ uri: "https://picsum.photos/200/300" }}
              style={styles.imageOther}
            />
            <View style={styles.otherItem}>
              <Text style={styles.name}>Product Name</Text>
              <Text style={styles.name}>$15.5</Text>
            </View>
          </View>
          <View>
            <Image
              source={{ uri: "https://picsum.photos/200/300" }}
              style={styles.imageOther}
            />
            <View style={styles.otherItem}>
              <Text style={styles.name}>Product Name</Text>
              <Text style={styles.name}>$15.5</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEDCC6", paddingTop: 100, paddingBottom: 100 },
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
  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textTransform: "uppercase",
  },
  price: { fontSize: 14, color: "#834D1E" },
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
  checkoutButton: {
    backgroundColor: "#AE0B0B",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutText: { color: "white", fontSize: 18, fontWeight: "bold" },
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
    width: 140,
    height: 120,
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