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
    <header className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            &lt;ORGANIZATIONS&gt;
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">in collaboration with:</p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-cyan-400 flex items-center justify-center hover:bg-cyan-500 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <span className="text-black font-semibold text-xs sm:text-sm md:text-base">LOGO</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}