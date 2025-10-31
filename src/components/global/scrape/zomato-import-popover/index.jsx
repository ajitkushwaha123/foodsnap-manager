"use client";

import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useClientAuthData } from "@/lib/auth/client-auth";
import { useProject } from "@/store/hooks/useProject";
import { useNotification } from "@/store/hooks/useNotification";

export default function ZomatoImportPopover() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState(null); 
  const { userId } = useClientAuthData();
  const { activeProjectId } = useProject();
  const { pushNotification } = useNotification();

  const handleSubmit = async () => {
    if (!url.trim() || !userId || !activeProjectId) return;

    setStatus("loading");

    try {
      await axios.post(
        `/api/${userId}/projects/${activeProjectId}/products/scrape`,
        { pageUrl: url }
      );

      setStatus("success");
      setUrl("");

      pushNotification({
        message: "Zomato import request queued successfully.",
        type: "success",
      });

      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      console.error("❌ Zomato import failed:", err);
      setStatus("error");

      pushNotification({
        message:
          err.response?.data?.message ||
          "Failed to import menu from Zomato. Please try again.",
        type: "error",
      });

      setTimeout(() => setStatus(null), 2500);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" className="flex items-center gap-2 rounded-md">
          <PlusCircle className="w-4 h-4" />
          Import Products
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4 rounded-2xl shadow-xl border bg-white">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          Enter Zomato URL
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          Paste the restaurant link you want to import.
        </p>

        <Input
          placeholder="e.g. ncr/henxs-cafe-1-dlf-phase-3-gurgaon/order"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mb-3 border-gray-300 focus-visible:ring-2 focus-visible:ring-red-500"
        />

        <Button
          onClick={handleSubmit}
          disabled={status === "loading" || status === "success"}
          className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 rounded-lg"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            "Import"
          )}
        </Button>

        <AnimatePresence>
          {status === "success" && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-green-600 text-sm text-center mt-2"
            >
              ✅ Import request queued!
            </motion.p>
          )}
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-red-600 text-sm text-center mt-2"
            >
              ❌ Failed to import menu.
            </motion.p>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}
