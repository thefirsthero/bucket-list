export type ItemStatus =
  | "active"
  | "in_progress"
  | "postponed"
  | "maybe"
  | "completed";
export type ItemCategory = "upcoming_year" | "general";

export interface BucketItem {
  id: number;
  title: string;
  description?: string;
  category: ItemCategory;
  status: ItemStatus;
  priority: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBucketItemDTO {
  title: string;
  description?: string;
  category: ItemCategory;
  status?: ItemStatus;
  priority?: number;
}

export interface UpdateBucketItemDTO {
  title?: string;
  description?: string;
  category?: ItemCategory;
  status?: ItemStatus;
  priority?: number;
  completed?: boolean;
}

export const statusLabels: Record<ItemStatus, string> = {
  active: "Active",
  in_progress: "In Progress",
  postponed: "Postponed",
  maybe: "Maybe",
  completed: "Completed",
};

export const statusColors: Record<ItemStatus, string> = {
  active: "bg-blue-500",
  in_progress: "bg-yellow-500",
  postponed: "bg-gray-500",
  maybe: "bg-purple-500",
  completed: "bg-green-500",
};
