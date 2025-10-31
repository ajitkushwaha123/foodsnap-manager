"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";

const AutomationButton = ({
  products = [],
  page = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(page);

  const runAutomation = async (items) => {
    await axios.post(
      `${
        process.env.NEXT_PUBLIC_AUTOMATION_SERVER_URL || "http://localhost:5000"
      }/api/zomato`,
      { data: items }
    );
  };

  const startAutomation = async () => {
    if (!products.length) return;
    setError(null);
    setIsLoading(true);

    try {
      let current = page;

      while (current <= totalPages) {
        console.log(`🚀 Running automation for page ${current}`);
        await runAutomation(products);

        if (current < totalPages && onPageChange) {
          // Wait for parent to fetch next 100
          await new Promise((resolve) => {
            const interval = setInterval(() => {
              // parent updates products when ready
              if (products.length > 0) {
                clearInterval(interval);
                resolve();
              }
            }, 1000);
          });
          onPageChange(current + 1);
        }

        setCurrentPage(current);
        current++;
      }

      console.log("✅ Automation complete for all pages!");
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
            Automating page {currentPage}...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Start Automation
          </>
        )}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default AutomationButton;
