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
  ActivityIndicator,
  Alert,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../redux/userSlice";
import { WebView } from "react-native-webview";
import { clearCart } from "../redux/cartSlice";
import NetInfo from '@react-native-community/netinfo';
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"; 

const BillDetail = ({ navigation, route }) => {
  const user = useSelector((state) => state.user.user);
  const selectedItems = useSelector((state) => state.cart.selectedItem) || [];
  const [paymentSelected, setPaymentSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [isUsingDefaultCoords, setIsUsingDefaultCoords] = useState(false);
  const dispatch = useDispatch();
  const { voucher, newAddress } = route.params || { voucher: null, newAddress: null };

  const [userAddress, setUserAddress] = useState(user?.address || "Danang, Vietnam");
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [userCoords, setUserCoords] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const shopCoords = { latitude: 10.7981, longitude: 106.6698 }; // 14 Nguyen Van Bao, phuong 3, Go Vap, TPHCM

  // Log user state to debug
  useEffect(() => {
    console.log("User state from Redux:", user);
  }, [user]);

  // Kiểm tra kết nối mạng
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        Alert.alert(
          "Không có kết nối mạng",
          "Vui lòng kết nối mạng để tiếp tục."
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // Update address when coming back from AddLocation screen
  useEffect(() => {
    if (newAddress) {
      console.log("New address received:", newAddress);
      setUserAddress(newAddress);
    }
  }, [newAddress]);

  // Fetch coordinates when address changes
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!userAddress) return;
      console.log("Fetching coords for address:", userAddress);
      setIsMapLoading(true);
      try {
        const coords = await getUserCoordsFromAddress(userAddress);
        setUserCoords(coords);

        if (coords.latitude === 10.7769 && coords.longitude === 106.7009) {
          setIsUsingDefaultCoords(true);
          Alert.alert(
            "Thông báo",
            "Không thể tìm thấy tọa độ chính xác cho địa chỉ này. Đang sử dụng vị trí mặc định.",
            [
              {
                text: "Sửa địa chỉ",
                onPress: handleEditAddress,
              },
              {
                text: "Tiếp tục",
                style: "default",
              },
            ]
          );
        } else {
          setIsUsingDefaultCoords(false);
        }

        calculateDistanceAndFee(coords);
      } catch (error) {
        console.error("Failed to fetch coordinates:", error);
        setUserCoords({ latitude: 10.7769, longitude: 106.7009 });
        setIsUsingDefaultCoords(true);
        calculateDistanceAndFee({ latitude: 10.7769, longitude: 106.7009 });
      } finally {
        setIsMapLoading(false);
      }
    };
    fetchCoordinates();
  }, [userAddress]);

  // Fetch user details when user changes
  useEffect(() => {
    if (user && user.user_id) { // Sử dụng user_id thay vì userId
      dispatch(fetchUserDetails(user.user_id));
    }
    if (user?.address && user.address !== userAddress && !newAddress) {
      setUserAddress(user.address);
    }
  }, [user]);

  const calculateDistanceAndFee = (coords) => {
    if (coords) {
      const distance = calculateDistance(shopCoords, coords);
      setDeliveryDistance(distance);

      const baseDistance = 5;
      const baseFee = 5;
      const additionalFeePer5km = 1;
      const distanceIn5kmIncrements = Math.max(1, Math.ceil(distance / baseDistance));
      const calculatedFee = baseFee + (distanceIn5kmIncrements - 1) * additionalFeePer5km;
      setDeliveryFee(calculatedFee);
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getUserCoordsFromAddress = async (address) => {
    try {
      if (!address || address.trim() === '') {
        console.log("Địa chỉ trống, sử dụng tọa độ mặc định");
        return { latitude: 10.7769, longitude: 106.7009 };
      }

      await delay(1000);

      const encodedAddress = encodeURIComponent(address);
      console.log("Encoded address:", encodedAddress);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&addressdetails=1&limit=1`,
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
      console.log("API Response:", data);

      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }

      console.warn("Không tìm thấy tọa độ, thử yêu cầu lại với địa chỉ đơn giản hóa");

      const simplifiedAddress = address.split(',').pop().trim();

      if (simplifiedAddress && simplifiedAddress !== address) {
        const simplifiedResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simplifiedAddress)}&limit=1`,
          {
            headers: {
              "User-Agent": "CoffeeShopApp/1.0.0 (nhuy126833@gmail.com)",
            },
          }
        );

        const simplifiedData = await simplifiedResponse.json();

        if (simplifiedData && simplifiedData.length > 0) {
          return {
            latitude: parseFloat(simplifiedData[0].lat),
            longitude: parseFloat(simplifiedData[0].lon),
          };
        }
      }

      console.warn("Không tìm thấy tọa độ cho địa chỉ, sử dụng tọa độ mặc định");
      return { latitude: 10.7769, longitude: 106.7009 };
    } catch (error) {
      console.error("Lỗi khi lấy tọa độ:", error);
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
      onComplete: (newAddress) => {
        setUserAddress(newAddress);
        navigation.setParams({ newAddress });
      },
    });
  };

  const calculatePaymentDetails = () => {
    const packagingFee = 2.0;
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    const voucherDiscount = voucher ? parseFloat(voucher.discount) || 0 : 0;
    const total = subtotal + deliveryFee + packagingFee - voucherDiscount;

    return {
      subtotal: subtotal.toFixed(1),
      deliveryFee: deliveryFee.toFixed(1),
      packagingFee: packagingFee.toFixed(1),
      voucherDiscount: voucherDiscount.toFixed(1),
      total: total.toFixed(1),
    };
  };

  const paymentDetails = calculatePaymentDetails();

  // const handlePlaceOrder = async () => {
  //   if (!paymentSelected && paymentSelected !== 0) {
  //     Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán");
  //     return;
  //   }
  
  //   if (!isConnected) {
  //     Alert.alert("Lỗi", "Không có kết nối mạng. Vui lòng kiểm tra và thử lại.");
  //     return;
  //   }
  
  //   setLoading(true);
  
  //   try {
  //     if (isUsingDefaultCoords) {
  //       const shouldContinue = await new Promise((resolve) => {
  //         Alert.alert(
  //           "Xác nhận",
  //           "Hệ thống đang sử dụng vị trí ước tính. Bạn có muốn tiếp tục đặt hàng không?",
  //           [
  //             { text: "Hủy", style: "cancel", onPress: () => resolve(false) },
  //             { text: "Tiếp tục", onPress: () => resolve(true) },
  //           ]
  //         );
  //       });
  
  //       if (!shouldContinue) {
  //         setLoading(false);
  //         return;
  //       }
  //     }
  
  //     let userIdForOrder;
  
  //     if (user && user.user_id) {
  //       userIdForOrder = user.user_id; // Sử dụng trực tiếp user_id
  //     } else {
  //       // Tạo ID cho khách
  //       userIdForOrder = "guest_" + Date.now();
  //     }
  
  //     if (!selectedItems || selectedItems.length === 0) {
  //       Alert.alert("Lỗi", "Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm để tiếp tục.");
  //       setLoading(false);
  //       return;
  //     }
  
  //     if (!userAddress) {
  //       Alert.alert("Lỗi", "Địa chỉ giao hàng không hợp lệ. Vui lòng nhập địa chỉ.");
  //       setLoading(false);
  //       return;
  //     }
  
  //     // Tạo IDs cho đơn hàng
  //     const orderId = `HD${Math.floor(1000 + Math.random() * 9000)}`;
  //     const orderDetailId = `CTHD${Math.floor(1000 + Math.random() * 9000)}`;
      
  //     const newOrder = {
  //       hoadon_id: orderId,
  //       user: userIdForOrder, // Chỉ gửi string ID
  //       ChiTietHoaDon: {
  //         chitiethoadon_id: orderDetailId,
  //         SanPham: selectedItems.map(item => ({
  //           productId: item._id || item.id || item.sanpham_id || `SP${Math.floor(1000 + Math.random() * 9000)}`,
  //           name: item.name || "Unknown Product",
  //           quantity: parseInt(item.quantity) || 1,
  //           price: parseFloat(item.price) || 0,
  //         })),
  //         dateCreated: new Date().toISOString(),
  //       },
  //       tongTien: parseFloat(paymentDetails.total) * 1000,
  //       paymentMethod: paymentSelected === 0 ? "Cash on Delivery" : "Credit Card",
  //       status: "pending"
  //     };
  
  //     console.log("Dữ liệu đơn hàng gửi lên:", JSON.stringify(newOrder, null, 2));
  
  //     let retryCount = 0;
  //     const maxRetries = 3;
  
  //     while (retryCount < maxRetries) {
  //       try {
  //         const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders`, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             "Accept": "application/json",
  //           },
  //           body: JSON.stringify(newOrder),
  //         });
  
  //         console.log("Mã trạng thái phản hồi:", response.status);
  
  //         const responseText = await response.text();
  //         console.log("Nội dung phản hồi:", responseText);
  
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! Status: ${response.status}, Response: ${responseText}`);
  //         }
  
  //         let result;
  //         try {
  //           result = JSON.parse(responseText);
  //         } catch (e) {
  //           console.log("Phản hồi không phải JSON hợp lệ, nhưng yêu cầu thành công");
  //           result = { success: true };
  //         }
  
  //         console.log("Đặt hàng thành công:", result);
  
  //         dispatch(clearCart());
  
  //         Alert.alert(
  //           "Đặt hàng thành công",
  //           "Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là: " + newOrder.hoadon_id,
  //           [{ text: "OK", onPress: () => navigation.navigate("Home") }]
  //         );
  
  //         break;
  //       } catch (error) {
  //         console.error(`Lần thử ${retryCount + 1}/${maxRetries} thất bại:`, error);
  //         retryCount++;
  
  //         if (retryCount >= maxRetries) {
  //           throw error;
  //         }
  
  //         await new Promise(resolve => setTimeout(resolve, 1000));
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi đặt hàng:", error);
  
  //     if (error.message.includes("Network request failed")) {
  //       Alert.alert("Lỗi kết nối", "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
  //     } else {
  //       Alert.alert(
  //         "Lỗi đặt hàng",
  //         "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.\n\n" +
  //         "Chi tiết lỗi: " + error.message
  //       );
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePlaceOrder = async () => {
    if (!paymentSelected && paymentSelected !== 0) {
      Alert.alert("Lỗi", "Vui lòng chọn phương thức thanh toán");
      return;
    }
  
    setLoading(true);
  
    try {
      if (isUsingDefaultCoords) {
        const shouldContinue = await new Promise((resolve) => {
          Alert.alert(
            "Xác nhận",
            "Hệ thống đang sử dụng vị trí ước tính. Bạn có muốn tiếp tục đặt hàng không?",
            [
              { text: "Hủy", style: "cancel", onPress: () => resolve(false) },
              { text: "Tiếp tục", onPress: () => resolve(true) },
            ]
          );
        });
  
        if (!shouldContinue) {
          setLoading(false);
          return;
        }
      }
  
      let userIdForOrder;
      let userData;
  
      // Kiểm tra user từ Redux
      if (user && user.user_id) {
        userIdForOrder = user.user_id;
        userData = user; // Dữ liệu người dùng từ Redux
      } else {
        // Tạo ID cho khách
        userIdForOrder = "guest_" + Date.now();
        userData = {
          user_id: userIdForOrder,
          name: "Khách",
          phoneNumber: "0123456789",
          address: userAddress || "Danang, Vietnam",
        };
      }
  
      if (!selectedItems || selectedItems.length === 0) {
        Alert.alert("Lỗi", "Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm để tiếp tục.");
        setLoading(false);
        return;
      }
  
      if (!userAddress) {
        Alert.alert("Lỗi", "Địa chỉ giao hàng không hợp lệ. Vui lòng nhập địa chỉ.");
        setLoading(false);
        return;
      }
  
      // Tạo IDs cho đơn hàng
      const orderId = `HD${Math.floor(1000 + Math.random() * 9000)}`;
      const orderDetailId = `CTHD${Math.floor(1000 + Math.random() * 9000)}`;
  
      const newOrder = {
        hoadon_id: orderId,
        user: {
          user_id: userIdForOrder,
          name: userData.name || "Khách",
          phoneNumber: userData.phoneNumber || "0123456789",
          address: userAddress || userData.address || "Danang, Vietnam",
        },
        ChiTietHoaDon: {
          chitiethoadon_id: orderDetailId,
          SanPham: selectedItems.map(item => ({
            productId: item._id || item.id || item.sanpham_id || `SP${Math.floor(1000 + Math.random() * 9000)}`,
            name: item.name || "Unknown Product",
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0,
            image: item.image || "https://picsum.photos/200/300", // Thêm trường image nếu có
          })),
          dateCreated: new Date().toISOString(),
        },
        tongTien: parseFloat(paymentDetails.total) * 1000,
        paymentMethod: paymentSelected === 0 ? "Cash on Delivery" : "Credit Card",
        status: "pending",
      };
  
      console.log("Dữ liệu đơn hàng gửi lên:", JSON.stringify(newOrder, null, 2));
  
      let retryCount = 0;
      const maxRetries = 3;
  
      while (retryCount < maxRetries) {
        try {
          const response = await fetch('http://172.20.10.7:5001/api/orders', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify(newOrder),
          });
  
          console.log("Mã trạng thái phản hồi:", response.status);
  
          const responseText = await response.text();
          console.log("Nội dung phản hồi:", responseText);
  
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Response: ${responseText}`);
          }
  
          let result;
          try {
            result = JSON.parse(responseText);
          } catch (e) {
            console.log("Phản hồi không phải JSON hợp lệ, nhưng yêu cầu thành công");
            result = { success: true };
          }
  
          console.log("Đặt hàng thành công:", result);
  
          dispatch(clearCart());
  
          Alert.alert(
            "Đặt hàng thành công",
            "Cảm ơn bạn đã đặt hàng. Mã đơn hàng của bạn là: " + newOrder.hoadon_id,
            [{ text: "OK", onPress: () => navigation.navigate("Home") }]
          );
  
          break;
        } catch (error) {
          console.error(`Lần thử ${retryCount + 1}/${maxRetries} thất bại:`, error);
          retryCount++;
  
          if (retryCount >= maxRetries) {
            throw error;
          }
  
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
  
      if (error.message.includes("Network request failed")) {
        Alert.alert("Lỗi kết nối", "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
      } else {
        Alert.alert(
          "Lỗi đặt hàng",
          "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.\n\n" +
          "Chi tiết lỗi: " + error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const MapComponent = ({ shopCoords, userCoords }) => {
    if (!userCoords) {
      return (
        <View style={[styles.map, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#967259" />
          <Text style={{ marginTop: 10 }}>Loading map...</Text>
        </View>
      );
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Delivery Route Map</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
          <style>
            html, body { height: 100%; margin: 0; padding: 0; }
            #map { height: 100%; width: 100%; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
          <script src="https://unpkg.com/leaflet-polylinedecorator"></script>
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              var shopCoords = [${shopCoords.latitude}, ${shopCoords.longitude}];
              var userCoords = [${userCoords.latitude}, ${userCoords.longitude}];
              
              var map = L.map('map').fitBounds([shopCoords, userCoords], { padding: [30, 30] });
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
              }).addTo(map);
              
              var shopMarker = L.marker(shopCoords).addTo(map)
                .bindPopup('<strong>Coffee Shop</strong>').openPopup();
              
              var userMarker = L.marker(userCoords).addTo(map)
                .bindPopup('<strong>Delivery Location</strong>');
              
              var routeLine = L.polyline([shopCoords, userCoords], {
                color: '#FF4D4D',
                weight: 5,
                opacity: 0.8,
                dashArray: '10, 10',
                lineJoin: 'round'
              }).addTo(map);
              
              var arrowHead = L.polylineDecorator(routeLine, {
                patterns: [
                  { offset: '50%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 15, polygon: false, pathOptions: { color: '#FF4D4D', weight: 5 } }) }
                ]
              }).addTo(map);
            });
          </script>
        </body>
      </html>
    `;

    return (
      <WebView
        source={{ html }}
        style={styles.map}
        javaScriptEnabled={true}
        onLoad={() => setIsMapLoading(false)}
        onError={(e) => {
          console.error("WebView error:", e.nativeEvent);
          setIsMapLoading(false);
        }}
      />
    );
  };

  const Address = ({ user }) => (
    <TouchableOpacity onPress={handleEditAddress} style={styles.addressContainer}>
      <Ionicons name="location" size={40} color="#FB452D" />
      <View style={styles.addressContent}>
        <Text style={styles.nameText}>{user?.name || "Nguyen Thi Nu Y"}</Text>
        <Text style={styles.phoneText}>(+84) {user?.phoneNumber || "0123456791"}</Text>
        <Text style={styles.addressText}>{userAddress || "No address"}</Text>
      </View>
      <AntDesign name="edit" size={20} color="#333" />
    </TouchableOpacity>
  );

  const Item = ({ item }) => (
    <View style={{ marginTop: 10 }}>
      <View style={styles.itemDetailContainer}>
        <Image source={{ uri: item.image || "https://picsum.photos/200/300" }} style={styles.img} resizeMode="cover" />
        <View style={styles.itemDetails}>
          <Text style={styles.nameText}>{item.name || "Ice Milk Coffee"}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${item.price || 0}</Text>
            <Text>Size: 100ml</Text>
          </View>
        </View>
        <Text style={styles.quantityText}>x{item.quantity || 1}</Text>
      </View>
      <View style={styles.noteContainer}>
        <Text>Note:</Text>
        <TextInput
          placeholder="ABC"
          style={styles.input}
          value={orderNote}
          onChangeText={setOrderNote}
        />
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
    <SafeAreaView style={styles.safeArea}>
      <Navbar />
      <View style={styles.head}>
        <AntDesign name="arrowleft" size={24} color="black" onPress={() => navigation.goBack()} />
        <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.title}>Your Order</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Address user={user} />
        <View style={styles.mapContainer}>
          {isMapLoading || !userCoords ? (
            <View style={[styles.map, styles.mapLoading]}>
              <ActivityIndicator size="large" color="#967259" />
              <Text style={{ marginTop: 10 }}>Loading map...</Text>
            </View>
          ) : (
            <MapComponent shopCoords={shopCoords} userCoords={userCoords} />
          )}
          <View style={styles.distanceInfoContainer}>
            <Text style={styles.distanceText}>
              Estimated Distance: {deliveryDistance} km | Delivery Fee: ${deliveryFee.toFixed(1)}
            </Text>
          </View>
        </View>
        <View style={styles.itemContainer}>
          {selectedItems.length > 0 ? (
            selectedItems.map((item, index) => <Item key={index} item={item} />)
          ) : (
            <Text style={styles.emptyCartText}>No items in your cart</Text>
          )}
          <View style={styles.otherContainer}>
            <Text style={styles.otherTitle}>Other drinks we recommend</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.otherItemContainer}>
            <View style={styles.recommendedProductCard}>
              <Image
                source={{ uri: "https://picsum.photos/200/300" }}
                style={styles.imageOther}
                resizeMode="cover"
              />
              <View style={styles.otherItem}>
                <Text style={styles.name}>Product Name</Text>
                <Text style={styles.name}>$15.5</Text>
              </View>
            </View>
            <View style={styles.recommendedProductCard}>
              <Image
                source={{ uri: "https://picsum.photos/200/300" }}
                style={styles.imageOther}
                resizeMode="cover"
              />
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
          <PaymentItem method="Credit Card" index={1} />
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
              <Text style={styles.paymentDetailLabel}>Voucher</Text>
              <Text style={[styles.paymentDetailValue, { color: "green" }]}>
                -${paymentDetails.voucherDiscount}
              </Text>
            </View>
          )}
          <View
            style={[styles.paymentDetailRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 10 }]}
          >
            <Text style={[styles.paymentDetailLabel, { fontWeight: "bold", fontSize: 18 }]}>
              TOTAL
            </Text>
            <Text style={[styles.paymentDetailValue, { fontWeight: "bold", fontSize: 18, color: "red" }]}>
              ${paymentDetails.total}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.orderButtonText}>Order</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Footer style={styles.fixedFooter} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#EEDCC6", 
    paddingBottom: 20 
  },
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
  title: { 
    fontSize: 24, 
    fontWeight: "bold" 
  },
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
  addressContent: { 
    flex: 1 
  },
  nameText: { 
    fontWeight: "bold", 
    fontSize: 16, 
    marginBottom: 2 
  },
  phoneText: { 
    fontSize: 14, 
    color: "#555", 
    marginBottom: 2 
  },
  addressText: { 
    fontSize: 14, 
    color: "#333" 
  },
  mapContainer: { 
    marginHorizontal: 20, 
    marginTop: 10, 
    height: 220, 
    borderRadius: 10, 
    overflow: "hidden",
    backgroundColor: "#FFF5E9",
  },
  map: { 
    height: 180,
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  mapLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  distanceInfoContainer: {
    backgroundColor: "#FFF5E9",
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  distanceText: { 
    textAlign: "center", 
    fontSize: 14, 
    color: "#333",
    fontWeight: "500"
  },
  img: { 
    width: 70, 
    height: 70, 
    borderRadius: 10 
  },
  itemDetails: {
    flex: 1,
  },
  priceContainer: { 
    flexDirection: "row", 
    gap: 20,
    marginTop: 5,
  },
  priceText: {
    fontWeight: "600",
    color: "#967259",
  },
  quantityText: {
    fontWeight: "bold",
  },
  itemDetailContainer: { 
    flexDirection: "row", 
    gap: 20, 
    alignItems: "center" 
  },
  itemContainer: {
    backgroundColor: "#FFF5E9",
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  emptyCartText: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
    color: '#777',
  },
  input: { 
    backgroundColor: "#EEDCC6", 
    borderRadius: 5, 
    padding: 5, 
    marginTop: 10, 
    width: 200 
  },
  noteContainer: { 
    flexDirection: "row", 
    padding: 10, 
    alignItems: "center", 
    gap: 20 
  },
  line: { 
    borderWidth: 0.5, 
    borderColor: "#ccc",
    marginVertical: 5,
  },
  otherContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginTop: 20,
    paddingHorizontal: 5,
  },
  otherTitle: { 
    fontSize: 18, 
    fontWeight: "700" 
  },
  seeAllText: {
    color: "#967259",
    fontWeight: "600",
  },
  otherItemContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginVertical: 10 
  },
  recommendedProductCard: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageOther: { 
    width: 140, 
    height: 120, 
    borderRadius: 10 
  },
  otherItem: { 
    position: "absolute", 
    bottom: 10, 
    left: 10 
  },
  name: { 
    color: "white", 
    textShadowColor: "rgba(0, 0, 0, 0.75)", 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 1,
    fontWeight: "bold",
  },
  deliveryContainer: {
    backgroundColor: "#FFF5E9",
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deliveryText: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 10 
  },
  deliveryDetailContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 
  },
  deliveryName: { 
    fontWeight: "700" 
  },
  voucherContainer: { 
    backgroundColor: "#FFF5E9", 
    marginHorizontal: 20, 
    padding: 15, 
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  voucherText: { 
    fontWeight: "700" 
  },
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
    padding: 12,
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  paymentDetailRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginVertical: 5 
  },
  paymentDetailLabel: { 
    fontSize: 16 
  },
  paymentDetailValue: { 
    fontSize: 16 
  },
  orderButton: {
    backgroundColor: "#FF4D4D",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  orderButtonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  safeArea: { 
    flex: 1, 
    backgroundColor: "#EEDCC6" 
  },
  scrollContent: {
    paddingBottom: 100, // Đảm bảo nội dung không bị Footer che khuất
  },
  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF5E9",
  },
});

export default BillDetail;