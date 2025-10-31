"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";

const AutomationButton = ({ products = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startAutomation = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${
          process.env.NEXT_PUBLIC_AUTOMATION_SERVER_URL ||
          "http://localhost:5000"
        }/api/zomato`,
        { data: products }
      );

      console.log("Automation started successfully:", response.data);
    } catch (err) {
      console.error("Automation error:", err);
      setError("Failed to start automation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={startAutomation} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please Wait...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Start Automation
          </>
        )}
      </Button>

      {error && <p className="mt-2 text-sm text-red-500">Error: {error}</p>}
    </>
  );
};

export default AutomationButton;
