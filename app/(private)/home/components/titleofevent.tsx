export default function TitleOfEvent() {
  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
          Title Of the Event
        </h1>

        {/* Event Poster/Banner Card */}
        <div className="bg-cyan-400 rounded-3xl p-8 sm:p-12 md:p-16 lg:p-20 mb-6 sm:mb-8 flex items-center justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px] shadow-lg">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black">
            Event Poster/Banner
          </p>
        </div>

        {/* Program Card */}
        <div className="bg-cyan-400 rounded-3xl p-8 sm:p-12 md:p-16 lg:p-20 flex items-center justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px] shadow-lg">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black">
            Program
          </p>
        </div>
      </div>
    </section>
  );
}