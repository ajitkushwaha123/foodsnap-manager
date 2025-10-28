"use client";
import { useState, useEffect } from "react";

export const useActiveProjectId = (projects = []) => {
  const [activeProjectId, setActiveProjectId] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      return localStorage.getItem("activeProjectId");
    }
    return null;
  });

  useEffect(() => {
    if (!projects || projects.length === 0) return;

    const exists = projects.find((p) => p._id === activeProjectId);
    const initialId = exists ? activeProjectId : projects[0]._id;

    setActiveProjectId(initialId);
    localStorage.setItem("activeProjectId", initialId);
  }, [projects]);

  // Update localStorage when activeProjectId changes
  useEffect(() => {
    if (!activeProjectId) {
      localStorage.removeItem("activeProjectId");
    } else {
      localStorage.setItem("activeProjectId", activeProjectId);
    }
  }, [activeProjectId]);

  // Listen to storage changes from other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "activeProjectId") {
        setActiveProjectId(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return [activeProjectId, setActiveProjectId];
};
