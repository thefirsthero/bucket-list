import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreVertical, Trash2, Edit } from "lucide-react";
import { BucketItem, statusLabels, statusColors } from "@/types/bucket";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BucketListItemProps {
  item: BucketItem;
  onToggleComplete: (id: number, completed: boolean) => void;
  onEdit: (item: BucketItem) => void;
  onDelete: (id: number) => void;
}

export function BucketListItem({
  item,
  onToggleComplete,
  onEdit,
  onDelete,
}: BucketListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("group", isDragging && "opacity-50")}
    >
      <Card className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            className="mt-1 cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-100 transition-opacity"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Checkbox */}
          <Checkbox
            checked={item.completed}
            onCheckedChange={(checked: boolean) =>
              onToggleComplete(item.id, checked)
            }
            className="mt-1"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium text-base",
                item.completed && "line-through text-muted-foreground",
              )}
            >
              {item.title}
            </h3>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white",
                  statusColors[item.status],
                )}
              >
                {statusLabels[item.status]}
              </span>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </div>
  );
}
