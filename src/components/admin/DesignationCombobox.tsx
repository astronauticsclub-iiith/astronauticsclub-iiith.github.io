"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';

interface DesignationComboboxProps {
  selectedDesignations: string[];
  onChange: (designations: string[]) => void;
  allDesignations: string[];
  disabled?: boolean;
}

const DesignationCombobox: React.FC<DesignationComboboxProps> = ({
  selectedDesignations,
  onChange,
  allDesignations,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  const filteredDesignations = allDesignations.filter(
    (d) =>
      d.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedDesignations.includes(d)
  );

  const handleSelect = (designation: string) => {
    if (!selectedDesignations.includes(designation)) {
      onChange([...selectedDesignations, designation]);
    }
    setInputValue('');
    setIsOpen(false);
  };

  const handleRemove = (designation: string) => {
    onChange(selectedDesignations.filter((d) => d !== designation));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      handleSelect(inputValue.trim());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={comboboxRef}>
      <div className={`flex flex-wrap gap-2 items-center w-full bg-background border-2 border-white p-2 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus-within:scale-[1.02] hover:border-opacity-80 focus-within:ring-2 focus-within:ring-white focus-within:border-white ${disabled ? 'opacity-50' : ''}`}>
        {selectedDesignations.map((designation) => (
          <div key={designation} className="flex items-center gap-1 bg-white text-background px-2 py-1 text-xs font-bold uppercase">
            <span>{designation}</span>
            {!disabled && (
              <button type="button" onClick={() => handleRemove(designation)} className="text-background hover:text-red-500">
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={disabled ? '' : "Add designation..."}
          className="flex-1 bg-transparent outline-none min-w-[120px]"
          disabled={disabled}
        />
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-white" disabled={disabled}>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-background border-2 border-white shadow-lg max-h-60 overflow-auto"
          >
            {filteredDesignations.length > 0 ? (
              filteredDesignations.map((designation) => (
                <li
                  key={designation}
                  onClick={() => handleSelect(designation)}
                  className="px-3 py-2 text-white uppercase text-sm cursor-pointer hover:bg-white hover:text-background"
                >
                  {designation}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-400 uppercase text-sm">
                {inputValue.trim() === '' ? 'Type to search or add' : `No results. Press Enter to add "${inputValue.trim()}"`}
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DesignationCombobox;
