"use client";

import { useSelector, useDispatch } from "react-redux";
import { X } from "lucide-react";
import { hideNotification } from "@/store/slices/notificationSlice";

export default function NotificationBar() {
  const dispatch = useDispatch();
  const { message, type, visible, action } = useSelector(
    (state) => state.notification
  );

  if (!visible) return null;

  const typeStyles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-yellow-500 text-black",
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 shadow-md ${typeStyles[type]} flex justify-between items-center p-4`}
    >
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>

      {action && (
        <button
          onClick={action.callback}
          className="ml-4 px-3 py-1 border rounded hover:opacity-90 transition"
        >
          {action.label}
        </button>
      )}

      <button
        onClick={() => dispatch(hideNotification())}
        className="ml-4 flex items-center justify-center w-6 h-6"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
