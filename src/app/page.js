import HomeClient from "@/components/HomeClient";
import {
  fetchHomeData,
  fetchContactData,
  fetchServicesData,
  fetchFullCatalog,
} from "@/lib/data-fetcher-server";

export const revalidate = 60;

export default async function Home({ city }) {
  // Fetch all initial data in parallel on the server
  const [homeData, contactData, servicesData, catalog] = await Promise.all([
    fetchHomeData().catch(() => null),
    fetchContactData().catch(() => null),
    fetchServicesData().catch(() => null),
    fetchFullCatalog().catch(() => []),
  ]);

  const initialContactInfo = contactData?.contactInfo || [];

  const rawServices = servicesData?.services || [];
  const initialServices = Array.isArray(rawServices)
    ? rawServices
        .map((service, index) => ({
          id: service?.id || `service-${index}`,
          title: typeof service?.title === "string" ? service.title.trim() : "",
          desc: typeof service?.desc === "string" ? service.desc.trim() : "",
        }))
        .filter((s) => s.title && s.desc)
    : [];

  const initialProducts = Array.isArray(catalog) ? catalog : [];

  return (
    <HomeClient
      city={city}
      initialHomeData={homeData}
      initialContactInfo={initialContactInfo}
      initialServices={initialServices}
      initialProducts={initialProducts}
    />
  );
}