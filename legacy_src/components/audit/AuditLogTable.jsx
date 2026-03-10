import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const actionColors = {
  login: 'bg-green-100 text-green-800',
  logout: 'bg-slate-100 text-slate-800',
  create: 'bg-blue-100 text-blue-800',
  update: 'bg-yellow-100 text-yellow-800',
  delete: 'bg-red-100 text-red-800',
  view: 'bg-purple-100 text-purple-800',
  export: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800'
};

export default function AuditLogTable({ logs }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (logId) => {
    setExpandedId(expandedId === logId ? null : logId);
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <p className="text-slate-500">No audit logs found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <Card key={log.id} className="cursor-pointer hover:bg-slate-50" onClick={() => toggleExpand(log.id)}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={actionColors[log.action_type]}>
                    {log.action_type}
                  </Badge>
                  {log.entity_type && (
                    <span className="text-sm font-medium text-slate-700">{log.entity_type}</span>
                  )}
                  {log.entity_name && (
                    <span className="text-sm text-slate-600 truncate">{log.entity_name}</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>User: <span className="font-medium text-slate-700">{log.user_email}</span></p>
                  <p>Time: {format(new Date(log.timestamp), 'PPpp')}</p>
                  {log.description && <p>{log.description}</p>}
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-2">
                {expandedId === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {expandedId === log.id && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                {log.changed_fields && log.changed_fields.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Changed Fields</h4>
                    <div className="space-y-2 text-sm">
                      {log.changed_fields.map((field) => (
                        <div key={field} className="bg-slate-50 p-3 rounded-lg">
                          <p className="font-medium text-slate-700 mb-1">{field}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-slate-500">Before</p>
                              <p className="font-mono bg-white p-2 rounded text-slate-700 whitespace-pre-wrap break-all">
                                {JSON.stringify(log.old_values?.[field], null, 2) || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">After</p>
                              <p className="font-mono bg-white p-2 rounded text-slate-700 whitespace-pre-wrap break-all">
                                {JSON.stringify(log.new_values?.[field], null, 2) || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {log.ip_address && log.ip_address !== 'unknown' && (
                  <p className="text-xs text-slate-500">IP Address: <span className="font-mono">{log.ip_address}</span></p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}