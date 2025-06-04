'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, AlertTriangle, Info, Megaphone } from 'lucide-react';

interface CustomAlertProps {
  isOpen: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  autoCloseDelay?: number;
}

export default function CustomAlert({ 
  isOpen, 
  message, 
  type, 
  onClose, 
  autoCloseDelay = 5000 
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
      case 'success':
        return {
          bg: 'bg-green-900',
          border: 'border-green-500',
          text: 'text-green-100',
          icon: CheckCircle
        };
      case 'error':
        return {
          bg: 'bg-red-900',
          border: 'border-red-500',
          text: 'text-red-100',
          icon: X
        };
      case 'warning':
        return {
          bg: 'bg-yellow-900',
          border: 'border-yellow-500',
          text: 'text-yellow-100',
          icon: AlertTriangle
        };
      case 'info':
        return {
          bg: 'bg-blue-900',
          border: 'border-blue-500',
          text: 'text-blue-100',
          icon: Info
        };
      default:
        return {
          bg: 'bg-background',
          border: 'border-white',
          text: 'text-white',
          icon: Megaphone
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Alert Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative ${styles.bg} border-4 ${styles.border} p-6 max-w-md mx-4 backdrop-blur-sm`}
          >
            <div className="flex items-start gap-4">
              <styles.icon size={24} className={styles.text} />
              <div className="flex-1">
                <p className={`${styles.text} font-bold text-sm uppercase leading-relaxed`}>
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`${styles.text} hover:bg-white hover:text-background transition-colors px-2 py-1 border-2 ${styles.border} font-bold text-lg`}
              >
                ×
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}