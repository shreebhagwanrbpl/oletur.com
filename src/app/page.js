"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

import {
  Microscope,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Building2,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Mail,
  Wrench,
  Award,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";

import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import ProductCard from "@/components/ProductCard";
import ContactForm from "@/components/ContactForm";
import HeroCarousel from "@/components/HeroCarousel";
import { fetchAllDynamicProducts } from "@/lib/fetchProducts";

/* =========================================================
   STATIC STATS
   ---------------------------------------------------------
   These are kept static because they are not part of the
   Services admin data.
========================================================= */

const stats = [
  {
    number: "5,000+",
    title: "Healthcare Partners",
    desc: "Hospitals & labs served nationwide",
    icon: Building2,
  },
  {
    number: "3,500+",
    title: "Products & Kits",
    desc: "Precision diagnostic instruments",
    icon: Microscope,
  },
  {
    number: "10+ Yrs",
    title: "Engineering Excellence",
    desc: "Proven biomedical leadership",
    icon: ShieldCheck,
  },
  {
    number: "99.9%",
    title: "Accuracy SLA",
    desc: "NABL & ISO certified standards",
    icon: Award,
  },
];

/* =========================================================
   STATIC WHY CHOOSE US / PILLARS
========================================================= */

const pillars = [
  {
    title: "Certified Calibration Standards",
    desc: "Every diagnostic analyzer undergoes NABL-traceable calibration to ensure precise patient diagnostics and regulatory safety.",
    icon: Award,
    badge: "ISO 13485 Certified",
  },
  {
    title: "24/7 Emergency AMC Response",
    desc: "Our nationwide team of biomedical engineers delivers rapid on-site maintenance to keep critical ICU and OT gear active.",
    icon: Zap,
    badge: "2-Hour SLA",
  },
  {
    title: "Turnkey Lab Setup & Engineering",
    desc: "From architectural workflow layout to instrument installation and staff certification, we engineer complete pathology labs.",
    icon: Building2,
    badge: "Turnkey Engineering",
  },
  {
    title: "Cold-Chain Reagent Supply",
    desc: "Strictly temperature-monitored distribution of biochemistry reagents, controls, and rapid assay kits with extended shelf life.",
    icon: FlaskConical,
    badge: "Monitored Cold Chain",
  },
];

/* =========================================================
   STATIC TESTIMONIALS
========================================================= */

const testimonials = [
  {
    quote:
      "Raj Biosis transformed our central laboratory setup. Their automated analyzers increased our daily sample throughput by 40% with zero downtime.",
    author: "Dr. Arvind Sharma",
    role: "Chief Pathologist",
    institution: "Apollo Diagnostics Center",
    rating: 5,
  },
  {
    quote:
      "The 24/7 AMC response team is outstanding. When our ICU patient monitor system faced a sensor issue, their engineer arrived within 90 minutes.",
    author: "Dr. Meenakshi Sundaram",
    role: "Medical Director",
    institution: "Metro Multispecialty Hospital",
    rating: 5,
  },
  {
    quote:
      "Their cold-chain reagent delivery has never failed us. Quality control results are consistently accurate, month after month.",
    author: "Rajesh Varma",
    role: "Laboratory Operations Manager",
    institution: "LifeCare PathLabs",
    rating: 5,
  },
];

/* =========================================================
   HOME PAGE
========================================================= */

export default function Home({ city }) {
  /* =======================================================
     DYNAMIC DATA STATES
  ======================================================= */

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [homeData, setHomeData] = useState(null);
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     PATH / LOCATION
  ======================================================= */

  const pathname = usePathname();

  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const staticRoutes = [
    "about",
    "services",
    "items",
    "contact",
  ];

  const district =
    pathParts.length > 0 &&
      !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  const locationTitle =
    city ||
    (district
      ? district.replace(/-/g, " ")
      : "");

  /* =======================================================
     LOCATION-AWARE LINKS
  ======================================================= */

  const makeLink = (path) => {
    if (!district) return path;

    if (path === "/") {
      return `/${district}`;
    }

    return `/${district}${path}`;
  };

  /* =======================================================
     FIREBASE DATA FETCH
  ======================================================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        /* =================================================
           HOME DATA
           -------------------------------------------------
           Dynamic:
           - Hero title
           - Hero description
           - Button text
           - Carousel media
        ================================================= */

        try {
          const homeSnap = await getDoc(
            doc(
              db,
              "websites",
              "oleturcom",
              "pages",
              "home"
            )
          );

          if (homeSnap.exists()) {
            setHomeData(
              homeSnap.data()
            );
          } else {
            setHomeData(null);
          }
        } catch (homeErr) {
          console.error(
            "Error fetching home data:",
            homeErr
          );

          setHomeData(null);
        }

        /* =================================================
           CONTACT DATA
           -------------------------------------------------
           Used for dynamic helpline/email.
        ================================================= */

        try {
          const contactSnap = await getDoc(
            doc(
              db,
              "websites",
              "oleturcom",
              "pages",
              "contact"
            )
          );

          if (contactSnap.exists()) {
            setContactInfo(
              contactSnap.data()
                .contactInfo || []
            );
          } else {
            setContactInfo([]);
          }
        } catch (contactErr) {
          console.error(
            "Error fetching contact data:",
            contactErr
          );

          setContactInfo([]);
        }

        /* =================================================
           SERVICES
           -------------------------------------------------
           IMPORTANT:
           Firebase ONLY.
           NO fallback services.
           NO static service data.
           
           Admin structure:
           {
             title: "...",
             desc: "..."
           }
        ================================================= */

        try {
          const serviceSnap = await getDoc(
            doc(
              db,
              "websites",
              "oleturcom",
              "pages",
              "services"
            )
          );

          if (
            serviceSnap.exists() &&
            Array.isArray(
              serviceSnap.data().services
            )
          ) {
            const dynamicServices =
              serviceSnap
                .data()
                .services
                .map((service, index) => ({
                  id:
                    service?.id ||
                    `service-${index}`,
                  title:
                    typeof service?.title ===
                      "string"
                      ? service.title.trim()
                      : "",
                  desc:
                    typeof service?.desc ===
                      "string"
                      ? service.desc.trim()
                      : "",
                }))
                .filter(
                  (service) =>
                    service.title &&
                    service.desc
                );

            setServices(
              dynamicServices
            );
          } else {
            /* No Firebase services */
            setServices([]);
          }
        } catch (srvErr) {
          console.error(
            "Error fetching services:",
            srvErr
          );

          /* Error = no services */
          setServices([]);
        }

        /* =================================================
           PRODUCTS
           -------------------------------------------------
           Dynamic products only.
        ================================================= */

        try {
          const fetchedProducts =
            await fetchAllDynamicProducts();

          if (
            Array.isArray(fetchedProducts)
          ) {
            setProducts(
              fetchedProducts
            );
          } else {
            setProducts([]);
          }
        } catch (productErr) {
          console.error(
            "Error fetching products:",
            productErr
          );

          setProducts([]);
        }
      } catch (err) {
        console.error(
          "Error loading home data:",
          err
        );

        setServices([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =======================================================
     FEATURED PRODUCTS
  ======================================================= */

  const displayProducts =
    products.slice(0, 3);

  /* =======================================================
     SERVICE ICONS
     -------------------------------------------------------
     Icons are UI-only.
     Service title/description remain dynamic.
  ======================================================= */

  const serviceIcons = [
    <Microscope
      size={28}
      key="service-icon-1"
    />,
    <Building2
      size={28}
      key="service-icon-2"
    />,
    <Wrench
      size={28}
      key="service-icon-3"
    />,
    <FlaskConical
      size={28}
      key="service-icon-4"
    />,
    <Stethoscope
      size={28}
      key="service-icon-5"
    />,
    <Award
      size={28}
      key="service-icon-6"
    />,
  ];

  /* =======================================================
     DYNAMIC HELPLINE PHONE
  ======================================================= */

  const helplinePhone = (() => {
    const item =
      contactInfo.find(
        (c) =>
          c?.label
            ?.toLowerCase()
            .includes("phone") ||
          c?.label
            ?.toLowerCase()
            .includes("mobile") ||
          c?.label
            ?.toLowerCase()
            .includes("helpline") ||
          c?.label
            ?.toLowerCase()
            .includes("contact")
      );

    if (!item) return "";

    if (Array.isArray(item.value)) {
      return item.value[0] || "";
    }

    return typeof item.value ===
      "string"
      ? item.value.trim()
      : "";
  })();

  /* =======================================================
     DYNAMIC EMAIL
  ======================================================= */

  const supportEmail = (() => {
    const item =
      contactInfo.find(
        (c) =>
          c?.label
            ?.toLowerCase()
            .includes("email") ||
          c?.label
            ?.toLowerCase()
            .includes("mail")
      );

    if (!item) return "";

    if (Array.isArray(item.value)) {
      return item.value[0] || "";
    }

    return typeof item.value ===
      "string"
      ? item.value.trim()
      : "";
  })();

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="bg-[#f8fafc] text-slate-900">

      {/* =================================================
          HERO CAROUSEL
      ================================================= */}

      <HeroCarousel
        homeData={homeData}
        locationTitle={locationTitle}
        makeLink={makeLink}
        loading={loading}
      />

      {/* =================================================
          STATS TICKER
      ================================================= */}

      <section className="border-y border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-10 text-white shadow-inner">
        <div className="container-custom">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map(
              (item, idx) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/20 text-sky-400 shadow-inner">
                      <Icon size={26} />
                    </div>

                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                        {item.number}
                      </h3>

                      <p className="text-xs font-bold text-sky-200 sm:text-sm">
                        {item.title}
                      </p>

                      <p className="hidden text-[11px] text-slate-400 sm:block">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          WHY CHOOSE US
      ================================================= */}

      <section className="section-padding bg-gradient-to-b from-white via-slate-50 to-sky-50/40">
        <div className="container-custom">

          <SectionTitle
            badge="Why Modern Labs Choose Us"
            title="Clearer Paths to Better Diagnostics"
            description="Open, spacious design language for fast product scanning and service discovery."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map(
              (pillar, index) => {
                const Icon =
                  pillar.icon;

                return (
                  <div
                    key={index}
                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10"
                  >
                    <div>

                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-[#0284c7] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0284c7] group-hover:text-white">
                        <Icon size={28} />
                      </div>

                      <span className="mb-3 inline-block rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                        {pillar.badge}
                      </span>

                      <h3 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-[#0284c7]">
                        {pillar.title}
                      </h3>

                      <p className="text-sm leading-relaxed text-slate-600">
                        {pillar.desc}
                      </p>
                    </div>

                    <div className="mt-8 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold text-[#0284c7]">
                      <span>
                        Learn standard
                      </span>

                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          FEATURED PRODUCTS
      ================================================= */}

      <section className="section-padding border-y border-slate-200/80 bg-white">
        <div className="container-custom">

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

            <SectionTitle
              badge="Diagnostic Inventory"
              title="Equipment Worth Exploring"
              description="Explore our curated catalog of automated clinical analyzers, PCR units, ICU patient monitors, and laboratory centrifuges."
            />

            <Link
              href={makeLink(
                "/items"
              )}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-6 py-3.5 text-sm font-bold text-[#0284c7] shadow-sm transition-all hover:border-[#0284c7] hover:bg-[#0284c7] hover:text-white"
            >
              <span>
                View All Products
              </span>

              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Product Grid */}

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {loading ? (
              <>
                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-[400px] animate-pulse rounded-3xl bg-slate-100"
                    />
                  )
                )}
              </>
            ) : displayProducts.length >
              0 ? (
              displayProducts.map(
                (prod) => (
                  <ProductCard
                    key={
                      prod.id ||
                      prod.slug
                    }
                    product={prod}
                    makeLink={
                      makeLink
                    }
                  />
                )
              )
            ) : (
              <div className="col-span-full flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                    <Microscope
                      size={26}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-slate-800">
                    No Products Available
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Products will appear
                    here when they are
                    added from the admin
                    panel.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* =================================================
          SERVICES MATRIX
          -------------------------------------------------
          IMPORTANT:
          This section is COMPLETELY DYNAMIC.

          Firebase:
          websites/oleturcom/pages/services

          Only:
          title
          desc

          No fallback data.
      ================================================= */}

      <section className="section-padding bg-gradient-to-b from-sky-50/40 via-white to-slate-50">
        <div className="container-custom">

          <SectionTitle
            badge="Healthcare Solutions"
            title="Support Built Around Your Workflow"
            description="Discover the services and technical solutions configured for your healthcare operations."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {loading ? (
              <>
                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-[280px] animate-pulse rounded-3xl bg-white shadow-sm"
                    />
                  )
                )}
              </>
            ) : services.length >
              0 ? (
              services.map(
                (srv, idx) => (
                  <ServiceCard
                    key={
                      srv.id ||
                      `service-${idx}`
                    }
                    icon={
                      serviceIcons[
                      idx %
                      serviceIcons.length
                      ]
                    }
                    title={
                      srv.title
                    }
                    description={
                      srv.desc
                    }
                    makeLink={
                      makeLink
                    }
                  />
                )
              )
            ) : (
              <div className="col-span-full flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <div>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#0284c7]">
                    <Wrench
                      size={26}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    No Services Available
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    Services will appear
                    here when they are
                    added from the admin
                    panel.
                  </p>

                  <Link
                    href={makeLink(
                      "/contact"
                    )}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0284c7] px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[#0369a1]"
                  >
                    Contact Our Team
                    <ArrowRight
                      size={16}
                    />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* =================================================
          ISO & QUALITY CERTIFICATION
          -------------------------------------------------
          Static marketing section kept unchanged.
      ================================================= */}

      <section className="relative overflow-hidden bg-slate-900 text-white section-padding">
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="container-custom relative z-10">

          <div className="grid items-center gap-12 lg:grid-cols-12">

            <div className="lg:col-span-7">

              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
                <Award size={16} />
                Quality Assurance &
                Compliance
              </span>

              <h2 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                Uncompromised Clinical
                Accuracy & Regulatory
                Standards
              </h2>

              <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                Raj Biosis strictly adheres
                to international quality
                protocols. Every equipment
                installation comes with
                complete IQ/OQ/PQ validation
                documentation and certified
                calibration reports.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 backdrop-blur-sm">
                  <h4 className="flex items-center gap-2 text-lg font-bold text-white">
                    <ShieldCheck
                      size={20}
                      className="text-sky-400"
                    />
                    ISO 13485 & CE
                    Compliance
                  </h4>

                  <p className="mt-2 text-xs text-slate-300">
                    Certified medical device
                    quality management system
                    for diagnostic analyzers.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 backdrop-blur-sm">
                  <h4 className="flex items-center gap-2 text-lg font-bold text-white">
                    <Clock
                      size={20}
                      className="text-sky-400"
                    />
                    2-Hour SLA Maintenance
                  </h4>

                  <p className="mt-2 text-xs text-slate-300">
                    Dedicated engineer dispatch
                    team ready for emergency
                    hospital repairs.
                  </p>
                </div>

              </div>
            </div>

            <div className="lg:col-span-5">

              <div className="rounded-3xl border border-slate-700 bg-slate-800/80 p-8 text-center shadow-2xl backdrop-blur-md">

                <div className="mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-sky-300/40 bg-gradient-to-br from-sky-400 via-[#0284c7] to-sky-700 p-2 text-white shadow-2xl shadow-sky-600/50 sm:h-28 sm:w-28">

                  <span className="text-3xl font-black leading-none tracking-tight text-white sm:text-4xl">
                    100%
                  </span>

                  <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-sky-100 sm:text-[11px]">
                    Certified
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white">
                  Compliance Guarantee
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  All instruments tested with
                  traceable reference standards
                  before dispatch to your
                  medical facility.
                </p>

                <Link
                  href={makeLink(
                    "/contact"
                  )}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-[#0284c7] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-600/40 transition-all hover:-translate-y-0.5 hover:bg-[#0369a1] hover:shadow-2xl"
                >
                  <span>
                    Request Inspection
                    Certificate
                  </span>

                  <ArrowRight
                    size={16}
                  />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =================================================
          TESTIMONIALS
          -------------------------------------------------
          Static section kept unchanged.
      ================================================= */}

      <section className="section-padding bg-gradient-to-b from-white via-slate-50 to-sky-50/40">
        <div className="container-custom">

          <SectionTitle
            badge="What Our Partners Say"
            title="Chosen by Diagnostic Teams"
            description="Read how healthcare professionals rely on Raj Biosis for accurate diagnostics and uninterrupted equipment uptime."
            center
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-3">

            {testimonials.map(
              (t, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
                >
                  <div>

                    <div className="mb-4 flex gap-1 text-[#0284c7]">
                      {Array.from({
                        length:
                          t.rating,
                      }).map(
                        (_, i) => (
                          <span
                            key={i}
                          >
                            ★
                          </span>
                        )
                      )}
                    </div>

                    <p className="text-sm italic leading-relaxed text-slate-600 sm:text-base">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-lg font-bold text-[#0284c7]">
                      {t.author.charAt(
                        4
                      ) || "D"}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {t.author}
                      </h4>

                      <p className="text-xs text-slate-500">
                        {t.role} —{" "}
                        <span className="font-medium text-[#0284c7]">
                          {
                            t.institution
                          }
                        </span>
                      </p>
                    </div>

                  </div>
                </div>
              )
            )}

          </div>
        </div>
      </section>

      {/* =================================================
          QUICK INQUIRY
      ================================================= */}

      <section className="section-padding border-t border-slate-200/80 bg-gradient-to-br from-sky-50/60 via-white to-slate-50">
        <div className="container-custom">

          <div className="grid items-center gap-12 lg:grid-cols-12">

            <div className="lg:col-span-5">

              <SectionTitle
                badge="Direct Consultation"
                title="Planning a Purchase or Need Technical Guidance?"
                description="Our biomedical engineering consultants will analyze your laboratory requirements, recommend optimal instruments, and provide a customized quote."
              />

              <div className="mt-8 space-y-4">

                {helplinePhone && (
                  <a
                    href={`tel:${String(
                      helplinePhone
                    ).replace(
                      /\s+/g,
                      ""
                    )}`}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-[#0284c7]/40"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-[#0284c7]">
                      <PhoneCall
                        size={22}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-500">
                        Direct Helpline
                      </p>

                      <p className="text-base font-bold text-slate-900">
                        {helplinePhone}
                      </p>
                    </div>
                  </a>
                )}

                {supportEmail && (
                  <a
                    href={`mailto:${supportEmail}`}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-[#0284c7]/40"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-[#0284c7]">
                      <Mail size={22} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-500">
                        Official Email
                      </p>

                      <p className="break-all text-base font-bold text-slate-900">
                        {supportEmail}
                      </p>
                    </div>
                  </a>
                )}

              </div>
            </div>

            <div className="lg:col-span-7">

              <ContactForm
                title="Request a Tailored Equipment Plan"
                subtitle="Fill out the form below and our equipment specialist will reach out within 2 hours."
              />

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}