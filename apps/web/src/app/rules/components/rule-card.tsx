import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Pencil, Trash2, Globe, Laptop } from "lucide-react";
import { type Rule, useToggleRule } from "@/hooks/use-rules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface RuleCardProps {
  rule: Rule;
  onEdit: (rule: Rule) => void;
  onDelete: (rule: Rule) => void;
}

export function RuleCard({ rule, onEdit, onDelete }: RuleCardProps) {
  const toggleRule = useToggleRule();
  const [isActive, setIsActive] = useState(rule.isActive);

  const handleToggle = async (checked: boolean) => {
    // Optimistic update
    setIsActive(checked);
    try {
      await toggleRule.mutateAsync(rule.id);
    } catch (error) {
      // Revert on error
      setIsActive(!checked);
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md border-muted/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold leading-none">
                {rule.name}
              </CardTitle>
              {rule.scope === "GLOBAL" ? (
                <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px] font-normal text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  Global
                </Badge>
              ) : (
                <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px] font-normal text-muted-foreground">
                  <Laptop className="h-3 w-3" />
                  Local
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-1 text-xs">
              Created {formatDistanceToNow(new Date(rule.createdAt), { addSuffix: true })}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(rule)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(rule)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3rem]">
          {rule.content}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
        <div className="flex gap-2">
          {rule.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-[10px] px-1.5 h-5">
              {tag.name}
            </Badge>
          ))}
          {rule.tags.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 h-5">
              +{rule.tags.length - 3}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>
            {isActive ? "Active" : "Inactive"}
          </span>
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            className="scale-75 data-[state=checked]:bg-primary"
          />
        </div>
      </CardFooter>
    </Card>
  );
}
