"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImage } from "@/store/hooks/useImage";
import { toast } from "sonner";
import ImageVerificationButton from "@/components/global/buttons/image-verification-button";
import ImageGrid from "@/components/global/menu/image-grid";

const ITEMS_PER_PAGE = 100;

const Page = () => {
  const { items, isLoading, getAllImages, pagination, approveAllImages } =
    useImage();

  const [page, setPage] = React.useState(1);

  const fetchPage = React.useCallback(async (pageNum = 1) => {
    await getAllImages({
      page: pageNum,
      limit: ITEMS_PER_PAGE,
    });
  }, []);

  React.useEffect(() => {
    fetchPage(page);
  }, [fetchPage, page]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pagination?.totalPages || 1)) return;
    setPage(newPage);
  };

  const handleApproveAll = async (approveAll = false) => {
    const confirmApprove = confirm(
      approveAll
        ? "✅ Approve ALL images? This will mark every image as approved."
        : `✅ Approve images from page ${page}?`
    );
    if (!confirmApprove) return;

    try {
      await approveAllImages({
        page,
        limit: ITEMS_PER_PAGE,
        all: approveAll,
      });

      toast.success(
        approveAll
          ? "All images approved successfully!"
          : `Images from page ${page} approved successfully!`
      );

      await fetchPage(approveAll ? 1 : page);
    } catch (err) {
      console.error("❌ Failed to approve images:", err);
      toast.error("Failed to approve images.");
    }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Images ({pagination?.totalCount || 0})
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all your uploaded images.
          </p>
        </div>

        <div className="flex justify-center items-center gap-3">
          <Button
            onClick={() => handleApproveAll(false)}
            disabled={isLoading || (items?.length ?? 0) === 0}
            variant="outline"
            className="flex items-center gap-2 rounded-md border-gray-300 hover:bg-gray-100 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Approve Page</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => handleApproveAll(true)}
            disabled={isLoading || (pagination?.totalCount ?? 0) === 0}
            variant="default"
            className="flex items-center gap-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Approving All...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve All</span>
              </>
            )}
          </Button>

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

          <ImageVerificationButton images={items || []} />
        </div>
      </div>

      <ImageGrid images={items || []} isLoading={isLoading} />

      {pagination?.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Page {page} of {pagination?.totalPages || 1} (
            {pagination?.totalCount || 0} images)
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
      )}
    </motion.div>
  );
};

export default Page;
