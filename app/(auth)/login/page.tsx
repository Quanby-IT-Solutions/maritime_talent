"use client"

import { LoginForm } from "@/components/login-form"
import Ballpit from "@/components/Ballpit"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Show the form after a short delay for smooth animation
    const timer = setTimeout(() => {
      setShowForm(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8 lg:p-12 shadow-lg border-r border-slate-200">
        <div className={`w-full max-w-md transition-all duration-1000 ease-out ${showForm ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
          <LoginForm />
        </div>
      </div>

      {/* Right Side - Ballpit Animation */}
      <div className="flex-1 relative overflow-hidden bg-slate-900 shadow-lg">
        <Ballpit
          count={80}
          gravity={0}
          friction={0.978}
          wallBounce={0.95}
          followCursor={false}
          colors={[0x2C2C54, 0x474787, 0xAAABB8, 0xECECEC, 0xFFD700]}
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

        {/* Message Overlay */}


        {/* Overlay for better visual separation */}
        <div className="absolute inset-0 bg-gradient-to-l from-slate-900/20 to-transparent" />
      </div>
    </div>
  )
}