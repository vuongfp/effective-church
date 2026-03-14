"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

interface Option {
  id: string;
  name: string;
  type: string;
  email?: string | null;
}

interface AssigneeSelectorProps {
  value?: string;
  onChange: (assignee: { id: string; name: string }) => void;
  placeholder?: string;
}

export default function AssigneeSelector({ value, onChange, placeholder = "Search and select..." }: AssigneeSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    if (!search.trim()) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    const fetchAssignees = async () => {
      try {
        const supabase = createClient();
        const { data: staffData, error: staffErr } = await supabase.from('staff').select('*');
        if (staffErr) throw staffErr;
        const staff = staffData || [];
        const volunteers: any[] = []; // Volunteer table merged or deprecated in Next.js schema

        const staffOptions = staff.map(s => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
          type: "Staff",
          email: s.email,
        }));

        const volunteerOptions = volunteers.map(v => ({
          id: v.id,
          name: `${v.first_name} ${v.last_name}`,
          type: "Volunteer",
          email: v.email,
        }));

        const allOptions = [...staffOptions, ...volunteerOptions].filter(opt =>
          opt.name.toLowerCase().includes(search.toLowerCase()) ||
          opt.email?.toLowerCase().includes(search.toLowerCase())
        );

        setOptions(allOptions);
      } catch (err) {
        console.error("Error fetching assignees:", err);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchAssignees, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (value) {
      const selected = options.find(opt => opt.id === value);
      if (selected) {
        setSelectedName(selected.name);
      }
    }
  }, [value, options]);

  const handleSelect = (option: Option) => {
    onChange({ id: option.id, name: option.name });
    setSelectedName(option.name);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          value={search || selectedName}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          ) : options.length === 0 ? (
            <div className="p-3 text-sm text-slate-500">
              {search ? "No results found" : "Start typing to search..."}
            </div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-3 py-2 hover:bg-slate-100 border-b border-slate-100 last:border-b-0 text-sm"
              >
                <div className="font-medium text-slate-900">{opt.name}</div>
                <div className="text-xs text-slate-500">{opt.type} {opt.email && `• ${opt.email}`}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}