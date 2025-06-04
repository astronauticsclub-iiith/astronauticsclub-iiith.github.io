'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface CustomConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CustomConfirm({ 
  isOpen, 
  title,
  message, 
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  type = 'warning',
  onConfirm,
  onCancel
}: CustomConfirmProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          titleColor: 'text-red-400',
          confirmBg: 'bg-red-600 border-red-600 hover:bg-red-700',
          icon: AlertTriangle
        };
      case 'warning':
        return {
          titleColor: 'text-yellow-400',
          confirmBg: 'bg-yellow-600 border-yellow-600 hover:bg-yellow-700',
          icon: AlertTriangle
        };
      case 'info':
        return {
          titleColor: 'text-blue-400',
          confirmBg: 'bg-blue-600 border-blue-600 hover:bg-blue-700',
          icon: Info
        };
      default:
        return {
          titleColor: 'text-white',
          confirmBg: 'bg-white border-white hover:bg-[#e0e0e0] text-background',
          icon: HelpCircle
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
            onClick={onCancel}
          />
          
          {/* Confirm Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-background border-4 border-white p-6 max-w-md mx-4 backdrop-blur-sm"
          >
            <div className="flex items-start gap-4 mb-6">
              <styles.icon size={28} className={styles.titleColor} />
              <div className="flex-1">
                <h3 className={`${styles.titleColor} font-bold text-lg uppercase mb-2`}>
                  {title}
                </h3>
                <p className="text-white font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors uppercase"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-3 border-2 ${styles.confirmBg} font-bold transition-colors uppercase text-white`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}