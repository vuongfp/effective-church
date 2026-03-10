import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw, ExternalLink, Sheet, Bot, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const DEFAULT_SYSTEM_PROMPT = `You are an AI assistant embedded in a dual-mode application:
1. EffectiveCRM - a business CRM with Contacts, Accounts, Opportunities, Activities, Notes, Campaigns, Tickets, Groups, Reports.
2. ChurchCRM - a church management system with Members, Groups/Cells, Events, Finances, Messages, Notes, Reports.

Be concise, accurate, and professional. Never guess data — always use the provided context.`;

export default function Settings() {
  const queryClient = useQueryClient();
  const [sheetInput, setSheetInput] = useState("");
  const [syncStatus, setSyncStatus] = useState(null); // null | "loading" | "success" | "error"
  const [syncMsg, setSyncMsg] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [promptSaved, setPromptSaved] = useState(false);

  // Load settings from DB
  const { data: settings = [] } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  useEffect(() => {
    if (settings.length > 0) {
      const sheetSetting = settings.find(s => s.key === "google_sheet_id");
      const promptSetting = settings.find(s => s.key === "ai_system_prompt");
      if (sheetSetting) setSheetInput(sheetSetting.value || "");
      if (promptSetting) setSystemPrompt(promptSetting.value || "");
      else setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    } else {
      setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    }
  }, [settings]);

  const saveSetting = async (key, value) => {
    const existing = settings.find(s => s.key === key);
    if (existing) {
      await base44.entities.AppSettings.update(existing.id, { value });
    } else {
      await base44.entities.AppSettings.create({ key, value });
    }
    queryClient.invalidateQueries({ queryKey: ["app-settings"] });
  };

  const handleSync = async () => {
    if (!sheetInput.trim()) return;
    setSyncStatus("loading");
    setSyncMsg("");
    // Save the sheet ID first
    await saveSetting("google_sheet_id", sheetInput.trim());
    try {
      const res = await base44.functions.invoke("syncToGoogleSheets", { spreadsheetId: sheetInput.trim() });
      if (res.data?.success) {
        setSyncStatus("success");
        setSyncMsg(`Synced ${res.data.sheets} sheets, ${res.data.totalCells} cells updated.`);
      } else {
        setSyncStatus("error");
        setSyncMsg(res.data?.error || "Unknown error");
      }
    } catch (e) {
      setSyncStatus("error");
      setSyncMsg(e.message || "Sync failed");
    }
  };

  const handleSavePrompt = async () => {
    await saveSetting("ai_system_prompt", systemPrompt);
    setPromptSaved(true);
    setTimeout(() => setPromptSaved(false), 2000);
  };

  // Extract spreadsheet URL for the open link button
  const getSheetUrl = () => {
    const idMatch = sheetInput.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const rawId = idMatch ? idMatch[1] : (/^[a-zA-Z0-9-_]+$/.test(sheetInput.trim()) ? sheetInput.trim() : null);
    if (rawId) return `https://docs.google.com/spreadsheets/d/${rawId}`;
    return null;
  };

  const sheetUrl = getSheetUrl();

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage application settings and integrations</p>
      </div>

      {/* Google Sheets Backup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sheet className="w-5 h-5 text-emerald-600" />
            Google Sheets Backup
          </CardTitle>
          <p className="text-sm text-slate-500">
            Sync all your data to a Google Spreadsheet. Each table will be written as a separate sheet.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Google Sheet URL or ID</label>
            <div className="flex gap-2">
              <Input
                value={sheetInput}
                onChange={e => setSheetInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... or Sheet ID"
                className="flex-1"
              />
              {sheetUrl && (
                <a href={sheetUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" title="Open Sheet">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Make sure the sheet is shared with edit access to the Google account used for OAuth.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleSync}
              disabled={!sheetInput.trim() || syncStatus === "loading"}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {syncStatus === "loading"
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</>
                : <><RefreshCw className="w-4 h-4 mr-2" /> Sync Now</>
              }
            </Button>

            {syncStatus === "success" && (
              <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                {syncMsg}
              </div>
            )}
            {syncStatus === "error" && (
              <div className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {syncMsg}
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-700">Sheets that will be synced:</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {["Members","Groups","Activities","Transactions","Visitors","Staff","Announcements","PrayerRequests","AttendanceRecords","Donations","Tasks","TrainingPrograms"].map(s => (
                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI System Prompt */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="w-5 h-5 text-violet-600" />
            AI Assistant – System Prompt
          </CardTitle>
          <p className="text-sm text-slate-500">
            Customize the base instructions for the AI Assistant. This affects how it responds to all users.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            rows={12}
            className="font-mono text-xs resize-y"
            placeholder="Enter system prompt..."
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleSavePrompt} className="bg-violet-600 hover:bg-violet-700">
              <Save className="w-4 h-4 mr-2" />
              Save Prompt
            </Button>
            <Button variant="outline" onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)} className="text-slate-500">
              Reset to Default
            </Button>
            {promptSaved && (
              <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle className="w-4 h-4" /> Saved!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}