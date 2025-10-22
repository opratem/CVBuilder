import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Settings, X, User, FileText, Briefcase, Target, GraduationCap, Rocket, Star, File } from 'lucide-react';
import { useCVStore } from '../../store/cvStore';
import type { CVSectionOrder } from '../../types/cv';
import Button from './Button';
import Card from './Card';

interface SectionReorderProps {
  onClose?: () => void;
}

interface SortableItemProps {
  section: CVSectionOrder;
  onToggleEnabled: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ section, onToggleEnabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSectionInfo = (sectionId: string) => {
    const sectionInfoMap: Record<string, { description: string; icon: React.ReactNode }> = {
      personalInfo: { description: 'Contact details and basic information', icon: <User className="w-4 h-4" /> },
      summary: { description: 'Professional summary or objective', icon: <FileText className="w-4 h-4" /> },
      workExperience: { description: 'Employment history and achievements', icon: <Briefcase className="w-4 h-4" /> },
      skills: { description: 'Technical and soft skills', icon: <Target className="w-4 h-4" /> },
      education: { description: 'Academic qualifications', icon: <GraduationCap className="w-4 h-4" /> },
      projects: { description: 'Notable projects and accomplishments', icon: <Rocket className="w-4 h-4" /> },
      certifications: { description: 'Professional certifications', icon: <Star className="w-4 h-4" /> },
      extracurricular: { description: 'Activities and volunteer work', icon: <Star className="w-4 h-4" /> }
    };
    return sectionInfoMap[sectionId] || { description: 'Section description', icon: <File className="w-4 h-4" /> };
  };

  const sectionInfo = getSectionInfo(section.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center space-x-3 p-4 bg-white border rounded-lg shadow-sm
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500 scale-105 rotate-1' : 'hover:shadow-md hover:border-gray-300'}
        ${!section.enabled ? 'opacity-60 bg-gray-50' : ''}
        transition-all duration-200 ease-in-out
        ${isDragging ? 'z-50' : 'z-0'}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Section Icon */}
      <div className="text-gray-600 flex items-center justify-center w-8 h-8">
        {sectionInfo.icon}
      </div>

      {/* Section Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className={`font-medium ${section.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
            {section.name}
          </h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            {section.order + 1}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{sectionInfo.description}</p>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => onToggleEnabled(section.id)}
        className={`
          p-2 rounded-lg transition-colors
          ${section.enabled
            ? 'text-green-600 hover:bg-green-50'
            : 'text-gray-400 hover:bg-gray-50'
          }
        `}
        title={section.enabled ? 'Hide section' : 'Show section'}
      >
        {section.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
      </button>
    </div>
  );
};

const SectionReorder: React.FC<SectionReorderProps> = ({ onClose }) => {
  const { cv, updateCV } = useCVStore();
  const [sections, setSections] = useState<CVSectionOrder[]>(
    cv.sectionOrder || []
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (active.id !== over?.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order values
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index
        }));

        return updatedItems;
      });
    }
  };

  const handleToggleEnabled = (sectionId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, enabled: !section.enabled }
          : section
      )
    );
  };

  const handleSave = () => {
    updateCV({
      ...cv,
      sectionOrder: sections
    });
    onClose?.();
  };

  const handleReset = () => {
    const defaultOrder: CVSectionOrder[] = [
      { id: 'personalInfo', name: 'Personal Information', enabled: true, order: 0 },
      { id: 'summary', name: 'Professional Summary', enabled: true, order: 1 },
      { id: 'workExperience', name: 'Work Experience', enabled: true, order: 2 },
      { id: 'skills', name: 'Skills', enabled: true, order: 3 },
      { id: 'education', name: 'Education', enabled: true, order: 4 },
      { id: 'projects', name: 'Projects', enabled: true, order: 5 },
      { id: 'certifications', name: 'Certifications', enabled: true, order: 6 },
      { id: 'extracurricular', name: 'Extracurricular Activities', enabled: true, order: 7 }
    ];
    setSections(defaultOrder);
  };

  const enabledSections = sections.filter(s => s.enabled).length;
  const totalSections = sections.length;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-blue-600" />
              Customize CV Layout
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Drag sections to reorder them or toggle visibility.
              {enabledSections} of {totalSections} sections enabled.
            </p>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className={`border rounded-lg p-4 mb-6 transition-all duration-200 ${
          activeId
            ? 'bg-blue-100 border-blue-300 shadow-md'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <h3 className="font-medium text-blue-900 mb-2">
            {activeId ? 'Drop to reorder section' : 'How to customize your CV layout:'}
          </h3>
          {!activeId && (
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• <strong>Drag sections</strong> using the grip handle to reorder them</li>
              <li>• <strong>Click the eye icon</strong> to show or hide sections</li>
              <li>• <strong>Personal Information</strong> will always appear first</li>
              <li>• Changes apply to all CV templates</li>
            </ul>
          )}
        </div>

        {/* Drag and Drop Area */}
        <div className="space-y-3 mb-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableItem
                  key={section.id}
                  section={section}
                  onToggleEnabled={handleToggleEnabled}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <SortableItem
                  section={sections.find(s => s.id === activeId)!}
                  onToggleEnabled={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Section Statistics */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{enabledSections}</div>
              <div className="text-sm text-gray-600">Visible Sections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">{totalSections - enabledSections}</div>
              <div className="text-sm text-gray-600">Hidden Sections</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleSave}
            variant="primary"
            className="flex-1"
          >
            Apply Changes
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
          >
            Reset to Default
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Warning for hidden sections */}
        {enabledSections < totalSections && (
          <div className="mt-4 text-xs text-center text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            Hidden sections won't appear in your CV or exports. You can re-enable them anytime.
          </div>
        )}
      </Card>
    </div>
  );
};

export default SectionReorder;
