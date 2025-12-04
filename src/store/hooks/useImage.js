"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchImages,
  deleteImage,
  approveMultipleImages,
  resetImageState,
  updateStatus,
  markAsCombo,
  markAsThali,
  markAsLatest,
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
        return await dispatch(fetchImages({ page, limit })).unwrap();
      } catch (err) {
        console.error("❌ Failed to fetch images:", err);
        throw err;
      }
    },
    [dispatch]
  );

  const removeImage = useCallback(
    async ({ imageId }) => {
      if (!imageId) {
        console.warn("⚠️ Missing imageId in removeImage");
        return;
      }

      try {
        return await dispatch(deleteImage({ imageId })).unwrap();
      } catch (err) {
        console.error("❌ Failed to delete image:", err);
        throw err;
      }
    },
    [dispatch]
  );

  const updateImageStatus = useCallback(
    async ({ imageId, status }) => {
      if (!imageId || typeof status !== "boolean") {
        console.warn("⚠️ Invalid params in updateImageStatus");
        return;
      }

      try {
        return await dispatch(updateStatus({ imageId, status })).unwrap();
      } catch (err) {
        console.error("❌ Failed to update image status:", err);
        throw err;
      }
    },
    [dispatch]
  );

  // CORRECT PAYLOAD PARAMS
  const MarkImageAsCombo = useCallback(
    async ({ imageId, is_combo }) => {
      if (!imageId || typeof is_combo !== "boolean") {
        console.warn("⚠️ Invalid params in MarkImageAsCombo");
        return;
      }

      try {
        return await dispatch(
          markAsCombo({ imageId, isCombo: is_combo })
        ).unwrap();
      } catch (err) {
        console.error("❌ Failed to mark image as combo:", err);
        throw err;
      }
    },
    [dispatch]
  );

  const MarkImageAsLatest = useCallback(
    async ({ imageId, is_latest }) => {
      if (!imageId || typeof is_latest !== "boolean") {
        console.warn("⚠️ Invalid params in MarkImageAsLatest");
        return;
      }

      try {
        return await dispatch(
          markAsLatest({ imageId, isLatest: is_latest })
        ).unwrap();
      } catch (err) {
        console.error("❌ Failed to mark image as latest:", err);
        throw err;
      }
    },
    [dispatch]
  );

  const MarkImageAsThali = useCallback(
    async ({ imageId, is_thali }) => {
      if (!imageId || typeof is_thali !== "boolean") {
        console.warn("⚠️ Invalid params in MarkImageAsThali");
        return;
      }

      try {
        return await dispatch(
          markAsThali({ imageId, isThali: is_thali })
        ).unwrap();
      } catch (err) {
        console.error("❌ Failed to mark image as thali:", err);
        throw err;
      }
    },
    [dispatch]
  );

  const approveAllImages = useCallback(
    async ({ page, limit, all }) => {
      if (!page || !limit) {
        console.warn("⚠️ Missing required params in approveAllImages");
        return;
      }

      try {
        return await dispatch(
          approveMultipleImages({ page, limit, all })
        ).unwrap();
      } catch (err) {
        console.error("❌ Failed to approve all images:", err);
        throw err;
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
    MarkImageAsCombo,
    MarkImageAsThali,
    MarkImageAsLatest,
  };
};
