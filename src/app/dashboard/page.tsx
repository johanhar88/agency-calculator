import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  ArrowLeft,
  Building,
  Calendar,
  LogOut, LayoutDashboard, Edit
} from "lucide-react";
import PrintPDF from "@/components/PrintPDF";

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
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/calculator" className="text-gray-500 hover:text-blue-600 transition flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium">
            <ArrowLeft size={16} /> Kembali ke Kalkulator
          </Link>
          <div className="text-xl font-bold text-gray-800 ml-4 border-l pl-4 border-gray-300 flex items-center gap-2">
            <LayoutDashboard size={24} className="text-blue-600" />Dashboard
          </div>
        </div>
        {/* NextAuth menyediakan rute bawaan /api/auth/signout untuk logout dari sisi server/tanpa state */}
        <Link href="/api/auth/signout" className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition font-medium">
          <LogOut size={18} /> Keluar
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto p-6 mt-6">
        
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
                              {project.pages} Halaman • {project.cmsTier ? 'CMS' : 'No CMS'}
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
    </div>
  );
}