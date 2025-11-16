import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableBulletPoint } from './SortableBulletPoint';
import { Plus } from 'lucide-react';
import Button from './Button';
import { BulletPoint } from '../../types/cv';

interface BulletPointsProps {
  points?: BulletPoint[];
  onChange: (points: BulletPoint[]) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}

const BulletPoints: React.FC<BulletPointsProps> = ({
  points = [],
  onChange,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = points.findIndex((point) => point.id === String(active.id));
      const newIndex = points.findIndex((point) => point.id === String(over.id));
      onChange(arrayMove(points, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={points} strategy={verticalListSortingStrategy}>
          {points.map((point) => (
            <SortableBulletPoint
              key={point.id}
              id={point.id}
              text={point.text}
              onRemove={() => onRemove(point.id)}
              onChange={(text) => onUpdate(point.id, text)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="flex items-center w-full justify-center"
      >
        <Plus className="w-4 h-4 mr-1" /> Add Bullet Point
      </Button>
    </div>
  );
};

export default BulletPoints;
