import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./slices/projectSlice";
import notificationReducer from "./slices/notificationSlice";
import productReducer from "./slices/productSlice";
import categoryReducer from "./slices/categorySlice";
import imageReducer from "./slices/imageSlice";

export const store = configureStore({
  reducer: {
    project: projectReducer,
    notification: notificationReducer,
    product: productReducer,
    category: categoryReducer,
    image: imageReducer,
  },
});
