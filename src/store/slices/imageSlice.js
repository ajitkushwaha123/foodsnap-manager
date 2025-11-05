import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchImages = createAsyncThunk(
  "image/fetchImages",
  async ({ page = 1, limit = 100 }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/image?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch image"
      );
    }
  }
);

export const deleteImage = createAsyncThunk(
  "image/deleteImage",
  async ({ imageId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(`/api/image/${imageId}`);
      return { imageId, message: data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete image"
      );
    }
  }
);

export const approveMultipleImages = createAsyncThunk(
  "image/approveMultipleImages",
  async ({ page, limit, all }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/image/approve-all`, {
        page,
        limit,
        all,
      });
      return { message: data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to approve all images"
      );
    }
  }
);

export const updateStatus = createAsyncThunk(
  "image/updateStatus",
  async ({ imageId, status }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/image/${imageId}`, { status });
      return {
        imageId,
        status: data.data?.status || status,
        message: data.message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update image status"
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
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    resetImageState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImages.pending, (state) => {
        state.isLoading = true;
        state.message = "";
        state.error = null;
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.data || [];
        state.pagination = action.payload?.pagination || null;
        state.message = "Images fetched successfully!";
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch image.";
      })
      .addCase(deleteImage.pending, (state) => {
        state.error = null;
        state.message = "";
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (image) => image._id !== action.payload.imageId
        );
        state.message = action.payload.message || "Image deleted successfully!";
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete image.";
      })
      .addCase(approveMultipleImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveMultipleImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.map((img) => ({ ...img, approved: true }));
        state.message =
          action.payload.message || "All images approved successfully!";
      })
      .addCase(approveMultipleImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to approve all images.";
      })
      .addCase(updateStatus.pending, (state) => {
        state.error = null;
        state.message = "";
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (image) => image._id === action.payload.imageId
        );
        if (index !== -1) {
          state.items[index].approved = action.payload.status;
        }
        state.message =
          action.payload.message ||
          "Image approval status updated successfully!";
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to update image approval status.";
      });
  },
});

export const { resetImageState } = imageSlice.actions;
export default imageSlice.reducer;
