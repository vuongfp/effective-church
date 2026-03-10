import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PermissionsGrid({ permissions = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(permissions.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [permissions]);

  // Get unique resource types
  const resourceTypes = useMemo(() => {
    return [...new Set(permissions.map(p => p.resource_type))].sort();
  }, [permissions]);

  // Group permissions by resource name
  const groupedPermissions = useMemo(() => {
    let filtered = permissions;

    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.resource_name?.toLowerCase().includes(term)
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(p => p.resource_type === filterType);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Group by resource name
    const grouped = {};
    filtered.forEach(perm => {
      const resourceName = perm.resource_name || "General";
      if (!grouped[resourceName]) {
        grouped[resourceName] = [];
      }
      grouped[resourceName].push(perm);
    });

    return grouped;
  }, [permissions, searchTerm, filterType, filterCategory]);

  const getActionColor = (action) => {
    const colors = {
      view: "bg-blue-50 text-blue-700 border-blue-200",
      create: "bg-green-50 text-green-700 border-green-200",
      edit: "bg-amber-50 text-amber-700 border-amber-200",
      delete: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[action] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getTypeColor = (type) => {
    return type === "entity" 
      ? "bg-indigo-100 text-indigo-700" 
      : "bg-purple-100 text-purple-700";
  };

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {resourceTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">
                {type === "entity" ? "Entities" : "Pages"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Permissions grid */}
      <div className="max-h-[65vh] overflow-y-auto">
        {Object.entries(groupedPermissions).length === 0 ? (
          <div className="py-12 text-center">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No permissions found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([resourceName, perms]) => (
              <div key={resourceName} className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 px-3">
                  {resourceName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 px-3">
                  {perms.map(perm => (
                    <div
                      key={perm.id}
                      className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-default ${getActionColor(perm.action)}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm leading-snug">
                              {perm.action} {perm.resource_name}
                            </p>
                            {perm.description && (
                              <p className="text-xs opacity-75 mt-0.5 line-clamp-2">
                                {perm.description}
                              </p>
                            )}
                          </div>
                          <Badge className={`flex-shrink-0 text-xs ${getTypeColor(perm.resource_type)}`}>
                            {perm.resource_type === "entity" ? "Entity" : "Page"}
                          </Badge>
                        </div>

                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="outline" className="text-xs bg-white">
                            {perm.action.toUpperCase()}
                          </Badge>
                          {perm.category && (
                            <Badge variant="secondary" className="text-xs">
                              {perm.category}
                            </Badge>
                          )}
                          {perm.is_system && (
                            <Badge variant="outline" className="text-xs bg-slate-100">
                              System
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="px-3 py-3 bg-slate-50 rounded-lg text-xs text-slate-600 border">
        Showing <span className="font-semibold text-slate-900">
          {Object.values(groupedPermissions).reduce((sum, perms) => sum + perms.length, 0)}
        </span> of <span className="font-semibold text-slate-900">{permissions.length}</span> permissions
      </div>
    </div>
  );
}