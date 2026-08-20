import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Building, 
  Calendar, 
  LayoutDashboard, 
  Edit 
} from "lucide-react";
import PrintPDF from "@/components/PrintPDF";
import Sidebar from "@/components/Sidebar";

// Server Component (Tidak menggunakan "use client")
export default async function DashboardPage() {
  // 1. CEK SESI LOGIN DI SINI
  const session = await getServerSession();
  if (!session) {
    // Jika tidak ada sesi (belum login), paksa pindah ke halaman login
    redirect("/");
  }

  // Mengambil data langsung dari Database menggunakan Prisma
  const customers = await prisma.customer.findMany({
    include: {
      projects: {
        orderBy: { createdAt: 'desc' } // Urutkan proyek dari yang terbaru
      }
    },
    orderBy: { createdAt: 'desc' } // Urutkan customer dari yang terbaru
  });

  // Kalkulasi Ringkasan Data (Metrics)
  const totalCustomers = customers.length;
  const totalProjects = customers.reduce((acc, curr) => acc + curr.projects.length, 0);
  const totalRevenue = customers.reduce((acc, curr) => 
    acc + curr.projects.reduce((sum, p) => sum + p.totalPrice, 0), 0
  );

  const formatRupiah = (num: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);

  return (
    <Sidebar>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="text-indigo-600" size={28} /> Dashboard Proyek
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Ringkasan data klien, riwayat proposal proyek, dan total estimasi pendapatan.
          </p>
        </div>
        
        {/* Section: Widget Ringkasan (Summary) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600">
              <Users size={28} />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium mb-1">Total Klien</div>
              <div className="text-2xl font-bold text-gray-800">{totalCustomers} Klien</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
              <Briefcase size={28} />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium mb-1">Total Proyek Web</div>
              <div className="text-2xl font-bold text-gray-800">{totalProjects} Proyek</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <DollarSign size={28} />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium mb-1">Estimasi Nilai Proyek</div>
              <div className="text-2xl font-bold text-gray-800">{formatRupiah(totalRevenue)}</div>
            </div>
          </div>
        </div>

        {/* Section: Daftar Customer & Proyek */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Database Klien & Riwayat Proyek</h2>
        
        {customers.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm border border-gray-100 text-gray-500">
            Belum ada data klien. Silakan tambahkan melalui halaman kalkulator.
          </div>
        ) : (
          <div className="space-y-6">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header Klien */}
                <div className="bg-gray-50 border-b border-gray-200 p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Users size={18} className="text-blue-500" /> {customer.name}
                    </h3>
                    {customer.company && (
                      <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                        <Building size={14} /> {customer.company}
                      </p>
                    )}
                  </div>
                  <div className="text-sm bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm font-medium text-gray-600">
                    Total: {customer.projects.length} Proyek
                  </div>
                </div>

                {/* Tabel Riwayat Proyek Klien */}
                <div className="p-0 overflow-x-auto">
                  {customer.projects.length === 0 ? (
                    <p className="text-gray-500 text-sm p-5 italic">Belum ada proyek yang disimpan untuk klien ini.</p>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                          <th className="py-3 px-5 font-medium">Nama Proyek</th>
                          <th className="py-3 px-5 font-medium">Spesifikasi</th>
                          <th className="py-3 px-5 font-medium">Tanggal Dibuat</th>
                          <th className="py-3 px-5 font-medium text-right">Estimasi Biaya</th>
                          <th className="py-3 px-5 font-medium text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {customer.projects.map((project) => (
                          <tr key={project.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                            <td className="py-4 px-5 font-semibold text-gray-800">
                              {project.name}
                            </td>
                            <td className="py-4 px-5 text-gray-600">
                              <div className="font-medium text-slate-800 text-xs">{project.webType}</div>
                              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                <span>{project.pages} Halaman</span>
                                <span>•</span>
                                <span className="text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">{project.complexityTier || "Sederhana"}</span>
                                <span>•</span>
                                <span>{project.cmsTier ? 'CMS' : 'No CMS'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-gray-500">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} /> 
                                <span>{formatDate(project.createdAt)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 font-bold text-blue-600 text-right">
                              {formatRupiah(project.totalPrice)}
                            </td>
                            <td className="py-4 px-5 flex justify-center items-center gap-2">
                              {/* Tombol Edit */}
                              <Link 
                                href={`/calculator?edit=${project.id}`} 
                                className="text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white p-2.5 rounded-lg transition"
                                title="Edit Proyek"
                              >
                                <Edit size={18} />
                              </Link>
                              {/* Tombol PDF yang sudah ada */}
                              <PrintPDF 
                                isFullButton={false}
                                customerName={customer.name}
                                projectData={project}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </Sidebar>
  );
}