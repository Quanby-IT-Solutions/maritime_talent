import Link from "next/link";
import Header from "./components/header";
import TitleOfEvent from "./components/titleofevent";
import SponsorTier from "./components/sponsortier";
import RegistrationButton from "./components/registrationbutton";
import Donate from "./components/donate";
import Mechanics from "./components/mechanics";
import LiquidChrome from "@/components/LiquidChrome";
import Iridescence from "@/components/Iridescence";
import { SparklesText } from "@/components/ui/sparkles-text";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Header Section with Iridescence Background */}
      <section className="relative w-full">
        {/* Iridescence Background - Only for Header */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Iridescence
            color={[0.1, 0.3, 0.5]}
            mouseReact={false}
            amplitude={0.1}
            speed={0.7}
          />
        </div>

        {/* Header Content */}
        <div className="relative z-10">
          <Header />
        </div>
      </section>

      {/* Rest of Content with Primary Background */}
      <div className="relative w-full bg-primary">
        <TitleOfEvent />

        <SponsorTier />
        <RegistrationButton />
        <Donate />
        <Mechanics />

        {/* Floating Register Button */}
        <Link
          href="/registration"
          className="fixed bottom-6 right-6 bg-[#0e8acc] hover:bg-[#daedfc] text-white font-semibold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 animate-pulse hover:animate-none"
        >
          <SparklesText
            className="text-xs sm:text-sm text-primary-foreground"
            colors={{ first: "#FFFFFF", second: "#6b71b3" }}
          >
            Register as Participant
          </SparklesText>
        </Link>
      </div>
    </div>
  );
}
