import SponsorMarquee from "./sponsor-marquee";

export default function Header() {
  const organizations = [
    { id: 1, name: "Organization 1" },
    { id: 2, name: "Organization 2" },
    { id: 3, name: "Organization 3" },
    { id: 4, name: "Organization 4" },
    { id: 5, name: "Organization 5" },
    { id: 6, name: "Organization 6" },
  ];

  return (
    <header className="w-full py-8 sm:py-12 lg:py-16">
      {/* Title Section - Constrained */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">
            ORGANIZATIONS
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-primary-foreground">
            in collaboration with:
          </p>
        </div>
      </div>

      {/* Marquee Section - Full Width */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <SponsorMarquee />
      </div>
    </header>
  );
}
