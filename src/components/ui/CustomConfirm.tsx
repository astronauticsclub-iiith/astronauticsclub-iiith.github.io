"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, HelpCircle } from "lucide-react";

interface CustomConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export default function CustomConfirm({
  isOpen,
  title,
  message,
  confirmText = "CONFIRM",
  cancelText = "CANCEL",
  type = "warning",
  onConfirm,
  onCancel,
  children,
}: CustomConfirmProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          titleColor: "text-red-400",
          confirmBg:
            "bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700",
          icon: AlertTriangle,
        };
      case "warning":
        return {
          titleColor: "text-yellow-400",
          confirmBg:
            "bg-yellow-600 border-yellow-600 hover:bg-yellow-700 hover:border-yellow-700",
          icon: AlertTriangle,
        };
      case "info":
        return {
          titleColor: "text-blue-400",
          confirmBg:
            "bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700",
          icon: Info,
        };
      default:
        return {
          titleColor: "text-white",
          confirmBg:
            "bg-white border-white hover:bg-[#e0e0e0] hover:border-[#e0e0e0] text-background",
          icon: HelpCircle,
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
            onClick={onCancel}
          />

          {/* Confirm Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative bg-background border-2 sm:border-4 border-white p-4 sm:p-6 w-full max-w-xs sm:max-w-md mx-auto backdrop-blur-sm shadow-2xl shadow-white/10 hover:shadow-white/20 transition-shadow duration-300"
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex-shrink-0"
              >
                <styles.icon
                  size={24}
                  className={`${styles.titleColor} sm:w-7 sm:h-7`}
                />
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`${styles.titleColor} font-bold text-base sm:text-lg uppercase mb-2 leading-tight`}
                >
                  {title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="text-white font-medium leading-relaxed text-sm sm:text-base"
                >
                  {message}
                </motion.p>
                {children && <div className="mt-4">{children}</div>}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <button
                onClick={onCancel}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 ${styles.confirmBg} font-bold transition-all duration-200 uppercase text-sm sm:text-base text-white hover:scale-105 active:scale-95`}
              >
                {confirmText}
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
