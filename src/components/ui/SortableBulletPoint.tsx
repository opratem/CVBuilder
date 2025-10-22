import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

interface SortableBulletPointProps {
  id: string;
  text: string;
  onChange: (text: string) => void;
  onRemove: () => void;
}

export const SortableBulletPoint: React.FC<SortableBulletPointProps> = ({
  id,
  text,
  onChange,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 p-2 bg-white rounded-lg border ${
        isDragging ? 'border-blue-400 shadow-lg' : 'border-gray-200'
      }`}
    >
      <button
        type="button"
        className="mt-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 resize-none border-0 bg-transparent p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
        placeholder="Enter bullet point..."
        rows={1}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = target.scrollHeight + 'px';
        }}
      />
      
      <button
        type="button"
        onClick={onRemove}
        className="mt-2 text-gray-400 hover:text-red-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};