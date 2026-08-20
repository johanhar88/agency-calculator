"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, DollarSign, Users, Trash2, 
  Save, Layout, Globe, Server, ShieldCheck 
} from "lucide-react";
import { getCustomers, deleteCustomer, getPricingConfig, updatePricingConfig } from "@/actions/dbActions";
import Sidebar from "@/components/Sidebar";

type Customer = {
  id: string;
  name: string;
  company?: string | null;
  projects?: Array<{ id: string }>;
};

type PricingConfig = {
  id: number;
  landingPage: number;
  companyProfile: number;
  eCommerce: number;
  webApp: number;
  pricePerPage: number;
  designCustom: number;
  designPremium: number;
  cmsBasic: number;
  cmsCustom: number;
  paymentGateway: number;
  apiIntegration: number;
  langMultiplier: number;
  securityAdvanced: number;
  hostingShared: number;
  hostingVPS: number;
  hostingDedicated: number;
  updatedAt: Date;
};

// ==========================================
// KOMPONEN PRICE INPUT (DIPINDAHKAN KE LUAR AGAR TIDAK TERSENDAT)
// ==========================================
const PriceInput = ({ 
  label, 
  name, 
  value, 
  onChange 
}: { 
  label: string, 
  name: string, 
  value: number | string | null | undefined, 
  onChange: (name: string, val: number) => void 
}) => {
  // Format angka ke format Rupiah (dengan titik)
  const formattedValue = new Intl.NumberFormat('id-ID').format(Number(value) || 0);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya ambil angka mentah
    const rawValue = e.target.value.replace(/\D/g, '');
    // Kirim data mentah ke state induk
    onChange(name, Number(rawValue));
  };

  return (
    <div className="flex flex-col">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <span className="text-slate-400 font-medium text-sm">Rp</span>
        </div>
        <input 
          type="text" 
          inputMode="numeric" 
          name={name} 
          value={formattedValue === "0" ? "" : formattedValue} 
          placeholder="0"
          onChange={onInputChange} 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
        />
      </div>
    </div>
  );
};

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function MasterDataPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pricing");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 3. PAKSA HARUS LOGIN
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/");
    },
  });

  const fetchData = async () => {
    try {
      const [custData, priceData] = await Promise.all([
        getCustomers(),
        getPricingConfig(),
      ]);

      setCustomers(custData);
      setPricing(priceData);
    } catch (error) {
      console.error("Failed to load master data:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [custData, priceData] = await Promise.all([
          getCustomers(),
          getPricingConfig(),
        ]);

        if (!isMounted) return;

        setCustomers(custData);
        setPricing(priceData);
      } catch (error) {
        console.error("Failed to load master data:", error);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 4. MUNCULKAN LOADING JIKA SEDANG MENGECEK LOGIN
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-indigo-600">
        Memverifikasi Akses...
      </div>
    );
  }

  const handlePriceChange = (name: string, value: number) => {
    setPricing((prev) => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  const savePricing = async () => {
    setIsSaving(true);
    await updatePricingConfig(pricing);
    setTimeout(() => {
      setIsSaving(false);
      alert("✅ Konfigurasi harga berhasil diperbarui!");
    }, 500);
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if(confirm(`Yakin ingin menghapus klien "${name}" beserta seluruh riwayat proyeknya? Data tidak bisa dikembalikan.`)) {
      await deleteCustomer(id);
      fetchData();
    }
  };

  if (!pricing) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <Database size={40} className="text-indigo-600" />
      </motion.div>
    </div>
  );

  return (
    <Sidebar>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
              <Database className="text-indigo-600" size={28} /> Master Data & Konfigurasi
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Kelola tarif harga standar komponen website dan kelola database master klien.
            </p>
          </div>

          {activeTab === "pricing" && (
            <button 
              onClick={savePricing} 
              disabled={isSaving}
              className="self-start md:self-auto bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              <Save size={18} /> {isSaving ? "Menyimpan..." : "Simpan Perubahan Harga"}
            </button>
          )}
        </div>
        
        <div className="flex justify-center mb-10">
          <div className="bg-slate-200/70 p-1.5 rounded-2xl flex gap-1 shadow-inner">
            <button 
              onClick={() => setActiveTab("pricing")} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === "pricing" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
            >
              <DollarSign size={18} /> Harga Layanan
            </button>
            <button 
              onClick={() => setActiveTab("clients")} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === "clients" ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Users size={18} /> Daftar Klien
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {activeTab === "pricing" && (
            <motion.div 
              key="tab-pricing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white rounded-3xl shadow-sm p-7 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <Layout className="text-indigo-500" size={22} /> Tipe Sistem (Base Price)
                </h3>
                <div className="space-y-5">
                  <PriceInput label="Landing Page (1 Halaman)" name="landingPage" value={pricing.landingPage} onChange={handlePriceChange} />
                  <PriceInput label="Company Profile" name="companyProfile" value={pricing.companyProfile} onChange={handlePriceChange} />
                  <PriceInput label="E-Commerce / Toko Online" name="eCommerce" value={pricing.eCommerce} onChange={handlePriceChange} />
                  <PriceInput label="Web App / SaaS (Custom)" name="webApp" value={pricing.webApp} onChange={handlePriceChange} />
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-7 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <Layout className="text-pink-500" size={22} /> Desain UI/UX & Kuantitas
                </h3>
                <div className="space-y-5">
                  <PriceInput label="Harga Per Halaman (Screen)" name="pricePerPage" value={pricing.pricePerPage} onChange={handlePriceChange} />
                  <PriceInput label="Desain UI/UX Custom" name="designCustom" value={pricing.designCustom} onChange={handlePriceChange} />
                  <PriceInput label="Desain UI/UX Premium (Animasi)" name="designPremium" value={pricing.designPremium} onChange={handlePriceChange} />
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-7 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <Server className="text-emerald-500" size={22} /> Fungsionalitas & CMS
                </h3>
                <div className="space-y-5">
                  <PriceInput label="Basic CMS (Panel Admin)" name="cmsBasic" value={pricing.cmsBasic} onChange={handlePriceChange} />
                  <PriceInput label="Custom Admin Panel" name="cmsCustom" value={pricing.cmsCustom} onChange={handlePriceChange} />
                  <PriceInput label="Integrasi Payment Gateway" name="paymentGateway" value={pricing.paymentGateway} onChange={handlePriceChange} />
                  <PriceInput label="Integrasi API / Pihak Ketiga" name="apiIntegration" value={pricing.apiIntegration} onChange={handlePriceChange} />
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-7 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <ShieldCheck className="text-blue-500" size={22} /> Server & Keamanan
                </h3>
                <div className="space-y-5">
                  <PriceInput label="Multiplier Multi-Bahasa" name="langMultiplier" value={pricing.langMultiplier} onChange={handlePriceChange} />
                  <PriceInput label="Keamanan Advanced (WAF/Pen-Test)" name="securityAdvanced" value={pricing.securityAdvanced} onChange={handlePriceChange} />
                  <PriceInput label="Hosting Shared (Per Tahun)" name="hostingShared" value={pricing.hostingShared} onChange={handlePriceChange} />
                  <PriceInput label="Hosting Cloud VPS (Per Tahun)" name="hostingVPS" value={pricing.hostingVPS} onChange={handlePriceChange} />
                  <PriceInput label="Hosting Dedicated (Per Tahun)" name="hostingDedicated" value={pricing.hostingDedicated} onChange={handlePriceChange} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "clients" && (
            <motion.div 
              key="tab-clients"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="text-indigo-500" size={20} /> Direktori Klien Anda
                </h3>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                  Total: {customers.length} Klien
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-slate-500 text-sm border-b border-slate-200">
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Nama Klien / PIC</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs">Nama Perusahaan</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-center">Rekam Jejak</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-wider text-xs text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 text-slate-800 font-bold">{c.name}</td>
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {c.company ? (
                            <span className="flex items-center gap-1.5"><Globe size={14} className="text-slate-400"/> {c.company}</span>
                          ) : (
                            <span className="text-slate-400 italic">Individu / Personal</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                            {c.projects?.length || 0} Proyek
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end">
                            <button 
                              onClick={() => handleDeleteCustomer(c.id, c.name)} 
                              title="Hapus Klien"
                              className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white p-2.5 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {customers.length === 0 && (
                <div className="p-16 flex flex-col items-center justify-center text-slate-500">
                  <Users size={48} className="text-slate-300 mb-4" />
                  <p className="font-medium text-lg text-slate-600">Belum ada data klien.</p>
                  <p className="text-sm">Klien yang ditambahkan melalui Kalkulator akan muncul di sini.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Sidebar>
  );
}