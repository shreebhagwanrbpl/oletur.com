import ContactClient from "@/components/ContactClient";
import { fetchContactData, fetchDistrictData } from "@/lib/data-fetcher-server";

export const revalidate = 60;

export default async function Page({ params }) {
  const { district = "jaipur" } = await params;

  const [contactData, districtData] = await Promise.all([
    fetchContactData().catch(() => null),
    fetchDistrictData(district).catch(() => null),
  ]);

  const initialContactInfo = contactData?.contactInfo || [];

  return (
    <ContactClient
      initialContactInfo={initialContactInfo}
      initialDistrictData={districtData}
    />
  );
}