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
  completed_at?: Date;
  archived: boolean;
  archived_year?: number;
  goal_year?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBucketItemDTO {
  title: string;
  description?: string;
  category: ItemCategory;
  status?: ItemStatus;
  priority?: number;
  goal_year?: number;
}

export interface UpdateBucketItemDTO {
  title?: string;
  description?: string;
  category?: ItemCategory;
  status?: ItemStatus;
  priority?: number;
  completed?: boolean;
}

export interface ReorderItemsDTO {
  items: Array<{ id: number; priority: number }>;
}
