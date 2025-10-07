import Link from "next/link";
import Header from "./components/header";
import TitleOfEvent from "./components/titleofevent";
import SponsorTier from "./components/sponsortier";
import RegistrationButton from "./components/registrationbutton";
import Donate from "./components/donate";
import Mechanics from "./components/mechanics";
import LiquidChrome from "@/components/LiquidChrome";

export default function LandingPage() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background LiquidChrome */}
      <div className="fixed inset-0 w-full h-full z-0">
        <LiquidChrome
          baseColor={[0.1, 0.3, 0.4]}
          speed={0.5}
          amplitude={0.4}
          frequencyX={2}
          frequencyY={1.5}
          interactive={true}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 w-full">
        <Header />
        <TitleOfEvent />
        <SponsorTier />
        <RegistrationButton />
        <Donate />
        <Mechanics />

        {/* Floating Register Button */}
        <Link
          href="/registration"
          className="fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 animate-pulse hover:animate-none"
        >
          <span className="text-xs sm:text-sm">Register as Participant</span>
        </Link>
      </div>
    </div>
  );
}
