import React, { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function PermissionGrid({ permissions, selectedPermissions, onPermissionChange }) {
  const [searchTerm, setSearchTerm] = useState("");

  const groupedPermissions = useMemo(() => {
    const filtered = permissions.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.resource_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by resource_type and resource_name
    const grouped = {};
    filtered.forEach(perm => {
      const resourceType = perm.resource_type || "Other";
      if (!grouped[resourceType]) grouped[resourceType] = {};
      
      const resourceName = perm.resource_name || "General";
      if (!grouped[resourceType][resourceName]) {
        grouped[resourceType][resourceName] = [];
      }
      grouped[resourceType][resourceName].push(perm);
    });

    return grouped;
  }, [permissions, searchTerm]);

  const handleSelectAllResource = (resourceType, resourceName, perms) => {
    const permIds = perms.map(p => p.id);
    const allSelected = permIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all
      permIds.forEach(id => onPermissionChange(id, false));
    } else {
      // Select all
      permIds.forEach(id => {
        if (!selectedPermissions.includes(id)) {
          onPermissionChange(id, true);
        }
      });
    }
  };

  const isResourceSelected = (perms) => {
    return perms.length > 0 && perms.every(p => selectedPermissions.includes(p.id));
  };

  const isResourcePartial = (perms) => {
    return perms.some(p => selectedPermissions.includes(p.id)) && 
           !perms.every(p => selectedPermissions.includes(p.id));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([resourceType, resourceGroups]) => (
          <div key={resourceType}>
            <h2 className="font-bold text-base text-slate-900 mb-3 capitalize">{resourceType}</h2>
            <div className="space-y-3">
              {Object.entries(resourceGroups).map(([resourceName, perms]) => {
                const allSelected = isResourceSelected(perms);
                const partial = isResourcePartial(perms);

                return (
                  <div key={`${resourceType}-${resourceName}`} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          checked={allSelected}
                          ref={(el) => {
                            if (el && partial) {
                              el.indeterminate = true;
                            }
                          }}
                          onCheckedChange={() => handleSelectAllResource(resourceType, resourceName, perms)}
                        />
                        <h3 className="font-semibold text-sm text-slate-700">{resourceName}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectAllResource(resourceType, resourceName, perms)}
                        className="text-xs"
                      >
                        {allSelected ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {perms.map(perm => (
                        <label key={perm.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer">
                          <Checkbox
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={(checked) => onPermissionChange(perm.id, checked)}
                          />
                          <div className="flex-1">
                            <div className="text-sm text-slate-900 capitalize">{perm.action}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}