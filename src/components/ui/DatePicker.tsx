import type React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const getDateFormat = () => {
    switch (dateFormat) {
      case 'month-year':
        return 'MM/yyyy';
      case 'year':
        return 'yyyy';
      case 'full':
      default:
        return showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
    }
  };

// Calculate year range - 50 years in the past to 10 years in the future
const currentYear = new Date().getFullYear();
const minYear = currentYear - 50;
const maxYear = currentYear + 10;

  const getPickerProps = () => {
    const baseProps = {
      selected,
      onChange,
      disabled,
      placeholderText: placeholder,
      dateFormat: getDateFormat(),
      showTimeSelect,
      wrapperClassName: "w-full",
      showYearDropdown: true,
      showMonthDropdown: true,
      dropdownMode: 'select' as const,
      yearDropdownItemNumber: 60,
      scrollableYearDropdown: true,
      minDate: new Date(minYear, 0, 1),
      maxDate: new Date(maxYear, 11, 31),
    };

    switch (dateFormat) {
      case 'month-year':
        return {
          ...baseProps,
          showMonthYearPicker: true
        };
      case 'year':
        return {
          ...baseProps,
          showYearPicker: true
        };
      case 'full':
      default:
        return baseProps;
    }
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      <label className="block text-sm font-medium text-text-secondary mb-1">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      <ReactDatePicker {...getPickerProps()} />
    </div>
  );
};

export default DatePicker;
