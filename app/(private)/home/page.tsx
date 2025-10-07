import Link from "next/link";
import Header from "./components/header";
import TitleOfEvent from "./components/titleofevent";
import SponsorTier from "./components/sponsortier";
import RegistrationButton from "./components/registrationbutton";
import Donate from "./components/donate";
import Mechanics from "./components/mechanics";

export default function LandingPage() {
  return (
    <div className="relative">
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
  );
}
