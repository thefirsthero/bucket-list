import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { BucketItem, ItemCategory } from "@/types/bucket";
import { BucketListItem } from "./BucketListItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BucketListSectionProps {
  title: string;
  category: ItemCategory;
  items: BucketItem[];
  onItemsReorder: (items: BucketItem[]) => void;
  onToggleComplete: (id: number, completed: boolean) => void;
  onEdit: (item: BucketItem) => void;
  onDelete: (id: number) => void;
  onAddNew: () => void;
}

export function BucketListSection({
  title,
  category,
  items,
  onItemsReorder,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddNew,
}: BucketListSectionProps) {
  const [activeItems, setActiveItems] = useState<BucketItem[]>([]);
  const [completedItems, setCompletedItems] = useState<BucketItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Separate items by completion status
  useEffect(() => {
    const active = items.filter((item) => !item.completed);
    const completed = items.filter((item) => item.completed);
    setActiveItems(active);
    setCompletedItems(completed);
  }, [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeItems.findIndex((item) => item.id === active.id);
      const newIndex = activeItems.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedActive = arrayMove(activeItems, oldIndex, newIndex);
        // Combine reordered active items with completed items
        onItemsReorder([...reorderedActive, ...completedItems]);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button onClick={onAddNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeItems.length === 0 && completedItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No items yet. Click "Add Item" to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active items with drag-and-drop */}
            {activeItems.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activeItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {activeItems.map((item) => (
                    <BucketListItem
                      key={item.id}
                      item={item}
                      onToggleComplete={onToggleComplete}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}

            {/* Completed items at the bottom */}
            {completedItems.length > 0 && (
              <>
                {activeItems.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-sm text-muted-foreground mb-3">
                      Completed
                    </p>
                  </div>
                )}
                {completedItems.map((item) => (
                  <BucketListItem
                    key={item.id}
                    item={item}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
