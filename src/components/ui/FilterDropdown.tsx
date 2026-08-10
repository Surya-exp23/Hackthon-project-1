import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Check, ChevronDown } from 'lucide-react';

const CATEGORIES = ['all', 'pothole', 'garbage_waste', 'streetlight', 'water_leakage', 'drainage', 'sidewalk', 'traffic_hazard'];
const STATUSES = ['all', 'open', 'assigned', 'in_progress', 'resolved'];

interface FilterDropdownProps {
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
}

export function FilterDropdown({ selectedCategory, setSelectedCategory, selectedStatus, setSelectedStatus }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline btn-sm"
        style={{ 
          gap: 8, 
          background: isOpen ? 'var(--surface-2)' : 'transparent',
          borderColor: isOpen ? 'var(--text-primary)' : 'var(--border)'
        }}
      >
        <Filter size={14} />
        <span>Filter</span>
        {activeFiltersCount > 0 && (
          <div style={{ 
            background: 'var(--accent)', color: 'var(--bg)', 
            width: 18, height: 18, borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800 
          }}>
            {activeFiltersCount}
          </div>
        )}
        <ChevronDown size={14} style={{ marginLeft: 4, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 8,
              width: 260,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: 16 }}>
              
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Status
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedStatus(s)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: selectedStatus === s ? 'var(--accent)' : 'var(--border)',
                        background: selectedStatus === s ? 'var(--accent)' : 'transparent',
                        color: selectedStatus === s ? 'var(--bg)' : 'var(--text-primary)',
                        transition: 'all 0.15s'
                      }}
                    >
                      {s === 'all' ? 'All' : s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Category
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: selectedCategory === c ? 'var(--surface-2)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        fontWeight: selectedCategory === c ? 600 : 500,
                      }}
                    >
                      {c === 'all' ? 'All Categories' : c.replace('_', ' ')}
                      {selectedCategory === c && <Check size={14} color="var(--accent)" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
