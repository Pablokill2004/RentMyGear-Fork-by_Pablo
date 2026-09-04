import { Suspense } from "react";
import { HeroCarousel } from "@/components/features/HeroCarousel";
import { CategoryButtons } from "@/components/features/CategoryButtons";
import { getRandomGear } from "@/services/inventoryService";
import { Skeleton } from "@/components/ui/skeleton";

async function FeaturedGear() {
  const items = await getRandomGear(5);
  return <HeroCarousel items={items} />;
}

function CarouselSkeleton() {
  return (
    <section className="w-full py-8">
      <div className="container mx-auto px-4">
        <Skeleton className="h-8 w-48 mx-auto mb-6" />
        <div className="flex gap-4 justify-center">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-72 h-80 rounded-lg" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="py-12 md:py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Renta Equipo Premium
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Encuentra el equipo profesional que necesitas para fotografía,
            aventuras en montaña o deportes acuáticos.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-3 text-sm">
            <span className="font-semibold text-primary">
              Tarifas desde $100 MXN por día
            </span>
            <span className="text-muted-foreground">
              Seguro de Daños opcional (Smart Insurance): 10%–20% de la tarifa
              diaria según la categoría
            </span>
          </div>
        </div>
      </section>

      {/* Featured carousel */}
      <Suspense fallback={<CarouselSkeleton />}>
        <FeaturedGear />
      </Suspense>

      {/* Category buttons */}
      <CategoryButtons />
    </div>
  );
}
