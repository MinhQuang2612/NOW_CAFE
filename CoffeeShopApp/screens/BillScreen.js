import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Footer from "../components/Footer";

export default function BillScreen({ navigation, route }) {
  const { selectedItems, userId } = route.params || { selectedItems: [], userId: null };
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [userInfo, setUserInfo] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null); // State for selected voucher

  // Constants for fees (matching your image in dollars)
  const DELIVERY_FEE = 0.2; // $0.2
  const PACKAGING_FEE = 2.0; // $2.0

  // Calculate subtotal and total price from selected items, including fees and voucher
  useEffect(() => {
    let subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    // Handle voucher logic: check for fixed discount, percentage discount, or free shipping
    let voucherDiscount = 0;
    let isFreeShipping = false;
    if (selectedVoucher) {
      if (selectedVoucher.discount) {
        voucherDiscount = selectedVoucher.discount; // Fixed discount in dollars (e.g., $50)
      } else if (selectedVoucher.percentageDiscount) {
        voucherDiscount = (subtotal * (selectedVoucher.percentageDiscount / 100)); // Percentage discount (e.g., 20% of subtotal)
      }
      if (selectedVoucher.isFreeShipping) {
        isFreeShipping = true; // If voucher provides free shipping, set delivery fee to 0
      }
    }

    // Calculate final total with fees and voucher (in dollars)
    const effectiveDeliveryFee = isFreeShipping ? 0 : DELIVERY_FEE;
    const finalTotal = subtotal + effectiveDeliveryFee + PACKAGING_FEE - voucherDiscount;
    setTotal(finalTotal >= 0 ? finalTotal : 0); // Ensure total is not negative
  }, [selectedItems, selectedVoucher]);

  // Fetch user info
  useEffect(() => {
    if (userId) {
      console.log("Fetching user info for userId:", userId);
      fetch(`http://localhost:5001/api/user/${userId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("API Response:", data);
          if (data.success && data.user) {
            setUserInfo(data.user);
          } else {
            console.log("Không tìm thấy người dùng hoặc dữ liệu không hợp lệ");
            Alert.alert("Error", "Không thể tải thông tin người dùng. Vui lòng kiểm tra kết nối hoặc thử lại.");
          }
        })
        .catch((error) => {
          console.error("❌ Lỗi lấy thông tin user:", error);
          Alert.alert("Error", "Lỗi kết nối đến máy chủ. Vui lòng thử lại.");
        });
    }
  }, [userId]);

  // Handle voucher selection (received from VoucherScreen)
  useEffect(() => {
    if (route.params?.voucher) {
      setSelectedVoucher(route.params.voucher);
    }
  }, [route.params?.voucher]);

  // Navigate to VoucherScreen to select a voucher
  const handleSelectVoucher = () => {
    navigation.navigate("Voucher", {
      onSelectVoucher: (voucher) => {
        setSelectedVoucher(voucher);
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Order</Text>
        </View>

        {userInfo ? (
          <View style={styles.sectionContainer}>
            <View style={styles.addressContainer}>
              <Image source={require("../assets/icons/delivery.png")} style={styles.icon} />
              <View>
                <Text style={styles.userName}>{userInfo.name || "No Name"}</Text>
                <Text style={styles.userPhone}>
                  {userInfo.phoneNumber ? `(+${userInfo.phoneNumber})` : "No Phone"}
                </Text>
                <Text style={styles.userAddress}>{userInfo.address || "No Address"}</Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={{ color: "red", textAlign: "center", marginVertical: 10 }}>
            Không tải được thông tin người dùng
          </Text>
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Delivery</Text>
          <View style={styles.deliveryOption}>
            <Image source={require("../assets/icons/delivery.png")} style={styles.icon} />
            <Text style={styles.deliveryText}>Fast delivery - 19:30-20:00</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.sectionContainer}
          onPress={handleSelectVoucher}
        >
          <Text style={styles.sectionTitle}>Voucher</Text>
          <View style={styles.voucherOption}>
            <Image source={require("../assets/icons/free-ship.png")} style={styles.icon} />
            <Text style={styles.voucherText}>
              {selectedVoucher ? selectedVoucher.title || "Select Voucher" : "Select Voucher"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {selectedItems.map((item) => (
            <View key={item.sanpham_id} style={styles.itemContainer}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.specialTag}>Winter special</Text>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemPrice}>${item.price}</Text>
                  <Text style={styles.itemSize}>Size: {item.size} ml</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteLabel}>Note:</Text>
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>{item.note || "No notes"}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Details Section */}
        <View style={styles.paymentDetailsContainer}>
          <Text style={styles.paymentTitle}>Payment Details</Text>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Subtotal ({selectedItems.length})</Text>
            <Text style={styles.paymentValue}>${selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</Text>
          </View>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Delivery Fee</Text>
            <Text style={styles.paymentValue}>${(selectedVoucher?.isFreeShipping ? 0 : DELIVERY_FEE).toFixed(2)}</Text>
          </View>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Packaging Fee</Text>
            <Text style={styles.paymentValue}>${PACKAGING_FEE.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Promo</Text>
            <Text style={[styles.paymentValue, { color: '#AE0B0B' }]}>-${(selectedVoucher?.discount || (selectedVoucher?.percentageDiscount ? (selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0) * (selectedVoucher.percentageDiscount / 100)) : 0)).toFixed(2)}</Text>
          </View>
          <View style={[styles.paymentItem, styles.totalRow]}>
            <Text style={styles.totalText}>TOTAL</Text>
            <Text style={[styles.totalAmount, { color: '#AE0B0B' }]}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.orderButton}>
          <Text style={styles.orderButtonText}>Order</Text>
        </TouchableOpacity>
      </ScrollView>
      <Footer style={styles.footer} /> {/* Fixed footer outside ScrollView */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9E8D9",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 120, // Increased padding to ensure content doesn’t overlap Footer
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#F9E8D9",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  sectionContainer: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#3D1B00",
  },
  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  voucherOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  specialTag: {
    fontSize: 12,
    color: "#8B5A2B",
    fontWeight: "bold",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemPrice: {
    fontSize: 14,
    color: "#AE0B0B",
    fontWeight: "bold",
  },
  itemSize: {
    fontSize: 14,
    color: "#555",
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: "bold",
  },
  noteContainer: {
    marginTop: 5,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  noteBox: {
    backgroundColor: "#E7D4C0",
    padding: 8,
    borderRadius: 5,
    marginTop: 3,
  },
  noteText: {
    fontSize: 14,
    color: "#555",
  },
  paymentDetailsContainer: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#3D1B00",
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#555",
  },
  paymentValue: {
    fontSize: 14,
    color: "#AE0B0B",
    fontWeight: "bold",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
    marginTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3D1B00",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#AE0B0B",
  },
  orderButton: {
    backgroundColor: "#AE0B0B",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  orderButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCE9D6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userPhone: {
    fontSize: 14,
    color: "#555",
  },
  userAddress: {
    fontSize: 14,
    color: "#555",
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9E8D9',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    zIndex: 10, // Ensure footer stays on top
  },
});
