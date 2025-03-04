import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BillScreen({ route, navigation }) {

  // Nếu không có route.params, tạo dữ liệu mặc định để test
  
  const { selectedItems, totalAmount } = route?.params;
  const [address, setAddress] = useState("123 Đường ABC, TP. HCM");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [discountCode, setDiscountCode] = useState("");

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 5; // Giả sử phí giao hàng cố định
  const packagingFee = 2; // Giả sử phí đóng gói cố định
  const promo = discountCode ? -10 : 0; // Giảm giá nếu có mã giảm giá
  const total = subtotal + deliveryFee + packagingFee + promo;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 20 }} 
      showsVerticalScrollIndicator={true}
    >

      <View style={styles.view1}> 
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#d2691e" />
          </TouchableOpacity>
          <Text style={styles.title}>Your order</Text>
      </View>
      <View style={styles.view2}> 
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.butđiaiem}>
            <Ionicons name="location-outline" size={24} color="#d2691e" />
          </TouchableOpacity>
          <View style={styles.view3}> 
              <Text >Selenay</Text>
              <Text >Address</Text>
          </View>
      </View>
      <View style={styles.view3}> 
        {selectedItems.map((item, index) => (
            <View key={index} style={styles.productItem}>
            <View style={styles.view2}>
              <Image
                  source={{ uri: item.image }} 
                  style={{
                    width: 100,
                    height: 100,
                  }}
                />
            <View style={{
              width:135,
            }}> 
                <Text style={{
                  fontWeight: "bold",
                }} >{item.name}</Text>
                <View style={styles.view2}>
                  <Text style={{
                    color:'brown',
                    marginRight:15
                  }}>${item.price}</Text>
                  <Text>Size: {item.size}</Text>
                </View>
            </View>
            <View style={{
              paddingTop:30,
              paddingLeft:15,
            }}>
              <Text style={{
                fontWeight: "bold",
              }}>x{item.quantity}</Text>
            </View>
        </View>
        <View style={styles.view4}>
              <Text style={{
                padding:10,
              }}>Note:</Text>
              <Text style={{
                backgroundColor:"#EEDCC6",
                padding:10,
                width:150,
                borderRadius:10,
              }}>{item.note}</Text>
            </View>
        </View>
        ))}
        <View style={styles.view5}>
          <Text style={styles.text1}>Other drinks we recommend</Text>
          <TouchableOpacity>
            <Text style={styles.text1}>See all</Text>
          </TouchableOpacity>
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
      </View>
      <View style={styles.view3}> 
        <Text style={styles.title}>Delivery</Text>
        <View style={styles.the}>
          <Image
            source={{ uri: "https://res.cloudinary.com/dgqppqcbd/image/upload/v1741017143/shipper_ynbzdb.webp" }}
            style={{
              width: 65,
              height: 50,
            }}
          />
          <View style={styles.view6}> 
              <Text style={styles.text1}>Fast delivery</Text>
              <Text >Receive goods at 19:30-20:00</Text>
          </View>
        </View>
        <View style={styles.the}>
          <Image
            source={{ uri: "https://res.cloudinary.com/dgqppqcbd/image/upload/v1741017143/shipper_ynbzdb.webp" }}
            style={{
              width: 65,
              height: 50,
            }}
          />
          <View style={styles.view6}> 
              <Text style={styles.text1}>Fast delivery</Text>
              <Text >Receive goods at 19:30-20:00</Text>
          </View>
        </View>

      </View>

      <View style={styles.view3}> 
        <View style={styles.view8}>
          <Text style={styles.title}>Voucher</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Voucher")}>
            <Text style={styles.text1}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.the}>
          <Image
            source={{ uri: "https://res.cloudinary.com/dgqppqcbd/image/upload/v1741018042/voucherfreeship_al6agv.png" }}
            style={{ 
              width: 65,
              height: 50,
            }}
          />
          <View style={styles.view6}> 
              <Text style={styles.text1}>Free ship: HAPPY DAY </Text>
              <Text >Receive goods at 19:30-20:00</Text>
          </View>
        </View>
      </View>

      <View style={styles.view3}> 
        <Text style={styles.title}>Payment method</Text>
        <View style={styles.the}> 
          <Image
            source={{ uri: "https://res.cloudinary.com/dgqppqcbd/image/upload/v1741018530/tien_plrfy0.png" }}
            style={{
              width: 65,
              height: 50,
            }}
          />
          <View style={styles.view6}> 
              <Text style={styles.text1}>Cash on Delivery</Text>
          </View>
        </View>
        <View style={styles.the}> 
          <Image
              source={{ uri: "https://res.cloudinary.com/dgqppqcbd/image/upload/v1741018530/tien_plrfy0.png" }}
              style={{
                width: 65,
                height: 50,
              }}
            />
            <View style={styles.view6}> 
                <Text style={styles.text1}>Cash on Delivery</Text>
            </View>
        </View>
        <View style={styles.the}> 
          <Image
              source={{ uri: "https://res.cloudinary.com/dgqppqcbd/image/upload/v1741018530/tien_plrfy0.png" }}
              style={{
                width: 65,
                height: 50,
              }}
            />
            <View style={styles.view6}> 
                <Text style={styles.text1}>Cash on Delivery</Text>
            </View>
        </View>
      </View>

      <View style={styles.view3}> 
        <Text style={styles.title}>Payment details</Text>
        <View style={styles.view8}>
            <Text>Subtotal</Text>
            <Text>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.view8}>
            <Text>Delivery fee</Text>
            <Text>${deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={styles.view8}>
            <Text>Packaging fee</Text>
            <Text>${packagingFee.toFixed(2)}</Text>
        </View>
        <View style={styles.view8}>
            <Text>Promo</Text>
            <Text>${promo.toFixed(2)}</Text>
        </View>
        <View style={styles.view8}>
            <Text style={{ fontWeight: "bold" }}>TOTAL</Text>
            <Text style={{ fontWeight: "bold", color: 'brown' }}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={() => alert("Thanh toán thành công!")}>
          <Text style={styles.payText}>Order</Text>
        </TouchableOpacity>
      </View>

        
     </ScrollView>
  );
}


