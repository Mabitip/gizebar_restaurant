/** Central map of local HD images from /public/images */

export const MEDIA = {
  brand: {
    logo: "/images/brand/logo.png",
    logoWhite: "/images/brand/logo-white.png",
  },
  ambiance: {
    hero: "/images/ambiance/hero-patio.jpg",
    patioBrick: "/images/ambiance/patio-brick.jpg",
    brandSign: "/images/ambiance/brand-sign.jpg",
    patioMural: "/images/ambiance/patio-mural.jpg",
  },
  food: {
    ethiopianPlatter: "/images/food/ethiopian-platter.jpg",
    sizzling: "/images/food/sizzling-platter.jpg",
    falafel: "/images/food/falafel-wrap.jpg",
    buffetPasta: "/images/food/buffet-pasta.jpg",
    buffetEthiopian: "/images/food/buffet-ethiopian.jpg",
  },
  drinks: {
    cocktails: "/images/drinks/cocktails-row.jpg",
    bottles: "/images/drinks/bar-bottles.jpg",
    whiskey: "/images/drinks/whiskey-ice.jpg",
    coffee: "/images/drinks/ethiopian-coffee.jpg",
    glassware: "/images/drinks/branded-glassware.jpg",
  },
  events: {
    aisle: "/images/events/event-aisle.jpg",
    stage: "/images/events/event-stage.jpg",
    chefs: "/images/events/buffet-chefs.jpg",
    celebration: "/images/events/patio-celebration.jpg",
  },
  team: {
    chefs: "/images/team/chefs.jpg",
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
