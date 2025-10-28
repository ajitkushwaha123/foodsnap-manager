import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async ({ userId, projectId, categoryData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `/api/${userId}/projects/${projectId}/categories`,
        categoryData
      );
      return data;
    } catch (error) {
      console.error("❌ Create category failed:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async ({ userId, projectId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/${userId}/projects/${projectId}/categories`
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

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async (
    { userId, projectId, categoryId, updatedData },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.put(
        `/api/${userId}/projects/${projectId}/categories/${categoryId}`,
        updatedData
      );
      return data;
    } catch (error) {
      console.error("❌ Update category failed:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async ({ userId, projectId, categoryId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `/api/${userId}/projects/${projectId}/categories/${categoryId}`
      );
      return { data, categoryId };
    } catch (error) {
      console.error("❌ Delete category failed:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    list: [],
    isLoading: false,
    message: "",
    error: null,
  },
  reducers: {
    resetCategoryState: (state) => {
      state.list = [];
      state.isLoading = false;
      state.message = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- Create --- */
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.message = "";
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload?.data);
        state.message =
          action.payload?.message || "Category created successfully!";
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create category.";
      })

      /* --- Fetch --- */
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.message = "";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload?.data || [];
        state.message =
          action.payload?.message || "Categories fetched successfully!";
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch categories.";
      })

      /* --- Update --- */
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCat = action.payload?.data;
        state.list = state.list.map((cat) =>
          cat._id === updatedCat._id ? updatedCat : cat
        );
        state.message =
          action.payload?.message || "Category updated successfully!";
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update category.";
      })

      /* --- Delete --- */
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload.categoryId;
        state.list = state.list.filter((cat) => cat._id !== deletedId);
        state.message =
          action.payload?.data?.message || "Category deleted successfully!";
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete category.";
      });
  },
});

export const { resetCategoryState } = categorySlice.actions;
export default categorySlice.reducer;
