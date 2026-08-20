"use client";

import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PrintPDF({ 
  projectData, 
  customerName, 
  isFullButton = false 
}: { 
  projectData: any, 
  customerName: string, 
  isFullButton?: boolean 
}) {
  
  const formatRupiah = (num: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("Proposal Penawaran Proyek Web", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    
    // Menggunakan tanggal proyek dibuat, atau tanggal hari ini jika estimasi baru
    const date = projectData.createdAt ? new Date(projectData.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    doc.text(`Tanggal: ${date}`, 14, 30);
    doc.text(`Klien: ${customerName}`, 14, 36);
    doc.text(`Nama Proyek: ${projectData.name}`, 14, 42);

    // Menyusun Data Tabel dari Spesifikasi Lengkap
    const tableData = [
      ["Tipe Website / Sistem", projectData.webType],
      ["Jumlah Halaman", `${projectData.pages} Halaman`],
      ["Desain UI/UX", projectData.designTier],
      ["Sistem CMS (Admin)", projectData.cmsTier],
      ["Payment Gateway", projectData.paymentGateway ? "Termasuk (Terintegrasi)" : "Tidak Ada"],
      ["API / Pihak Ketiga", projectData.apiIntegration ? "Termasuk (Terintegrasi)" : "Tidak Ada"],
      ["Keamanan Sistem", projectData.securityTier],
      ["Dukungan Bahasa", `${projectData.languages} Bahasa`],
      ["Infrastruktur Server", projectData.hostingTier],
    ];

    // Render Tabel
    autoTable(doc, {
      startY: 50,
      head: [['Spesifikasi & Fungsionalitas', 'Keterangan']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 11, cellPadding: 5 },
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 50; 
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Total Estimasi Biaya:", 14, finalY + 15);
    
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(formatRupiah(projectData.totalPrice), doc.internal.pageSize.width - 14, finalY + 15, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("*Harga di atas adalah estimasi sistem dan dapat disesuaikan kembali.", 14, finalY + 30);

    // Download File
    doc.save(`Proposal_${projectData.name.replace(/\s+/g, '_')}.pdf`);
  };

  // Render bentuk tombol panjang (untuk Kalkulator)
  if (isFullButton) {
    return (
      <button 
        onClick={generatePDF}
        className="w-full mt-3 bg-blue-50 text-blue-700 hover:text-indigo-700 font-bold py-3.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition shadow-sm flex justify-center items-center gap-2 cursor-pointer"
      >
        <FileText size={20} /> Cetak Proposal PDF
      </button>
    );
  }

  // Render bentuk tombol ikon kecil (untuk Dashboard)
  return (
    <button 
      onClick={generatePDF} 
      title="Cetak PDF Proyek Ini" 
      className="text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white p-2.5 rounded-lg transition cursor-pointer"
    >
      <FileText size={18}/>
    </button>
  );
}