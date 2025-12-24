import { useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
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
  onToggleComplete: (id: number, completed: boolean) => void;
  onEdit: (item: BucketItem) => void;
  onDelete: (id: number) => void;
  onAddNew: () => void;
}

export function BucketListSection({
  title,
  category,
  items,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddNew,
}: BucketListSectionProps) {
  const [activeItems, setActiveItems] = useState<BucketItem[]>([]);
  const [completedItems, setCompletedItems] = useState<BucketItem[]>([]);

  const { setNodeRef } = useDroppable({
    id: category,
  });

  // Separate items by completion status and sort active items by priority
  useEffect(() => {
    const active = items
      .filter((item) => !item.completed)
      .sort((a, b) => a.priority - b.priority);
    const completed = items.filter((item) => item.completed);
    setActiveItems(active);
    setCompletedItems(completed);
  }, [items]);

  return (
    <Card ref={setNodeRef} className="flex flex-col overflow-hidden h-full">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button onClick={onAddNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {activeItems.length === 0 && completedItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No items yet. Click "Add Item" to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Active items with drag-and-drop */}
            {activeItems.length > 0 && (
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
            )}

            {/* Completed items at the bottom */}
            {completedItems.length > 0 && (
              <>
                {activeItems.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">
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
