"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  XCircle,
  Star,
  StarOff,
  ShieldCheck,
  Search,
  X,
} from "lucide-react";

const ITEMS_PER_PAGE = 200;

const PremiumManagerPage = () => {
  const [images, setImages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCount, setSuccessCount] = useState(null);

  const scrollRef = useRef(null);

  // ── Fetch premium images ───────────────────────────────────────
  const fetchImages = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/image?premium=true&page=${pageNum}&limit=${ITEMS_PER_PAGE}&sort=title`
      );
      const data = await res.json();
      if (data.success) {
        setImages(data.data || []);
        setPagination(data.pagination || null);
      }
    } catch (err) {
      console.error("Failed to fetch premium images:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages(page);
    setSelected(new Set());
  }, [page, fetchImages]);

  // Auto-scroll active page into view
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-page="${page}"]`);
    if (activeBtn)
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [page, pagination]);

  // ── Selection helpers ─────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(images.map((img) => img._id)));
  const clearSelection = () => setSelected(new Set());

  // ── Submit: mark selected as premium=false ─────────────────────
  const handleRemovePremium = async () => {
    if (selected.size === 0) return;
    setIsSubmitting(true);
    setSuccessCount(null);
    try {
      const res = await fetch("/api/image", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selected),
          updates: { premium: false },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessCount(data.modifiedCount);
        setSelected(new Set());
        // Remove de-premiumed images from local state instantly
        setImages((prev) =>
          prev.filter((img) => !Array.from(selected).includes(img._id))
        );
        // Update pagination count
        setPagination((prev) =>
          prev
            ? {
                ...prev,
                totalCount: Math.max(0, (prev.totalCount || 0) - data.modifiedCount),
              }
            : prev
        );
      } else {
        alert(data.error || "Failed to update images.");
      }
    } catch (err) {
      console.error("Remove premium error:", err);
      alert("An error occurred while updating images.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage) => {
    const total = pagination?.totalPages || 1;
    if (newPage < 1 || newPage > total) return;
    setPage(newPage);
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="px-6 py-4">

          {/* Top row */}
          <div className="flex items-center justify-between gap-4 mb-2">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-200">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight flex items-center gap-2">
                  Premium Manager
                  <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                    premium = true
                  </span>
                </h1>
                <p className="text-xs text-gray-500">
                  {loading
                    ? "Loading…"
                    : `${pagination?.totalCount?.toLocaleString() ?? 0} premium images · select non-premium ones to remove`}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Success toast */}
              <AnimatePresence>
                {successCount !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onAnimationComplete={() =>
                      setTimeout(() => setSuccessCount(null), 3000)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      {successCount} removed from premium
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selection badge */}
              <AnimatePresence>
                {selected.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">
                      {selected.size} selected
                    </span>
                    <button
                      onClick={clearSelection}
                      className="text-amber-400 hover:text-amber-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remove Premium button */}
              <AnimatePresence>
                {selected.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleRemovePremium}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg transition-all duration-200 disabled:opacity-60 shadow-md shadow-amber-200"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                    {isSubmitting
                      ? "Updating…"
                      : `Remove Premium (${selected.size})`}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Select / Deselect All */}
              <button
                onClick={
                  selected.size === images.length && images.length > 0
                    ? clearSelection
                    : selectAll
                }
                disabled={loading || images.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-all duration-200 disabled:opacity-50"
              >
                {selected.size === images.length && images.length > 0 ? (
                  <><CheckSquare className="w-4 h-4" /> Deselect All</>
                ) : (
                  <><Square className="w-4 h-4" /> Select All</>
                )}
              </button>

              {/* Refresh */}
              <button
                onClick={() => fetchImages(page)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Hint banner */}
          <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              <strong>Tip:</strong> Click images that don't look premium to select them (highlighted in red), then click{" "}
              <strong>Remove Premium</strong> — they'll instantly disappear from this view.
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5">
        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-100 animate-pulse"
              >
                <div className="aspect-square" />
                <div className="px-2 py-1.5 bg-amber-100">
                  <div className="h-2.5 w-3/4 mx-auto rounded bg-amber-200" />
                </div>
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-5">
              <Star className="w-10 h-10 text-amber-300 fill-amber-200" />
            </div>
            <p className="text-lg font-semibold text-gray-600">No premium images</p>
            <p className="text-sm mt-1 text-gray-400">
              All done! No images are currently marked as premium.
            </p>
            <button
              onClick={() => fetchImages(1)}
              className="mt-5 px-4 py-2 text-sm font-medium text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          /* Grid */
          <motion.div
            key={`page-${page}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-6 gap-3"
          >
            {images.map((img, idx) => {
              const isSelected = selected.has(img._id);
              return (
                <motion.div
                  key={img._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, delay: Math.min(idx * 0.004, 0.25) }}
                  onClick={() => toggleSelect(img._id)}
                  className={`flex flex-col rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 ${
                    isSelected
                      ? "ring-[3px] ring-red-500 ring-offset-2 shadow-lg shadow-red-200/60"
                      : "ring-1 ring-amber-100 hover:ring-amber-300 hover:shadow-md"
                  }`}
                >
                  {/* Image area */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={img.image_url}
                      alt={img.title || "Image"}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        isSelected ? "brightness-75 saturate-50" : "group-hover:scale-105"
                      }`}
                      loading="lazy"
                      draggable={false}
                    />

                    {/* Selected overlay — red X */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-red-600/25 flex items-center justify-center"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                            <StarOff className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hover dimmer */}
                    {!isSelected && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
                    )}

                    {/* Top-left selection bubble */}
                    <div
                      className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                        isSelected
                          ? "bg-red-500 border-red-500"
                          : "bg-white/70 border-white/70 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>

                    {/* Badges top-right */}
                    <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end">
                      {img.latest && (
                        <div className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-bold shadow-sm">
                          LATEST
                        </div>
                      )}
                      <div className="px-1.5 py-0.5 rounded-full bg-amber-400 text-white text-[9px] font-bold shadow-sm flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        PRO
                      </div>
                      {img.food_type && (
                        <div
                          className={`w-2.5 h-2.5 rounded-full border border-white/80 ${
                            img.food_type === "veg"
                              ? "bg-green-500"
                              : img.food_type === "non_veg" || img.food_type === "non-veg"
                              ? "bg-red-500"
                              : "bg-amber-400"
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Title bar */}
                  <div
                    className={`px-2 py-1.5 text-center transition-colors duration-200 ${
                      isSelected ? "bg-red-50" : "bg-white group-hover:bg-amber-50/50"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium truncate leading-tight ${
                        isSelected ? "text-red-600" : "text-gray-600"
                      }`}
                      title={img.title || ""}
                    >
                      {img.title || <span className="italic text-gray-400">Untitled</span>}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && (pagination?.totalPages || 0) > 1 && (
          <div className="mt-8 pt-5 border-t border-amber-100">
            <p className="text-sm text-gray-500 mb-3 text-center">
              Page{" "}
              <span className="font-semibold text-gray-700">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{pagination?.totalPages}</span>
              &nbsp;·&nbsp;
              <span className="font-semibold text-amber-600">
                {pagination?.totalCount?.toLocaleString()}
              </span>{" "}
              premium images
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={scrollRef}
                className="flex items-center gap-1.5 overflow-x-auto flex-1 py-1 px-0.5"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {Array.from({ length: pagination?.totalPages || 0 }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      data-page={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`flex-shrink-0 w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        pageNum === page
                          ? "bg-amber-500 text-white shadow-md shadow-amber-200 scale-110"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-amber-400 hover:text-amber-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === (pagination?.totalPages || 1) || loading}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumManagerPage;
