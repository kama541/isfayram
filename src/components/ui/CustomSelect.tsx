import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export const CustomSelect = ({ value, onChange, options, placeholder = "Tanlang", className = "" }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className={`w-full p-2.5 bg-slate-50 border ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} rounded-xl cursor-pointer flex items-center justify-between transition-all`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-800'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                  value === option.value 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="block truncate">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
