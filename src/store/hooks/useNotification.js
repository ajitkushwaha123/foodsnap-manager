"use client";
import { useDispatch } from "react-redux";
import { showNotification } from "../slices/notificationSlice";

export const useNotification = () => {
  const dispatch = useDispatch();

  const pushNotification = ({ message, type = "info", action = null }) => {
    if (!message) return;
    dispatch(showNotification({ message, type, action }));
  };

  return { pushNotification };
};
