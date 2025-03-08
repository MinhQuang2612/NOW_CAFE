

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const API_URL = "http://localhost:5001/api/vouchers";

export default function VoucherScreen({ navigation }) {
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setVouchers(data);
      } catch (error) {
        console.error("Lỗi khi lấy voucher:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const renderVoucherItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.voucherCard, 
        selectedVoucher === item._id && styles.selectedCard
      ]}
      onPress={() => setSelectedVoucher(item._id)}
    >
      <View style={styles.voucherRow}>
        <Image 
          source={require("../assets/icons/free-ship.png")} 
          style={styles.voucherIcon} 
        />
        <View style={styles.voucherText}>
          <Text 
            numberOfLines={1} 
            ellipsizeMode="tail" 
            style={[
              styles.voucherTitle, 
              selectedVoucher === item._id && styles.selectedText
            ]}
          >
            {item.title}
          </Text>
          <Text 
            numberOfLines={1} 
            ellipsizeMode="tail" 
            style={[
              styles.voucherDescription, 
              selectedVoucher === item._id && styles.selectedText
            ]}
          >
            {item.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Voucher</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔄 Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          renderItem={renderVoucherItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.voucherList}
          showsVerticalScrollIndicator={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9E8D9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "#F9E8D9",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#3D1B00",
  },
  voucherList: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  voucherCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedCard: {
    backgroundColor: "#8B5A2B",
  },
  voucherRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  voucherIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
  },
  voucherText: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3D1B00",
    marginBottom: 4,
  },
  voucherDescription: {
    fontSize: 14,
    color: "#666",
  },
  selectedText: {
    color: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});

