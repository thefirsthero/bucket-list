import { useState, useEffect } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { BucketListSection } from "@/components/BucketListSection";
import { ItemDialog } from "@/components/ItemDialog";
import { BucketItem, ItemCategory, ItemStatus } from "@/types/bucket";
import { apiService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function BucketList() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketItem | null>(null);
  const [dialogCategory, setDialogCategory] = useState<ItemCategory>("general");
  const [currentYear] = useState(new Date().getFullYear());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Check if we need to archive previous year's items
      const lastArchiveCheck = localStorage.getItem("lastArchiveCheck");
      const currentYear = new Date().getFullYear();

      if (!lastArchiveCheck || parseInt(lastArchiveCheck) < currentYear) {
        // Archive previous year's completed items
        await apiService.archivePreviousYear();
        localStorage.setItem("lastArchiveCheck", currentYear.toString());
      }

      // Fetch current items
      await fetchItems();
    } catch (error) {
      console.error("Failed to initialize data:", error);
      // Still try to fetch items even if archiving fails
      await fetchItems();
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllItems();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = (category: ItemCategory) => {
    setEditingItem(null);
    setDialogCategory(category);
    setDialogOpen(true);
  };

  const handleEdit = (item: BucketItem) => {
    setEditingItem(item);
    setDialogCategory(item.category);
    setDialogOpen(true);
  };

  const handleSave = async (data: {
    title: string;
    description: string;
    category: ItemCategory;
    status: ItemStatus;
  }) => {
    try {
      if (editingItem) {
        // Update existing item
        await apiService.updateItem(editingItem.id, data);
      } else {
        // Create new item
        await apiService.createItem(data);
      }
      await fetchItems();
      setDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await apiService.deleteItem(id);
      await fetchItems();
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    try {
      const item = items.find((i) => i.id === id);

      if (!item) return;

      // If completing a "Someday" item, move it to "Current Goals" category
      if (completed && item.category === "general") {
        await apiService.updateItem(id, {
          completed: true,
          status: "completed",
          category: "upcoming_year",
        });
      } else {
        await apiService.updateItem(id, {
          completed,
          status: completed ? "completed" : "active",
        });
      }

      await fetchItems();
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDragStart = (_event: DragStartEvent) => {
    // Can be used for drag overlay in the future
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Can be used to show visual feedback during drag
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as number;
    const activeItem = items.find((item) => item.id === activeId);

    if (!activeItem || activeItem.completed) return;

    // Determine if we're dropping on another item or on a droppable zone
    const overId = over.id;
    const overItem = items.find((item) => item.id === overId);

    // If dropped on a droppable zone (category), move to that category
    if (overId === "upcoming_year" || overId === "general") {
      const targetCategory = overId as ItemCategory;

      // If same category, do nothing
      if (activeItem.category === targetCategory) return;

      // Move to the end of the target category
      const targetCategoryItems = items.filter(
        (item) => item.category === targetCategory && !item.completed,
      );
      const newPriority = targetCategoryItems.length;

      // Update locally
      const updatedItems = items.map((item) => {
        if (item.id === activeId) {
          return { ...item, category: targetCategory, priority: newPriority };
        }
        return item;
      });

      setItems(updatedItems);

      // Update backend
      try {
        await apiService.updateItem(activeId, {
          category: targetCategory,
          priority: newPriority,
        });
      } catch (error) {
        console.error("Failed to move item:", error);
        await fetchItems();
      }
      return;
    }

    // Otherwise, we're dropping on another item
    if (!overItem || activeId === overId) return;

    const activeCategory = activeItem.category;
    const overCategory = overItem.category;

    // Get active items for each category (sorted by priority)
    const getActiveItemsForCategory = (category: ItemCategory) =>
      items
        .filter((item) => item.category === category && !item.completed)
        .sort((a, b) => a.priority - b.priority);

    if (activeCategory === overCategory) {
      // Reordering within the same category
      const categoryItems = getActiveItemsForCategory(activeCategory);
      const oldIndex = categoryItems.findIndex((item) => item.id === activeId);
      const newIndex = categoryItems.findIndex((item) => item.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(categoryItems, oldIndex, newIndex);

      // Update items with new priorities
      const updatedItems = items.map((item) => {
        if (item.category === activeCategory && !item.completed) {
          const index = reordered.findIndex(
            (r: BucketItem) => r.id === item.id,
          );
          if (index !== -1) {
            return { ...item, priority: index };
          }
        }
        return item;
      });

      setItems(updatedItems);

      // Send to backend
      try {
        const itemsWithPriority = reordered.map(
          (item: BucketItem, index: number) => ({
            id: item.id,
            priority: index,
          }),
        );
        await apiService.reorderItems(itemsWithPriority);
      } catch (error) {
        console.error("Failed to reorder items:", error);
        await fetchItems();
      }
    } else {
      // Moving between categories
      const sourceCategoryItems = getActiveItemsForCategory(activeCategory);
      const targetCategoryItems = getActiveItemsForCategory(overCategory);

      // Find position in target category
      const targetIndex = targetCategoryItems.findIndex(
        (item) => item.id === overId,
      );
      if (targetIndex === -1) return;

      // Remove from source
      const updatedSource = sourceCategoryItems
        .filter((item) => item.id !== activeId)
        .map((item, index) => ({ ...item, priority: index }));

      // Add to target at the position
      const updatedTarget = [...targetCategoryItems];
      updatedTarget.splice(targetIndex, 0, {
        ...activeItem,
        category: overCategory,
      });
      const updatedTargetWithPriority = updatedTarget.map((item, index) => ({
        ...item,
        priority: index,
      }));

      // Merge all updates
      const updatedItems = items.map((item) => {
        if (item.id === activeId) {
          return { ...item, category: overCategory, priority: targetIndex };
        }
        if (item.category === activeCategory && !item.completed) {
          const updated = updatedSource.find((u) => u.id === item.id);
          return updated || item;
        }
        if (item.category === overCategory && !item.completed) {
          const updated = updatedTargetWithPriority.find(
            (u) => u.id === item.id,
          );
          return updated || item;
        }
        return item;
      });

      setItems(updatedItems);

      // Update backend
      try {
        // Update category first
        await apiService.updateItem(activeId, { category: overCategory });

        // Then update priorities
        const allUpdates = [
          ...updatedSource.map((item) => ({
            id: item.id,
            priority: item.priority,
          })),
          ...updatedTargetWithPriority.map((item) => ({
            id: item.id,
            priority: item.priority,
          })),
        ];
        await apiService.reorderItems(allUpdates);
      } catch (error) {
        console.error("Failed to move item between categories:", error);
        await fetchItems();
      }
    }
  };

  const upcomingYearItems = items.filter(
    (item) => item.category === "upcoming_year",
  );
  const generalItems = items.filter((item) => item.category === "general");

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid gap-4 md:grid-cols-2 flex-1 overflow-hidden pt-4">
          <Skeleton className="h-full" />
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid gap-4 md:grid-cols-2 flex-1 overflow-hidden pt-4">
          <BucketListSection
            title={`Current Goals (${currentYear})`}
            category="upcoming_year"
            items={upcomingYearItems}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={() => handleAddNew("upcoming_year")}
          />

          <BucketListSection
            title="Someday"
            category="general"
            items={generalItems}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={() => handleAddNew("general")}
          />
        </div>

        <ItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSave}
          item={editingItem}
          defaultCategory={dialogCategory}
        />
      </div>
    </DndContext>
  );
}
