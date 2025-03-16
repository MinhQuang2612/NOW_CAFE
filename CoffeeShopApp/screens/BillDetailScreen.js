import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  SafeAreaView,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../redux/userSlice";
import { removeFromCart } from "../redux/cartSlice";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/orders`;

const BillDetail = ({ navigation, route }) => { 
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const user = useSelector((state) => state.user.user);
  const cartUserId = useSelector((state) => state.cart.cartUserId); // Không thêm "guest" mặc định ngay
  const selectedItems = useSelector((state) => state.cart.selectedItem) || [];
  const cartItems = useSelector((state) => state.cart.cartItems) || [];
  const [paymentSelected, setPaymentSelected] = useState(1); // 1: Thanh toán khi nhận hàng
  const dispatch = useDispatch();
  const { voucher } = route.params || { voucher: null };

  // Xác định userId, fallback thành "guest" nếu không có cartUserId
  const userId = cartUserId || "guest";

  useEffect(() => {
    console.log("API_URL:", API_URL);
    console.log("User from Redux:", user);
    console.log("Cart UserId:", cartUserId);
    console.log("UserId (final):", userId);
    console.log("Selected Items:", selectedItems);
    console.log("Cart Items:", cartItems);

    // Chỉ điều hướng nếu userId là "guest" và không có cartUserId hợp lệ
    if (userId === "guest" && !cartUserId) {
      console.warn("No valid userId found, redirecting to Login");
      Alert.alert("Lỗi", "Vui lòng đăng nhập để đặt hàng!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    // Gọi fetchUserDetails để lấy thông tin user (sử dụng userId từ cart)
    if (!user && userId !== "guest") {
      dispatch(fetchUserDetails(userId))
        .unwrap()
        .catch((error) => {
          console.error("Fetch User Error in useEffect:", error.message);
          // Không điều hướng, chỉ log lỗi
        });
    }
  }, [user, cartUserId, selectedItems, cartItems, dispatch, navigation]);

  const calculatePaymentDetails = () => {
    const deliveryFee = 2.0;
    const packagingFee = 2.0;
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    const adjustedDeliveryFee =
      voucher && voucher.title === "Miễn phí vận chuyển" ? 0 : deliveryFee;
    const promoDiscount = voucher && voucher.discount ? parseFloat(voucher.discount) || 0 : 0;
    const total = subtotal + adjustedDeliveryFee + packagingFee - promoDiscount;

    return {
      subtotal: subtotal.toFixed(1),
      deliveryFee: adjustedDeliveryFee.toFixed(1),
      packagingFee: packagingFee.toFixed(1),
      promoDiscount: promoDiscount.toFixed(1),
      total: total.toFixed(1),
    };
  };

  const paymentDetails = calculatePaymentDetails();

  const handleOrder = () => {
    console.log("Handling order...");
    console.log("Current User:", user);
    console.log("UserId:", userId);
    console.log("Selected Items:", selectedItems);

    if (userId === "guest") {
      console.warn("UserId is guest:", userId);
      Alert.alert("Lỗi", "Vui lòng đăng nhập để đặt hàng!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (selectedItems.length === 0) {
      Alert.alert("Lỗi", "Giỏ hàng trống, không thể đặt hàng!", [
        { text: "OK", onPress: () => navigation.navigate("Cart") },
      ]);
      return;
    }

    Alert.alert(
      "Xác nhận đặt hàng",
      "Bạn có chắc chắn muốn đặt hàng không?",
      [
        {
          text: "Hủy",
          style: "cancel",
          onPress: () => navigation.navigate("Cart"),
        },
        {
          text: "Xác nhận",
          onPress: async () => {
            const orderData = {
              hoadon_id: `HHD${Math.floor(1000 + Math.random() * 9000)}`,
              user: { User_id: userId },
              ChiTietHoaDon: {
                SanPham: selectedItems.map((item) => ({
                  product_id: item.sanpham_id,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                })),
                dateCreated: new Date().toISOString(),
                tongTien: parseFloat(paymentDetails.total),
              },
              paymentMethod:
                paymentSelected === 0 ? "Ví điện tử" : "Thanh toán khi nhận hàng",
              status: "pending",
            };

            console.log("Order Data to send:", orderData);

            try {
              const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
              });

              const data = await response.json();
              console.log("API Response:", data);

              if (!response.ok) {
                throw new Error(
                  `HTTP error! Status: ${response.status}, Message: ${
                    data.message || "Unknown error"
                  }`
                );
              }

              selectedItems.forEach((item) => {
                dispatch(removeFromCart({ sanpham_id: item.sanpham_id, userId }));
              });

              Alert.alert("Thành công", "Đặt hàng thành công!", [
                { text: "OK", onPress: () => navigation.navigate("Cart") },
              ]);
            } catch (error) {
              console.error("Order Error:", error);
              Alert.alert("Lỗi", `Đặt hàng thất bại: ${error.message}`);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const Address = () => (
    <View style={styles.addressContainer}>
      <Ionicons name="location" size={40} color="#FB452D" />
      <View>
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{user.name|| "Tên người dùng"}</Text>
          <Text>(+84){user?.phoneNumber || "0123456789"}</Text>
        </View>
        <Text>{user?.address || "Địa chỉ mặc định"}</Text>
      </View>
    </View>
  );

  const Item = ({ item }) => (
    <View style={{ marginTop: 10 }}>
      <View style={styles.itemDetailContainer}>
        <Image
          source={{ uri: item.image || "https://picsum.photos/200/300" }}
          style={styles.img}
          resizeMode="cover"
        />
        <View>
          <Text style={styles.categoryText}>{item.category}</Text>
          <Text style={styles.nameText}>{item.name || "Tên sản phẩm"}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{(item.price || 0).toLocaleString()} VND</Text>
            <Text>Size: 350ml</Text>
          </View>
        </View>
        <Text>x{item.quantity || 1}</Text>
      </View>
      <View style={styles.noteContainer}>
        <Text>Ghi chú:</Text>
        <TextInput placeholder="ABC" style={styles.input} />
      </View>
      <View style={styles.line} />
    </View>
  );

  const SuggestedItems = () => (
    <>
      <View style={styles.otherContainer}>
        <Text style={styles.otherTitle}>Đồ uống chúng tôi đề xuất</Text>
        <Pressable>
          <Text>Xem tất cả</Text>
        </Pressable>
      </View>
      <View style={styles.otherItemContainer}>
        <View>
          <Image
            source={{ uri: "https://picsum.photos/200/300" }}
            style={styles.imageOther}
            resizeMode="cover"
          />
          <View style={styles.otherItem}>
            <Text style={styles.name}>ICED YIN & YANG</Text>
            <Text style={styles.name}>45,000 VND</Text>
          </View>
        </View>
        <View>
          <Image
            source={{ uri: "https://picsum.photos/200/300" }}
            style={styles.imageOther}
            resizeMode="cover"
          />
          <View style={styles.otherItem}>
            <Text style={styles.name}>ICED CHOCOLATE</Text>
            <Text style={styles.name}>60,000 VND</Text>
          </View>
        </View>
      </View>
    </>
  );

  const Delivery = () => (
    <View style={styles.deliveryContainer}>
      <Text style={styles.deliveryText}>Giao hàng</Text>
      <View style={styles.deliveryDetailContainer}>
        <Image source={require("../assets/images/deliveryItem.png")} resizeMode="cover" />
        <View>
          <Text style={styles.deliveryName}>Giao hàng nhanh</Text>
          <Text>Nhận hàng lúc 19:30 - 20:00</Text>
        </View>
      </View>
    </View>
  );

  const Voucher = () => (
    <View style={styles.voucherContainer}>
      <Text style={styles.deliveryText}>Voucher</Text>
      <Pressable
        style={styles.voucherDetailContainer}
        onPress={() => navigation.navigate("Voucher")}
      >
        <Image source={require("../assets/images/voucher.png")} resizeMode="cover" />
        <View>
          <Text style={styles.voucherText}>{voucher ? voucher.title : "Voucher"}</Text>
          <Text>
            {voucher
              ? voucher.description.length > 30
                ? voucher.description.substring(0, 30) + "..."
                : voucher.description
              : "Mô tả"}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  const Payment = () => (
    <View style={styles.deliveryContainer}>
      <Text style={styles.deliveryText}>Phương thức thanh toán</Text>
      <Pressable
        style={
          paymentSelected === 0
            ? [styles.paymentContainer, { backgroundColor: "#967259" }]
            : styles.paymentContainer
        }
        onPress={() => setPaymentSelected(0)}
      >
        <Image source={require("../assets/images/payment.png")} resizeMode="cover" />
        <Text>Thanh toán qua ví điện tử</Text>
      </Pressable>
      <Pressable
        style={
          paymentSelected === 1
            ? [styles.paymentContainer, { backgroundColor: "#967259" }]
            : styles.paymentContainer
        }
        onPress={() => setPaymentSelected(1)}
      >
        <Image source={require("../assets/images/payment.png")} resizeMode="cover" />
        <Text>Thanh toán khi nhận hàng</Text>
      </Pressable>
    </View>
  );

  const PaymentDetails = () => (
    <View style={styles.paymentDetailContainer}>
      <Text style={styles.deliveryText}>Chi tiết thanh toán</Text>
      <View style={styles.paymentDetailRow}>
        <Text style={styles.paymentDetailLabel}>
          Tổng tiền sản phẩm ({selectedItems.length})
        </Text>
        <Text style={styles.paymentDetailValue}>
          {parseFloat(paymentDetails.subtotal).toLocaleString()} VND
        </Text>
      </View>
      <View style={styles.paymentDetailRow}>
        <Text style={styles.paymentDetailLabel}>Phí giao hàng</Text>
        <Text style={styles.paymentDetailValue}>
          {parseFloat(paymentDetails.deliveryFee).toLocaleString()} VND
        </Text>
      </View>
      <View style={styles.paymentDetailRow}>
        <Text style={styles.paymentDetailLabel}>Phí đóng gói</Text>
        <Text style={styles.paymentDetailValue}>
          {parseFloat(paymentDetails.packagingFee).toLocaleString()} VND
        </Text>
      </View>
      {voucher && voucher.title === "Miễn phí vận chuyển" && (
        <View style={styles.paymentDetailRow}>
          <Text style={styles.paymentDetailLabel}>Khuyến mãi</Text>
          <Text style={[styles.paymentDetailValue, { color: "green" }]}>
            Miễn phí vận chuyển
          </Text>
        </View>
      )}
      {voucher && parseFloat(paymentDetails.promoDiscount) > 0 && (
        <View style={styles.paymentDetailRow}>
          <Text style={styles.paymentDetailLabel}>Khuyến mãi</Text>
          <Text style={[styles.paymentDetailValue, { color: "green" }]}>
            -{parseFloat(paymentDetails.promoDiscount).toLocaleString()} VND
          </Text>
        </View>
      )}
      <View
        style={[
          styles.paymentDetailRow,
          { marginTop: 10, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 10 },
        ]}
      >
        <Text style={[styles.paymentDetailLabel, { fontWeight: "bold", fontSize: 18 }]}>
          TỔNG CỘNG
        </Text>
        <Text
          style={[styles.paymentDetailValue, { fontWeight: "bold", fontSize: 18, color: "red" }]}
        >
          {parseFloat(paymentDetails.total).toLocaleString()} VND
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Address />
        <View style={styles.itemContainer}>
          {selectedItems.length > 0 ? (
            selectedItems.map((item, index) => <Item key={index} item={item} />)
          ) : (
            <Text>Không có sản phẩm nào trong giỏ hàng.</Text>
          )}
          <SuggestedItems />
        </View>
        <Delivery />
        <Voucher />
        <Payment />
        <PaymentDetails />
        <Pressable style={styles.orderButton} onPress={handleOrder}>
          <Text style={styles.orderButtonText}>Đặt hàng</Text>
        </Pressable>
      </ScrollView>
      <Footer style={styles.fixedFooter} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEDCC6",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF5E9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addressContainer: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 50,
    backgroundColor: "#FFF5E9",
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nameContainer: {
    flexDirection: "row",
    gap: 10,
  },
  nameText: {
    fontWeight: "bold",
  },
  img: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  categoryText: {
    fontWeight: "bold",
  },
  nameText: {
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  priceContainer: {
    flexDirection: "row",
    gap: 20,
  },
  itemDetailContainer: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  itemContainer: {
    backgroundColor: "#FFF5E9",
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  input: {
    backgroundColor: "#EEDCC6",
    borderRadius: 5,
    padding: 5,
    marginTop: 10,
    width: 200,
  },
  noteContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    gap: 20,
  },
  line: {
    borderWidth: 1,
    borderColor: "black",
  },
  otherContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  otherTitle: {
    fontSize: 18,
    fontWeight: "700",
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
  deliveryContainer: {
    backgroundColor: "#FFF5E9",
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 10,
    borderRadius: 10,
  },
  deliveryText: {
    fontSize: 18,
    fontWeight: "700",
  },
  deliveryDetailContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deliveryName: {
    fontWeight: "700",
  },
  voucherContainer: {
    backgroundColor: "#FFF5E9",
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 10,
  },
  voucherText: {
    fontWeight: "700",
  },
  voucherDetailContainer: {
    flexDirection: "row",
    backgroundColor: "#EEDCC6",
    padding: 10,
    borderRadius: 10,
  },
  paymentContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#EEDCC6",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  paymentDetailContainer: {
    backgroundColor: "#FFF5E9",
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 10,
    borderRadius: 10,
  },
  paymentDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  paymentDetailLabel: {
    fontSize: 16,
  },
  paymentDetailValue: {
    fontSize: 16,
  },
  orderButton: {
    backgroundColor: "#FF4D4D",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default BillDetail;