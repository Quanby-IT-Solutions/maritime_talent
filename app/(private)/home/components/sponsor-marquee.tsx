"use client";
import LogoLoop from "@/components/LogoLoop";

// Alternative with image sources
const imageLogos = [
  {
    src: "/placeholder-logo.svg",
    alt: "Company 1",
    href: "https://company1.com",
  },
  {
    src: "/placeholder-logo1.svg",
    alt: "Company 2",
    href: "https://company2.com",
  },
  {
    src: "/placeholder-logo2.svg",
    alt: "Company 3",
    href: "https://company3.com",
  },
];

export default function SponsorMarquee() {
  return (
    <div className="w-full max-w-full h-32 sm:h-40 md:h-48 relative overflow-hidden">
      <LogoLoop
        logos={imageLogos}
        speed={120}
        direction="left"
        logoHeight={48}
        gap={40}
        pauseOnHover
        scaleOnHover
        fadeOut={false}
        ariaLabel="Technology partners"
      />
    </div>
  );
}
