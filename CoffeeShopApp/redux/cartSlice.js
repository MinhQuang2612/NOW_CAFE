import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { set } from "mongoose";

export const fetchCartItems = createAsyncThunk("cart/fetchCartItems", async ({ userId }) => {
  try {
    const response = await fetch(`http://localhost:5001/api/cart/${userId}`);
    const data = await response.json();
    // console.log("🛒 Cart Data:", data);
    // Lay danh sach san pham tu cart
    const cartItems = data.cart.SanPham;
    // console.log("🛒 Cart Items:", cartItems);
    return cartItems;
  } catch (error) {
    throw error;
  }
});

// Update cart
export const updateCartItems = createAsyncThunk("cart/updateCartItems", async ({ userId, cartItems }) => {
  try {
    const response = await fetch(`http://localhost:5001/api/cart/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ SanPham: cartItems }),
    });
    const data = await response.json();
    console.log("🛒 Updated Cart Data:", data);
    return data.cart.SanPham;
  } catch (error) {
    throw error;
  }
});




const initialState = {
  cartItems: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // addToCart: (state, action) => {
    //   const { product, quantity } = action.payload;
    //   const existingItem = state.cartItems.find((item) => item.sanpham_id === product.sanpham_id);

    //   if (existingItem) {
    //     existingItem.quantity += quantity;
    //   } else {
    //     state.cartItems.push({ ...product, quantity });
    //   }

    //   state.totalAmount = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // },

    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      console.log("🛒 Add to Cart:", product, quantity);
      const existingItem = state.cartItems.find((item) => item.id === product.sanpham_id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({ ...product, quantity });
      }

      state.totalAmount = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((item) => item.sanpham_id !== action.payload);
      state.totalAmount = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
    }
    
  },
  extraReducers (builder) {
    builder
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.totalAmount = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0);
        console.log("🛒 Cart Items:", action.payload);
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        console.error("Error:", action.error.message);
      })
      .addCase(fetchCartItems.pending, (state, action) => {
        console.log("Loading...");
      })

  
  }
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
