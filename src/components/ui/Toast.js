"use client";

import { useEffect, useState } from "react";
import { HiCheckCircle, HiXCircle, HiInformationCircle } from "react-icons/hi2";

export function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: HiCheckCircle,
    error: HiXCircle,
    info: HiInformationCircle,
  };

  const styles = {
    success: "bg-chart-3 text-white",
    error: "bg-destructive text-destructive-foreground",
    info: "bg-primary text-primary-foreground",
  };

  const Icon = icons[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-5 duration-300 ${styles[type]}`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="font-medium">{message}</p>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return { toast, showToast, hideToast };
}
