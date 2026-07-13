import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchImages = createAsyncThunk(
  "image/fetchImages",
  async ({ page = 1, limit = 5000 }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/image?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch images"
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

export const updateStatus = createAsyncThunk(
  "image/updateStatus",
  async ({ imageId, status }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/image/${imageId}`, { status });
      return {
        imageId,
        status: data.data?.status ?? status,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update image status"
      );
    }
  }
);

export const markAsLatest = createAsyncThunk(
  "image/markAsLatest",
  async ({ imageId, isLatest }, { rejectWithValue }) => {
    try {
      await axios.put(`/api/image/${imageId}/mark-as-latest`, { isLatest });
      return { imageId, isLatest };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update latest status"
      );
    }
  }
);

export const markAsCombo = createAsyncThunk(
  "image/markAsCombo",
  async ({ imageId, isCombo }, { rejectWithValue }) => {
    try {
      await axios.put(`/api/image/${imageId}/mark-as-combo`, { isCombo });
      return { imageId, isCombo };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update combo status"
      );
    }
  }
);

export const markAsThali = createAsyncThunk(
  "image/markAsThali",
  async ({ imageId, isThali }, { rejectWithValue }) => {
    try {
      await axios.put(`/api/image/${imageId}/mark-as-thali`, { isThali });
      return { imageId, isThali };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update thali status"
      );
    }
  }
);

export const approveMultipleImages = createAsyncThunk(
  "image/approveMultipleImages",
  async ({ page = 1, limit = 1000, all = false }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`/api/image/approve-all`, {
        page,
        limit,
        all,
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to approve images"
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
        state.error = null;
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.data || [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteImage.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (img) => img._id !== action.payload.imageId
        );
      })

      .addCase(updateStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload.imageId
        );
        if (index !== -1) {
          state.items[index].approved = action.payload.status;
        }
      })

      .addCase(markAsLatest.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload.imageId
        );
        if (index !== -1) {
          state.items[index].latest = action.payload.isLatest;
        }
      })

      .addCase(markAsCombo.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload.imageId
        );
        if (index !== -1) {
          state.items[index].isCombo = action.payload.isCombo;
        }
      })

      .addCase(markAsThali.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload.imageId
        );
        if (index !== -1) {
          state.items[index].isThali = action.payload.isThali;
        }
      })

      .addCase(approveMultipleImages.fulfilled, (state, action) => {
        state.message = action.payload?.message || "Images approved";
        if (action.payload?.updatedItems) {
          state.items = action.payload.updatedItems;
        }
      })

      .addMatcher(
        (action) => action.type.endsWith("rejected"),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export const { resetImageState } = imageSlice.actions;

export default imageSlice.reducer;
