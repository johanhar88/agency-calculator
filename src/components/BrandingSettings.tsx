"use client";

import { useState } from "react";
import { getBranding, setBranding, Branding } from "../lib/branding";

export default function BrandingSettings() {
  const [branding, setBrandingState] = useState<Branding>(() => getBranding());
  const [status, setStatus] = useState("");

  if (!branding) return null;

  function update(field: keyof Branding, value: string) {
    const next = { ...branding, [field]: value } as Branding;
    setBrandingState(next);
  }

  function save() {
    if (!branding) return;
    setBranding(branding);
    setStatus("Disimpan");
    setTimeout(() => setStatus(""), 2000);
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-7 border border-slate-200">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800">Pengaturan Branding</h3>
          <p className="text-sm text-slate-500 mt-1">Sesuaikan identitas yang muncul pada dokumen penawaran.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Nama Perusahaan</label>
            <input
              className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              value={branding.companyName}
              onChange={(e) => update("companyName", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email Kontak</label>
            <input
              className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              value={branding.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Logo Placeholder (teks atau URL)</label>
            <input
              className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              value={branding.logoPlaceholder}
              onChange={(e) => update("logoPlaceholder", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md cursor-pointer"
              onClick={save}>
              Simpan
            </button>
            {status && <span className="text-sm text-emerald-600">{status}</span>}
          </div>
        </div>

        <div className="md:col-span-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pratinjau Header</label>
          <div className="p-4 rounded-lg border border-slate-100 bg-gradient-to-b from-white to-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-indigo-600 font-extrabold text-lg">{branding.companyName}</div>
                <div className="text-sm text-slate-500">{branding.email}</div>
              </div>
              <div className="text-sm text-slate-400 italic">{branding.logoPlaceholder}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
