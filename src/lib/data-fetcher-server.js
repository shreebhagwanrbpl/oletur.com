import "server-only";

import { COMPANY_ID, WEBSITE_ID, makeSlug, isVisibleForWebsite } from "./catalog-utils";
import { adminFetch, fetchCatalogFromAdmin } from "./admin-api";

const unwrap = (response) => response?.data ?? response?.pages ?? response ?? null;

export function normalizeProduct(product = {}, index = 0) {
  const title = product.title || product.name || product.productName || product.itemName || "Biomedical Equipment";
  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : product.image ? [product.image]
    : product.imageUrl ? [product.imageUrl]
    : product.imgUrl ? [product.imgUrl]
    : [];
  const id = product.id || product.uid || product.productId || `${makeSlug(title) || "product"}-${index}`;
  const slug = product.slug || makeSlug(title);

  return {
    ...product,
    id,
    uid: product.uid || id,
    productId: product.productId || id,
    title,
    name: title,
    slug,
    description: product.description ?? product.desc ?? "",
    desc: product.desc ?? product.description ?? "",
    category: product.category || "Diagnostic & Laboratory Equipment",
    categoryId: product.categoryId || product.categoryID || makeSlug(product.category || "diagnostic"),
    subCategory: product.subCategory || product.subcategory || product.category || "General",
    subcategoryId: product.subcategoryId || product.subCategoryId || makeSlug(product.subCategory || product.subcategory || product.category || "general"),
    companyId: product.companyId || COMPANY_ID,
    images,
    image: images[0] || product.image || "",
    video: product.video || "",
    pdf: product.pdf || "",
    brand: product.brand || "",
    model: product.model || "",
    capacity: product.capacity || "",
    throughput: product.throughput || "",
    instrument: product.instrument || "",
    usage: product.usage || "",
    parameters: product.parameters || "",
    automation: product.automation || "",
    availability: product.availability || "",
    size: product.size || "",
    isPublished: product.isPublished !== false,
  };
}

export async function fetchDocCached(path) {
  const parts = String(path || "").split("/").filter(Boolean);
  if (parts[0] === "__website__" && parts[1] === "districts") {
    return unwrap(await adminFetch("/api/site-data", {}, { type: "district", pageType: "district", district: parts[2] }));
  }
  if (parts[0] === "__website__") {
    const pageType = parts[1] || "";
    if (pageType) return unwrap(await adminFetch("/api/site-data", {}, { type: pageType, pageType }));
  }
  if (parts[0] === "websites" && parts[2] === "pages" && parts[3]) {
    return unwrap(await adminFetch("/api/site-data", {}, { type: parts[3], pageType: parts[3] }));
  }
  if (parts[0] === "websites" && parts[2] === "districts" && parts[3]) {
    return unwrap(await adminFetch("/api/site-data", {}, { type: "district", pageType: "district", district: parts[3] }));
  }
  return null;
}

export async function fetchWebsitePage(pageType) {
  return unwrap(await adminFetch("/api/site-data", {}, { type: pageType, pageType }));
}

export const fetchHomeData = () => fetchWebsitePage("home");
export const fetchContactData = () => fetchWebsitePage("contact");
export const fetchServicesData = () => fetchWebsitePage("services");

export async function fetchDistrictData(district) {
  if (!district) return null;
  return unwrap(await adminFetch("/api/site-data", {}, { type: "district", pageType: "district", district }));
}

export async function fetchFullCatalog() {
  const products = await fetchCatalogFromAdmin();
  return products
    .filter((product) => isVisibleForWebsite(product, WEBSITE_ID))
    .map(normalizeProduct);
}

export async function fetchProductBySlug(slug) {
  if (!slug) return null;
  const products = await fetchFullCatalog();
  const target = String(slug).toLowerCase().trim();
  return products.find(
    (p) =>
      p.slug?.toLowerCase() === target ||
      makeSlug(p.title)?.toLowerCase() === target ||
      String(p.id)?.toLowerCase() === target
  ) || null;
}

export async function fetchActiveDistricts() {
  const response = await adminFetch("/api/site-data", {}, { type: "districts", pageType: "districts" });
  const rows = response?.data?.districts ?? response?.districts ?? response?.data ?? response;
  return Array.isArray(rows) ? rows.map((row, index) => ({
    ...row,
    id: row.id || row.slug || `dist-${index}`,
    slug: row.slug || row.id || makeSlug(row.district || row.name || `dist-${index}`),
  })) : [];
}

export const fetchAllDistricts = fetchActiveDistricts;
