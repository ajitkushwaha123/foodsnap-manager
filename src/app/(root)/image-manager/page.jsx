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
  Images,
  XCircle,
  Trash2,
  Search,
  X,
} from "lucide-react";
import { useImage } from "@/store/hooks/useImage";

const ITEMS_PER_PAGE = 5000;
const SEARCH_LIMIT = 5000;

const FOOD_TYPE_CHIPS = [
  { label: "All", value: "", color: "gray" },
  { label: "🥦 Veg", value: "veg", color: "green" },
  { label: "🍗 Non-Veg", value: "non-veg", color: "red" },
  { label: "🥚 Egg", value: "egg", color: "yellow" },
];

const chipActiveClass = {
  gray: "bg-gray-800 text-white border-gray-800",
  green: "bg-green-500 text-white border-green-500 shadow-sm shadow-green-200",
  red: "bg-red-500 text-white border-red-500 shadow-sm shadow-red-200",
  yellow: "bg-amber-400 text-white border-amber-400 shadow-sm shadow-amber-200",
};

const Page = () => {
  const { items, isLoading, pagination } = useImage();

  // ── Browse state ──────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [localImages, setLocalImages] = useState([]);
  const [localPagination, setLocalPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Search state ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [foodType, setFoodType] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [searchPagination, setSearchPagination] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // ── Selection state ───────────────────────────────────────────
  const [selected, setSelected] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingLatest, setIsMarkingLatest] = useState(false);

  const isSearchMode = debouncedQuery.trim().length > 0 || foodType !== "";

  // ── Derived display values ────────────────────────────────────
  const displayImages = isSearchMode ? searchResults : localImages;
  const displayPagination = isSearchMode ? searchPagination : localPagination;
  const displayLoading = isSearchMode ? isSearching : loading;
  const displayPage = isSearchMode ? searchPage : page;

  // ── Debounce search input (300 ms) ────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setSearchPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset search page when filter changes
  useEffect(() => {
    setSearchPage(1);
  }, [foodType]);

  // ── Fetch browse page ─────────────────────────────────────────
  const fetchPage = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/image?page=${pageNum}&limit=${ITEMS_PER_PAGE}&sort=title`
      );
      const data = await res.json();
      if (data.success) {
        setLocalImages(data.data || []);
        setLocalPagination(data.pagination || null);
      }
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch search results ──────────────────────────────────────
  const fetchSearch = useCallback(async (q, pg, ft) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: SEARCH_LIMIT });
      if (q) params.set("q", q);
      if (ft) params.set("food_type", ft);
      const res = await fetch(`/api/image/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data || []);
        setSearchPagination(data.pagination || null);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // ── Effects ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isSearchMode) {
      fetchPage(page);
      setSelected(new Set());
    }
  }, [page, fetchPage, isSearchMode]);

  useEffect(() => {
    if (isSearchMode) {
      fetchSearch(debouncedQuery, searchPage, foodType);
      setSelected(new Set());
    }
  }, [debouncedQuery, searchPage, foodType, fetchSearch, isSearchMode]);

  // ── Handlers ─────────────────────────────────────────────────
  const handlePageChange = (newPage) => {
    const total = displayPagination?.totalPages || 1;
    if (newPage < 1 || newPage > total) return;
    if (isSearchMode) setSearchPage(newPage);
    else setPage(newPage);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelected(new Set(displayImages.map((img) => img._id)));
  const clearSelection = () => setSelected(new Set());

  const handleDelete = async () => {
    if (selected.size === 0) return;
    const confirmed = window.confirm(
      `Delete ${selected.size} image${selected.size > 1 ? "s" : ""}? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(new Set());
        if (isSearchMode) fetchSearch(debouncedQuery, searchPage, foodType);
        else fetchPage(page);
      } else {
        alert(data.error || "Failed to delete images.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsLatest = async () => {
    if (selected.size === 0) return;
    
    setIsMarkingLatest(true);
    try {
      const res = await fetch("/api/image", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selected),
          updates: { latest: true, premium: true },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(new Set());
        if (isSearchMode) fetchSearch(debouncedQuery, searchPage, foodType);
        else fetchPage(page);
      } else {
        alert(data.error || "Failed to mark images as latest.");
      }
    } catch (err) {
      console.error("Mark as latest error:", err);
      alert("An error occurred while updating images.");
    } finally {
      setIsMarkingLatest(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setFoodType("");
    setSearchPage(1);
    setSearchResults([]);
    setSearchPagination(null);
  };

  // Auto-scroll active page button into view
  const scrollRef = useRef(null);
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-page="${displayPage}"]`);
    if (activeBtn)
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [displayPage, displayPagination]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="px-6 py-4">

          {/* Top row: title + controls */}
          <div className="flex items-center justify-between gap-4 mb-3">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
                <Images className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Image Manager
                </h1>
                <p className="text-xs text-gray-500">
                  {isSearchMode
                    ? `${displayPagination?.totalCount?.toLocaleString() ?? 0} results`
                    : `${localPagination?.totalCount?.toLocaleString() ?? 0} images · sorted A→Z`}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Selection badge */}
              <AnimatePresence>
                {selected.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-lg"
                  >
                    <CheckSquare className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-semibold text-violet-700">
                      {selected.size} selected
                    </span>
                    <button
                      onClick={clearSelection}
                      className="text-violet-400 hover:text-violet-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mark as Latest button */}
              <AnimatePresence>
                {selected.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleMarkAsLatest}
                    disabled={isMarkingLatest}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-200 disabled:opacity-60 shadow-sm shadow-blue-200"
                  >
                    {isMarkingLatest ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckSquare className="w-4 h-4" />
                    )}
                    {isMarkingLatest ? "Updating…" : `Mark as Latest`}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Delete button */}
              <AnimatePresence>
                {selected.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 disabled:opacity-60 shadow-sm shadow-red-200"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {isDeleting ? "Deleting…" : `Delete ${selected.size}`}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Select / Deselect all */}
              <button
                onClick={
                  selected.size === displayImages.length && displayImages.length > 0
                    ? clearSelection
                    : selectAll
                }
                disabled={displayLoading || displayImages.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-violet-400 hover:text-violet-600 transition-all duration-200 disabled:opacity-50"
              >
                {selected.size === displayImages.length && displayImages.length > 0 ? (
                  <><CheckSquare className="w-4 h-4" /> Deselect All</>
                ) : (
                  <><Square className="w-4 h-4" /> Select All</>
                )}
              </button>

              {/* Refresh (browse mode only) */}
              {!isSearchMode && (
                <button
                  onClick={() => fetchPage(page)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-violet-400 hover:text-violet-600 transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              )}
            </div>
          </div>

          {/* Search row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px] max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="image-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, tags, cuisine, description…"
                className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200 placeholder:text-gray-400"
              />
              {/* Clear / loading indicator */}
              {isSearching ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 animate-spin pointer-events-none" />
              ) : (searchQuery || foodType) ? (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Food-type filter chips */}
            <div className="flex items-center gap-1.5">
              {FOOD_TYPE_CHIPS.map((chip) => {
                const isActive = foodType === chip.value;
                return (
                  <button
                    key={chip.value}
                    onClick={() =>
                      setFoodType(chip.value === foodType ? "" : chip.value)
                    }
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                      isActive
                        ? chipActiveClass[chip.color]
                        : "bg-white text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-600"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* "Searching for…" label */}
            <AnimatePresence>
              {isSearchMode && debouncedQuery && (
                <motion.p
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="text-xs text-gray-500 whitespace-nowrap"
                >
                  Showing results for{" "}
                  <span className="font-semibold text-violet-600">
                    "{debouncedQuery}"
                  </span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5">
        {/* Loading skeleton */}
        {displayLoading ? (
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"
              >
                <div className="aspect-square" />
                <div className="px-2 py-1.5 bg-gray-200">
                  <div className="h-2.5 w-3/4 mx-auto rounded bg-gray-300" />
                </div>
              </div>
            ))}
          </div>
        ) : displayImages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            {isSearchMode ? (
              <>
                <Search className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm mt-1">Try a different keyword or remove filters</p>
                <button
                  onClick={clearSearch}
                  className="mt-5 px-4 py-2 text-sm font-medium text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <Images className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">No images found</p>
                <p className="text-sm mt-1">Try refreshing or uploading new images</p>
              </>
            )}
          </div>
        ) : (
          /* Grid */
          <motion.div
            key={
              isSearchMode
                ? `search-${debouncedQuery}-${foodType}-${searchPage}`
                : `browse-${page}`
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-6 gap-3"
          >
            {displayImages.map((img, idx) => {
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
                      ? "ring-[3px] ring-violet-500 ring-offset-2 shadow-lg shadow-violet-200/50"
                      : "ring-1 ring-transparent hover:ring-gray-300 hover:shadow-md"
                  }`}
                >
                  {/* Image area */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={img.image_url}
                      alt={img.title || "Image"}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        isSelected ? "brightness-90" : "group-hover:scale-105"
                      }`}
                      loading="lazy"
                      draggable={false}
                    />

                    {/* Selected overlay */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-violet-600/20 flex items-center justify-center"
                        >
                          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hover dimmer */}
                    {!isSelected && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
                    )}

                    {/* Top-left check bubble */}
                    <div
                      className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                        isSelected
                          ? "bg-violet-600 border-violet-600"
                          : "bg-white/70 border-white/70 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Food-type dot */}
                    <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end">
                      {img.latest && (
                        <div className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold shadow-sm">
                          LATEST
                        </div>
                      )}
                      {img.food_type && (
                        <div
                          className={`w-2.5 h-2.5 rounded-full border border-white/80 ${
                            img.food_type === "veg"
                              ? "bg-green-500"
                              : img.food_type === "non-veg"
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
                      isSelected ? "bg-violet-50" : "bg-white group-hover:bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium truncate leading-tight ${
                        isSelected ? "text-violet-700" : "text-gray-600"
                      }`}
                      title={img.title || ""}
                    >
                      {img.title || (
                        <span className="italic text-gray-400">Untitled</span>
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {!displayLoading && (displayPagination?.totalPages || 0) > 1 && (
          <div className="mt-8 pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3 text-center">
              Page{" "}
              <span className="font-semibold text-gray-700">{displayPage}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {displayPagination?.totalPages}
              </span>
              &nbsp;·&nbsp;
              <span className="font-semibold text-gray-700">
                {displayPagination?.totalCount?.toLocaleString()}
              </span>{" "}
              {isSearchMode ? "results" : "total images"}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(displayPage - 1)}
                disabled={displayPage === 1 || displayLoading}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={scrollRef}
                className="flex items-center gap-1.5 overflow-x-auto flex-1 py-1 px-0.5"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {Array.from(
                  { length: displayPagination?.totalPages || 0 },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <button
                    key={pageNum}
                    data-page={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={displayLoading}
                    className={`flex-shrink-0 w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      pageNum === displayPage
                        ? "bg-violet-600 text-white shadow-md shadow-violet-200 scale-110"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-violet-400 hover:text-violet-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(displayPage + 1)}
                disabled={
                  displayPage === (displayPagination?.totalPages || 1) ||
                  displayLoading
                }
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 bg-white"
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

export default Page;
