"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Option { label: string; value: string | number; }

export default function CustomSelect({ 
  label, options, value, onChange 
}: { 
  label: string; options: Option[]; value: any; onChange: (val: any) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || "Pilih opsi...";

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      
      {/* Tombol Trigger Dropdown */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 cursor-pointer flex justify-between items-center transition-all duration-200 hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500"
      >
        <span className="text-sm font-medium">{selectedLabel}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={18} className="text-slate-400" />
        </motion.div>
      </div>

      {/* List Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden"
          >
            {options.map((opt) => (
              <li 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`p-3 text-sm cursor-pointer transition-colors ${value === opt.value ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}