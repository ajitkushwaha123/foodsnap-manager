"use client";

import { motion } from "framer-motion";
import { useImage } from "@/store/hooks/useImage";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  Star,
  UtensilsCrossed,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ImageGrid({ images, isLoading }) {
  const {
    updateImageStatus,
    MarkImageAsCombo,
    MarkImageAsLatest,
    MarkImageAsThali,
    removeImage,
  } = useImage();

  const [loadingId, setLoadingId] = useState(null);

  const performUpdate = async (fn, payload, successMsg) => {
    try {
      setLoadingId(payload.imageId);
      await fn(payload);
      toast.success(successMsg);
    } catch {
      toast.error("Action failed!");
    } finally {
      setLoadingId(null);
    }
  };

  if (!images?.length && !isLoading)
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        No images found
      </div>
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
      {images.map((img) => {
        const loading = loadingId === img._id;

        return (
          <motion.div
            key={img._id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-sm shadow-sm hover:shadow border border-gray-200 overflow-hidden"
          >
            <img
              src={img?.image_url}
              alt="img"
              className="w-full h-48 object-cover border-b border-gray-200"
            />

            {/* BADGES */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {img.isCombo && (
                <span className="px-2 py-[2px] text-xs bg-blue-600 text-white rounded">
                  Combo
                </span>
              )}
              {img.latest && (
                <span className="px-2 py-[2px] text-xs bg-green-600 text-white rounded">
                  Latest
                </span>
              )}
              {img.isThali && (
                <span className="px-2 py-[2px] text-xs bg-orange-600 text-white rounded">
                  Thali
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-2 py-2 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-5 gap-[6px]">
                <Button
                  className="h-9 "
                  variant={img.approved ? "default" : "outline"}
                  disabled={loading}
                  onClick={() =>
                    performUpdate(
                      updateImageStatus,
                      { imageId: img._id, status: !img.approved },
                      "Status updated!"
                    )
                  }
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  className="h-9"
                  variant={img.isCombo ? "default" : "outline"}
                  disabled={loading}
                  onClick={() =>
                    performUpdate(
                      MarkImageAsCombo,
                      { imageId: img._id, is_combo: !img.isCombo },
                      "Combo updated!"
                    )
                  }
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <UtensilsCrossed className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  className="h-9"
                  variant={img.latest ? "default" : "outline"}
                  disabled={loading}
                  onClick={() =>
                    performUpdate(
                      MarkImageAsLatest,
                      { imageId: img._id, is_latest: !img.latest },
                      "Latest updated!"
                    )
                  }
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  className="h-9"
                  variant={img.isThali ? "default" : "outline"}
                  disabled={loading}
                  onClick={() =>
                    performUpdate(
                      MarkImageAsThali,
                      { imageId: img._id, is_thali: !img.isThali },
                      "Thali updated!"
                    )
                  }
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <span className="text-lg">🍱</span>
                  )}
                </Button>

                <Button
                  className="h-9"
                  variant="destructive"
                  disabled={loading}
                  onClick={() =>
                    performUpdate(
                      removeImage,
                      { imageId: img._id },
                      "Image deleted!"
                    )
                  }
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
