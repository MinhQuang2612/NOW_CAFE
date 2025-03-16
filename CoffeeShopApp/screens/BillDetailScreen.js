import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../redux/userSlice";
import { WebView } from "react-native-webview";

const BillDetail = ({ navigation, route }) => {
  const user = useSelector((state) => state.user.user);
  const selectedItems = useSelector((state) => state.cart.selectedItem) || [];
  const [paymentSelected, setPaymentSelected] = useState(null);
  const dispatch = useDispatch();
  const { voucher } = route.params || { voucher: null };

  const [userAddress, setUserAddress] = useState(user?.address || "Danang, Vietnam");
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!userAddress) return;
      const coords = await getUserCoordsFromAddress(userAddress);
      setUserCoords(coords);
    };
    fetchCoordinates();
  }, [userAddress]);

  useEffect(() => {
    if (user && user.userId) {
      dispatch(fetchUserDetails(user.userId));
    }
    if (user?.address && user.address !== userAddress) {
      setUserAddress(user.address);
    }
    calculateDistanceAndFee();
  }, [user, userCoords]);

  const calculateDistanceAndFee = () => {
    const shopCoords = { latitude: 10.8142, longitude: 106.6678 };
    if (userCoords) {
      const distance = calculateDistance(shopCoords, userCoords);
      setDeliveryDistance(distance);

      const baseDistance = 5;
      const baseFee = 2;
      const additionalFeePer5km = 2;
      const distanceIn5kmIncrements = Math.ceil(distance / baseDistance);
      const calculatedFee = baseFee + (distanceIn5kmIncrements - 1) * additionalFeePer5km;
      setDeliveryFee(Math.max(calculatedFee, baseFee));
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getUserCoordsFromAddress = async (address) => {
    try {
      await delay(1000); // Đợi 1 giây để tránh rate limit
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        {
          headers: {
            "User-Agent": "CoffeeShopApp/1.0.0 (nhuy126833@gmail.com)",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      console.warn("No coordinates found for address, using default coordinates");
      return { latitude: 10.7769, longitude: 106.7009 };
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return { latitude: 10.7769, longitude: 106.7009 };
    }
  };

  const calculateDistance = (coord1, coord2) => {
    const R = 6371;
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const toRad = (value) => (value * Math.PI) / 180;

  const handleEditAddress = () => {
    navigation.navigate("AddLocation", {
      currentAddress: userAddress,
    });
  };

  const calculatePaymentDetails = () => {
    const packagingFee = 2.0;
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    const promoDiscount = voucher ? parseFloat(voucher.discount) || 0 : 0;
    const total = subtotal + deliveryFee + packagingFee - promoDiscount;

    return {
      subtotal: subtotal.toFixed(1),
      deliveryFee: deliveryFee.toFixed(1),
      packagingFee: packagingFee.toFixed(1),
      promoDiscount: promoDiscount.toFixed(1),
      total: total.toFixed(1),
    };
  };

  const paymentDetails = calculatePaymentDetails();

  const MapComponent = ({ shopCoords, userCoords }) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Leaflet Map</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
          <style>
            #map { height: 100%; width: 100%; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
          <script>
            var map = L.map('map').setView([10.8142, 106.6678], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            L.marker([10.8142, 106.6678]).addTo(map).bindPopup('Shop Location');
            L.marker([${userCoords?.latitude || 10.7769}, ${userCoords?.longitude || 106.7009}]).addTo(map).bindPopup('Delivery Location');
          </script>
        </body>
      </html>
    `;

    return <WebView source={{ html }} style={styles.map} />;
  };

  const Address = ({ user }) => (
    <TouchableOpacity onPress={handleEditAddress} style={styles.addressContainer}>
      <Ionicons name="location" size={40} color="#FB452D" />
      <View style={styles.addressContent}>
        <Text style={styles.nameText}>{user?.name || "Nguyen Thi Nu Y"}</Text>
        <Text style={styles.phoneText}>(+84) {user?.phoneNumber || "0123456791"}</Text>
        <Text style={styles.addressText}>{userAddress}</Text>
      </View>
    </TouchableOpacity>
  );

  const Item = ({ item }) => (
    <View style={{ marginTop: 10 }}>
      <View style={styles.itemDetailContainer}>
        <Image source={{ uri: item.image || "https://picsum.photos/200/300" }} style={styles.img} resizeMode="cover" />
        <View>
          <Text style={styles.nameText}>{item.name || "Ice Milk Coffee"}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${item.price || 0}</Text>
            <Text>Size: 100ml</Text>
          </View>
        </View>
        <Text>x{item.quantity || 1}</Text>
      </View>
      <View style={styles.noteContainer}>
        <Text>Note:</Text>
        <TextInput placeholder="ABC" style={styles.input} />
      </View>
      <View style={styles.line}></View>
    </View>
  );

  const DeliveryItem = () => (
    <View style={styles.deliveryDetailContainer}>
      <Image source={require("../assets/images/deliveryItem.png")} resizeMode="cover" />
      <View>
        <Text style={styles.deliveryName}>Fast Delivery</Text>
        <Text>Receive goods from 19:30 - 20:00</Text>
      </View>
    </View>
  );

  const VoucherItem = ({ voucher }) => (
    <TouchableOpacity style={styles.voucherDetailContainer} onPress={() => navigation.navigate("Voucher")}>
      <Image source={require("../assets/images/voucher.png")} resizeMode="cover" />
      <View>
        <Text style={styles.voucherText}>{voucher ? voucher.title : "Free ship: HAPPY DAY"}</Text>
        <Text>
          {voucher
            ? voucher.description.length > 30
              ? voucher.description.substring(0, 30) + "..."
              : voucher.description
            : "Receive goods from 19:30 - 20:00"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const PaymentItem = ({ method, index }) => (
    <TouchableOpacity
      style={paymentSelected === index ? [styles.paymentContainer, { backgroundColor: "#967259" }] : styles.paymentContainer}
      onPress={() => setPaymentSelected(index)}
    >
      <Image source={require("../assets/images/payment.png")} resizeMode="cover" />
      <Text>{method}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.head}>
        <AntDesign name="arrowleft" size={24} color="black" onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Your Order</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={true}>
        <Address user={user} />
        <View style={styles.mapContainer}>
          <MapComponent shopCoords={{ latitude: 10.8142, longitude: 106.6678 }} userCoords={userCoords} />
          <Text style={styles.distanceText}>
            Estimated Distance: {deliveryDistance} km | Delivery Fee: ${deliveryFee}
          </Text>
        </View>
        <View style={styles.itemContainer}>
          {selectedItems.length > 0
            ? selectedItems.map((item, index) => <Item key={index} item={item} />)
            : <Text>No items</Text>}
          <View style={styles.otherContainer}>
            <Text style={styles.otherTitle}>Other drinks we recommend</Text>
            <TouchableOpacity><Text>See all</Text></TouchableOpacity>
          </View>
          <View style={styles.otherItemContainer}>
            <View>
              <Image source={{ uri: "https://picsum.photos/200/300" }} style={styles.imageOther} resizeMode="cover" />
              <View style={styles.otherItem}>
                <Text style={styles.name}>Product Name</Text>
                <Text style={styles.name}>$15.5</Text>
              </View>
            </View>
            <View>
              <Image source={{ uri: "https://picsum.photos/200/300" }} style={styles.imageOther} resizeMode="cover" />
              <View style={styles.otherItem}>
                <Text style={styles.name}>Product Name</Text>
                <Text style={styles.name}>$15.5</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.deliveryContainer}>
          <Text style={styles.deliveryText}>Delivery</Text>
          <DeliveryItem />
        </View>
        <View style={styles.voucherContainer}>
          <Text style={styles.deliveryText}>Voucher</Text>
          <VoucherItem voucher={voucher} />
        </View>
        <View style={styles.deliveryContainer}>
          <Text style={styles.deliveryText}>Payment Method</Text>
          <PaymentItem method="Cash on Delivery" index={0} />
          <PaymentItem method="Cash on Delivery" index={1} />
        </View>
        <View style={styles.paymentDetailContainer}>
          <Text style={styles.deliveryText}>Payment Details</Text>
          <View style={styles.paymentDetailRow}>
            <Text style={styles.paymentDetailLabel}>Subtotal ({selectedItems.length})</Text>
            <Text style={styles.paymentDetailValue}>${paymentDetails.subtotal}</Text>
          </View>
          <View style={styles.paymentDetailRow}>
            <Text style={styles.paymentDetailLabel}>Delivery Fee</Text>
            <Text style={styles.paymentDetailValue}>${paymentDetails.deliveryFee}</Text>
          </View>
          <View style={styles.paymentDetailRow}>
            <Text style={styles.paymentDetailLabel}>Packaging Fee</Text>
            <Text style={styles.paymentDetailValue}>${paymentDetails.packagingFee}</Text>
          </View>
          {voucher && (
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>Promo</Text>
              <Text style={[styles.paymentDetailValue, { color: "green" }]}>-${paymentDetails.promoDiscount}</Text>
            </View>
          )}
          <View style={[styles.paymentDetailRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 10 }]}>
            <Text style={[styles.paymentDetailLabel, { fontWeight: "bold", fontSize: 18 }]}>TOTAL</Text>
            <Text style={[styles.paymentDetailValue, { fontWeight: "bold", fontSize: 18, color: "red" }]}>${paymentDetails.total}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.orderButton}>
          <Text style={styles.orderButtonText}>Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEDCC6", paddingBottom: 20 },
  head: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    gap: 20,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FFF5E9",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#FFF5E9",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressContent: { flex: 1 },
  nameText: { fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  phoneText: { fontSize: 14, color: "#555", marginBottom: 2 },
  addressText: { fontSize: 14, color: "#333" },
  mapContainer: { marginHorizontal: 20, marginTop: 10, height: 200, borderRadius: 10, overflow: "hidden" },
  map: { ...StyleSheet.absoluteFillObject },
  distanceText: { padding: 10, textAlign: "center", backgroundColor: "#FFF5E9", fontSize: 14, color: "#333" },
  img: { width: 70, height: 70, borderRadius: 10 },
  priceContainer: { flexDirection: "row", gap: 20 },
  itemDetailContainer: { flexDirection: "row", gap: 20, alignItems: "center" },
  itemContainer: {
    backgroundColor: "#FFF5E9",
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  input: { backgroundColor: "#EEDCC6", borderRadius: 5, padding: 5, marginTop: 10, width: 200 },
  noteContainer: { flexDirection: "row", padding: 10, alignItems: "center", gap: 20 },
  line: { borderWidth: 0.5, borderColor: "#ccc" },
  otherContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 },
  otherTitle: { fontSize: 18, fontWeight: "700" },
  otherItemContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  imageOther: { width: 140, height: 120, borderRadius: 10 },
  otherItem: { position: "absolute", bottom: 10, left: 10 },
  name: { color: "white", textShadowColor: "rgba(0, 0, 0, 0.75)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 },
  deliveryContainer: {
    backgroundColor: "#FFF5E9",
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 10,
    borderRadius: 10,
  },
  deliveryText: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  deliveryDetailContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  deliveryName: { fontWeight: "700" },
  voucherContainer: { backgroundColor: "#FFF5E9", marginHorizontal: 20, padding: 10, borderRadius: 10 },
  voucherText: { fontWeight: "700" },
  voucherDetailContainer: {
    flexDirection: "row",
    backgroundColor: "#EEDCC6",
    padding: 10,
    borderRadius: 10,
    gap: 10,
    alignItems: "center",
  },
  paymentContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#EEDCC6",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: "center",
  },
  paymentDetailContainer: {
    backgroundColor: "#FFF5E9",
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
  },
  paymentDetailRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 5 },
  paymentDetailLabel: { fontSize: 16 },
  paymentDetailValue: { fontSize: 16 },
  orderButton: {
    backgroundColor: "#FF4D4D",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: "center",
  },
  orderButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

