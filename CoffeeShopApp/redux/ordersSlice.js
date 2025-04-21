import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch danh sách đơn hàng từ API theo userId
export const fetchOrders = createAsyncThunk("orders/fetchOrders", async (userId) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders/${userId}`);

  const data = await response.json();

  // Kiểm tra dữ liệu trả về từ API
  console.log("Fetched orders from API:", data);

  return data;  // Trả về dữ liệu
});

const ordersSlice = createSlice({
  name: "orders",
  initialState: { orders: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;  // Bắt đầu lấy dữ liệu
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload.orders;  // Lưu đơn hàng vào state
        state.loading = false;  // Xử lý xong, tắt loading
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.error = action.error.message;  // Nếu có lỗi
        state.loading = false;  // Tắt loading nếu có lỗi
      });
  },
});


export default ordersSlice.reducer;
