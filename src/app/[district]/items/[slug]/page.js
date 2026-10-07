import ProductDetails from "../../../items/[slug]/ProductDetails";
import { fetchProductBySlug, fetchContactData } from "@/lib/data-fetcher-server";

export const revalidate = 60;

export default async function Page({ params }) {
    const { slug, district } = await params;

    const [product, contactData] = await Promise.all([
        fetchProductBySlug(slug).catch(() => null),
        fetchContactData().catch(() => null),
    ]);

    return (
        <ProductDetails
            slug={slug}
            district={district}
            initialProduct={product}
            initialContactInfo={contactData?.contactInfo || []}
        />
    );
}