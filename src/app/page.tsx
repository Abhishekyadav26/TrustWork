"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WalletConnect } from "@/components/WalletConnect";
import { Header } from "@/components/ui/header-2";
import TestimonialV2 from "@/components/ui/testimonial-v2";
import { FloatingPaths } from "@/components/ui/background-paths";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import { FlickeringFooter } from "@/components/ui/flickering-footer";
import { AccordionDemo } from "@/components/accordion-demo";
import { FeaturesDemo } from "@/components/features-8-demo";
import { JobBoard } from "@/components/JobBoard";
import { PostJob } from "@/components/PostJob";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase, PlusCircle, ListTodo, Scale, Loader2,
  Shield, CheckCircle, Star, Cpu, ArrowRight, Zap, Globe
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const logos = [
  { src: "https://svgl.app/library/nvidia-wordmark-light.svg", alt: "Nvidia Logo" },
  { src: "https://svgl.app/library/supabase_wordmark_light.svg", alt: "Supabase Logo" },
  { src: "https://svgl.app/library/openai_wordmark_light.svg", alt: "OpenAI Logo" },
  { src: "https://svgl.app/library/turso-wordmark-light.svg", alt: "Turso Logo" },
  { src: "https://svgl.app/library/vercel_wordmark.svg", alt: "Vercel Logo" },
  { src: "https://svgl.app/library/github_wordmark_light.svg", alt: "GitHub Logo" },
  { src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg", alt: "Claude AI Logo" },
  { src: "https://svgl.app/library/clerk-wordmark-light.svg", alt: "Clerk Logo" },
];

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "jobs" | "post" | "escrow" | "arbitration"
  >("jobs");

  const loaderRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Simulate app initialization and animate loader
  useEffect(() => {
    let ctx = gsap.context(() => {
      if (loaderRef.current) {
        gsap.fromTo(
          ".loader-element",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: "power3.out" }
        );
      }
    });

    const timer = setTimeout(() => {
      if (loaderRef.current) {
        gsap.to(".loader-element", {
          opacity: 0,
          y: -20,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => setIsInitializing(false),
        });
      } else {
        setIsInitializing(false);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  // Landing Page Scroll Animations
  useEffect(() => {
    if (!isInitializing && !isConnected && landingRef.current) {
      let ctx = gsap.context(() => {
        // Hero Section Animation
        gsap.fromTo(
          ".hero-title",
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: "power4.out", delay: 0.2 }
        );
        gsap.fromTo(
          ".hero-subtitle",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.4 }
        );
        gsap.fromTo(
          ".hero-action",
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)", delay: 0.6 }
        );

        // Problem Section ScrollTrigger
        gsap.fromTo(
          ".problem-card",
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".problem-section",
              start: "top 75%",
            },
          }
        );

        // Features ScrollTrigger
        gsap.fromTo(
          ".feature-item",
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".features-section",
              start: "top 70%",
            },
          }
        );
      }, landingRef);
      return () => ctx.revert();
    }
  }, [isInitializing, isConnected]);

  // Animate main app screen
  useEffect(() => {
    if (isConnected && mainRef.current) {
      let ctx = gsap.context(() => {
        gsap.fromTo(
          ".app-header",
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
        gsap.fromTo(
          ".app-nav-item",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: "power2.out", delay: 0.2 }
        );
      }, mainRef);
      return () => ctx.revert();
    }
  }, [isConnected]);

  // Animate tab content transitions
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  const handleConnect = (walletAddress: string) => {
    setAddress(walletAddress);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setAddress("");
    setIsConnected(false);
  };

  // Show initialization loader
  if (isInitializing) {
    return (
      <div ref={loaderRef} className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background"></div>
        <div className="text-center relative z-10">
          <div className="loader-element inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-8 shadow-[0_0_40px_rgba(59,130,246,0.5)]">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
          <h1 className="loader-element text-4xl font-bold text-foreground tracking-tight mb-4">
            TrustWork
          </h1>
          <p className="loader-element text-lg text-muted-foreground font-medium flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Connecting to Stellar...
          </p>
        </div>
      </div>
    );
  }

  // Premium Landing Page (Disconnected)
  if (!isConnected) {
    return (
      <div ref={landingRef} className="relative min-h-screen bg-background text-foreground selection:bg-blue-500/30">
        {/* Global Fixed Background Paths */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-30">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        {/* Navigation */}
        <Header
          actions={
            <WalletConnect
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isConnected={isConnected}
              address={address}
            />
          }
        />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Background Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

          <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
            <div className="hero-title inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted dark:bg-white/5 border border-border dark:border-white/10 mb-8 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-200">The Web3 Upwork Alternative</span>
            </div>

            <h1 className="hero-title text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-tight">
              Freelance Without <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent bg-300% animate-gradient">
                Compromise.
              </span>
            </h1>

            <p className="hero-subtitle text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              No 20% platform fees. No frozen accounts. Secure your work with neutral smart contract escrows and on-chain arbitration on Stellar.
            </p>

            <div className="hero-action flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative bg-background rounded-xl p-1">
                  <WalletConnect
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    isConnected={isConnected}
                    address={address}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Globe className="w-4 h-4 text-yellow-400 " /> Built on Stellar
              </p>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="relative mx-auto max-w-5xl py-10 md:py-20 z-10">
          <h2 className="mb-8 text-center font-medium text-foreground text-xl tracking-tight md:text-2xl">
            <span className="text-muted-foreground">Trusted by top teams.</span>
            <br />
            <span className="font-semibold">Used by the leaders in Web3.</span>
          </h2>
          <div className="mx-auto my-5 h-px max-w-3xl bg-border [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
          <LogoCloud logos={logos} />
          <div className="mx-auto mt-5 h-px max-w-3xl bg-border [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
        </section>

        {/* Features Block */}
        <FeaturesDemo />

        {/* Features Section */}
        <section className="features-section py-32 relative">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">How It Works</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                  title: "Smart Escrow",
                  desc: "Clients lock XLM in a neutral smart contract. Funds are mathematically guaranteed."
                },
                {
                  icon: <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
                  title: "Auto Milestones",
                  desc: "Upon milestone approval, funds are instantly released without intermediaries."
                },
                {
                  icon: <Scale className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
                  title: "On-Chain Arbitration",
                  desc: "Disputes? A decentralized jury of TRUST holders votes to resolve conflicts fairly."
                },
                {
                  icon: <Star className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />,
                  title: "TRUST Token",
                  desc: "Earn TRUST tokens for completing jobs. Higher trust equals better visibility."
                },
                {
                  icon: <Cpu className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
                  title: "AI Agent Intelligence",
                  desc: "AI automatically scores proposals and flags potential dispute patterns early."
                },
                {
                  icon: <Briefcase className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />,
                  title: "Global Talent",
                  desc: "Hire anyone, anywhere. Stellar provides lightning-fast, near-zero cost settlement."
                }
              ].map((feat, i) => (
                <div key={i} className="feature-item bg-white dark:bg-white/5 border border-border dark:border-white/10 p-8 rounded-3xl hover:bg-muted dark:hover:bg-white/10 transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-muted dark:bg-white/5 flex items-center justify-center mb-6">
                    {feat.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-foreground">{feat.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialV2 />

        {/* FAQ Section */}
        <section className="py-24 relative bg-muted/10">
          <div className="container mx-auto px-6 max-w-4xl flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <AccordionDemo />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative bg-gradient-to-b from-background to-blue-50 dark:to-blue-950/20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold mb-8">Ready to work freely?</h2>
            <div className="inline-block relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition duration-300"></div>
              <div className="relative">
                <WalletConnect
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  isConnected={isConnected}
                  address={address}
                />
              </div>
            </div>
          </div>
        </section>

        <FlickeringFooter />
      </div>
    );
  }

  // Connected App Dashboard
  return (
    <div ref={mainRef} className="min-h-screen bg-background text-foreground selection:bg-blue-500/30">
      <div className="app-header">
        <Header
          actions={
            <WalletConnect
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isConnected={isConnected}
              address={address}
            />
          }
        />
      </div>

      <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-[73px] z-40">
        <div className="container mx-auto px-6">
          <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2">
            {[
              { id: "jobs", icon: ListTodo, label: "Job Board" },
              { id: "post", icon: PlusCircle, label: "Post Job" },
              { id: "escrow", icon: Shield, label: "My Escrows" },
              { id: "arbitration", icon: Scale, label: "Arbitration" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                onClick={() => setActiveTab(tab.id as any)}
                className={`app-nav-item rounded-full px-6 py-5 ${
                  activeTab === tab.id
                    ? "bg-muted text-foreground hover:bg-muted/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div ref={contentRef}>
          {activeTab === "jobs" && <JobBoard address={address} />}
          {activeTab === "post" && <PostJob address={address} />}

          {/* Dashboard Placeholder Cards */}
          {(activeTab === "escrow" || activeTab === "arbitration") && (
            <Card className="border border-border bg-card backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
              <CardHeader className="border-b border-border bg-muted/50 pb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                    {activeTab === "escrow" ? (
                      <Shield className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                    ) : (
                      <Scale className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-foreground">
                      {activeTab === "escrow" ? "Smart Escrows" : "On-Chain Arbitration"}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base mt-1">
                      {activeTab === "escrow"
                        ? "Manage your XLM contracts and release milestones"
                        : "Participate in decentralized dispute resolution"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
                    {activeTab === "escrow" ? (
                      <Shield className="h-10 w-10 text-muted-foreground" />
                    ) : (
                      <Scale className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Module In Development</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {activeTab === "escrow"
                      ? "The smart contract interface for locking XLM and managing milestones is currently being deployed to testnet."
                      : "The TRUST token weighted voting system for arbitration is being finalized."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

