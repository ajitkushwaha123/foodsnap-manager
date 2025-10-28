import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: "",
  type: null, // "success" | "error" | "info" | "warning"
  visible: false,
  action: null, // { label: "Retry", callback: () => {} }
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (state, action) => {
      const { message, type = "info", action: actionButton } = action.payload;
      state.message = message;
      state.type = type;
      state.visible = true;
      state.action = actionButton || null;
    },
    hideNotification: (state) => {
      state.visible = false;
      state.message = "";
      state.type = null;
      state.action = null;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
