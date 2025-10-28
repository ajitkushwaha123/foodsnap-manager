"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  IndianRupee,
  Loader2,
  PackageSearch,
  Trash2,
} from "lucide-react";
import ZomatoImportPopover from "../scrape/zomato-import-popover";
import { useProduct } from "@/store/hooks/useProduct";

const ProductGrid = ({ products, isLoading, page }) => {
  const [search, setSearch] = React.useState("");
  const { deleteProductById } = useProduct();

  const filtered = products?.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const showEmpty = !isLoading && (!products || products.length === 0);
  const showNoMatch =
    !isLoading && filtered.length === 0 && products.length > 0;

  const renderCard = (product, index) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="bg-white shadow-sm rounded-lg border p-4 flex flex-col space-y-2 hover:shadow-md transition-shadow"
    >
      {/* Image */}
      {product.img ? (
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-32 rounded-md object-cover mb-2"
        />
      ) : (
        <div className="w-full h-32 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
          <ImageIcon className="w-8 h-8" />
        </div>
      )}

      {/* Name */}
      <h3 className="text-gray-800 font-semibold capitalize truncate">
        {product.name}
      </h3>

      {/* Category & Subcategory */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary" className="capitalize">
          {product.category}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {product.sub_category}
        </Badge>
      </div>

      {/* Price */}
      <div className="flex items-center gap-1 font-semibold text-gray-700">
        <IndianRupee className="w-4 h-4" />
        {product.base_price.toFixed(2)}
      </div>

      {/* Food Type */}
      <Badge
        className={`${
          product.food_type?.toLowerCase() === "veg"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {product.food_type}
      </Badge>

      {/* Actions */}
      <div className="mt-auto flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteProductById(product.id)}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  return (
    <Card>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-gray-600 text-sm font-medium">
              Fetching your latest product list...
            </p>
          </div>
        ) : showEmpty ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <PackageSearch className="w-16 h-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-800">
              No products yet
            </h3>
            <p className="text-gray-500 text-sm">
              Once you import from Zomato or Swiggy, your items will appear
              here.
            </p>
            <ZomatoImportPopover />
          </div>
        ) : showNoMatch ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <PackageSearch className="w-14 h-14 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-800">
              No results found
            </h3>
            <p className="text-gray-500 text-sm">
              Try a different name or keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product, i) => renderCard(product, i))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductGrid;
