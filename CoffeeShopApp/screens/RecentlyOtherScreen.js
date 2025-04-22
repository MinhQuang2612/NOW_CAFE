import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Footer from "../components/Footer";

const RecentlyOtherScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId } = route.params;  // Lấy userId từ navigation parameters

  const [activeTab, setActiveTab] = useState(true);  // Khai báo activeTab
  const [orders, setOrders] = useState([]);  // State để lưu đơn hàng
  const [loading, setLoading] = useState(true);  // State để theo dõi việc tải dữ liệu
  const [error, setError] = useState(null);  // State để theo dõi lỗi
  const [searchText, setSearchText] = useState("");  // State cho ô tìm kiếm

  useEffect(() => {
    if (userId) {
      fetchOrders(userId);  // Gọi API khi component mount và userId có giá trị
    }
  }, [userId]);

  const fetchOrders = async (userId) => {
    try {
      const response = await fetch (`${process.env.EXPO_PUBLIC_API_URL}/api/orders/${userId}`)  ;
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);  // Lưu dữ liệu đơn hàng vào state
      } else {
        setError("Không có đơn hàng nào cho người dùng này.");
      }
    } catch (error) {
      setError("Lỗi khi lấy dữ liệu từ API.");
    } finally {
      setLoading(false);
    }
  };

  // Lọc đơn hàng theo trạng thái
  const recentOrders = orders.filter((order) => order.status !== "Completed");
  const pastOrders = orders.filter((order) => order.status === "Completed");

  // Lọc đơn hàng theo từ khóa tìm kiếm
  const filteredOrders = searchText
    ? orders.filter((order) => {
        const orderId = order.hoadon_id.toString();
        const productName = order.ChiTietHoaDon?.SanPham?.map((sp) => sp.name).join(" ") || "";
        const orderDate = new Date(order.ChiTietHoaDon?.dateCreated).toLocaleDateString("vi-VN");

        // Tìm kiếm không phân biệt chữ hoa hay chữ thường
        return (
          orderId.includes(searchText) ||
          productName.toLowerCase().includes(searchText.toLowerCase()) ||
          orderDate.includes(searchText)
        );
      })
    : orders;  // Nếu ô tìm kiếm trống, hiển thị tất cả các đơn hàng

  const OrderItem = ({ bill }) => {
    const firstProduct = bill.ChiTietHoaDon?.SanPham[0];
    const totalProducts = bill.ChiTietHoaDon?.SanPham.reduce(
      (sum, product) => sum + product.quantity,
      0
    );

    return (
      <TouchableOpacity onPress={() => navigation.navigate("OrderDetail", { order: bill })}>
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
        <Text style={styles.headerText}>Orders</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() =>
          navigation.navigate("SearchOrder", { orders: orders }) // Truyền đơn hàng qua navigate
        }>
            <Ionicons name="search" size={24} color="#967259" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tìm kiếm */}
      {/* <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập ID, tên sản phẩm hoặc ngày (dd/mm/yyyy)"
          placeholderTextColor="#AAA"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View> */}

      {/* Tab selection */}
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

      {/* Display orders */}
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#230C02" />
        ) : error ? (
          <Text>Error: {error}</Text>
        ) : (
          <FlatList
            data={activeTab ? recentOrders : pastOrders} // Sử dụng recentOrders hoặc pastOrders theo tab
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEE",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    margin: 10,
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
});

export default RecentlyOtherScreen;
