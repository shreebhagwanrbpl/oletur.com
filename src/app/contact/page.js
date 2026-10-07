import ContactClient from "@/components/ContactClient";
import { fetchContactData } from "@/lib/data-fetcher-server";

export const revalidate = 60;

export default async function ContactPage() {
  const contactData = await fetchContactData().catch(() => null);
  const initialContactInfo = contactData?.contactInfo || [];

  return <ContactClient initialContactInfo={initialContactInfo} />;
}