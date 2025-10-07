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
          count={115}
          gravity={0}
          friction={0.978}
          wallBounce={0.95}
          followCursor={false}
          colors={[0x2C2C54, 0x474787, 0xAAABB8, 0xECECEC]}
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

      {/* Centered Login Form with Fade-in Animation */}
      <div className={`absolute inset-0 z-20 flex items-center justify-center p-6 transition-all duration-1000 ease-out ${showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}