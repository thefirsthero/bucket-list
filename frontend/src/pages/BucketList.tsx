import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { BucketListSection } from "@/components/BucketListSection";
import { ItemDialog } from "@/components/ItemDialog";
import { BucketItem, ItemCategory } from "@/types/bucket";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function BucketList() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketItem | null>(null);
  const [dialogCategory, setDialogCategory] = useState<ItemCategory>("general");

  useEffect(() => {
    fetchItems();
  }, []);

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
    status: any;
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
      await apiService.updateItem(id, { completed });
      await fetchItems();
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleItemsReorder = async (
    category: ItemCategory,
    reorderedItems: BucketItem[],
  ) => {
    // Optimistically update UI
    const updatedItems = items.map((item) => {
      if (item.category === category) {
        const reordered = reorderedItems.find((r) => r.id === item.id);
        return reordered || item;
      }
      return item;
    });
    setItems(updatedItems);

    // Update priorities on backend
    try {
      const itemsWithPriority = reorderedItems.map((item, index) => ({
        id: item.id,
        priority: index,
      }));
      await apiService.reorderItems(itemsWithPriority);
    } catch (error) {
      console.error("Failed to reorder items:", error);
      // Revert on error
      await fetchItems();
    }
  };

  const upcomingYearItems = items.filter(
    (item) => item.category === "upcoming_year",
  );
  const generalItems = items.filter((item) => item.category === "general");

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Bucket List" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bucket List"
        description="Track your dreams and goals for the upcoming year and beyond"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <BucketListSection
          title="Upcoming Year"
          category="upcoming_year"
          items={upcomingYearItems}
          onItemsReorder={(items) => handleItemsReorder("upcoming_year", items)}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={() => handleAddNew("upcoming_year")}
        />

        <BucketListSection
          title="General Bucket List"
          category="general"
          items={generalItems}
          onItemsReorder={(items) => handleItemsReorder("general", items)}
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
  );
}
