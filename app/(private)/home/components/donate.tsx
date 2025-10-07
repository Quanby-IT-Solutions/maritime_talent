"use client";

import { useState } from "react";

export default function Donate() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Donate Header */}
        <div className="bg-cyan-400 rounded-full py-4 px-8 text-center shadow-lg">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">
            Donate
          </h2>
        </div>

        {/* Donation Form */}
        <div className="border-4 border-black rounded-lg p-6 sm:p-8 md:p-10 bg-white">
          <h3 className="text-lg sm:text-xl font-semibold mb-6">Donation form</h3>
          
          <div className="space-y-4 mb-8">
            {/* Name Input */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm sm:text-base font-medium min-w-[120px]">
                Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 border-2 border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-400"
                placeholder="Enter your name"
              />
            </div>

            {/* Organization Input */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm sm:text-base font-medium min-w-[120px]">
                Organization:
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="flex-1 border-2 border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-400"
                placeholder="Enter your organization"
              />
            </div>
          </div>

          {/* QR and Bank Account Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center mb-6">
            <button className="w-32 h-32 sm:w-40 sm:h-40 bg-cyan-400 hover:bg-cyan-500 text-black font-bold text-xl sm:text-2xl rounded-lg shadow-lg transition-all duration-300 hover:scale-105">
              QR
            </button>
            <button className="w-32 h-32 sm:w-40 sm:h-40 bg-cyan-400 hover:bg-cyan-500 text-black font-bold text-base sm:text-lg rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center text-center px-4">
              Bank Account Details
            </button>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center">
            <button className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold text-xs sm:text-sm px-6 py-2 rounded-full shadow-md transition-all duration-300 hover:scale-105">
              Upload screenshot of transfer
            </button>
          </div>
        </div>

        {/* Contact Us */}
        <div className="bg-cyan-400 rounded-lg py-4 px-8 text-center shadow-lg">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">
            Contact Us:
          </h3>
        </div>
      </div>
    </section>
  );
}