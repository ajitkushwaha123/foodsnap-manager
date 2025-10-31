"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchProducts,
  deleteProduct,
  deleteMultipleProduct,
  resetProductState,
} from "@/store/slices/productSlice";

export const useProduct = () => {
  const dispatch = useDispatch();

  const { items, isLoading, message, error, pagination, categories } =
    useSelector((state) => state.product);

  const resetProducts = useCallback(() => {
    dispatch(resetProductState());
  }, [dispatch]);

  const getAllProducts = useCallback(
    async ({ userId, projectId, page = 1, limit = 100 }) => {
      if (!userId || !projectId) {
        console.warn("⚠️ Missing userId or projectId in getAllProducts");
        return;
      }

      console.log("📦 Fetching products for:", {
        userId,
        projectId,
        page,
        limit,
      });

      try {
        await dispatch(
          fetchProducts({ userId, projectId, page, limit })
        ).unwrap();
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      }
    },
    [dispatch]
  );

  const removeProduct = useCallback(
    async ({ userId, projectId, productId }) => {
      if (!userId || !projectId || !productId) {
        console.warn("⚠️ Missing required params in removeProduct");
        return;
      }

      console.log("🗑 Deleting product:", { userId, projectId, productId });

      try {
        await dispatch(
          deleteProduct({ userId, projectId, productId })
        ).unwrap();
      } catch (err) {
        console.error("❌ Failed to delete product:", err);
      }
    },
    [dispatch]
  );

  const removeAllProducts = useCallback(
    async ({ userId, projectId, page, limit, all }) => {
      if (!userId || !projectId || !page || !limit) {
        console.warn("⚠️ Missing required params in removeAllProducts");
        return;
      }

      console.log("🗑 Deleting all products for:", { userId, projectId });

      try {
        await dispatch(
          deleteMultipleProduct({ userId, projectId, page, limit, all })
        ).unwrap();
      } catch (err) {
        console.error("❌ Failed to delete all products:", err);
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
    categories,
    resetProducts,
    getAllProducts,
    removeProduct,
    removeAllProducts,
  };
};
