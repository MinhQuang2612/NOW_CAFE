import React from "react";
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Octicons, Ionicons } from "@expo/vector-icons";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useNavigation } from "@react-navigation/native";

const OrderDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { order } = route.params;

  if (!order) {
    return <Text>No order data</Text>;
  }

  const StatusProcess = ({ status }) => {
    const statusList = ["Order pleased", "Packing", "On the way", "Completed"];
  
    const statusIndex = statusList.indexOf(status);
  
    return (
      <View style={styles.statusContainer}>
        {statusList.map((item, index) => (
          <View key={index} style={styles.statusItem}>
            <View
              style={[
                styles.circle,
                { backgroundColor: index <= statusIndex ? "#00EC4B" : "#EEDCC6" },
              ]}
            >
              {index <= statusIndex && (
                <Octicons name="check-circle-fill" size={20} color="white" />
              )}
            </View>

            <Text
              style={[
                styles.statusText,
                { color: index <= statusIndex ? "#00EC4B" : "#EEDCC6" },
              ]}
            >
              {item}
            </Text>
            {index < statusList.length - 1 && (
              <View
                style={[
                  styles.line,
                  { borderColor: index < statusIndex ? "#00EC4B" : "#EEDCC6" },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Navbar user={{ name: order.user.name }} />
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.titleText}>Track your order</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        <View style={styles.orderContainer}>
          <Text style={styles.orderText}>Order: {order.hoadon_id}</Text>
          <Text style={styles.dateText}>
            Date: {new Date(order.ChiTietHoaDon.dateCreated).toLocaleString("vi-VN")}
          </Text>
        </View>

        <StatusProcess status={order.status} />

        {/* Address */}
        <View style={styles.itemContainer}>
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={50} color="#FB452D" />
            <View>
              <Text style={styles.productPrice}>{order.user.name}</Text>
              <Text style={styles.productPrice}>(+84) {order.user.phoneNumber}</Text>
              <Text style={styles.productPrice}>{order.user.address}</Text>
            </View>
          </View>
        </View>

        {/* Product List */}
        <View style={styles.productWrapper}>
          {order.ChiTietHoaDon.SanPham.map((product, index) => (
            <View key={index} style={styles.productContainer}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <View style={styles.productDetailsContainer}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>${product.price} Size: {product.size} ml</Text>
                <Text style={styles.productPrice}>Quantity: {product.quantity}</Text>
                <Text style={styles.productPrice}>Note: {product.note}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment details */}
        <View style={styles.itemContainer}>
          <Text style={styles.tileName}>Payment details</Text>
          <View style={styles.priceItem}>
            <Text style={styles.productPrice}>Subtotal: </Text>
            <Text style={styles.productPrice}>{order.tongTien}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Contact us</Text>
          </TouchableOpacity>
          {order.status === "Order pleased" && (
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: "#834D1E" }]}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>
                Cancel order
              </Text>
            </TouchableOpacity>
          )}
          {order.status === "Completed" && (
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: "#834D1E" }]}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>
                Received
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120,
    backgroundColor: "#EEDCC6",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  contentContainer: {
    backgroundColor: "#230C02",
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  orderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EEDCC6",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 12,
    color: "#EEDCC6",
    marginBottom: 20,
  },
  orderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    width: "100%",
  },
  statusItem: {
    alignItems: "center",
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  line: {
    flex: 1,  
    height: 2, 
    marginHorizontal: 5,
  },
  itemContainer: {
    backgroundColor: "#FFF5E9",
    padding: 10,
    marginTop: 5,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderColor: "#834D1E",
    marginBottom: 5,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#967259",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    padding: 10,
  },
  productWrapper: {
    marginTop: 5,
    padding: 5,
    backgroundColor: "#EEDCC6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#834D1E",
    marginBottom: 5,
  },
  productContainer: {
    flexDirection: "row", 
    marginBottom: 5, 
    backgroundColor: "#FFF5E9",
    padding: 5,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderColor: "#EEDCC6",
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 5, 
  },
  productDetailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  productPrice: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold",
  },
  productQuantity: {
    fontSize: 14,
    color: "black",
  },
  productNote: {
    fontSize: 12,
    color: "#7D6C56",
  },
  priceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#967259",
  },
  namePrice: {
    fontWeight: "bold",
    color: "#967259",
  },
  totalPrice: {
    fontWeight: "bold",
    color: "#967259",
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    marginBottom: 5,
  },
  buttonText: {
    color: "#834D1E",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#FFF5E9",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: 150,
  },
});
