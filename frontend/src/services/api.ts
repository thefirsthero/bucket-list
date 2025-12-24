import {
  BucketItem,
  CreateBucketItemDTO,
  UpdateBucketItemDTO,
} from "@/types/bucket";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Get all items
  async getAllItems(): Promise<BucketItem[]> {
    return this.request<BucketItem[]>("/api/bucket-items");
  }

  // Get items by category
  async getItemsByCategory(category: string): Promise<BucketItem[]> {
    return this.request<BucketItem[]>(`/api/bucket-items/category/${category}`);
  }

  // Get single item
  async getItemById(id: number): Promise<BucketItem> {
    return this.request<BucketItem>(`/api/bucket-items/${id}`);
  }

  // Create new item
  async createItem(data: CreateBucketItemDTO): Promise<BucketItem> {
    return this.request<BucketItem>("/api/bucket-items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update item
  async updateItem(id: number, data: UpdateBucketItemDTO): Promise<BucketItem> {
    return this.request<BucketItem>(`/api/bucket-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Delete item
  async deleteItem(id: number): Promise<void> {
    return this.request<void>(`/api/bucket-items/${id}`, {
      method: "DELETE",
    });
  }

  // Reorder items
  async reorderItems(
    items: Array<{ id: number; priority: number }>,
  ): Promise<void> {
    return this.request<void>("/api/bucket-items/reorder", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> {
    return this.request("/health");
  }
}

export const apiService = new ApiService(API_BASE_URL);
