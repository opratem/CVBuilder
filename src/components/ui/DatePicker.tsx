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

  const getPickerProps = () => {
    const baseProps = {
      selected,
      onChange,
      disabled,
      placeholderText: placeholder,
      dateFormat: getDateFormat(),
      showTimeSelect,
      wrapperClassName: "w-full"
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
