import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async ({ userId, projectId, page = 1, limit = 100 }, { rejectWithValue }) => {
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

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async ({ userId, projectId, productId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `/api/${userId}/projects/${projectId}/products/${productId}`
      );
      return { productId, message: data.message };
    } catch (error) {
      console.error("❌ Delete product failed:", error);
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete product"
      );
    }
  }
);

export const deleteMultipleProduct = createAsyncThunk(
  "product/deleteMultipleProduct",
  async ({ userId, projectId, page, limit, all }, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `/api/${userId}/projects/${projectId}/products`,
        {
          data: { page, limit, all },
        }
      );
      return { message: data.message };
    } catch (error) {
      console.error("❌ Delete all products failed:", error);
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete all products"
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

      .addCase(deleteProduct.pending, (state) => {
        // state.isLoading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.items = state.items.filter(
          (product) => product._id !== action.payload.productId
        );
        state.message =
          action.payload.message || "Product deleted successfully!";
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload || "Failed to delete product.";
      })

      .addCase(deleteMultipleProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(deleteMultipleProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = [];
        state.message =
          action.payload.message || "All products deleted successfully!";
      })
      .addCase(deleteMultipleProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete all products.";
      });
  },
});

export const { resetProductState } = productSlice.actions;
export default productSlice.reducer;
