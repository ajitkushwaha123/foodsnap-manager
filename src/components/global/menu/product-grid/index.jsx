"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  IndianRupee,
  Loader2,
  PackageSearch,
  Trash2,
} from "lucide-react";
import ZomatoImportPopover from "../../scrape/zomato-import-popover";
import { useProduct } from "@/store/hooks/useProduct";

export default function ProductGrid({
  products,
  isLoading,
  userId,
  projectId,
}) {
  const { removeProduct } = useProduct();
  const [deletingId, setDeletingId] = React.useState(null); // <-- track which one is deleting

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await removeProduct({ userId, projectId, productId: id });
    } finally {
      setDeletingId(null);
    }
  };

  const showEmpty = !isLoading && (!products || products?.length === 0);

  return (
    <div className="w-full">
      <Card className="w-full border-none shadow-none">
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
              <h3 className="text-md font-semibold text-gray-800">
                No products yet
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Once you import from Zomato or Swiggy, your items will appear
                here.
              </p>
              <ZomatoImportPopover />
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="w-full cursor-pointer"
                >
                  <Card className="overflow-hidden rounded-md p-3 shadow-sm hover:shadow-md transition relative group">
                    <div className="relative">
                      {product?.img ? (
                        <img
                          src={product.img}
                          alt={product.name || "Product"}
                          className="w-full h-48 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded">
                          <ImageIcon className="text-gray-400 w-8 h-8" />
                        </div>
                      )}

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingId === product._id}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                      >
                        {deletingId === product._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
