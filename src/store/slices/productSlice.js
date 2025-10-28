import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async ({ userId, projectId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/${userId}/projects/${projectId}/products?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error) {
      console.error("❌ Fetch products failed:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "product/fetchCategories",
  async ({ userId, projectId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/${userId}/projects/${projectId}/products/category`
      );
      return data;
    } catch (error) {
      console.error("❌ Fetch categories failed:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

const initialState = {
  items: [],
  isLoading: false,
  message: "",
  error: null,
  pagination: null,
  categories: [],
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    resetProductState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.message = "";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.data || [];
        state.pagination = action.payload?.pagination || null;
        state.message =
          action.payload?.message || "Products fetched successfully!";
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch products.";
        state.message = "";
      })
      .addCase(fetchCategories.pending, (state) => {
        state.message = "";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload?.data || [];
        state.message =
          action.payload?.message || "Categories fetched successfully!";
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch categories.";
        state.message = "";
      });
  },
});

export const { resetProductState } = productSlice.actions;
export default productSlice.reducer;
