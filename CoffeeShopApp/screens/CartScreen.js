import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart, fetchCartItems, addToCart, updateCartItems } from "../redux/cartSlice";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AntDesign } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import Checkbox from "expo-checkbox";
import { TextInput } from "react-native-web";

export default function CartScreen({ navigation }) {
  const cartItems = useSelector((state) => state.cart.cartItems);
  // const totalAmount = useSelector((state) => state.cart.totalAmount);
  const dispatch = useDispatch();
  const [numberItem, setNumberItem] = useState(0); // Số lượng sản phẩm da checked
  const [dataCheck, setDataCheck] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [checkAll, setCheckAll] = useState(false);

  // User mac dinh la user0001
  const userIdDefault = "user0001";
  

  useEffect(() => {
    dispatch(fetchCartItems({ userId: userIdDefault }));
  }, []);

  useEffect(() => {
    setNumberItem(cartItems.length);
    // Nếu dataCheck rỗng:
    // - Lấy dữ liệu từ cartItems
    // - Set checked = false
    console.log("🛒 Cart Items:", cartItems);
    console.log("🛒 Data Check:", dataCheck);
    dataCheck.length === 0 ?
      setDataCheck(
        cartItems.map((item) => ({
          id: item.sanpham_id,
          price: item.price,
          quantity: item.quantity,
          checked: false,
        }))
      ):(
        dataCheck.map((item) => {
          const itemInCart = cartItems.find((cartItem) => cartItem.sanpham_id === item.id);
          if (!itemInCart) {
            return {
              id: item.id,
              price: item.price,
              quantity: item.quantity,
              checked: false,
            }
          }
          return {
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            checked: item.checked,
          }
        })
    )
    console.log("🛒 Cart Items1:", cartItems);
    console.log("🛒 Data Check1:", dataCheck);

    // setDataCheck(defaultDataCheck);
  }, [cartItems]);

  useEffect(() => {
    const total = dataCheck.reduce((acc = 0, item) => {
      if (item.checked) {
        console.log("🛒 Item Price:", item.price);
        acc += item.price * item.quantity;
        return acc;
      }
      return acc;
    }, 0);
    setTotalAmount(total);


    // Tinh so luong san pham da check
    const numberItemChecked = dataCheck.filter((item) => item.checked).length;
    setNumberItem(numberItemChecked);

    // Thay doi checkAll
    const checkAll = dataCheck.every((item) => item.checked);
    setCheckAll(checkAll);


  }, [dataCheck]);
  console.log("🛒 Data Check:", dataCheck);

  useEffect(() => {
    dispatch(updateCartItems({ userId: userIdDefault, cartItems: cartItems }));
  }
  , [cartItems]);

  /*
    Trong data chưa có
      - categrory
      - size
      - khong can total price
      - note
  */
  const Item = ({ item }) => {
    const dataCheckItem = dataCheck.find(
      (check) => check.id === item.sanpham_id
    );
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemDetailContainer}>
          <Checkbox
            value={dataCheckItem?.checked}
            onValueChange={(value) => {
              const newDataCheck = dataCheck.map((check) => {
                if (check.id === item.sanpham_id) {
                  return {
                    id: check.id,
                    price: check.price,
                    quantity: check.quantity,
                    checked: value,
                  };
                }
                return check;
              });
              setDataCheck(newDataCheck);
            }}
          />
          <Image source={{ uri: item.image }} style={styles.image} />
          <View>
            <Text style={styles.categoryText}>Category</Text>
            <Text style={styles.name}>
              {item.name.length > 15
                ? item.name.slice(0, 15) + "..."
                : item.name}
            </Text>
            {/* <Text style={styles.name}>{item.name}</Text> */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}> ${item.price}</Text>
              <Text>Size: 100ml </Text>
            </View>
          </View>
          {/* Thay doi so luong */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} 
              onPress={() => handleDecreaseQuantity({item})}
            >
              <Text style={styles.textQuantityButton}>-</Text>
            </TouchableOpacity>
            <Text>{item.quantity} </Text>
            <TouchableOpacity style={styles.quantityButton}
              onPress={() => handleIncreaseQuantity({item})}
            >
              <Text style={styles.quantity}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Note */}
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


  // Xử lý số lượng

  const handleDecreaseQuantity = ({item}) => {
    // Thay đổi số lượng trong cartItems
    dispatch(addToCart({ product: item, quantity: -1 }));

    
   
  };

 

  const handleIncreaseQuantity = ({item}) => {
    // Thay đổi số lượng trong cartItems
    dispatch(addToCart({ product: item, quantity: 1 }));
  };

  // Xu ly check all

  const handleCheckAll = (value) => { // value: true/false cuar checkAll
    // Neu value = true thi setCheckAll = true, nguoc lai
    setCheckAll(value);
    const newDataCheck = dataCheck.map((check) => {
      return {
        id: check.id,
        price: check.price,
        quantity: check.quantity,
        checked: value,
      };
    });
    setDataCheck(newDataCheck);

    
    
  };

  // console.log("🛒 Cart Items:", cartItems);
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
          <Text style={styles.emptyCart}>Giỏ hàng trống</Text>
        )}

        <View style={styles.totalContainer}>
          <View style={styles.checkContainer}>
            <Checkbox
              value={checkAll}
              onValueChange={(value) => handleCheckAll(value)}
              
            />
            <Text>All</Text>
          </View>
          <View>
            <Text>
              Total payment:{" "}
              <Text style={styles.textTotal}>${totalAmount}</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>
            Buy Now !({dataCheck.filter((item) => item.checked).length})
          </Text>
        </TouchableOpacity>

        <View style={styles.otherContainer}>
          <Text style={styles.otherText}>Other drink you may like</Text>
          <Text>See all</Text>
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

      {/* {cartItems.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Tổng cộng: ${totalAmount}</Text>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate("Bill")}
          >
            <Text style={styles.checkoutText}>Thanh toán</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => dispatch(clearCart())}>
            <Text style={styles.clearCartText}>Xóa giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      )} */}
      <Footer />
    </View>
  );
}

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
