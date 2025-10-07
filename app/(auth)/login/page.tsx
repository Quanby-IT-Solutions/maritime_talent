"use client"

import { LoginForm } from "@/components/login-form"
import Ballpit from "@/components/Ballpit"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Show the form after 2 seconds to let the balls drop
    const timer = setTimeout(() => {
      setShowForm(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ballpit Background */}
      <div className="absolute inset-0" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', width: '100%' }}>
        <Ballpit
          count={100}
          gravity={0}
          friction={0.978}
          wallBounce={0.95}
          followCursor={false}
          colors={[0x2c3e50, 0x34495e, 0x2c2c54, 0x40407a, 0x706fd3, 0x5f27cd, 0x341f97]}
          ambientColor={0xffffff}
          ambientIntensity={0.8}
          lightIntensity={100}
          materialParams={{
            metalness: 0.6,
            roughness: 0.2,
            clearcoat: 1,
            clearcoatRoughness: 0.1
          }}
          minSize={0.3}
          maxSize={1.2}
          size0={1.5}
          maxVelocity={0.2}
          maxX={8}
          maxY={8}
          maxZ={4}
        />
      </div>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Centered Login Form with Fade-in Animation - Floating on top */}
      <div className={`absolute inset-0 z-20 flex items-center justify-center p-6 transition-all duration-1000 ease-out ${showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg border-2 border-slate-300">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-800">
                Maritime
                <span className="block text-slate-600 font-light text-2xl">
                  Talent System
                </span>
              </h1>
              <p className="text-slate-500 text-base font-light">
                Navigate your career with confidence
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl p-8">
            <LoginForm />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {"Don't have an account? "}
            <a href="/registration" className="text-slate-700 hover:text-slate-900 font-medium transition-colors underline decoration-slate-300 hover:decoration-slate-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}