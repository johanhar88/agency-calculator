"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion"; // Library Animasi
import CountUp from "react-countup"; // Animasi Angka
import { 
  Rocket, Layout , UserPlus, Save, 
  CreditCard , Server , Database, Settings, Cpu
} from "lucide-react";
import { getCustomers, createCustomer, saveProject, getPricingConfig } from "@/actions/dbActions";
import PrintPDF from "@/components/PrintPDF";
import CustomSelect from "@/components/CustomSelect";
import Sidebar from "@/components/Sidebar";

export default function CalculatorPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [projectName, setProjectName] = useState("");
  
  // Parameter State
  const [webType, setWebType] = useState("Company Profile");
  const [pages, setPages] = useState(5);
  const [complexityTier, setComplexityTier] = useState("Sederhana");
  const [designTier, setDesignTier] = useState("Custom");
  const [cmsTier, setCmsTier] = useState("Basic CMS");
  const [paymentGateway, setPaymentGateway] = useState(false);
  const [apiIntegration, setApiIntegration] = useState(false);
  const [securityTier, setSecurityTier] = useState("Standard");
  const [languages, setLanguages] = useState(1);
  const [hostingTier, setHostingTier] = useState("Cloud VPS");

  const fetchInitialData = useCallback(async () => {
    const [custData, priceData] = await Promise.all([getCustomers(), getPricingConfig()]);
    setCustomers(custData);
    setPricing(priceData);
  }, []);

  useEffect(() => {
    void fetchInitialData();
  }, [fetchInitialData]);

  const calculateTotal = () => {
    if (!pricing) return 0;
    let total = 0;
    if (webType === "Landing Page") total += pricing.landingPage;
    if (webType === "Company Profile") total += pricing.companyProfile;
    if (webType === "E-Commerce") total += pricing.eCommerce;
    if (webType === "Web App / SaaS") total += pricing.webApp;
    
    total += pages * pricing.pricePerPage;
    
    // Biaya Tingkat Kompleksitas
    if (complexityTier === "Sederhana") total += pricing.complexityLow ?? 0;
    if (complexityTier === "Menengah") total += pricing.complexityMedium ?? 3500000;
    if (complexityTier === "Kompleks") total += pricing.complexityHigh ?? 7500000;
    if (complexityTier === "Sangat Kompleks") total += pricing.complexityVeryHigh ?? 15000000;

    if (designTier === "Custom") total += pricing.designCustom;
    if (designTier === "Premium") total += pricing.designPremium;
    if (cmsTier === "Basic CMS") total += pricing.cmsBasic;
    if (cmsTier === "Custom Admin") total += pricing.cmsCustom;
    if (paymentGateway) total += pricing.paymentGateway;
    if (apiIntegration) total += pricing.apiIntegration;
    if (languages > 1) total += (languages - 1) * pricing.langMultiplier;
    if (securityTier === "Advanced") total += pricing.securityAdvanced;
    if (hostingTier === "Shared") total += pricing.hostingShared;
    if (hostingTier === "Cloud VPS") total += pricing.hostingVPS;
    if (hostingTier === "Dedicated") total += pricing.hostingDedicated;
    return total;
  };

  const handleSaveProject = async () => {
    if (!selectedCustomerId || !projectName) return alert("Pilih Customer dan isi Nama Proyek terlebih dahulu!");
    await saveProject({
      name: projectName, webType, pages, complexityTier, designTier, cmsTier, paymentGateway, 
      apiIntegration, securityTier, languages, hostingTier, totalPrice: calculateTotal(), customerId: selectedCustomerId,
    });
    alert("Proyek berhasil disimpan ke database!");
    setProjectName(""); 
  };

  // Konfigurasi Animasi Framer Motion
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  if (!pricing) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" as const }}>
        <Settings size={40} className="text-blue-600" />
      </motion.div>
    </div>
  );

  return (
    <Sidebar>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Rocket className="text-indigo-600" size={28} /> Kalkulator Estimasi Biaya
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Hitung rincian biaya pembuatan website secara instan dan simpan langsung ke CRM.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Form & Kalkulator */}
        <motion.div 
          className="lg:col-span-8 space-y-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Panel Klien */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm p-7 border border-slate-200 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2"><UserPlus size={20} className="text-indigo-600"/> 1. Informasi Klien</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 items-end">
              
              {/* MENGGUNAKAN CUSTOM SELECT UNTUK KLIEN */}
              <div>
                <CustomSelect 
                  label="Pilih Klien"
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  options={[
                    { label: "-- Pilih Customer --", value: "" },
                    // Memetakan data dari database ke format yang diminta CustomSelect
                    ...customers.map(c => ({
                      label: `${c.name} ${c.company ? `(${c.company})` : ''}`,
                      value: c.id
                    }))
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Proyek</label>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Mis: Website E-Commerce Toko Baju" className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"/>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Atau Tambah Klien Baru</label>
              <form action={async (formData) => { await createCustomer(formData); await fetchInitialData(); (document.getElementById('form-add-customer') as HTMLFormElement).reset(); }} id="form-add-customer" className="flex flex-col md:flex-row gap-3">
                <input type="text" name="name" placeholder="Nama PIC" required className="flex-1 p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                <input type="text" name="company" placeholder="Perusahaan (Opsional)" className="flex-1 p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                <button type="submit" className="bg-slate-800 text-white px-6 py-3 text-sm font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 cursor-pointer">Tambah</button>
              </form>
            </div>
          </motion.div>

          {/* Panel Spesifikasi */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm p-7 border border-slate-200 hover:shadow-md transition-shadow">
             <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Layout size={20} className="text-indigo-600"/> 2. Spesifikasi Inti</h2>
             <div className="space-y-6">
                <div>
                  <CustomSelect 
                    label="Tipe Aplikasi / Website"
                    value={webType}
                    onChange={setWebType}
                    options={[
                      { label: "Landing Page (Single Page)", value: "Landing Page" },
                      { label: "Company Profile / Bisnis", value: "Company Profile" },
                      { label: "E-Commerce / Toko Online", value: "E-Commerce" },
                      { label: "Web App / SaaS (Sistem Custom)", value: "Web App / SaaS" }
                    ]}
                  />
                </div>

                {/* Tingkat Kompleksitas */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Cpu size={18} className="text-indigo-600" /> Tingkat Kompleksitas Logika & Fitur
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {[
                      { tier: "Sederhana", label: "Sederhana", desc: "CRUD standar & form dasar" },
                      { tier: "Menengah", label: "Menengah", desc: "Multi-role & alur dinamis" },
                      { tier: "Kompleks", label: "Kompleks", desc: "Real-time & automasi alur" },
                      { tier: "Sangat Kompleks", label: "Sangat Kompleks", desc: "Enterprise & high-concurrency" },
                    ].map((item) => (
                      <div 
                        key={item.tier} 
                        onClick={() => setComplexityTier(item.tier)} 
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          complexityTier === item.tier 
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-600' 
                            : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-sm font-bold">{item.label}</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-1 leading-snug">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between font-semibold text-slate-700 mb-4">
                    <span className="text-sm">Estimasi Jumlah Halaman</span>
                    <span className="text-indigo-700 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">{pages} Halaman</span>
                  </label>
                  <input type="range" min="1" max="100" value={pages} onChange={(e) => setPages(Number(e.target.value))} className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Tingkat Kualitas UI/UX</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Template", "Custom", "Premium"].map((tier) => (
                      <div key={tier} onClick={() => setDesignTier(tier)} className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all duration-200 ${designTier === tier ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-600' : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'}`}>
                        {tier}
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </motion.div>
          
          {/* Panel Fungsionalitas */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm p-7 border border-slate-200 hover:shadow-md transition-shadow">
             <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Database size={20} className="text-indigo-600"/> 3. Sistem & Integrasi</h2>
             <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Content Management System (Admin Panel)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Tanpa CMS", "Basic CMS", "Custom Admin"].map((tier) => (
                      <div key={tier} onClick={() => setCmsTier(tier)} className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all duration-200 ${cmsTier === tier ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-600' : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'}`}>
                        {tier}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${paymentGateway ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={paymentGateway} onChange={() => setPaymentGateway(!paymentGateway)} className="mt-1 w-5 h-5 accent-emerald-600 rounded" />
                    <div>
                      <div className={`font-bold ${paymentGateway ? 'text-emerald-800' : 'text-slate-700'}`}>Payment Gateway</div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">Integrasi pembayaran online otomatis (Midtrans, Xendit, Stripe).</div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${apiIntegration ? 'border-purple-500 bg-purple-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={apiIntegration} onChange={() => setApiIntegration(!apiIntegration)} className="mt-1 w-5 h-5 accent-purple-600 rounded" />
                    <div>
                      <div className={`font-bold ${apiIntegration ? 'text-purple-800' : 'text-slate-700'}`}>API & 3rd Party</div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">Sinkronisasi dengan software eksternal (ERP, CRM, Maps API).</div>
                    </div>
                  </label>
                </div>
             </div>
          </motion.div>
          
          {/* Panel Infrastruktur */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm p-7 border border-slate-200 hover:shadow-md transition-shadow">
             <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Server size={20} className="text-indigo-600"/> 4. Infrastruktur & Keamanan</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <CustomSelect label="Kapasitas Server (Per Tahun)" value={hostingTier} onChange={setHostingTier}
                options={[
                  { label: "Shared Hosting (Trafik Rendah)", value: "Shared" },
                  { label: "Cloud VPS (Direkomendasikan)", value: "Cloud VPS" },
                  { label: "Dedicated Server (High Traffic)", value: "Dedicated" }
                ]}/>
                </div>
                <div>
                  <CustomSelect label="Tingkat Keamanan" value={securityTier} onChange={setSecurityTier}
                  options={[
                  { label: "Standard (SSL & Basic Auth)", value: "Standard" },
                  { label: "Advanced (Pen-Test & WAF)", value: "Advanced" }
                ]}/>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Dukungan Bahasa (Multilingual)</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="1" max="5" value={languages} onChange={(e) => setLanguages(Number(e.target.value))} className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                    <span className="w-24 text-center bg-indigo-50 text-indigo-700 font-bold px-3 py-2 rounded-lg border border-indigo-100">{languages} Bahasa</span>
                  </div>
                </div>
             </div>
          </motion.div>
        </motion.div>

        {/* Kolom Kanan: Summary (Sticky Panel Premium) */}
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" as const }}
        >
          <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl shadow-2xl p-7 text-white sticky top-28 overflow-hidden relative">
            {/* Background Accent / Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
            
            <h2 className="text-lg font-bold opacity-90 mb-6 flex items-center gap-2">
              <CreditCard size={20} /> Rincian Estimasi
            </h2>
            
            <div className="space-y-4 text-sm text-blue-100/80 font-medium mb-8">
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/60">Sistem Dasar:</span> <span className="text-white">{webType}</span></div>
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/60">Kompleksitas:</span> <span className="text-white font-bold text-indigo-300">{complexityTier}</span></div>
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/60">Halaman:</span> <span className="text-white">{pages} Pcs</span></div>
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/60">UI/UX:</span> <span className="text-white">{designTier}</span></div>
              <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-white/60">Panel Admin:</span> <span className="text-white">{cmsTier}</span></div>
            </div>

            <div className="relative z-10">
              <div className="text-sm font-medium text-blue-200 mb-2 uppercase tracking-widest">Total Biaya</div>
              <div className="text-4xl font-extrabold tracking-tight text-white mb-8 flex items-baseline">
                {/* Animasi Rolling Number */}
                <CountUp 
                  start={0} 
                  end={calculateTotal()} 
                  duration={0.8} 
                  separator="." 
                  prefix="Rp " 
                />
              </div>
            </div>

            <button 
              onClick={handleSaveProject} 
              className="w-full bg-white text-indigo-900 font-bold py-4 rounded-xl hover:bg-slate-100 hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex justify-center items-center gap-2 mb-3 cursor-pointer"
            >
              <Save size={20} /> Simpan Proposal ke CRM
            </button>

            <PrintPDF 
              isFullButton={true}
              customerName={customers.find(c => c.id === selectedCustomerId)?.name || "Klien Umum"}
              projectData={{
                name: projectName || "Estimasi Layanan",
                webType, pages, complexityTier, designTier, cmsTier, paymentGateway, 
                apiIntegration, securityTier, languages, hostingTier,
                totalPrice: calculateTotal()
              }}
            />
          </div>
        </motion.div>
      </div>
      </div>
    </Sidebar>
  );
}