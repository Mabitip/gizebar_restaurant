import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "ETB") {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function whatsappUrl(message?: string) {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "251968626262";
  const number = raw.replace(/\D/g, "");
  const text = encodeURIComponent(
    message ||
      "Hello Gize Bar & Restaurant! I would like to place an order."
  );
  return `https://wa.me/${number}?text=${text}`;
}

function siteBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || SITE.domain;
  return raw.replace(/\/$/, "");
}

export function orderPageUrl(qrToken?: string) {
  const base = siteBaseUrl();
  return qrToken ? `${base}/order?t=${qrToken}` : `${base}/order`;
}

/** URL encoded in table QR codes — opens the public menu page. */
export function qrMenuUrl() {
  return `${siteBaseUrl()}/menu`;
}

export function phoneTel() {
  return "tel:+251968626262";
}

export const SITE = {
  name: "Gize Bar & Restaurant",
  shortName: "Gize",
  domain: "https://gizebarandrestaurant.com",
  phone: "+251 96 862 6262",
  phoneRaw: "+251968626262",
  email: "gizebar@gmail.com",
  address: "Bole, Behind Mega Building",
  addressAm: "አድራሻ: ቦሌ ከሜጋ ህንፃ ጀርባ",
  city: "Addis Ababa",
  country: "Ethiopia",
  description:
    "Gize Bar & Restaurant is a luxury dining destination in Bole, Addis Ababa — where Ethiopian heritage meets international cuisine, craft cocktails, and refined nightlife.",
} as const;

