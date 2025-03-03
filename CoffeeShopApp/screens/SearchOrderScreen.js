import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/Footer";

const SearchOrderScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Tìm kiếm đơn hàng</Text>
        <View style={{ width: 24 }} /> {/* Placeholder để căn giữa tiêu đề */}
      </View>

      {/* Ô tìm kiếm */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập từ khoá tìm kiếm"
          placeholderTextColor="#AAA"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Nội dung kết quả (Hiện tại để trống) */}
      <View style={styles.resultContainer}>
        {/* Kết quả tìm kiếm sẽ hiển thị ở đây */}
      </View>

      {/* Footer */}
      <Footer />
    </View>
  );
};

export default SearchOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  resultContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
  },
});