const styles = StyleSheet.create({
  the:{
    flexDirection: "row",
    paddingLeft:10,
    padding:10,
    marginTop:5,
    backgroundColor:"#EEDCC6",
    borderRadius:10,
    margin:5,
  },
  view7:{
    backgroundColor:"#EEDCC6",
  },
  view6:{
    marginLeft:15,
  },
  container: { flex: 1, padding: 20, backgroundColor: "#EEDCC6"},
  imageOther: {
    width: 160,
    height: 160,
    borderRadius: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    textTransform: "uppercase",
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
    width: 150,
    height: 100,
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
  text1:{
    fontWeight:'bold',
    fontSize:14,
  },
  view1:{
    flexDirection: "row",
  },view5:{
    padding:10,
    flexDirection: "row",
    justifyContent:"space-between",
  },
  view2:{
    flexDirection: "row",
    borderRadius:10,
    backgroundColor:"white",
    padding: 10,
  },
  view8:{
    justifyContent:"space-between",
    flexDirection: "row",
    borderRadius:10,
    backgroundColor:"white",
    padding: 10,
  },
  butđiaiem:{
    margin:5,
    marginRight:10,
  },
  view4:{
    flexDirection: "row",
    backgroundColor:"white",
    padding:5,
  },
  view3:{
    padding:5,
    paddingBottom:5,
    backgroundColor:"white",
    borderRadius:15,
    marginTop:10,
    marginBottom:10,
  },
  text:{
    color:"EEDCC6",
  },
  backButton: { flexDirection: "row",alignItems: "center", marginBottom: 10, marginRight:30, },
  backText: { fontSize: 18, marginLeft: 10 },
  title: { fontSize: 22, fontWeight: "bold",  marginBottom: 10, color:"#d2691e" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginVertical: 5 },
  selected: { fontWeight: "bold", color: "green", marginVertical: 5 },
  unselected: { color: "gray", marginVertical: 5 },
  productItem: { padding: 10, borderBottomWidth: 1 },
  total: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  payButton: { backgroundColor: "brown", right:-180,padding: 15, marginTop: 10, alignItems: "center", borderRadius:15, width:120 },
  payText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
