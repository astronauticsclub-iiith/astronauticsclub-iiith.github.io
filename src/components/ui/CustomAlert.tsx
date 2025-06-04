"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, AlertTriangle, Info, Megaphone } from "lucide-react";

interface CustomAlertProps {
  isOpen: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
  autoCloseDelay?: number;
}

export default function CustomAlert({
  isOpen,
  message,
  type,
  onClose,
  autoCloseDelay = 5000,
}: CustomAlertProps) {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-900/90",
          border: "border-green-400",
          text: "text-green-100",
          icon: CheckCircle,
        };
      case "error":
        return {
          bg: "bg-red-900/90",
          border: "border-red-400",
          text: "text-red-100",
          icon: X,
        };
      case "warning":
        return {
          bg: "bg-yellow-900/90",
          border: "border-yellow-400",
          text: "text-yellow-100",
          icon: AlertTriangle,
        };
      case "info":
        return {
          bg: "bg-blue-900/90",
          border: "border-blue-400",
          text: "text-blue-100",
          icon: Info,
        };
      default:
        return {
          bg: "bg-background/90",
          border: "border-white",
          text: "text-white",
          icon: Megaphone,
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Alert Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`relative ${styles.bg} border-2 sm:border-4 ${styles.border} p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-auto backdrop-blur-sm shadow-2xl shadow-black/20 hover:shadow-black/30 transition-shadow duration-300 flex items-center justify-between`}
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex items-center gap-3 sm:gap-4"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                }}
                className="flex-shrink-0"
              >
                <styles.icon
                  size={20}
                  className={`${styles.text} sm:w-6 sm:h-6`}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex-1 min-w-0"
              >
                <p
                  className={`${styles.text} font-bold text-sm sm:text-base uppercase leading-relaxed`}
                >
                  {message}
                </p>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`${styles.text} hover:bg-white hover:text-background transition-all duration-200 px-1.5 sm:px-2 py-0.5 sm:py-1 border-2 ${styles.border} font-bold text-base sm:text-lg flex-shrink-0 min-w-[2rem] sm:min-w-[2.5rem] flex items-center justify-center`}
              >
                ×
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
