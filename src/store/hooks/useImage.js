"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchImages,
  deleteImage,
  approveMultipleImages,
  resetImageState,
  updateStatus,
} from "@/store/slices/imageSlice";

export const useImage = () => {
  const dispatch = useDispatch();

  const { items, isLoading, message, error, pagination } = useSelector(
    (state) => state.image
  );

  const resetImages = useCallback(() => {
    dispatch(resetImageState());
  }, [dispatch]);

  const getAllImages = useCallback(
    async ({ page = 1, limit = 100 }) => {
      try {
        await dispatch(fetchImages({ page, limit })).unwrap();
      } catch (err) {
        console.error("❌ Failed to fetch images:", err);
      }
    },
    [dispatch]
  );

  const removeImage = useCallback(
    async ({ imageId }) => {
      if (!imageId) return console.warn("⚠️ Missing imageId in removeImage");
      try {
        await dispatch(deleteImage({ imageId })).unwrap();
      } catch (err) {
        console.error("❌ Failed to delete image:", err);
      }
    },
    [dispatch]
  );

  const updateImageStatus = useCallback(
    async ({ imageId, status }) => {
      if (!imageId || typeof status !== "boolean")
        return console.warn("⚠️ Invalid params in updateImageStatus");
      try {
        await dispatch(updateStatus({ imageId, status })).unwrap();
      } catch (err) {
        console.error("❌ Failed to update image status:", err);
      }
    },
    [dispatch]
  );

  const approveAllImages = useCallback(
    async ({ page, limit, all }) => {
      if (!page || !limit)
        return console.warn("⚠️ Missing required params in approveAllImages");
      try {
        await dispatch(approveMultipleImages({ page, limit, all })).unwrap();
      } catch (err) {
        console.error("❌ Failed to approve all images:", err);
      }
    },
    [dispatch]
  );

  return {
    items,
    isLoading,
    message,
    error,
    pagination,
    resetImages,
    getAllImages,
    removeImage,
    approveAllImages,
    updateImageStatus,
  };
};
