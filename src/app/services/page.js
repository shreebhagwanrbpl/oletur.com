import ServicesClient from "@/components/ServicesClient";
import { fetchServicesData, fetchContactData } from "@/lib/data-fetcher-server";

export const revalidate = 60;

export default async function ServicesPage() {
  const [servicesData, contactData] = await Promise.all([
    fetchServicesData().catch(() => null),
    fetchContactData().catch(() => null),
  ]);

  const rawServices = servicesData?.services || [];
  const initialServices = Array.isArray(rawServices)
    ? rawServices
        .map((service, index) => ({
          id: service?.id || service?.uid || `service-${index}`,
          title: typeof service?.title === "string" ? service.title.trim() : "",
          desc: typeof service?.desc === "string" ? service.desc.trim() : "",
        }))
        .filter((s) => s.title && s.desc)
    : [];

  const initialContactInfo = contactData?.contactInfo || [];

  return (
    <ServicesClient
      initialServices={initialServices}
      initialContactInfo={initialContactInfo}
    />
  );
}