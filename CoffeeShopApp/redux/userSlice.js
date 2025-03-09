// src/redux/userSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUserDetails = createAsyncThunk(
  'user/fetchUserDetails',
  async (userId) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/${userId}`
      );
      const data = await response.json();
      console.log('data', data);
      if (data.success) {
        return data.user;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
);


const initialState = {
  user: null, // Lưu thông tin người dùng, bao gồm userID, name, phoneNumber, address, points, email, v.v.
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },

  extraReducers (builder) {
    builder.addCase(fetchUserDetails.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(fetchUserDetails.rejected, (state, action) => {
      state.user = null;
    });
    
  }
 
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;