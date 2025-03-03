import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Footer from "../components/Footer";

const RecentlyOtherScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(true);

  const handleToggleTab = () => {
    setActiveTab(!activeTab);
  };

  // Khai báo dữ liệu mẫu cho bill
  const defaultBill = {
    hoadon_id: "12345",
    ChiTietHoaDon: {
      dateCreated: "2025-02-28",
      SanPham: [{}, {}, {}], // Giả định có 3 sản phẩm
    },
  };

  const Item = ({ bill, status }) => {
    const numberProduct = bill.ChiTietHoaDon.SanPham.length;
    return (
      <View style={styles.itemContainer}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dgqppqcbd/image/upload/v1739955485/B%C3%A1nh_tiramisu_mjr1rk.png",
          }}
          style={styles.image}
        />

        <View>
          <View style={styles.statusContainer}>
            <Text style={styles.nameText}>Order: {bill.hoadon_id}</Text>
            <Text
              style={[
                status === "Packing"
                  ? { backgroundColor: "#F2994A" }
                  : { backgroundColor: "#32CD32" },
                styles.statusText,
              ]}
            >
              {status}
            </Text>
          </View>

          <Text style={styles.inforText}>
            Date: {bill.ChiTietHoaDon.dateCreated}
          </Text>
          <Text style={styles.inforText}>Product({numberProduct})</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Thanh tiêu đề với nút Tìm kiếm và Thông báo */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Orders</Text>
        <View style={styles.iconContainer}>
          {/* Nút Tìm kiếm */}
          <TouchableOpacity onPress={() => navigation.navigate("SearchOrder")}>
            <Ionicons name="search" size={24} color="967259" />
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
          onPress={handleToggleTab}
        >
          <Text style={styles.textTab}>Recently</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            { borderTopRightRadius: 10, borderBottomRightRadius: 10 },
            activeTab ? styles.unselected : styles.selected,
          ]}
          onPress={handleToggleTab}
        >
          <Text style={styles.textTab}>Past Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung tab */}
      <View style={styles.contentContainer}>
        {activeTab ? (
          <Item bill={defaultBill} status={"Packing"} />
        ) : (
          <Item bill={defaultBill} status={"Completed"} />
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
    top:-20,
    paddingVertical: 15,
    backgroundColor: "#EEDCC6",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "967259",
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
