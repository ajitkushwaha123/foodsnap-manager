"use client";

import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchCategories,
  fetchProducts,
  importZomatoMenu,
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
    async ({ userId, projectId, page = 1, limit = 10 }) => {
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
      await dispatch(
        fetchProducts({ userId, projectId, page, limit })
      ).unwrap();
    },
    [dispatch]
  );

  const getAllCategory = useCallback(
    async ({ userId, projectId }) => {
      if (!userId || !projectId) {
        console.warn("⚠️ Missing userId or projectId in getAllCategory");
        return;
      }
      console.log("📦 Fetching categories for:", {
        userId,
        projectId,
        page,
        limit,
      });
      await dispatch(fetchCategories({ userId, projectId })).unwrap();
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
    getAllCategory,
  };
};
