"use client";

import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBranding } from "../lib/branding";

type ProjectData = {
  createdAt?: Date | string | number;
  name?: string;
  webType?: string;
  complexityTier?: string;
  pages?: number;
  designTier?: string;
  cmsTier?: string;
  paymentGateway?: boolean;
  apiIntegration?: boolean;
  securityTier?: string;
  languages?: number;
  hostingTier?: string;
  totalPrice?: number;
};

export default function PrintPDF({ projectData, customerName, isFullButton = false }: { projectData: ProjectData; customerName: string; isFullButton?: boolean }) {
  const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  const generatePDF = () => {
    const doc = new jsPDF();
    // Header / branding (ambil dari pengaturan jika tersedia)
    const branding = getBranding();
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text(branding.companyName, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Email: ${branding.email}`, 14, 26);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(14, 30, doc.internal.pageSize.width - 14, 30);

    // Judul
    doc.setFontSize(20);
    doc.setTextColor(10, 25, 74);
    doc.text("Proposal Penawaran", 14, 40);

    // Metadata
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const date = projectData.createdAt
      ? new Date(projectData.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    doc.text(`Tanggal: ${date}`, 14, 48);
    doc.text(`Klien: ${customerName}`, 14, 54);
    doc.text(`Nama Proyek: ${projectData.name ?? "-"}`, 14, 60);
    // logo placeholder (teks kecil di kanan atas)
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(branding.logoPlaceholder, doc.internal.pageSize.width - 14, 18, { align: "right" });

    // Menyusun Data Tabel dari Spesifikasi (pastikan string values)
    const tableData: [string, string][] = [
      ["Tipe Website / Sistem", projectData.webType ?? "-"],
      ["Tingkat Kompleksitas", projectData.complexityTier ?? "Sederhana"],
      ["Jumlah Halaman", `${projectData.pages ?? 0} Halaman`],
      ["Desain UI/UX", projectData.designTier ?? "-"],
      ["Sistem CMS (Admin)", projectData.cmsTier ?? "-"],
      ["Payment Gateway", projectData.paymentGateway ? "Termasuk (Terintegrasi)" : "Tidak Ada"],
      ["API / Pihak Ketiga", projectData.apiIntegration ? "Termasuk (Terintegrasi)" : "Tidak Ada"],
      ["Keamanan Sistem", projectData.securityTier ?? "-"],
      ["Dukungan Bahasa", `${projectData.languages ?? 1} Bahasa`],
      ["Infrastruktur Server", projectData.hostingTier ?? "-"],
    ];

    // Render tabel
    autoTable(doc, {
      startY: 70,
      head: [["Spesifikasi & Fungsionalitas", "Keterangan"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 6 },
    });

    const lastAutoTable = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable;
    const finalY = lastAutoTable?.finalY ?? 70;

    // Total (highlighted)
    const totalLabelY = finalY + 15;
    const totalBoxWidth = 90;
    const totalBoxHeight = 18;
    const boxX = doc.internal.pageSize.width - 14 - totalBoxWidth;
    const boxY = totalLabelY - 12;
    doc.setFillColor(245, 247, 250);
    doc.rect(boxX, boxY, totalBoxWidth, totalBoxHeight, "F");
    doc.setLineWidth(0.4);
    doc.setDrawColor(220, 225, 230);
    doc.rect(boxX, boxY, totalBoxWidth, totalBoxHeight);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("Total Estimasi Biaya", boxX + 6, boxY + 7);
    doc.setFontSize(14);
    doc.setTextColor(10, 25, 74);
    doc.text(formatRupiah(projectData.totalPrice ?? 0), boxX + totalBoxWidth - 6, boxY + 13, { align: "right" });

    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text("(Harga belum termasuk pajak dan layanan pihak ketiga)", 14, boxY + totalBoxHeight + 8);

    // Terms & Conditions (bahasa lebih formal)
    const terms = `SYARAT DAN KETENTUAN (TERMS & CONDITIONS)\n\n1. Lingkup Pekerjaan\nPekerjaan pengembangan aplikasi akan dilaksanakan sesuai dengan ruang lingkup, fitur, dan spesifikasi yang tertuang dalam proposal ini. Setiap pekerjaan yang berada di luar ruang lingkup tersebut akan dianggap sebagai pekerjaan tambahan (additional work) dan akan dikenakan biaya terpisah setelah disepakati bersama.\n\n2. Jadwal Pelaksanaan\nEstimasi waktu pengerjaan mengikuti jadwal yang disepakati. Perubahan requirement, keterlambatan pemberian materi/data, atau keterlambatan persetujuan dari pihak Klien dapat memengaruhi dan mengubah jadwal penyelesaian proyek.\n\n3. Revisi dan Perubahan\nKlien berhak atas maksimal dua (2) kali revisi untuk setiap fitur atau modul yang telah disepakati, dengan ketentuan bahwa revisi tersebut tidak merubah ruang lingkup fungsionalitas utama. Perubahan konsep, penambahan fitur signifikan, atau perubahan alur bisnis setelah persetujuan awal akan diproses sebagai Change Request dan dapat memerlukan biaya serta penyesuaian jadwal.\n\n4. Ketentuan Pembayaran\nPembayaran dilakukan sesuai termin yang tercantum dalam proposal. Developer berhak menangguhkan pekerjaan apabila Klien tidak memenuhi kewajiban pembayaran sesuai jadwal yang disepakati.\n\n5. Jaminan (Warranty)\nDeveloper memberikan jaminan perbaikan (bug-fix) selama tiga puluh (30) hari kalender sejak aplikasi dinyatakan selesai dan diterima oleh Klien, untuk permasalahan yang timbul akibat kesalahan implementasi Developer dan tidak disebabkan oleh perubahan requirement atau gangguan pihak ketiga.\n\n6. Pemeliharaan dan Layanan Pihak Ketiga\nPekerjaan pemeliharaan, pengembangan tambahan, atau integrasi layanan pihak ketiga (mis. hosting, domain, payment gateway, API pihak ketiga) setelah masa garansi akan dianggap sebagai pekerjaan terpisah dan dikenakan biaya sesuai kesepakatan. Biaya layanan pihak ketiga tidak termasuk dalam penawaran ini kecuali dinyatakan secara eksplisit.`;

    // Render T&C with wrapping and paging
    let y = finalY + 40;
    const pageWidth = doc.internal.pageSize.width - 28;
    doc.setFontSize(12);
    doc.setTextColor(10, 25, 74);
    // doc.text("Terms & Conditionss", 14, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const paragraphs = terms.split("\n\n");
    paragraphs.forEach((p) => {
      const lines = doc.splitTextToSize(p, pageWidth);
      if (y + lines.length * 5 > doc.internal.pageSize.height - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, 14, y);
      y += lines.length * 5 + 6;
    });

    // Signature block (ensure space)
    // if (y + 60 > doc.internal.pageSize.height - 20) {
    //   doc.addPage();
    //   y = 40;
    // }
    // const sigY = y + 30;
    // const sigXLeft = 30;
    // const sigXRight = doc.internal.pageSize.width - 80;
    // doc.setFontSize(10);
    // doc.setTextColor(80, 80, 80);
    // doc.text("Hormat kami,", sigXLeft, sigY);
    // doc.text("Pihak Klien,", sigXRight, sigY);

    // // Lines for signatures
    // doc.setLineWidth(0.4);
    // doc.line(sigXLeft, sigY + 20, sigXLeft + 140, sigY + 20);
    // doc.line(sigXRight, sigY + 20, sigXRight + 140, sigY + 20);

    // Save PDF
    const safeName = projectData.name ? projectData.name.replace(/\s+/g, "_") : "Proposal";
    doc.save(`Proposal_${safeName}.pdf`);
  };

  // Render bentuk tombol panjang (untuk Kalkulator)
  if (isFullButton) {
    return (
      <button
        onClick={generatePDF}
        className="w-full mt-3 bg-blue-50 text-blue-700 hover:text-indigo-700 font-bold py-3.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition shadow-sm flex justify-center items-center gap-2 cursor-pointer">
        <FileText size={20} /> Cetak Proposal PDF
      </button>
    );
  }

  // Render bentuk tombol ikon kecil (untuk Dashboard)
  return (
    <button
      onClick={generatePDF}
      title="Cetak PDF Proyek Ini"
      className="text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white p-2.5 rounded-lg transition cursor-pointer">
      <FileText size={18} />
    </button>
  );
}
