"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Trophy,
  Zap,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    window.location.href = "/team-create";
  };

  const benefits = [
    { icon: Shield, text: "Free franchise creation" },
    { icon: Trophy, text: "Compete for MVP Crowns" },
    { icon: Zap, text: "Real-time simulations" },
  ];

  return (
    <div className="min-h-screen bg-navy-primary flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 bg-gradient-to-br from-navy-secondary/30 via-navy-primary to-navy-primary" />
      <div className="fixed top-0 right-0 w-1/3 h-full bg-gradient-to-l from-wine/5 to-transparent" />
      
      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Benefits */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric to-cyan-glow flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-white block leading-tight">GM DYNASTY</span>
                <span className="text-xs text-gold font-medium tracking-wider">LITE</span>
              </div>
            </Link>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Build Your <span className="text-gradient-gold">Football Dynasty</span>
            </h1>
            <p className="text-text-muted text-lg leading-relaxed">
              Join the premier franchise simulation platform. Create your team, set your strategy, and compete against the best.
            </p>
          </div>
          
          <div className="space-y-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 bg-navy-card/50 border border-navy-border rounded-xl p-4"
              >
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-gold" />
                </div>
                <span className="text-text-light font-medium">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-wine/10 border border-wine/20 rounded-xl">
            <p className="text-sm text-text-muted">
              "GM Dynasty Lite completely changed how I experience football. The strategy depth is incredible."
            </p>
            <p className="text-sm text-white font-medium mt-2">— Coach Goated, Top 10 Ranked</p>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric to-cyan-glow flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-white block leading-tight">GM DYNASTY</span>
                <span className="text-[10px] text-gold font-medium tracking-wider">LITE</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
          </div>

          <Card className="border-navy-border">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Smith"
                      className="w-full bg-navy-secondary border border-navy-border rounded-lg pl-10 pr-4 py-3 text-text-light placeholder:text-text-muted focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric/50 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="coachsmith"
                      className="w-full bg-navy-secondary border border-navy-border rounded-lg pl-10 pr-4 py-3 text-text-light placeholder:text-text-muted focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric/50 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="coach@example.com"
                      className="w-full bg-navy-secondary border border-navy-border rounded-lg pl-10 pr-4 py-3 text-text-light placeholder:text-text-muted focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric/50 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="w-full bg-navy-secondary border border-navy-border rounded-lg pl-10 pr-12 py-3 text-text-light placeholder:text-text-muted focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric/50 transition-all"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full bg-navy-secondary border border-navy-border rounded-lg pl-10 pr-12 py-3 text-text-light placeholder:text-text-muted focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric/50 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-navy-border bg-navy-secondary text-electric focus:ring-electric/50"
                    required
                  />
                  <span className="text-sm text-text-muted">
                    I agree to the{" "}
                    <Link href="#" className="text-electric hover:text-cyan-glow">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="#" className="text-electric hover:text-cyan-glow">Privacy Policy</Link>
                  </span>
                </label>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="gold"
                  className="w-full gap-2"
                  isLoading={isLoading}
                >
                  Create Franchise
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-navy-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-navy-card text-text-muted">or sign up with</span>
                </div>
              </div>

              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-secondary border border-navy-border rounded-lg text-sm text-text-light hover:bg-navy-border transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-secondary border border-navy-border rounded-lg text-sm text-text-light hover:bg-navy-border transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-electric hover:text-cyan-glow font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <div className="text-center mt-4">
            <Link href="/" className="text-xs text-text-muted hover:text-white transition-colors">
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}