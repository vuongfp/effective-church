import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export default function AuditLogFilters({ filters, onFiltersChange, onExport, isExporting }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-sm text-slate-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">User Email</label>
            <Input
              placeholder="Search user..."
              value={filters.user_email || ''}
              onChange={(e) => handleFilterChange('user_email', e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Action Type</label>
            <Select value={filters.action_type || 'all'} onValueChange={(value) => handleFilterChange('action_type', value === 'all' ? '' : value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Entity Type</label>
            <Input
              placeholder="e.g., Contact, User"
              value={filters.entity_type || ''}
              onChange={(e) => handleFilterChange('entity_type', e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Date From</label>
            <Input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Date To</label>
            <Input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1.5">Status</label>
            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              onClick={() => onFiltersChange({ user_email: '', action_type: '', entity_type: '', date_from: '', date_to: '', status: '' })}
              className="text-sm"
            >
              Clear Filters
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              onClick={onExport}
              disabled={isExporting}
              className="w-full gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}