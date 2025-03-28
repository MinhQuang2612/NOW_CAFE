//chitietdơnhangbandau

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import Navbar from "../components/Navbar";
import { Octicons, Ionicons } from "@expo/vector-icons";
import Footer from "../components/Footer";

const bill = {
  hoadon_id: "HD0001",
  user: {
    user_id: "user0001",
    name: "Tran Minh Quang",
    phoneNumber: "0123456789",
    address: "Ho Chi Minh, Vietnam",
  },
  ChiTietHoaDon: {
    chitiethoadon_id: "CTHD0001",
    SanPham: [
      {
        productId: "SP0001",
        name: "Cà phê sữa đá",
        quantity: 1,
        price: 25000,
      },
      {
        productId: "SP0002",
        name: "Cà phê sữa đá",
        quantity: 1,
        price: 25000,
      },
    ],
    dateCreated: "2024-02-18T10:00:00Z",
  },
  tongTien: 25000,
};

const OderDetailScreen = () => {
    const testStatus =2;
  /* Status 
        0: Order pleased
        1: Packing
        2: Shipping
        3: Delivered
    */
  const StatusProcess = ({ status }) => {
    return (
      <View>
        <View style={styles.statusContainer}>
          <Octicons
            name="dot-fill"
            size={40}
            color={status >= 0 ? "#00EC4B" : "#EEDCC6"}
          />

          {[...Array(3)].map((_, index) => {
            return (
              <View key={index} style={styles.statusContainer}>
                <View
                  style={[
                    styles.processLine,
                    { borderColor: index < status ? "#00EC4B" : "#EEDCC6" },
                  ]}
                />
                {status - 1 === index ? (
                  <Octicons
                    name="check-circle-fill"
                    size={40}
                    color="#00EC4B"
                  />
                ) : (
                  <Octicons
                    name="dot-fill"
                    size={40}
                    color={index < status ? "#00EC4B" : "#EEDCC6"}
                  />
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>Order</Text>
          <Text style={styles.statusText}>Packing</Text>
          <Text style={styles.statusText}>Shipping</Text>
          <Text style={styles.statusText}>Delivered</Text>
        </View>
      </View>
    );
  };

  const ProductItem = ({ product }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.productContainer}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/dgqppqcbd/image/upload/v1739955485/B%C3%A1nh_tiramisu_mjr1rk.png",
            }}
            style={styles.image}
          />
          <View>
            <Text>Category</Text>
            <Text style={[styles.nameText, { textTransform: "uppercase" }]}>
              {product.name}
            </Text>
            <View style={styles.addressContainer}>
              <Text>Price: {product.price}</Text>
              <Text>Size: 100ml</Text>
            </View>
          </View>
          <Text>x{product.quantity}</Text>
        </View>
        <View style={styles.noteContainer}>
          <Text>Note:</Text>
          <TextInput
            style={styles.input}
            placeholder="Note"
            placeholderTextColor="#0000004D"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Navbar user={{ name: "Hiep Hinh" }} />
      <Text style={styles.titleText}>Track your order</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.orderContainer}>
          <Text style={styles.orderText}>Order: {bill.hoadon_id}</Text>
          <Text style={styles.dateText}>
            Date: {bill.ChiTietHoaDon.dateCreated}
          </Text>
        </View>
        {/* Status */}
        <StatusProcess status={testStatus} />

        {/* Address */}
        <View style={styles.itemContainer}>
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={50} color="#FB452D" />
            <View>
              <View style={styles.addressContainer}>
                <Text style={styles.nameText}>{bill.user.name}</Text>
                <Text>(+84) {bill.user.phoneNumber}</Text>
              </View>
              <Text>{bill.user.address}</Text>
            </View>
          </View>
        </View>
        {/* Product */}
        <View style={styles.itemContainer}>
          {bill.ChiTietHoaDon.SanPham.map((product, index) => {
            return <ProductItem key={index} product={product} />;
          })}
        </View>

        {/* Total payment */}
        <View style={styles.itemContainer}>
          <Text style={styles.tileName}>Payment details </Text>

          <View style={styles.priceItem}>
            <Text style={styles.namePrice}>Subtotal: </Text>
            <Text>${bill.tongTien}</Text>
          </View>

          <View style={styles.priceItem}>
            <Text style={styles.namePrice}>Delivery fee: </Text>
            <Text>$0</Text>
          </View>

          <View style={styles.priceItem}>
            <Text style={styles.namePrice}>Packing fee: </Text>
            <Text>$0</Text>
          </View>

          <View style={styles.priceItem}>
            <Text style={styles.namePrice}>Promo: </Text>
            <Text>$0</Text>
          </View>

          <View style={styles.priceItem}>
            <Text style={styles.namePrice}>TOTAL: </Text>
            <Text style={styles.totalPrice}>$0</Text>
          </View>
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Contact us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button,{backgroundColor: "#834D1E"}]}>
            {
                testStatus === 3 ? <Text style={[styles.buttonText,{color:'white'}]}>Recived</Text> : <Text style={[styles.buttonText,{color:'white'}]}>Cancel order</Text>
            }
        </TouchableOpacity>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

export default OderDetailScreen;

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
  // Nội dung
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
  // StatusProcess
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 105,
  },
  processLine: {
    borderColor: "#EEDCC6",
    flex: 1,
    borderWidth: 2,
  },
  statusText: {
    color: "#EEDCC6",
    fontSize: 12,
    fontWeight: "bold",
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  // Address
  itemContainer: {
    backgroundColor: "#FFF5E9",
    padding: 10,
    marginTop: 20,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderColor: "#834D1E",
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
  // Product
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  productContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  input: {
    backgroundColor: "#EEDCC6",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    width: 200,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
    marginTop: 10,
  },
  // Total payment
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
    // Button
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 100
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