export const ABOUT = {
  companyName: "Gize Bar and Restaurant",
  established: "2018",
  address:
    "Addis Ababa, Kirkos Sub city, Woreda 2, House No. 117, Behind Bole Printing Press.",
  motto: "Gize – Home away Home!",
  vision:
    "To be one of the top 5 bar and restaurants in Addis Ababa by 2031.",
  mission:
    "To consistently deliver quality and healthy food through a full-fledged service and fair price and assure customers’ satisfaction.",
  values: [
    {
      title: "Superior Service",
      description:
        "We are always committed to deliver quality, complete and superior service.",
    },
    {
      title: "Hospitality",
      description:
        "We are committed to provide delightful, long-lasting and memorable service to our customers. We always strive to show heartfelt love, respect, politeness and enduring care at every moment in our service delivery.",
    },
    {
      title: "Accountability",
      description:
        "We always deliver our service giving due attention to keep the safety and health of our customers with higher sense of Integrity.",
    },
    {
      title: "Ethical & Legality",
      description:
        "We always work keeping the ethical norms and moral values of the society as well as legality of our service.",
    },
    {
      title: "Art, History and Heritages",
      description:
        "Our facilities as well as service delivery systems give due emphasis to promote the Art, History and Heritages of the country and its peoples.",
    },
    {
      title: "Social Responsibility",
      description:
        "In line with meeting our vision, we also give due attention to be actively involved in several social responsibility activities.",
    },
  ],
  nameStory: {
    title: "ጊዜ ቤት",
    sections: [
      {
        heading: "ጊዜ",
        paragraphs: [
          "መጽሐፈ ሰዋሰው ወ ግስ ወ መዝገበ ቃላት ሐዲስ “ጊዜ” የሚለውን ቃል “በቁሙ የተለየ፣ የተወሰነ ሰዓት፣ ዕለት፣ ወርኅ፣ ዓመት፣ ዘመን፣ ዕድሜ ሰው እስኪሞት እስኪሻር የሚኖርበት፣ የሚያርፍበት፣ የሚሰራበት ሌትና መዓልት…” ሲል ይተረጉመዋል፡፡",
          "የአዲስ አበባ ዩኒቨርሲቲ የኢትዮጵያ ቋንቋዎች ጥናትና ምርምር ማዕከል ያሳተመው መዝገበ ቃላት በበኩሉ፣ “ከአለፈው እስካሁን ያለው ወደፊትም የሚመጣው ሰኮንድ፣ ደቂቃ፣ ሰዓት፣ ቀን፣ ሳምንት፣ ወር፣ ዓመት…” የሚል ትርጉም ይሰጠዋል ለቃሉ፡፡",
          "ጊዜ ኩነቶችን (ክስተቶችን) ለመደርደር፣ ቆይታቸውን ለማነጻጻር፣ በመካከላቸውም ያለፈውን ቆይታ ለመወሰን በተረፈም የነገሮችን እንቅስቃሴ መጠን ለመለካት የሚያገለግል ነገር እንደሆነም ድርሳናት ያትታሉ።",
        ],
      },
      {
        heading: "ቤት",
        paragraphs: [
          "አቢሲኒካ መዝገበ ቃላት ቤት የሚለውን ቃል ሲተነትነው፤ “ናሱ ግንቡ ግድግዳው በጠርብ በዕንጨት በደንጊያ በጡብ በክፍል በክፍል የሚሠራ መኖሪያ ቤት መቀመጫ በዐለም በደስታ በመከራ በኀዘን የሚኖሩበት ቤት ወይም ከቀን ሐሩር ከሌሊት ቍር የሚከለክሉበት የሚጠለሉበት” ይለዋል፡፡",
        ],
      },
      {
        heading: "ጊዜ ቤት",
        paragraphs: [
          "“ጊዜ ቤት” የሚለውን ስንሰማ ብዙዎቻችን ፈጥኖ ወደ አእምሯችን የሚመጣው የማብዣ ሰንጠረዥ ነው፡፡",
          "“ጊዜ ቤት” በተማሪነት ዘመናችን ቁጥሮችን ከለየንና መደመርና መቀነስ የተሰኙትን መደበኛ የሒሳብ ስሌቶች ካወቅን በኋላ ለሚገጥመን ማባዛት የተባለ ፈታኝ ስሌት ራሳችንን የምናለማምድበት ብልሃት ነው፡፡ ልጅ ሳለን በየደብተሮቻችን ጀርባ የማናጣው የማስያ መላ፣ ስናድግ ደግሞ አይረሴ ትዝታችን ነው - “ጊዜ ቤት”፡፡",
          "“ጊዜ ቤት” አሁን ደግሞ የእኛ ስም ነው፡፡",
          "እስከ ቅርብ ጊዜ ድረስ ስንጠራበት ከቆየነው “ጊዜ ባር እና ሬስቶራንት” የሚል ስያሜያችንን ይልቅ፣ ለግብራችንም ለልካችንም ይመጥናል ብለን በማመን ነው “ጊዜ ቤት” መጠሪያችን ይሆን ዘንድ የመረጥነው፡፡",
          "ሰው የሚያርፍበትና የሚሰራበት፣ ያለፈውን ዘመን ትዝታ በሙዚቃና ጥንታዊ ቅርሶች ዘወር ብሎ የሚቃኝበት፤ አሁኑን በሚገባ የሚያጣጥምበት፤ በሙሉ መስተንግዶና እንክብካቤ የወደፊት ጣፋጭ ትዝታውን የሚወጥንበት፣ የነገሮችን ሂደት በቅጡ ደርድሮ የሚለይበትና የሚያነጻጽርበት፣ በደስታ በመከራ በኀዘን የሚኖርበት ወይም ከቀን ሐሩር ከሌሊት ቍር የሚከለክልበት የሚጠለልበት ቤት ነው - “ጊዜ ቤት”፡፡",
          "“ጊዜ ቤት” የሆነ ጊዜ ጎራ ብለው በልተው ጠጥተው ተዝናንተው የሚወጡበት ባርና ሬስቶራንት ብቻ አይደለም - የማይጠፉበት የሰርክ ቤት እንጂ፡፡ እንደራስ ጎጆ የሚናፍቁት፣ ደጋግመው የሚጎበኙት፣ እህል ውሃው የራስ ማጀት እንዳፈራው የሚጣፍጥበት፣ መስተንግዶው እንደራስ ሳሎን ፍቅርና አክብሮት የተሞላበት፣ ለራስ የሚኮሩበት ለእንግዳ የማያፍሩበት ቤት ነው - “ጊዜ ቤት”፡፡",
          "ሲፈልጉ ማረፊያ ሲፈልጉ መዝናኛ፣ ቢስተናገዱ የሚከበሩበት፣ ቢጋብዙ የማያፍሩበት የራስ እልፍኝ፤ እናም ደግሞ እንደ ተማሪነት ዘመን በመላ እውቀት የሚቀስሙበት፣ የሚማሩበት፣ ምቹ ገበታም ጭምር ነው - “ጊዜ ቤት”፡፡",
          "በክብር ተቀብለን የምናስተናግዳቸውን እንግዶቻችንን “ደንበኞቻችን” ከማለት ይልቅ “ቤተኞቻችን” ብለን ስንጠራቸው ነው የሚገባቸውን ክብር እንደሰጠናቸው የሚሰማን፡፡",
          "“ደንበኛ ንጉሥ ነው!” አንልም እኛ፤ “ቤተኛ ንጉሥ ነው!” እንጂ፡፡",
        ],
      },
    ],
  },
} as const;

export type NavChild = {
  href: string;
  label: string;
};

export type NavLink = {
  href: string;
  label: string;
  children?: readonly NavChild[];
};

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/menu", label: "Menu" },
  { href: "/catering", label: "Catering" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
  {
    href: "/services",
    label: "Services",
    children: [
      { href: "/catering", label: "Catering Packages" },
      { href: "/testimonials", label: "Testimonials" },
    ],
  },
  { href: "/contact", label: "Contact" },
];

/** Flat list for footers / mobile sheets that do not render nested menus. */
export function flattenNavLinks(links: readonly NavLink[] = NAV_LINKS) {
  return links.flatMap((link) =>
    link.children?.length
      ? link.children.map((child) => ({ href: child.href, label: child.label }))
      : [{ href: link.href, label: link.label }]
  );
}

export const OPENING_HOURS = [
  { day: "Monday – Thursday", hours: "10:00 AM – 12:00 AM" },
  { day: "Friday – Saturday", hours: "10:00 AM – 2:00 AM" },
  { day: "Sunday", hours: "11:00 AM – 11:00 PM" },
] as const;
