import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>

      {/* Right side - Maritime Hero with Cool Overlay */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {/* <img
            src="/calm-ocean-waves-water-surface-maritime-profession.jpg"
            alt="Maritime background"
            className="w-full h-full object-cover"
          /> */}
        </div>

        {/* Cool Overlay Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/70 to-purple-900/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Animated Wave Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-400/30 via-transparent to-purple-400/30 animate-pulse" />
          <div className="absolute top-1/4 left-0 w-full h-full bg-gradient-to-l from-cyan-400/20 via-transparent to-blue-400/20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-r from-indigo-400/25 via-transparent to-cyan-400/25 animate-pulse delay-2000" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce" />
        <div className="absolute bottom-32 left-16 w-24 h-24 bg-blue-400/20 rounded-full blur-lg animate-pulse delay-500" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-cyan-400/30 rounded-full blur-md animate-ping" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full" />
              <h1 className="text-5xl font-bold leading-tight">
                Maritime
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                  Talent System
                </span>
              </h1>
            </div>

            <p className="text-xl leading-relaxed text-blue-100/90 max-w-md">
              Connecting maritime professionals with opportunities across the seven seas. Navigate your career with confidence and precision.
            </p>

            <div className="flex items-center space-x-4 text-blue-200/80">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Secure • Professional • Global</span>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    </div>
  )
}