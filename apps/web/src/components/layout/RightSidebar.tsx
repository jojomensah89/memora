"use client";

import {
  AppWindow,
  Database,
  FileText,
  Filter,
  Plus,
  Search,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    documents: true,
    apis: true,
    databases: true,
  });

  // Mock context data - replace with actual data from API
  const contextItems = [
    {
      id: "1",
      title: "Project Documentation",
      type: "Document",
      description:
        "Comprehensive guide for the Memora project structure and setup",
      tags: ["documentation", "backend", "frontend"],
      icon: FileText,
      size: "2.4 MB",
      lastUpdated: "2h ago",
      selected: false,
    },
    {
      id: "2",
      title: "API Specifications",
      type: "API",
      description: "Complete API documentation with endpoints and examples",
      tags: ["api", "frontend", "backend"],
      icon: AppWindow,
      size: "156 KB",
      lastUpdated: "1d ago",
      selected: true,
    },
    {
      id: "3",
      title: "Database Schema",
      type: "Schema",
      description: "Database structure and relationship diagrams",
      tags: ["database", "backend"],
      icon: Database,
      size: "89 KB",
      lastUpdated: "3d ago",
      selected: false,
    },
    {
      id: "4",
      title: "User Manual",
      type: "Document",
      description: "Step-by-step guide for end users",
      tags: ["documentation", "frontend"],
      icon: FileText,
      size: "1.2 MB",
      lastUpdated: "1w ago",
      selected: false,
    },
    {
      id: "5",
      title: "Authentication Flow",
      type: "Document",
      description: "Detailed authentication and authorization flow",
      tags: ["documentation", "security", "backend"],
      icon: FileText,
      size: "445 KB",
      lastUpdated: "5d ago",
      selected: true,
    },
  ];

  const allTags = Array.from(
    new Set(contextItems.flatMap((item) => item.tags))
  );

  const filteredItems = contextItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => item.tags.includes(tag));

    const matchesType =
      (activeFilters.documents && item.type === "Document") ||
      (activeFilters.apis && item.type === "API") ||
      (activeFilters.databases && item.type === "Schema");

    return matchesSearch && matchesTags && matchesType;
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleTypeFilterToggle = (type: keyof typeof activeFilters) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleItemSelect = (itemId: string) => {
    // Placeholder for item selection logic
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Document":
        return "text-blue-500";
      case "API":
        return "text-green-500";
      case "Schema":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex h-full w-80 flex-col border-l bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="border-b">
        <div className="px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-sm">Context Library</h2>
            <Button size="sm" variant="outline">
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-8 pl-9 text-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search context..."
              value={searchQuery}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">Type:</span>
            <div className="flex space-x-2">
              {[
                { key: "documents", label: "Docs" },
                { key: "apis", label: "API" },
                { key: "databases", label: "DB" },
              ].map((type) => (
                <Button
                  className="h-6 px-2 text-xs"
                  key={type.key}
                  onClick={() =>
                    handleTypeFilterToggle(
                      type.key as keyof typeof activeFilters
                    )
                  }
                  size="sm"
                  variant={
                    activeFilters[type.key as keyof typeof activeFilters]
                      ? "default"
                      : "outline"
                  }
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          {/* Tags Filter */}
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center">
              <Tag className="mr-2 h-4 w-4" />
              Tags
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-wrap gap-2 p-2">
                {allTags.map((tag) => (
                  <Badge
                    className="cursor-pointer px-2 py-1 text-xs"
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Context Items */}
          <SidebarGroup>
            <SidebarGroupLabel>
              Items ({filteredItems.length})
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        className="h-auto w-full justify-start px-2 py-3"
                        isActive={item.selected}
                      >
                        <div onClick={() => handleItemSelect(item.id)}>
                          <div className="flex w-full items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div
                                className={`rounded-lg bg-muted p-2 ${getTypeColor(item.type)}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                  <h3 className="truncate font-medium text-sm">
                                    {item.title}
                                  </h3>
                                  <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                                    {item.description}
                                  </p>

                                  <div className="mt-2 flex items-center space-x-2">
                                    <span className="text-muted-foreground text-xs">
                                      {item.size}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      •
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {item.lastUpdated}
                                    </span>
                                  </div>

                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {item.tags.map((tag) => (
                                      <Badge
                                        className="px-2 py-0.5 text-xs"
                                        key={tag}
                                        variant="secondary"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div
                                  className="ml-2 flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Checkbox
                                    checked={item.selected}
                                    className="h-4 w-4"
                                    onCheckedChange={() =>
                                      handleItemSelect(item.id)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>

              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-muted-foreground">
                  <FileText className="mb-2 h-8 w-8" />
                  <p className="text-sm">No context items found</p>
                  <p className="mt-1 text-xs">Try adjusting your filters</p>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">
              {filteredItems.filter((item) => item.selected).length} selected
            </span>
            <Button className="bg-[#1677ff] hover:bg-[#1066e6]" size="sm">
              Apply Context
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </div>
  );
};

export default RightSidebar;
