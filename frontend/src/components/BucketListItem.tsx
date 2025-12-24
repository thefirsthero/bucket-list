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
  } = useSortable({ id: item.id, disabled: item.completed });

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
      <Card className="p-3">
        <div className="flex items-start gap-2">
          {/* Drag Handle - only show for non-completed items */}
          {!item.completed && (
            <button
              className="mt-0.5 cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-100 transition-opacity flex-shrink-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          {/* Checkbox */}
          <Checkbox
            checked={item.completed}
            onCheckedChange={(checked: boolean) =>
              onToggleComplete(item.id, checked)
            }
            className="mt-0.5 flex-shrink-0"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium text-sm leading-tight",
                item.completed && "line-through text-muted-foreground",
              )}
            >
              {item.title}
            </h3>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white",
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
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex-shrink-0"
              >
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
