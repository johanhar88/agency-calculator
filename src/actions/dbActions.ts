"use server"; // BARIS INI WAJIB ADA DI PALING ATAS

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. FUNGSI CUSTOMER & PROJECT (Kalkulator)
// ==========================================

export async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { projects: true }
  });
}

export async function createCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const company = formData.get("company") as string;

  await prisma.customer.create({
    data: { name, company },
  });
  revalidatePath("/calculator");
}

export async function saveProject(data: any) {
  await prisma.project.create({
    data: {
      name: data.name,
      webType: data.webType,
      pages: data.pages,
      complexityTier: data.complexityTier || "Sederhana",
      designTier: data.designTier,
      cmsTier: data.cmsTier,
      paymentGateway: data.paymentGateway,
      apiIntegration: data.apiIntegration,
      securityTier: data.securityTier,
      languages: data.languages,
      hostingTier: data.hostingTier,
      totalPrice: data.totalPrice,
      customerId: data.customerId,
    }
  });
  revalidatePath("/dashboard");
}

// ==========================================
// 2. FUNGSI MASTER DATA KLIEN
// ==========================================

export async function deleteCustomer(id: string) {
  // Hapus project terkait dulu (karena ada relasi database)
  await prisma.project.deleteMany({ where: { customerId: id } });
  // Setelah proyeknya dihapus, baru hapus customernya
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/master-data");
}

// ==========================================
// 3. FUNGSI MASTER HARGA
// ==========================================

export async function getPricingConfig() {
  let config = await prisma.pricingConfig.findFirst();
  // Jika database baru dan belum ada baris harga, buat default secara otomatis
  if (!config) {
    config = await prisma.pricingConfig.create({ data: { id: 1 } });
  }
  return config;
}

export async function updatePricingConfig(data: any) {
  await prisma.pricingConfig.update({
    where: { id: 1 },
    data: {
      landingPage: Number(data.landingPage),
      companyProfile: Number(data.companyProfile),
      eCommerce: Number(data.eCommerce),
      webApp: Number(data.webApp),
      pricePerPage: Number(data.pricePerPage),
      complexityLow: Number(data.complexityLow ?? 0),
      complexityMedium: Number(data.complexityMedium ?? 3500000),
      complexityHigh: Number(data.complexityHigh ?? 7500000),
      complexityVeryHigh: Number(data.complexityVeryHigh ?? 15000000),
      designCustom: Number(data.designCustom),
      designPremium: Number(data.designPremium),
      cmsBasic: Number(data.cmsBasic),
      cmsCustom: Number(data.cmsCustom),
      paymentGateway: Number(data.paymentGateway),
      apiIntegration: Number(data.apiIntegration),
      langMultiplier: Number(data.langMultiplier),
      securityAdvanced: Number(data.securityAdvanced),
      hostingShared: Number(data.hostingShared),
      hostingVPS: Number(data.hostingVPS),
      hostingDedicated: Number(data.hostingDedicated),
    }
  });
  revalidatePath("/master-data");
  revalidatePath("/calculator");
}

// ==========================================
// 4. FUNGSI EDIT PROYEK
// ==========================================

export async function getProjectById(id: string) {
  return await prisma.project.findUnique({ where: { id } });
}

export async function updateProject(id: string, data: any) {
  await prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      webType: data.webType,
      pages: data.pages,
      complexityTier: data.complexityTier || "Sederhana",
      designTier: data.designTier,
      cmsTier: data.cmsTier,
      paymentGateway: data.paymentGateway,
      apiIntegration: data.apiIntegration,
      securityTier: data.securityTier,
      languages: data.languages,
      hostingTier: data.hostingTier,
      totalPrice: data.totalPrice,
      customerId: data.customerId,
    }
  });
  revalidatePath("/dashboard");
}