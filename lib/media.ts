/** Central map of Cloudinary HD images with CDN delivery */

export const MEDIA = {
  brand: {
    logo: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761965/gize/brand/logo.jpg",
    logoWhite: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761964/gize/brand/logo-white.png",
    mainLogo: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761987/gize/brand/png-main-logo.png",
    originalLogo: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761986/gize/brand/gize-orginal.png",
  },
  ambiance: {
    hero: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761958/gize/ambiance/hero-patio.jpg",
    patioBrick: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761960/gize/ambiance/patio-brick.jpg",
    brandSign: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761957/gize/ambiance/brand-sign.jpg",
    patioMural: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761961/gize/ambiance/patio-mural.jpg",
  },
  food: {
    ethiopianPlatter: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761981/gize/food/ethiopian-platter.jpg",
    sizzling: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761984/gize/food/sizzling-platter.jpg",
    falafel: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761983/gize/food/falafel-wrap.jpg",
    buffetPasta: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761980/gize/food/buffet-pasta.jpg",
    buffetEthiopian: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761978/gize/food/buffet-ethiopian.jpg",
  },
  drinks: {
    cocktails: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761969/gize/drinks/cocktails-row.jpg",
    bottles: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761966/gize/drinks/bar-bottles.jpg",
    whiskey: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761971/gize/drinks/whiskey-ice.jpg",
    coffee: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761970/gize/drinks/ethiopian-coffee.jpg",
    glassware: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761967/gize/drinks/branded-glassware.jpg",
  },
  events: {
    aisle: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761973/gize/events/event-aisle.jpg",
    stage: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761975/gize/events/event-stage.jpg",
    chefs: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761972/gize/events/buffet-chefs.jpg",
    celebration: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761977/gize/events/patio-celebration.jpg",
  },
  team: {
    chefs: "https://res.cloudinary.com/dyf8tcuy6/image/upload/v1788761985/gize/team/chefs.jpg",
  },
} as const;

const FOOD_POOL = [
  MEDIA.food.ethiopianPlatter,
  MEDIA.food.sizzling,
  MEDIA.food.falafel,
  MEDIA.food.buffetPasta,
  MEDIA.food.buffetEthiopian,
];

const DRINK_POOL = [
  MEDIA.drinks.cocktails,
  MEDIA.drinks.bottles,
  MEDIA.drinks.whiskey,
  MEDIA.drinks.coffee,
  MEDIA.drinks.glassware,
];

/** Pick a food image by category slug / index */
export function foodImageFor(categorySlug: string, index = 0): string {
  switch (categorySlug) {
    case "traditional-ethiopian":
    case "breakfast":
      return index % 2 === 0 ? MEDIA.food.ethiopianPlatter : MEDIA.food.buffetEthiopian;
    case "international":
    case "lunch":
      return index % 2 === 0 ? MEDIA.food.falafel : MEDIA.food.buffetPasta;
    case "dinner":
      return index % 2 === 0 ? MEDIA.food.sizzling : MEDIA.food.buffetPasta;
    case "desserts":
      return MEDIA.food.falafel;
    default:
      return FOOD_POOL[index % FOOD_POOL.length]!;
  }
}

/** Pick a drink image by category slug */
export function drinkImageFor(categorySlug: string, index = 0): string {
  switch (categorySlug) {
    case "cocktails":
      return MEDIA.drinks.cocktails;
    case "hot-drinks":
      return MEDIA.drinks.coffee;
    case "whiskey":
      return MEDIA.drinks.whiskey;
    case "wine":
    case "beer":
    case "vodka":
    case "gin":
      return index % 2 === 0 ? MEDIA.drinks.bottles : MEDIA.drinks.glassware;
    case "soft-drinks":
      return MEDIA.drinks.glassware;
    default:
      return DRINK_POOL[index % DRINK_POOL.length]!;
  }
}

export function menuImageFor(categorySlug: string, categoryType: "food" | "drink", index = 0) {
  return categoryType === "drink"
    ? drinkImageFor(categorySlug, index)
    : foodImageFor(categorySlug, index);
}

export const GALLERY_IMAGES = [
  { title: "Gize Patio Dining", image: MEDIA.ambiance.hero, category: "ambiance" },
  { title: "Brick Terrace Seating", image: MEDIA.ambiance.patioBrick, category: "ambiance" },
  { title: "Mural Patio", image: MEDIA.ambiance.patioMural, category: "ambiance" },
  { title: "Welcome Sign", image: MEDIA.ambiance.brandSign, category: "restaurant" },
  { title: "Ethiopian Platter", image: MEDIA.food.ethiopianPlatter, category: "food" },
  { title: "Sizzling Special", image: MEDIA.food.sizzling, category: "food" },
  { title: "Falafel Wrap", image: MEDIA.food.falafel, category: "food" },
  { title: "Buffet Service", image: MEDIA.food.buffetEthiopian, category: "food" },
  { title: "Signature Cocktails", image: MEDIA.drinks.cocktails, category: "drinks" },
  { title: "Bar Selection", image: MEDIA.drinks.bottles, category: "drinks" },
  { title: "Celebration Aisle", image: MEDIA.events.aisle, category: "events" },
  { title: "Event Stage", image: MEDIA.events.stage, category: "events" },
] as const;

export const INSTAGRAM_IMAGES = [
  MEDIA.ambiance.hero,
  MEDIA.food.ethiopianPlatter,
  MEDIA.drinks.cocktails,
  MEDIA.ambiance.patioMural,
  MEDIA.events.celebration,
  MEDIA.food.sizzling,
] as const;

export const HERO_IMAGE = MEDIA.ambiance.hero;
export const OG_IMAGE = MEDIA.ambiance.hero;
