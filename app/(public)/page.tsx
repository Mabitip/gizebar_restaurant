import { HeroSection } from "@/components/home/hero";
import { StatsSection } from "@/components/home/stats";
import { AboutPreview } from "@/components/home/about-preview";
import { FeaturedMenu } from "@/components/home/featured-menu";
import { DishGrid } from "@/components/home/dish-grid";
import { WhyChooseUs } from "@/components/home/why-choose";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { EventsPreview } from "@/components/home/events-preview";
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel";
import {
  InstagramFeed,
  MapSection,
  NewsletterSection,
  ReservationCta,
} from "@/components/home/cta-sections";
import {
  getEvents,
  getGallery,
  getMenuItems,
  getTestimonials,
} from "@/lib/data";

export default async function HomePage() {
  const [featured, signature, cocktails, chefPicks, specials, gallery, events, testimonials] =
    await Promise.all([
      getMenuItems({ featured: true }),
      getMenuItems({ signature: true }),
      getMenuItems({ cocktails: true }),
      getMenuItems({ chefPick: true }),
      getMenuItems({ todaysSpecial: true }),
      getGallery(),
      getEvents(),
      getTestimonials(),
    ]);

  return (
    <>
      <HeroSection />
      <StatsSection />
      <AboutPreview />
      <FeaturedMenu items={featured} />
      <DishGrid
        eyebrow="Signature Dishes"
        title="Crafted to impress"
        description="The dishes that define our kitchen — bold, refined, and unmistakably Gize."
        items={signature}
      />
      <DishGrid
        eyebrow="Cocktails"
        title="Liquid luxury"
        description="Signature mixes and classics poured with precision."
        items={cocktails.slice(0, 4)}
        dark
      />
      <DishGrid
        eyebrow="Chef Recommendations"
        title="From our kitchen"
        description="Personal favorites selected by our executive chef."
        items={chefPicks}
      />
      <DishGrid
        eyebrow="Today's Specials"
        title="Tonight only"
        description="Limited plates and pours — ask your server for availability."
        items={specials}
        dark
      />
      <WhyChooseUs />
      <GalleryPreview items={gallery} />
      <EventsPreview events={events} />
      <TestimonialsCarousel items={testimonials} />
      <ReservationCta />
      <NewsletterSection />
      <InstagramFeed />
      <MapSection />
    </>
  );
}
