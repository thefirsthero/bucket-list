import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { BucketItem } from "@/types/bucket";
import { apiService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { statusLabels, statusColors } from "@/types/bucket";

interface GroupedItems {
  [year: number]: BucketItem[];
}

export default function Archive() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchArchivedItems();
  }, []);

  const fetchArchivedItems = async () => {
    try {
      setLoading(true);
      const data = await apiService.getArchivedItems();
      setItems(data);

      // Auto-expand most recent year
      if (data.length > 0 && data[0].archived_year) {
        setExpandedYears(new Set([data[0].archived_year]));
      }
    } catch (error) {
      console.error("Failed to fetch archived items:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  // Group items by year
  const groupedItems: GroupedItems = items.reduce((acc, item) => {
    const year =
      item.archived_year ||
      new Date(item.completed_at || item.created_at).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {} as GroupedItems);

  const years = Object.keys(groupedItems)
    .map(Number)
    .sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="pt-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-24 w-full mb-3" />
          <Skeleton className="h-24 w-full mb-3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="pt-4">
          <h1 className="text-3xl font-bold mb-6">Archive</h1>
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No archived items yet</p>
                <p className="text-sm mt-2">
                  Completed items from previous years will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="pt-4 pb-4">
        <h1 className="text-3xl font-bold mb-2">Archive</h1>
        <p className="text-muted-foreground mb-4">
          Completed goals from previous years
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {years.map((year) => {
          const yearItems = groupedItems[year];
          const isExpanded = expandedYears.has(year);

          return (
            <Card key={year}>
              <CardHeader className="pb-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto hover:bg-transparent"
                  onClick={() => toggleYear(year)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-5 w-5 flex-shrink-0" />
                    )}
                    <CardTitle className="flex-1 text-left">{year}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {yearItems.length}{" "}
                      {yearItems.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                </Button>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-2">
                  {yearItems.map((item) => (
                    <Card key={item.id} className="p-3 bg-muted/30">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm leading-tight line-through text-muted-foreground">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span
                              className={cn(
                                "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white",
                                statusColors[item.status],
                              )}
                            >
                              {statusLabels[item.status]}
                            </span>
                            {item.completed_at && (
                              <span className="text-xs text-muted-foreground">
                                Completed{" "}
                                {new Date(
                                  item.completed_at,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
