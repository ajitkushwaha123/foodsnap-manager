"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";

const ImageVerificationButton = ({ products = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startProcessing = async (items) => {
    try {
      await axios.post(`/api/library/upload`, { data: items });
    } catch (err) {
      console.error("Error in startProcessing:", err);
      throw err;
    }
  };

  const startAutomation = async () => {
    if (!products.length) return;
    setError(null);
    setIsLoading(true);

    try {
      await startProcessing(products);
    } catch (err) {
      console.error("Automation error:", err);
      setError("Failed to complete automation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={startAutomation}
        disabled={isLoading || !products.length}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Automating page...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Start Processing
          </>
        )}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ImageVerificationButton;
