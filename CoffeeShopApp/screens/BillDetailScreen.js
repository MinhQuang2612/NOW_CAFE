import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../redux/userSlice";

const BillDetail = ({ navigation, route }) => {
  const user = useSelector((state) => state.user.user);
  // const { selectedItems, userId } = route.params || {
  //   selectedItems: [],
  //   userId: null,
  // };
  const selectedItems = useSelector((state) => state.cart.selectedItem);
  console.log("Selected Items", selectedItems);

  const [paymentSelected, setpaymentSelected] = useState(false);
  console.log("Selected Item", selectedItems);
  // console.log("user", user);
  const dispatch = useDispatch();
  // console.log('userData', user._id);

  const {voucher} = route.params || {voucher: null};

  useEffect(() => {
    if (user && user.userId) {
      dispatch(fetchUserDetails(user.userId));
    }
  }, [user]);
  console.log("user", user);
  // Address
  const Address = ({ user }) => {
    return (
      <View style={styles.addresContainer}>
        <Ionicons name="location" size={40} color="#FB452D" />
        <View>
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{user.name} </Text>
            <Text>(+84){user.phoneNumber}</Text>
          </View>
          <Text>{user.address} </Text>
        </View>
      </View>
    );
  };

  // Item Selected
  const Item = ({ item }) => {
    return (
      <View style={{ marginTop: 10 }}>
        <View style={styles.itemDetailContainer}>
          <Image source={{ uri: item.image }} style={styles.img} />

          <View>
            <Text style={styles.categoryText}>Category</Text>
            <Text style={styles.nameText}>{item.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>${item.price}</Text>
              <Text>Size: 100ml</Text>
            </View>
          </View>
          <Text>x{item.quantity}</Text>
        </View>

        <View style={styles.noteContainer}>
          <Text>Note:</Text>
          <TextInput placeholder="ABC " style={styles.input} />
        </View>
        <View style={styles.line}></View>
      </View>
    );
  };

  // Delivery Item
  const DeliveryItem = () => {
    return (
      <View style={styles.deliveryDetailContainer}>
        <Image source={require("../assets/images/deliveryItem.png")} />
        <View>
          <Text style={styles.deliveryName}>Fast delivery</Text>
          <Text>Recieve good at 19:30 - 20.0000</Text>
        </View>
      </View>
    );
  };
  // Voucher Item
  const VoucherItem = ({voucher}) => {
    return (
      <TouchableOpacity style={styles.voucherDetailContainer}
        onPress={() => navigation.navigate("Voucher")}
      >
        <Image source={require("../assets/images/voucher.png")} />
        <View>
          <Text style={styles.voucherText}>
            {voucher ? voucher.title : "Voucher"}
          </Text>
          <Text>
            {
            voucher ? (
              voucher.description.length > 30 ?
              voucher.description.substring(0, 30) + "..."
              : voucher.description

             ) : "Description"
            }


          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Payment Item
  const PaymentItem = () => {
    return (
      <TouchableOpacity
        style={
          paymentSelected
            ? [styles.paymentContainer, { backgroundColor: "#967259" }]
            : styles.paymentContainer
        }
        onPress={() => paymentHandle()}
      >
        <Image source={require("../assets/images/payment.png")} />
        <Text>Cash on Delivery</Text>
      </TouchableOpacity>
    );
  };
  // Xử lý

  const paymentHandle = () => {
    setpaymentSelected(!paymentSelected);
  };
  return (
    <View style={styles.container}>
      {/* HeadHead */}
      <View style={styles.head}>
        <AntDesign name="arrowleft" size={24} color="black" />
        <Text style={styles.title}>Your order</Text>
      </View>
      <ScrollView>
        {/* Address */}
        <Address user={user} />
        {/* Item */}
        <View style={styles.itemContainer}>
          {
            selectedItems.length > 0 ? selectedItems.map((item, index) => (
              <Item item={item} key={index} />
            )) : <Text>No item</Text>
          }

          {/* Order Recoment */}
          <View style={styles.otherContainer}>
            <Text style={styles.ortherTitle}>Order drinks we recoment</Text>
            <TouchableOpacity>
              <Text>See all</Text>
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

        {/* Delivery */}
        <View style={styles.deliveryContainer}>
          <Text style={styles.deliveryText}>Delivery</Text>
          <DeliveryItem />
        </View>

        {/* Voucher */}
        <View style={styles.voucherContainer}>
          <Text style={styles.deliveryText}>Voucher</Text>
          <VoucherItem voucher={voucher} />
        </View>

        {/* Payment */}
        <View style={styles.deliveryContainer}>
          <Text style={styles.deliveryText}>Payment method</Text>
          <PaymentItem />
          <PaymentItem />
        </View>
      </ScrollView>
    </View>
  );
};

export default BillDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEDCC6",
    paddingBottom: 20,
  },
  head: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    gap: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  //Adress
  addresContainer: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#FFF5E9",
    padding: 10,
    borderRadius: 10,
  },
  nameContainer: {
    flexDirection: "row",
    gap: 10,
  },
  nameText: {
    fontWeight: "bold",
  },
  //Item
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
  // Orther
  otherContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  ortherTitle: {
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
  otherContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  // Delivery
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
  // Delivery Detail
  deliveryDetailContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deliveryName: {
    fontWeight: "700",
  },
  // Voucher
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
});
