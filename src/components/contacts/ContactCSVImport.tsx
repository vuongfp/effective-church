"use client";
import React, { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download } from "lucide-react";

const FIELD_MAP = {
  first_name: ["first_name", "firstname", "first name", "họ"],
  last_name: ["last_name", "lastname", "last name", "tên"],
  email: ["email", "e-mail", "mail"],
  phone: ["phone", "phone_number", "phonenumber", "điện thoại", "mobile"],
  company: ["company", "organization", "công ty"],
  role: ["role", "job_title", "jobtitle", "title", "chức vụ"],
  address: ["address", "địa chỉ", "addr"],
  relationship: ["relationship", "quan hệ", "relation"],
  favorite_channel: ["favorite_channel", "favoritechannel", "channel", "kênh liên lạc", "kênh yêu thích"],
  notes: ["notes", "note", "ghi chú", "remarks"],
  groups: ["groups", "group", "nhóm"],
  status: ["status", "trạng thái"],
};

function parseCSV(text: string) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ""; });
    return row;
  });
}

function mapRow(raw: Record<string, string>) {
  const contact: Record<string, any> = {};
  for (const [field, aliases] of Object.entries(FIELD_MAP)) {
    for (const alias of aliases) {
      if (raw[alias] !== undefined && raw[alias] !== "") {
        if (field === "groups" && typeof raw[alias] === "string") {
          contact[field] = raw[alias].split(";").map(g => g.trim()).filter(Boolean);
        } else {
          contact[field] = raw[alias];
        }
        break;
      }
    }
  }
  return contact;
}

const SAMPLE_CSV = `first_name,last_name,email,phone,company,role,address,relationship,favorite_channel,notes,groups,status
Nguyễn,Văn A,a@example.com,0901234567,Công ty ABC,Giám đốc,Hà Nội,client,email,Khách hàng VIP,VIP;Hà Nội,active
Trần,Thị B,b@example.com,0987654321,Công ty XYZ,Kế toán,TP.HCM,colleague,zalo,,TP.HCM,active`;

interface ContactCSVImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
}

export default function ContactCSVImport({ open, onOpenChange, onImported }: ContactCSVImportProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result !== "string") return;
      const parsed = parseCSV(result);
      const mapped = parsed.map(mapRow);
      const errs = mapped
        .map((r, i) => (!r.first_name || !r.last_name || !r.email) ? `Row ${i + 2}: missing first_name, last_name, or email` : null)
        .filter((e): e is string => e !== null);
      setErrors(errs);
      setRows(mapped);
      setDone(false);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const valid = rows.filter(r => r.first_name && r.last_name && r.email);
    if (!valid.length) return;
    setImporting(true);
    const supabase = createClient();
    const { error } = await supabase.from('members').insert(valid);
    if (error) console.error("Import error:", error);
    setImportedCount(valid.length);
    setImporting(false);
    setDone(true);
    onImported?.();
  };

  const handleClose = () => {
    setRows([]);
    setErrors([]);
    setDone(false);
    setImportedCount(0);
    if (fileRef.current) fileRef.current.value = "";
    onOpenChange(false);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_sample.csv";
    a.click();
  };

  const validCount = rows.filter(r => r.first_name && r.last_name && r.email).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" /> Import Contacts from CSV
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-lg font-semibold text-slate-800">Imported {importedCount} contacts!</p>
            <Button onClick={handleClose} className="mt-2 bg-indigo-600 hover:bg-indigo-700">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-700">CSV columns supported:</p>
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-red-500">*Required:</span> first_name, last_name, email<br />
                <span className="font-semibold">Optional:</span> phone, company, role, address, relationship, favorite_channel, notes, groups (semicolon-separated), status
              </p>
              <button onClick={downloadSample} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs mt-1">
                <Download className="w-3 h-3" /> Download sample CSV
              </button>
            </div>

            {/* Upload area */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
              <FileText className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm font-medium text-slate-700">Click to select CSV file</span>
              <span className="text-xs text-slate-400 mt-1">.csv files only</span>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            </label>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                {errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{e}</p>
                ))}
              </div>
            )}

            {/* Preview */}
            {rows.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Preview: <span className="text-green-600">{validCount} valid</span>
                  {errors.length > 0 && <span className="text-red-500 ml-2">{errors.length} invalid (will be skipped)</span>}
                </p>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        {["Name", "Email", "Phone", "Company", "Relationship", "Channel", "Groups"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-slate-600 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 20).map((r, i) => {
                        const isInvalid = !r.first_name || !r.last_name || !r.email;
                        return (
                          <tr key={i} className={`border-t ${isInvalid ? "bg-red-50" : "hover:bg-slate-50"}`}>
                            <td className="px-3 py-1.5">{r.first_name} {r.last_name}</td>
                            <td className="px-3 py-1.5 text-slate-500">{r.email || "—"}</td>
                            <td className="px-3 py-1.5 text-slate-500">{r.phone || "—"}</td>
                            <td className="px-3 py-1.5 text-slate-500">{r.company || "—"}</td>
                            <td className="px-3 py-1.5 text-slate-500">{r.relationship || "—"}</td>
                            <td className="px-3 py-1.5 text-slate-500">{r.favorite_channel || "—"}</td>
                            <td className="px-3 py-1.5 text-slate-500">{Array.isArray(r.groups) ? r.groups.join(", ") : r.groups || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {rows.length > 20 && <p className="text-xs text-center text-slate-400 py-1">...and {rows.length - 20} more rows</p>}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0 || importing}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {importing ? "Importing..." : `Import ${validCount} Contacts`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}