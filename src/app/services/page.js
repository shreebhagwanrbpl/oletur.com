"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import {
  Microscope,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Wrench,
  Activity,
  Award,
  Zap,
  CheckCircle2,
  PhoneCall,
  FileCheck,
  Cpu,
} from "lucide-react";

const workflowSteps = [
  {
    step: "01",
    title: "Diagnostic Audit & Consultation",
    desc: "We analyze your hospital sample load, space constraints, and technical requirements to select the exact analyzer configuration.",
    icon: FileCheck,
  },
  {
    step: "02",
    title: "Precision Solution Engineering",
    desc: "Custom lab layout designs, power backup specifications, and reagent supply schedule formulation.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Installation & NABL Calibration",
    desc: "Certified engineers perform physical installation, IQ/OQ/PQ protocols, and NABL-traceable reference calibration.",
    icon: Award,
  },
  {
    step: "04",
    title: "24/7 SLA Field Maintenance",
    desc: "Round-the-clock technical emergency support, scheduled preventive maintenance visits, and automated reagent restocking.",
    icon: Zap,
  },
];

export default function ServicesPage() {
  // ONLY FIREBASE/ADMIN SERVICES
  const [services, setServices] = useState([]);

  // Contact information remains dynamic from admin
  const [contactInfo, setContactInfo] = useState([]);

  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  const pathParts = pathname.split("/").filter(Boolean);

  const staticRoutes = [
    "about",
    "services",
    "products",
    "contact",
    "items",
  ];

  const district =
    pathParts.length > 0 && !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  const makeLink = (path) => {
    if (!district) return path;

    if (path === "/") {
      return `/${district}`;
    }

    return `/${district}${path}`;
  };

  // Service icons remain static.
  // Title + Description come only from Firebase.
  const icons = [
    <Microscope size={28} key={1} />,
    <FlaskConical size={28} key={2} />,
    <ShieldCheck size={28} key={3} />,
    <Stethoscope size={28} key={4} />,
    <Wrench size={28} key={5} />,
    <Activity size={28} key={6} />,
  ];

  useEffect(() => {
    const fetchServicesAndContact = async () => {
      try {
        const [servicesSnap, contactSnap] = await Promise.all([
          getDoc(
            doc(
              db,
              "websites",
              "oleturcom",
              "pages",
              "services"
            )
          ),

          getDoc(
            doc(
              db,
              "websites",
              "oleturcom",
              "pages",
              "contact"
            )
          ),
        ]);

        /* =========================================================
           SERVICES
           ONLY ADMIN/FIREBASE DATA
           NO FALLBACK DATA
        ========================================================== */

        if (servicesSnap.exists()) {
          const rawServices =
            servicesSnap.data()?.services || [];

          const dbServices = rawServices
            .map((service, index) => ({
              id:
                service?.id ||
                service?.uid ||
                `service-${index}`,

              title:
                typeof service?.title === "string"
                  ? service.title.trim()
                  : "",

              desc:
                typeof service?.desc === "string"
                  ? service.desc.trim()
                  : "",
            }))
            // Admin saves only services having both title and description
            .filter(
              (service) =>
                service.title &&
                service.desc
            );

          setServices(dbServices);
        } else {
          setServices([]);
        }

        /* =========================================================
           CONTACT
           ADMIN/FIREBASE DATA
        ========================================================== */

        if (contactSnap.exists()) {
          setContactInfo(
            contactSnap.data()?.contactInfo || []
          );
        } else {
          setContactInfo([]);
        }
      } catch (error) {
        console.error(
          "Error loading services/contact data:",
          error
        );

        // IMPORTANT:
        // On error, don't use fallback services.
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServicesAndContact();
  }, []);

  /* =========================================================
     DYNAMIC EMERGENCY PHONE FROM ADMIN CONTACT DATA
  ========================================================== */

  const emergencyPhone = (() => {
    const item = contactInfo.find((contact) => {
      const label = (
        contact?.label || ""
      ).toLowerCase();

      return (
        label.includes("phone") ||
        label.includes("mobile") ||
        label.includes("helpline") ||
        label.includes("emergency") ||
        label.includes("tel") ||
        label.includes("contact")
      );
    });

    if (!item) {
      return "";
    }

    if (Array.isArray(item.value)) {
      return item.value[0] || "";
    }

    return typeof item.value === "string"
      ? item.value.trim()
      : "";
  })();

  return (
    <div className="bg-[#f8fafc] text-slate-900">

      {/* =========================================================
          BANNER
          STATIC - AS REQUESTED
      ========================================================== */}

      <PageBanner
        badge="Technical Services"
        title="Biomedical Support From Setup to Service"
        subtitle="NABL-certified calibration, 2-hour emergency repair SLAs, cold-chain reagent distribution, and turnkey pathology setup."
      />

      {/* =========================================================
          SERVICES SECTION
          SERVICE DATA = DYNAMIC FROM ADMIN
      ========================================================== */}

      <section className="section-padding bg-gradient-to-b from-white via-slate-50 to-sky-50/40">
        <div className="container-custom">

          <SectionTitle
            badge="Full Service Catalog"
            title="Designed Around Reliable Operations"
            description="Explore our specialized services designed to keep clinical laboratories and hospital departments operating at peak accuracy."
            center
          />

          {/* =====================================================
              LOADING
          ====================================================== */}

          {loading ? (
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>

          ) : services.length > 0 ? (

            /* ===================================================
               DYNAMIC SERVICES
               ONLY TITLE + DESCRIPTION FROM ADMIN
            ==================================================== */

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

              {services.map((service, index) => (
                <ServiceCard
                  key={
                    service.id ||
                    `service-${index}`
                  }

                  icon={
                    icons[
                    index % icons.length
                    ]
                  }

                  title={service.title}

                  description={
                    service.desc
                  }

                  makeLink={makeLink}
                />
              ))}

            </div>

          ) : (

            /* ===================================================
               NO FALLBACK
            ==================================================== */

            <div className="mt-16 flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">

              <div>

                <h3 className="text-2xl font-bold text-slate-900">
                  No Services Available
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Our service catalog is currently being updated.
                </p>

                <Link
                  href={makeLink("/contact")}
                  className="mt-5 inline-flex items-center rounded-2xl bg-[#0284c7] px-6 py-3 text-sm font-bold !text-white transition-all hover:bg-[#0369a1]"
                >
                  Contact Our Team
                </Link>

              </div>

            </div>
          )}

        </div>
      </section>

      {/* =========================================================
          WORKFLOW PROCESS
          STATIC - KEEP AS IT IS
      ========================================================== */}

      <section className="section-padding bg-white border-y border-slate-200/80">
        <div className="container-custom">

          <SectionTitle
            badge="Execution Framework"
            title="Our 4-Step Engineering Workflow"
            description="A systematic process ensuring seamless integration, rapid compliance, and long-term instrument reliability."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {workflowSteps.map(
              (step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={index}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10"
                  >

                    <div>

                      <div className="flex items-center justify-between">

                        <span className="text-4xl font-black text-sky-200 group-hover:text-[#0284c7] transition-colors">
                          {step.step}
                        </span>

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0284c7] shadow-sm border border-slate-100">
                          <Icon size={24} />
                        </div>

                      </div>

                      <h3 className="mt-6 text-xl font-bold text-slate-900 group-hover:text-[#0284c7] transition-colors">
                        {step.title}
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {step.desc}
                      </p>

                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <span className="text-xs font-bold text-sky-700">
                        Phase {index + 1} Milestone
                      </span>
                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>
      </section>

      {/* =========================================================
          BREAKDOWN SLA
          STATIC CONTENT + DYNAMIC PHONE
      ========================================================== */}

      <section className="section-padding bg-gradient-to-b from-sky-50/40 via-white to-slate-50">

        <div className="container-custom">

          <div className="rounded-3xl border border-slate-700 bg-gradient-to-r from-slate-950 to-slate-900 p-8 sm:p-12 text-white shadow-2xl">

            <div className="grid lg:grid-cols-12 gap-8 items-center">

              <div className="lg:col-span-8">

                <span className="inline-flex items-center gap-2 rounded-full bg-[#0284c7] px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-md">
                  <Zap size={14} />
                  Emergency Breakdown Helpline
                </span>

                <h3 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                  Facing an Equipment Emergency in ICU or Lab?
                </h3>

                <p className="mt-3 text-base text-slate-300 leading-relaxed">
                  Our certified field engineers are equipped with OEM diagnostic kits and genuine spare parts for instant on-site restoration.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-6 text-sm font-semibold text-white">

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-sky-400"
                    />
                    <span>
                      2-Hour On-Site SLA
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-sky-400"
                    />
                    <span>
                      Loaner Analyzer Option
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-sky-400"
                    />
                    <span>
                      NABL Re-calibration Included
                    </span>
                  </div>

                </div>

              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center text-center border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-8">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Emergency Dispatch
                </p>

                {/* PHONE = DYNAMIC FROM ADMIN */}

                {emergencyPhone ? (

                  <a
                    href={`tel:${emergencyPhone.replace(
                      /\s+/g,
                      ""
                    )}`}
                    className="mt-2 text-2xl font-black text-white hover:text-sky-400 transition-colors inline-block"
                  >
                    {emergencyPhone}
                  </a>

                ) : (

                  <p className="mt-2 text-sm text-slate-300">
                    24/7 Field Dispatch Active
                  </p>

                )}

                <Link
                  href={makeLink("/contact")}
                  className="mt-5 w-full rounded-2xl bg-[#0284c7] py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-sky-600/30 transition-all hover:bg-[#0369a1]"
                >
                  Book Priority Repair
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}