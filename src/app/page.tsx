"use client";
import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import Link from "next/link";
import Head from "next/head";

export default function HomePage() {
	const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
		const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - left) / width;
		const y = (e.clientY - top) / height;
		setMouse({ x, y });
	}

	const blob1 = {
		transform: `translate(${(-40 + mouse.x * 80)}px, ${(-40 + mouse.y * 60)}px) scale(1.05)`
	};
	const blob2 = {
		transform: `translate(${(mouse.x - 0.5) * -120}px, ${(mouse.y - 0.5) * -100}px) scale(1.1)`
	};
	const blob3 = {
		transform: `translate(calc(-50% + ${(mouse.x - 0.5) * 60}px), calc(-50% + ${(mouse.y - 0.5) * 60}px)) scale(1.1)`
	};
	const blob4 = {
		transform: `translate(${(mouse.x - 0.5) * 80}px, ${(mouse.y - 0.5) * -60}px) scale(1.08)`
	};

	// Calculate 3D transforms for floating cards
	const card1Transform = {
		transform: `perspective(1000px) 
			rotateX(${(mouse.y - 0.5) * 10}deg) 
			rotateY(${(mouse.x - 0.5) * -10}deg)
			translateZ(20px)`
	};

	const card2Transform = {
		transform: `perspective(1000px) 
			rotateX(${(mouse.y - 0.5) * 15}deg) 
			rotateY(${(mouse.x - 0.5) * -15}deg)
			translateZ(40px)`
	};

	return (
		<div 
			className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 overflow-hidden" 
			onMouseMove={handleMouseMove}
		>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
			</Head>

			{/* Premium animated background effects */}
			<div className="absolute inset-0 overflow-hidden">
				{/* Gradient mesh background */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(0,0,0,0))]" />
				
				{/* Animated grid lines */}
				<div className="absolute inset-0 opacity-20">
					<div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />
				</div>

				{/* Enhanced blobs with premium gradients */}
				<div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-gradient-to-br from-blue-400/20 via-blue-600/20 to-indigo-500/20 opacity-40 rounded-full blur-3xl z-0 animate-blob-move-1" style={blob1} />
				<div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-gradient-to-tr from-indigo-500/20 via-blue-400/20 to-blue-300/20 opacity-40 rounded-full blur-3xl z-0 animate-blob-move-2" style={blob2} />
				<div className="absolute top-1/2 left-1/2 w-[320px] h-[320px] bg-gradient-to-br from-blue-300/20 via-blue-500/20 to-indigo-400/20 opacity-40 rounded-full blur-3xl z-0 animate-blob-move-3" style={blob3} />
				<div className="absolute top-1/3 right-1/2 w-[260px] h-[260px] bg-gradient-to-br from-indigo-400/20 via-blue-300/20 to-blue-500/20 opacity-30 rounded-full blur-3xl z-0 animate-blob-move-4" style={blob4} />
			</div>

			{/* Floating particles with glow effect */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="particle-container">
					{[...Array(20)].map((_, i) => (
						<div
							key={i}
							className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								animationDelay: `${Math.random() * 5}s`,
								animationDuration: `${5 + Math.random() * 5}s`,
								opacity: 0.4 + Math.random() * 0.4,
								boxShadow: '0 0 8px 2px rgba(59, 130, 246, 0.3)'
							}}
						/>
					))}
				</div>
			</div>

			{/* Main content with enhanced 3D effects */}
			<main className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16 gap-8 sm:gap-10">
				{/* Premium badge with glass effect */}
				<div 
					className="group relative"
					style={card1Transform}
				>
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-50 blur-xl group-hover:opacity-70 transition-opacity" />
					<span className="relative inline-block px-6 py-2 rounded-full bg-slate-900/80 text-blue-200 font-semibold text-xs tracking-widest shadow-lg backdrop-blur-sm animate-fade-in border border-white/10 group-hover:border-white/20 transition-all">
						Gordon College Official
					</span>
				</div>

				{/* Enhanced heading with 3D effect */}
				<div 
					className="text-center space-y-4"
					style={card2Transform}
				>
					<h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-center tracking-tight text-white drop-shadow-2xl animate-fade-in-up">
						Secure <span className="bg-gradient-to-r from-blue-200 via-indigo-300 to-blue-200 bg-clip-text text-transparent">Graduation</span> <span className="relative inline-block">
							Verification
							<div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
						</span>
					</h1>
					<p className="text-base sm:text-lg md:text-xl text-center text-blue-100/90 max-w-2xl mx-auto animate-fade-in-up delay-100 drop-shadow-lg font-light">
						A reliable, secure, and modern way to verify graduation status and protect the integrity of your academic credentials at Gordon College.
					</p>
				</div>

				{/* Premium CTA buttons with glass effect */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 animate-fade-in-up delay-200 w-full max-w-lg mx-auto">
					<Link 
						href="/login" 
						className={cn(
							buttonVariants(), 
							"relative px-8 py-4 text-base sm:text-lg shadow-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-full sm:w-auto group overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
						)}
					>
						<div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
						<span className="relative flex items-center justify-center gap-2">
							Get Started
							<svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</span>
					</Link>
					<Link 
						href="/register" 
						className={cn(
							buttonVariants({ variant: "outline" }), 
							"px-8 py-4 text-base sm:text-lg border-white/20 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/40 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
						)}
					>
						Create an Account
					</Link>
				</div>

				{/* Trust indicators with premium styling */}
				<div className="mt-12 sm:mt-16 flex flex-col items-center gap-4 animate-fade-in-up delay-300">
					<span className="text-sm text-blue-200/90 font-medium tracking-wide uppercase drop-shadow-lg">
						Trusted by students, faculty, and employers
					</span>
					<div className="flex items-center gap-6 mt-2">
						<div className="flex gap-3">
							<div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
							<div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-indigo-300 rounded-full animate-pulse delay-100 shadow-lg shadow-indigo-500/50" />
							<div className="w-2 h-2 bg-gradient-to-r from-blue-300 to-blue-200 rounded-full animate-pulse delay-200 shadow-lg shadow-blue-400/50" />
						</div>
					</div>
				</div>

				{/* Feature highlights with glass cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full px-4">
					{[
						{
							icon: "🔒",
							title: "Secure",
							description: "End-to-end encrypted verification process"
						},
						{
							icon: "⚡",
							title: "Fast",
							description: "Instant document verification"
						},
						{
							icon: "🎓",
							title: "Trusted",
							description: "Official Gordon College platform"
						}
					].map((feature, index) => (
						<div
							key={index}
							className="group relative rounded-2xl p-6 backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
							style={{
								transform: `perspective(1000px) 
									rotateX(${(mouse.y - 0.5) * 5}deg) 
									rotateY(${(mouse.x - 0.5) * -5}deg)
									translateZ(10px)`,
								transformStyle: 'preserve-3d'
							}}
						>
							<div className="text-3xl mb-3">{feature.icon}</div>
							<h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
							<p className="text-sm text-blue-100/80">{feature.description}</p>
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
						</div>
					))}
				</div>
			</main>

			{/* Enhanced animations and effects */}
			<style jsx global>{`
				@keyframes float {
					0%, 100% { transform: translateY(0) scale(1); }
					50% { transform: translateY(-20px) scale(1.1); }
				}
				.animate-float {
					animation: float 3s ease-in-out infinite;
				}
				@keyframes fadeIn { 
					from { 
						opacity: 0;
						filter: blur(5px);
					} 
					to { 
						opacity: 1;
						filter: blur(0);
					} 
				}
				@keyframes fadeInUp { 
					from { 
						opacity: 0; 
						transform: translateY(24px); 
						filter: blur(5px);
					} 
					to { 
						opacity: 1; 
						transform: none;
						filter: blur(0);
					} 
				}
				.animate-fade-in { 
					animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
				}
				.animate-fade-in-up { 
					animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
				}
				.bg-grid-white {
					background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
						linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
				}
				@keyframes pulse-glow {
					0%, 100% { 
						opacity: 0.5;
						transform: scale(1);
					}
					50% { 
						opacity: 1;
						transform: scale(1.2);
					}
				}
				.animate-pulse-glow {
					animation: pulse-glow 2s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
}

// Add some simple fade-in animations
// You can add these to your global CSS or Tailwind config:
// .animate-fade-in { animation: fadeIn 0.8s both; }
// .animate-fade-in-up { animation: fadeInUp 0.8s both; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } } 