import Link from "next/link";

export default function RegistrationButton() {
  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center">
          {/* Register As Guest Button */}
          <Link
            href="/registration?type=guest"
            className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl p-8 sm:p-10 md:p-12 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span className="text-base sm:text-lg md:text-xl font-bold mb-1">
              Register As Guest
            </span>
            <span className="text-xs sm:text-sm md:text-base opacity-90">
              (QR Code for easy access)
            </span>
          </Link>

          {/* Register As Contestant Button */}
          <Link
            href="/registration?type=contestant"
            className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl p-8 sm:p-10 md:p-12 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span className="text-base sm:text-lg md:text-xl font-bold mb-1">
              Register As Contestant
            </span>
            <span className="text-xs sm:text-sm md:text-base opacity-90">
              (QR Code for easy access)
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
