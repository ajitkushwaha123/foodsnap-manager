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
  Info,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ZomatoImportPopover from "../../scrape/zomato-import-popover";
import { useProduct } from "@/store/hooks/useProduct";

export default function ProductGrid({
  products,
  isLoading,
  userId,
  projectId,
}) {
  const { removeProduct } = useProduct();
  const [deletingId, setDeletingId] = React.useState(null);

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
                  <Card
                    className={`overflow-hidden border-2 ${
                      product.status == "accepted"
                        ? "border-blue-300"
                        : product.status == "queued"
                        ? "border-yellow-300"
                        : product.status == "done"
                        ? "border-green-500"
                        : product.status == "rejected"
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md p-3 shadow-sm hover:shadow-md transition relative group`}
                  >
                    <div className="relative border-2 rounded-md overflow-hidden">
                      {/* Product Image */}
                      {product?.img ? (
                        <img
                          src={product.img}
                          alt={product.name || "Product"}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="text-gray-400 w-8 h-8" />
                        </div>
                      )}

                      {/* Buttons (Top Right Corner) */}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        {/* Info Button with Popover */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="bg-white/80 hover:bg-white"
                            >
                              <Info className="w-4 h-4 text-gray-700" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-64 text-sm"
                            side="left"
                            align="start"
                          >
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-800">
                                Status Info
                              </h4>
                              <div>
                                <span className="font-medium">Current:</span>{" "}
                                <span
                                  className={`capitalize ${
                                    product.status === "failed"
                                      ? "text-red-500"
                                      : product.status === "done"
                                      ? "text-green-600"
                                      : product.status === "queued"
                                      ? "text-yellow-600"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {product.status}
                                </span>
                              </div>
                              {product.reason && (
                                <div>
                                  <span className="font-medium">Reason:</span>{" "}
                                  {product.reason}
                                </div>
                              )}
                              {product.status_logs?.length > 0 && (
                                <div className="max-h-40 overflow-y-auto border-t pt-2">
                                  <p className="font-medium mb-1">
                                    Status Logs:
                                  </p>
                                  <ul className="space-y-1">
                                    {product.status_logs.map((log, idx) => (
                                      <li
                                        key={idx}
                                        className="border rounded p-1 text-xs text-gray-600"
                                      >
                                        <div>
                                          <span className="font-medium">
                                            {log.status}
                                          </span>{" "}
                                          – {log.reason || "No reason"}
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                          {new Date(
                                            log.timestamp
                                          ).toLocaleString()}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>

                        {/* Delete Button */}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                        >
                          {deletingId === product._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
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
