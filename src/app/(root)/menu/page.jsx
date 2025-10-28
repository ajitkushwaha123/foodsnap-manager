"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductTable from "@/components/global/table/product-table";
import { useClientAuthData } from "@/lib/auth/client-auth";
import { useProject } from "@/store/hooks/useProject";
import { useProduct } from "@/store/hooks/useProduct";
import useCategory from "@/store/hooks/useCategory";

const ITEMS_PER_PAGE = 10;

const Page = () => {
  const { userId } = useClientAuthData();
  const { activeProjectId } = useProject();
  const { items, isLoading, getAllProducts, pagination } = useProduct();
  const { fetchCategoriesHandler } = useCategory();

  console.log("Rendering Product Page", pagination);

  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    if (!userId || !activeProjectId) return;
    setPage(1);
    fetchCategoriesHandler(userId, activeProjectId);
  }, [userId, activeProjectId, fetchCategoriesHandler]);

  const fetchPage = React.useCallback(
    async (pageNum = 1) => {
      if (!userId || !activeProjectId) return;
      await getAllProducts({
        userId,
        projectId: activeProjectId,
        page: pageNum,
        limit: ITEMS_PER_PAGE,
      });
    },
    [userId, activeProjectId, getAllProducts]
  );

  React.useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pagination?.totalPages || 1)) return;
    setPage(newPage);
  };

  const renderPageButtons = () => {
    const totalPages = pagination?.totalPages || 1;
    const buttons = [];
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          variant={i === page ? "default" : "outline"}
          disabled={isLoading}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 bg-gradient-to-b from-gray-50 to-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your imported food items for Zomato & Swiggy.
          </p>
        </div>

        <Button
          onClick={() => fetchPage(page)}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2 rounded-md border-gray-300 hover:bg-gray-100 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCcw className="w-4 h-4" />
              <span>Refresh</span>
            </>
          )}
        </Button>
      </div>

      {/* Product Table */}
      <ProductTable isLoading={isLoading} products={items || []} page={page} />

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-500">
          Page {page} of {pagination?.totalPages || 1} (
          {pagination?.totalCount || 0} items)
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || isLoading}
            onClick={() => handlePageChange(page - 1)}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>

          {renderPageButtons()}

          <Button
            variant="outline"
            size="sm"
            disabled={page === (pagination?.totalPages || 1) || isLoading}
            onClick={() => handlePageChange(page + 1)}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Page;
