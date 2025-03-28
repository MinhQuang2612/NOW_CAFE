import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";

const SearchOrderScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");

  // Lấy danh sách đơn hàng từ Redux store
  const orders = useSelector((state) => state.orders.orders);

  // Hàm lọc đơn hàng dựa trên từ khóa tìm kiếm
  const filteredOrders = searchText
    ? orders.filter((order) => {
        const orderId = order.hoadon_id.toString();
        const productName = order.ChiTietHoaDon?.SanPham?.map((sp) => sp.name).join(" ") || "";
        const orderDate = new Date(order.ChiTietHoaDon?.dateCreated).toLocaleDateString("vi-VN");

        return (
          orderId.includes(searchText) ||
          productName.toLowerCase().includes(searchText.toLowerCase()) ||
          orderDate.includes(searchText)
        );
      })
    : [];

  // Hàm xử lý khi nhấn vào đơn hàng
  
  const handleOrderPress = (bill) => {
    dispatch(selectOrder(bill)); // Lưu đơn hàng vào Redux
    navigation.navigate("OrderDetail");
  };
  // Component hiển thị mỗi đơn hàng
  const OrderItem = ({ bill }) => {
    const firstProduct = bill.ChiTietHoaDon?.SanPham[0];
    const totalProducts = bill.ChiTietHoaDon?.SanPham.reduce((sum, product) => sum + product.quantity, 0);

    return (
      <TouchableOpacity onPress={() => handleOrderPress(bill)}>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Tìm kiếm đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Ô tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập ID, tên sản phẩm hoặc ngày (dd/mm/yyyy)"
          placeholderTextColor="#AAA"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Danh sách kết quả */}
      {searchText === "" ? (
        <Text style={styles.noResultText}>🔎 Chưa có kết quả tìm kiếm</Text>
      ) : filteredOrders.length === 0 ? (
        <Text style={styles.noResultText}>❌ Không tìm thấy đơn hàng</Text>
      ) : (
        <FlatList
          style={styles.list}
          data={filteredOrders}
          keyExtractor={(item) => item.hoadon_id.toString()}
          renderItem={({ item }) => <OrderItem bill={item} />}
        />
      )}

      {/* Footer */}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  list:{
    margin:10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEE",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    margin:10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    padding: 8,
    flex: 1,
    height: 40,
  },
  noResultText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  itemContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#EEDCC6",
    marginVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 8,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inforText: {
    fontSize: 14,
    color: "#555",
  },
  statusText: {
    padding: 4,
    borderRadius: 4,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SearchOrderScreen;
