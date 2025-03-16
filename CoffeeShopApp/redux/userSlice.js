// src/redux/userSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserDetails",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/${userId}`);
      const data = await response.json();
      console.log("📡 Fetch User Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user details");
      }

      if (data.success && data.user) {
        return data.user;
      } else {
        throw new Error("User not found or invalid response");
      }
    } catch (error) {
      console.error("❌ Fetch User Error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null, // Lưu thông tin người dùng
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.user = action.payload;
        console.log("✅ User Fetched:", action.payload);
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.user = null;  // Đặt lại user khi thất bại
        console.error("❌ User Fetch Rejected:", action.payload);
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;