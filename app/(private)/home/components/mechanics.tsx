export default function Mechanics() {
  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Contestant Registration Header */}
        <div className="bg-cyan-400 rounded-full py-4 px-8 text-center shadow-lg">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">
            Contestant Registration
          </h2>
        </div>

        {/* Mechanics Card */}
        <div className="bg-blue-600 rounded-3xl p-12 sm:p-16 md:p-20 lg:p-24 flex items-center justify-center min-h-[250px] sm:min-h-[300px] md:min-h-[350px] shadow-lg">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">
            MECHANICS
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-between items-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg md:text-xl px-8 py-3 sm:px-10 sm:py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
            Download
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg md:text-xl px-12 py-3 sm:px-16 sm:py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
            Proceed
          </button>
        </div>
      </div>
    </section>
  );
}