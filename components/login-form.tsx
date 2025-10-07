"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Anchor, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await login(email, password);

    if (result.success) {
      toast.success('Login successful!', {
        description: 'Welcome back! Redirecting to dashboard...'
      });

      console.log('Login successful, checking cookies...');
      console.log('Document cookies:', document.cookie);

      // Force a full page reload to ensure cookies are properly set
      setTimeout(() => {
        console.log('Redirecting to /admin');
        window.location.href = '/admin';
      }, 1500);
    } else {
      toast.error('Login failed', {
        description: result.error || 'Invalid credentials'
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo and Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Anchor className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
      </div>

      {/* Login Card */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4 pt-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Sign In</CardTitle>
          <CardDescription className="text-sm text-gray-600">Enter your credentials</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mtq2025.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <button type="button" className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

        </CardContent>
      </Card>

      {/* Sign Up Link */}
      <p className="text-center text-xs text-gray-500">
        {"Don't have an account? "}
        <a href="/registration" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Sign up</a>
      </p>
    </div>
  )
}
