import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

interface DatePickerProps {
  label: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  dateFormat?: 'full' | 'month-year' | 'year';
  showTimeSelect?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

type ViewMode = 'calendar' | 'months' | 'years';

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  selected,
  onChange,
  placeholder = "Select date",
  disabled = false,
  required = false,
  fullWidth = false,
  dateFormat = 'full',
  showTimeSelect = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (dateFormat === 'year') return 'years';
    if (dateFormat === 'month-year') return 'months';
    return 'calendar';
  });
  const [viewDate, setViewDate] = useState(() => selected || new Date());
  const [yearRangeStart, setYearRangeStart] = useState(() => {
    const year = (selected || new Date()).getFullYear();
    return Math.floor(year / 12) * 12;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset view mode when opening
  useEffect(() => {
    if (isOpen) {
      if (dateFormat === 'year') setViewMode('years');
      else if (dateFormat === 'month-year') setViewMode('months');
      else setViewMode('calendar');

      setViewDate(selected || new Date());
      const year = (selected || new Date()).getFullYear();
      setYearRangeStart(Math.floor(year / 12) * 12);
    }
  }, [isOpen, dateFormat, selected]);

  const formatDisplayDate = () => {
    if (!selected) return '';

    switch (dateFormat) {
      case 'year':
        return selected.getFullYear().toString();
      case 'month-year':
        return `${MONTHS[selected.getMonth()]} ${selected.getFullYear()}`;
      case 'full':
      default:
        const day = selected.getDate().toString().padStart(2, '0');
        const month = (selected.getMonth() + 1).toString().padStart(2, '0');
        const year = selected.getFullYear();
        return `${day}/${month}/${year}`;
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(newDate);
    setIsOpen(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    setViewDate(newDate);

    if (dateFormat === 'month-year') {
      onChange(newDate);
      setIsOpen(false);
    } else {
      setViewMode('calendar');
    }
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(year, viewDate.getMonth(), 1);
    setViewDate(newDate);

    if (dateFormat === 'year') {
      onChange(newDate);
      setIsOpen(false);
    } else if (dateFormat === 'month-year') {
      setViewMode('months');
    } else {
      setViewMode('months');
    }
  };

  const navigateMonth = (delta: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };

  const navigateYearRange = (delta: number) => {
    setYearRangeStart(prev => prev + (delta * 12));
  };

  const renderCalendarView = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const days = [];

    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selected &&
        selected.getFullYear() === year &&
        selected.getMonth() === month &&
        selected.getDate() === day;
      const isToday = today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={`w-8 h-8 rounded-md text-sm font-medium transition-all duration-150 ${
            isSelected
              ? 'bg-accent text-white shadow-lg'
              : isToday
                ? 'border border-accent text-accent'
                : 'text-text-secondary hover:bg-surface-hover hover:text-accent'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-surface-hover transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode('months')}
            className="text-sm font-semibold text-text-primary hover:text-accent transition-colors px-2 py-1 rounded-md hover:bg-surface-hover"
          >
            {MONTHS[month]} {year}
          </button>

          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-surface-hover transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="w-8 h-6 flex items-center justify-center text-xs font-medium text-text-muted">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const renderMonthsView = () => {
    const year = viewDate.getFullYear();
    const currentMonth = selected?.getMonth();
    const currentYear = selected?.getFullYear();

    return (
      <div>
        {/* Year Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year - 1, viewDate.getMonth(), 1))}
            className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-surface-hover transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode('years')}
            className="text-sm font-semibold text-text-primary hover:text-accent transition-colors px-2 py-1 rounded-md hover:bg-surface-hover"
          >
            {year}
          </button>

          <button
            type="button"
            onClick={() => setViewDate(new Date(year + 1, viewDate.getMonth(), 1))}
            className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-surface-hover transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Months Grid */}
        <div className="grid grid-cols-3 gap-2">
          {MONTHS_SHORT.map((month, index) => {
            const isSelected = currentYear === year && currentMonth === index;
            return (
              <button
                key={month}
                type="button"
                onClick={() => handleMonthSelect(index)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-accent text-white shadow-lg'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-accent'
                }`}
              >
                {month}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearsView = () => {
    const currentYear = new Date().getFullYear();
    const selectedYear = selected?.getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

    return (
      <div>
        {/* Decade Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigateYearRange(-1)}
            className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-surface-hover transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-semibold text-text-primary">
            {yearRangeStart} - {yearRangeStart + 11}
          </span>

          <button
            type="button"
            onClick={() => navigateYearRange(1)}
            className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-surface-hover transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Years Grid */}
        <div className="grid grid-cols-3 gap-2">
          {years.map(year => {
            const isSelected = selectedYear === year;
            const isCurrent = currentYear === year;
            const isFuture = year > currentYear + 10;
            const isPast = year < currentYear - 80;

            return (
              <button
                key={year}
                type="button"
                onClick={() => !isFuture && !isPast && handleYearSelect(year)}
                disabled={isFuture || isPast}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-accent text-white shadow-lg'
                    : isCurrent
                      ? 'border border-accent text-accent'
                      : isFuture || isPast
                        ? 'text-text-disabled cursor-not-allowed'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-accent'
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>

        {/* Quick Navigation */}
        <div className="mt-4 pt-3 border-t border-border flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setYearRangeStart(Math.floor((currentYear - 30) / 12) * 12)}
            className="text-xs px-2 py-1 rounded text-text-muted hover:text-accent hover:bg-surface-hover transition-colors"
          >
            30 years ago
          </button>
          <button
            type="button"
            onClick={() => setYearRangeStart(Math.floor(currentYear / 12) * 12)}
            className="text-xs px-2 py-1 rounded text-accent bg-accent/10 hover:bg-accent/20 transition-colors"
          >
            Current
          </button>
        </div>
      </div>
    );
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>

      {/* Input Field */}
      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={`relative flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          type="text"
          readOnly
          disabled={disabled}
          value={formatDisplayDate()}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-20 text-sm rounded-lg glass-input text-text-primary placeholder-text-muted cursor-pointer focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {selected && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-error transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Calendar className="w-4 h-4 text-text-muted" />
        </div>
      </div>

      {/* Dropdown Calendar */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 p-4 rounded-xl glass-card shadow-xl min-w-[280px] animate-fadeIn">
          {viewMode === 'calendar' && renderCalendarView()}
          {viewMode === 'months' && renderMonthsView()}
          {viewMode === 'years' && renderYearsView()}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                onChange(new Date());
                setIsOpen(false);
              }}
              className="text-xs px-3 py-1.5 rounded-md text-accent hover:bg-accent/10 transition-colors font-medium"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs px-3 py-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
