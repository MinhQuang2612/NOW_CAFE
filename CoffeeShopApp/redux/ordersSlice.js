import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch danh sách đơn hàng từ API
export const fetchOrders = createAsyncThunk("orders/fetchOrders", async () => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders`);
  return response.json();
});

const ordersSlice = createSlice({
  name: "orders",
  initialState: { orders: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export default ordersSlice.reducer;
