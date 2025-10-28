import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  resetCategoryState,
} from "../slices/categorySlice";
import { useCallback } from "react";

const useCategory = () => {
  const dispatch = useDispatch();

  const {
    list: categories,
    isLoading,
    message,
    error,
  } = useSelector((state) => state.category);

  const fetchCategoriesHandler = useCallback(
    (userId, projectId) => {
      if (!userId || !projectId) return;
      dispatch(fetchCategories({ userId, projectId }));
    },
    [dispatch]
  );

  const createCategoryHandler = useCallback(
    (userId, projectId, categoryData) => {
      if (!userId || !projectId) return;
      dispatch(createCategory({ userId, projectId, categoryData }));
    },
    [dispatch]
  );

  const updateCategoryHandler = useCallback(
    (userId, projectId, categoryId, updatedData) => {
      if (!userId || !projectId || !categoryId) return;
      dispatch(updateCategory({ userId, projectId, categoryId, updatedData }));
    },
    [dispatch]
  );

  const deleteCategoryHandler = useCallback(
    (userId, projectId, categoryId) => {
      if (!userId || !projectId || !categoryId) return;
      dispatch(deleteCategory({ userId, projectId, categoryId }));
    },
    [dispatch]
  );

  const resetCategoryHandler = useCallback(() => {
    dispatch(resetCategoryState());
  }, [dispatch]);

  return {
    categories,
    isLoading,
    message,
    error,
    fetchCategoriesHandler,
    createCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
    resetCategoryHandler,
  };
};

export default useCategory;
