import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../redux/ordersSlice";

const RecentlyOtherScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(true);

  const orders = useSelector((state) => state.orders.orders);
  const loading = useSelector((state) => state.orders.loading);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const recentOrders = orders.filter((order) => order.status !== "Completed");
  const pastOrders = orders.filter((order) => order.status === "Completed");

const OrderItem = ({ bill, onPress }) => {
    // Lấy sản phẩm đầu tiên từ danh sách sản phẩm
  const firstProduct = bill.ChiTietHoaDon?.SanPham[0];

  // Tính tổng số sản phẩm trong đơn hàng (tính cả trùng lặp)
  const totalProducts = bill.ChiTietHoaDon?.SanPham.reduce(
    (sum, product) => sum + product.quantity,
    0
  );
  
    return (
      <TouchableOpacity onPress={() => onPress(bill)}>
        <View style={styles.itemContainer}>
          <Image
            source={{ uri: firstProduct?.image || "https://your-default-image.com/default.png" }}
            style={styles.image}
          />
          <View>
            <View style={styles.statusContainer}>
              <Text style={styles.nameText}>Order: {bill.hoadon_id}</Text>
              <Text
                style={[
                  bill.status === "Packing"
                    ? { backgroundColor: "#F2994A" }
                    : { backgroundColor: "#32CD32" },
                  styles.statusText,
                ]}
              >
                {bill.status}
              </Text>
            </View>
            <Text style={styles.nameText}>Product: {firstProduct?.name || "No Product"}</Text>
            <Text style={styles.inforText}>
              Date: {new Date(bill.ChiTietHoaDon?.dateCreated).toLocaleString("vi-VN")}
            </Text>
            <Text style={styles.inforText}>Total Products: {totalProducts}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
      {/* Thanh tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Orders</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("SearchOrder")}>
            <Ionicons name="search" size={24} color="#967259" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chuyển đổi tab */}
      <View style={styles.toggleTabContainer}>
        <TouchableOpacity
          style={[
            { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
            activeTab ? styles.selected : styles.unselected,
          ]}
          onPress={() => setActiveTab(true)}
        >
          <Text style={styles.textTab}>Recently</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
            activeTab ? styles.unselected : styles.selected,
          ]}
          onPress={() => setActiveTab(false)}
        >
          <Text style={styles.textTab}>Past Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Hiển thị danh sách đơn hàng */}
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#230C02" />
        ) : (
          <FlatList
            data={activeTab ? recentOrders : pastOrders}
            keyExtractor={(item) => item.hoadon_id.toString()}
            renderItem={({ item }) => <OrderItem bill={item} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Footer />
    </View>
  );  
};

export default RecentlyOtherScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#EEDCC6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    top: -20,
    paddingVertical: 15,
    backgroundColor: "#EEDCC6",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#967259",
  },
  iconContainer: {
    flexDirection: "row",
    gap: 15,
  },
  toggleTabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  selected: {
    backgroundColor: "#230C02",
    padding: 10,
    width: 100,
    alignItems: "center",
  },
  unselected: {
    padding: 10,
    backgroundColor: "#EEDCC6",
    borderWidth: 1,
    width: 100,
    alignItems: "center",
  },
  textTab: {
    color: "white",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#230C02",
    padding: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EEDCC6",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#967259",
  },
  statusText: {
    color: "#967259",
    width: 80,
    textAlign: "center",
    padding: 5,
    borderRadius: 10,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  inforText: {
    color: "#967259",
  },
});