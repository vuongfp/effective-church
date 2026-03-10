import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import AuditLogTable from '@/components/audit/AuditLogTable';
import AuditLogFilters from '@/components/audit/AuditLogFilters';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLang } from '@/components/i18n/LanguageContext';
import { t } from '@/components/i18n/translations';

export default function AuditLogsPage() {
  const { lang } = useLang();
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    user_email: '',
    action_type: '',
    entity_type: '',
    date_from: '',
    date_to: '',
    status: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  // Check admin access
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch audit logs with filters
  const { data: allLogs = [], isLoading, error } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => base44.entities.AuditLog.list('-timestamp', 500),
    enabled: !!user?.email
  });

  // Apply filters
  const filteredLogs = allLogs.filter(log => {
    if (filters.user_email && !log.user_email.toLowerCase().includes(filters.user_email.toLowerCase())) {
      return false;
    }
    if (filters.action_type && log.action_type !== filters.action_type) {
      return false;
    }
    if (filters.entity_type && !log.entity_type?.toLowerCase().includes(filters.entity_type.toLowerCase())) {
      return false;
    }
    if (filters.status && log.status !== filters.status) {
      return false;
    }
    if (filters.date_from) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (logDate < filters.date_from) return false;
    }
    if (filters.date_to) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (logDate > filters.date_to) return false;
    }
    return true;
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Prepare CSV data
      const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Description', 'Status', 'Changed Fields'];
      const rows = filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.user_email,
        log.action_type,
        log.entity_type || '',
        log.entity_id || '',
        log.description || '',
        log.status,
        (log.changed_fields || []).join(', ')
      ]);

      // Create CSV content
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Check admin access
  if (user && user.role !== 'admin') {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold">{t("Access Denied", lang)}</h2>
            <p className="text-slate-600">{t("Only administrators can view audit logs.", lang)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t("Audit Logs", lang)}</h1>
        <p className="text-slate-600 mt-1">{t("Track all user activities and system changes", lang)}</p>
      </div>

      <AuditLogFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 text-sm text-red-700">
            Error loading audit logs: {error.message}
          </CardContent>
        </Card>
      )}

      <div>
        <p className="text-sm text-slate-600 mb-4">
           {lang === "vi" ? "Hiển thị" : lang === "fr" ? "Affichage" : "Showing"} <span className="font-semibold">{filteredLogs.length}</span> {lang === "vi" ? "của" : lang === "fr" ? "de" : "of"} <span className="font-semibold">{allLogs.length}</span> {lang === "vi" ? "nhật ký kiểm toán" : lang === "fr" ? "journaux d'audit" : "audit logs"}
         </p>
        {isLoading ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-500">{lang === "vi" ? "Đang tải nhật ký kiểm toán..." : lang === "fr" ? "Chargement des journaux d'audit..." : "Loading audit logs..."}</p>
            </CardContent>
          </Card>
        ) : (
          <AuditLogTable logs={filteredLogs} />
        )}
      </div>
    </div>
  );
}