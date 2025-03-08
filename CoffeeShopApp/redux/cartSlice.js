import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Fetch cart items từ server
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cart/${userId}`);
      if (!response.ok) {
        // Nếu không tìm thấy (404) hoặc lỗi khác, trả về mảng rỗng
        if (response.status === 404) {
          return [];
        }
        throw new Error("Failed to fetch cart items");
      }
      const data = await response.json();
      const cartItems = Array.isArray(data.cart?.SanPham) ? data.cart.SanPham : [];
      return cartItems.map((item) => ({
        sanpham_id: item.sanpham_id || "",
        name: item.name || "Unknown",
        price: item.price || 0,
        quantity: item.quantity || 0,
        image: item.image || "",
      }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update cart items lên server
export const updateCartItems = createAsyncThunk(
  "cart/updateCartItems",
  async ({ userId, cartItems }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cart/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ SanPham: cartItems }),
      });
      if (!response.ok) {
        throw new Error("Failed to update cart");
      }
      const data = await response.json();
      const updatedCartItems = Array.isArray(data.cart?.SanPham) ? data.cart.SanPham : [];
      return updatedCartItems.map((item) => ({
        sanpham_id: item.sanpham_id || "",
        name: item.name || "Unknown",
        price: item.price || 0,
        quantity: item.quantity || 0,
        image: item.image || "",
      }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  cartItems: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      console.log("🛒 Add to Cart:", product, quantity);
      const existingItem = state.cartItems.find(
        (item) => item.sanpham_id === product.sanpham_id
      );

      if (existingItem) {
        existingItem.quantity = Math.max(0, existingItem.quantity + quantity);
        if (existingItem.quantity < 1) {
          state.cartItems = state.cartItems.filter(
            (item) => item.sanpham_id !== product.sanpham_id
          );
        }
      } else if (quantity > 0) {
        state.cartItems.push({
          ...product,
          quantity: quantity,
          price: product.price || 0,
          name: product.name || "Unknown",
          image: product.image || "",
        });
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.sanpham_id !== action.payload
      );
      state.totalAmount = state.cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
    },
  },
  extraReducers: (builder) => {
    // Xử lý fetchCartItems
    builder
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.cartItems = action.payload || [];
        state.totalAmount = (action.payload || []).reduce(
          (sum, item) => sum + (item?.price || 0) * (item?.quantity || 0),
          0
        );
        console.log("🛒 Fetched Cart Items:", action.payload);
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.cartItems = []; // Đặt cartItems về rỗng khi thất bại
        state.totalAmount = 0;
        console.error("🛒 Fetch Error:", action.payload || "Failed to fetch cart items");
      })

      // Xử lý updateCartItems
      .addCase(updateCartItems.fulfilled, (state, action) => {
        state.cartItems = action.payload || [];
        state.totalAmount = (action.payload || []).reduce(
          (sum, item) => sum + (item?.price || 0) * (item?.quantity || 0),
          0
        );
        console.log("🛒 Updated Cart Items:", action.payload);
      })
      .addCase(updateCartItems.rejected, (state, action) => {
        state.cartItems = []; // Đặt cartItems về rỗng khi thất bại
        state.totalAmount = 0;
        console.error("🛒 Update Error:", action.payload || "Failed to update cart");
      });
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;