"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import axios from "axios";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (uploadedFiles) => {
    if (uploadedFiles.length > 0) {
      setFile(uploadedFiles[0]);
      console.log("Selected file:", uploadedFiles[0]);
    } else {
      setFile(null);
    }
  };

  const handleImageUpload = async () => {
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("images", file);

    try {
      setIsUploading(true);

      const response = await axios.post("/api/image/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload success:", response.data);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full mx-auto h-[100%] overflow-y-scroll border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-6 flex flex-col items-center justify-center space-y-4">
      <FileUpload onChange={handleFileUpload} multiple={false} />

      <Button onClick={handleImageUpload} disabled={isUploading || !file}>
        {isUploading ? "Uploading..." : "Submit"}
      </Button>
    </div>
  );
};

export default ImageUpload;
