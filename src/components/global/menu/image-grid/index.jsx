"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  Loader2,
  PackageSearch,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useImage } from "@/store/hooks/useImage";

export default function ImageGrid({ images, isLoading }) {
  const { removeImage, updateImageStatus } = useImage();
  const [deletingId, setDeletingId] = React.useState(null);
  const [updatingId, setUpdatingId] = React.useState(null);

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      setDeletingId(id);
      await removeImage({ imageId: id });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleApproved = async (img) => {
    if (!img?._id) return;
    const newStatus = !img.approved;
    console.log("🔄 Toggling approved status for image:", img._id, newStatus);
    try {
      setUpdatingId(img._id);
      await updateImageStatus({ imageId: img._id, status: newStatus });
    } catch (err) {
      console.error("❌ Failed to update image status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const showEmpty = !isLoading && (!images || images.length === 0);

  return (
    <div className="w-full">
      <Card className="w-full border-none shadow-none">
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              <p className="text-gray-600 text-sm font-medium">
                Fetching your latest images...
              </p>
            </div>
          ) : showEmpty ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
              <PackageSearch className="w-16 h-16 text-gray-300" />
              <h3 className="text-md font-semibold text-gray-800">
                No images found
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Once you upload or import images, they’ll appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img) => (
                <motion.div
                  key={img._id}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="w-full cursor-pointer"
                >
                  <Card
                    className={`overflow-hidden border-2 rounded-md p-3  ${
                      img.approved ? "border-green-300" : "border-red-300"
                    } shadow-sm hover:shadow-md transition relative group`}
                  >
                    <div className="relative border-2 rounded-md overflow-hidden">
                      {img?.image_url ? (
                        <img
                          src={img.image_url}
                          alt={img.title || "Image"}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="text-gray-400 w-8 h-8" />
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <Button
                          size="icon"
                          variant={img.approved ? "destructive" : "default"}
                          className={
                            img.approved
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          }
                          onClick={() => handleToggleApproved(img)}
                          disabled={updatingId === img._id}
                          title={
                            img.approved
                              ? "Mark as not approved"
                              : "Mark as approved"
                          }
                        >
                          {updatingId === img._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : img.approved ? (
                            <X className="w-4 h-4 text-white" />
                          ) : (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(img._id)}
                          disabled={deletingId === img._id}
                        >
                          {deletingId === img._id ? (
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
