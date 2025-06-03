"use client";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import Link from "next/link";

export default function HomePage() {
	// Parallax state
	const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

	// Mouse move handler
	function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
		const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - left) / width;
		const y = (e.clientY - top) / height;
		setMouse({ x, y });
	}

	// Parallax transform helpers
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

	return (
		<div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 overflow-hidden" onMouseMove={handleMouseMove}>
			{/* More vibrant, larger, and more visible animated blobs */}
			<div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-gradient-to-br from-blue-500 via-blue-300 to-indigo-300 opacity-60 rounded-full blur-2xl z-0" style={blob1} />
			<div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-gradient-to-tr from-indigo-400 via-blue-200 to-blue-100 opacity-50 rounded-full blur-2xl z-0" style={blob2} />
			<div className="absolute top-1/2 left-1/2 w-[320px] h-[320px] bg-gradient-to-br from-blue-200 via-blue-300 to-indigo-200 opacity-50 rounded-full blur-2xl z-0" style={blob3} />
			<div className="absolute top-1/3 right-1/2 w-[260px] h-[260px] bg-gradient-to-br from-indigo-300 via-blue-200 to-blue-400 opacity-40 rounded-full blur-2xl z-0" style={blob4} />
			{/* More visible floating particles */}
			<div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-400 rounded-full opacity-80 animate-particle-float-1 z-0" />
			<div className="absolute top-2/3 right-1/4 w-2 h-2 bg-indigo-300 rounded-full opacity-70 animate-particle-float-2 z-0" />
			<div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-blue-300 rounded-full opacity-60 animate-particle-float-3 z-0" />
			<div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-blue-500 rounded-full opacity-70 animate-particle-float-4 z-0" />

			<main className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl px-6 py-16 gap-10">
				<span className="inline-block px-4 py-1 mb-4 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs tracking-widest shadow-sm animate-fade-in">
					Gordon College Official
				</span>
				<h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-400 bg-clip-text text-transparent animate-fade-in-up">
					Secure Graduation Verification
				</h1>
				<p className="text-lg sm:text-xl text-center text-blue-900/80 max-w-2xl animate-fade-in-up delay-100">
					A reliable, secure, and modern way to verify graduation status and protect the integrity of your academic credentials at Gordon College.
				</p>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 animate-fade-in-up delay-200">
					<Link href="/login" className={cn(buttonVariants(), "px-8 py-3 text-lg shadow-lg hover:scale-105 transition-transform duration-200")}>Get Started</Link>
					<Link href="/register" className={cn(buttonVariants({ variant: "outline" }), "px-8 py-3 text-lg border-blue-600 text-blue-700 hover:bg-blue-50 hover:scale-105 transition-transform duration-200")}>Create an Account</Link>
				</div>
				<div className="mt-10 flex flex-col items-center gap-2 animate-fade-in-up delay-300">
					<span className="text-xs text-blue-500 font-medium tracking-wide uppercase">Trusted by students, faculty, and employers</span>
					<div className="flex gap-2 mt-2">
						<span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
						<span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-100" />
						<span className="w-2 h-2 bg-blue-200 rounded-full animate-pulse delay-200" />
					</div>
				</div>
			</main>

			{/* Global styles for blob and particle animations */}
			<style jsx global>{`
				@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
				@keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
				.animate-fade-in { animation: fadeIn 0.8s both; }
				.animate-fade-in-up { animation: fadeInUp 0.8s both; }
				@keyframes blobMove1 {
					0%, 100% { transform: translate(0, 0) scale(1); }
					50% { transform: translate(80px, 60px) scale(1.18); }
				}
				@keyframes blobMove2 {
					0%, 100% { transform: translate(0, 0) scale(1); }
					50% { transform: translate(-60px, -50px) scale(1.15); }
				}
				@keyframes blobMove3 {
					0%, 100% { transform: translate(-50%, -50%) scale(1); }
					50% { transform: translate(-60%, -60%) scale(1.22); }
				}
				@keyframes blobMove4 {
					0%, 100% { transform: translate(0, 0) scale(1); }
					50% { transform: translate(40px, -40px) scale(1.12); }
				}
				.animate-blob-move-1 { animation: blobMove1 10s ease-in-out infinite alternate; }
				.animate-blob-move-2 { animation: blobMove2 13s ease-in-out infinite alternate; }
				.animate-blob-move-3 { animation: blobMove3 16s ease-in-out infinite alternate; }
				.animate-blob-move-4 { animation: blobMove4 12s ease-in-out infinite alternate; }
				@keyframes particleFloat1 {
					0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
					50% { transform: translateY(-40px) scale(1.3); opacity: 1; }
				}
				@keyframes particleFloat2 {
					0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
					50% { transform: translateY(32px) scale(1.2); opacity: 1; }
				}
				@keyframes particleFloat3 {
					0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
					50% { transform: translateY(-28px) scale(1.18); opacity: 1; }
				}
				@keyframes particleFloat4 {
					0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
					50% { transform: translateY(30px) scale(1.25); opacity: 1; }
				}
				.animate-particle-float-1 { animation: particleFloat1 8s ease-in-out infinite alternate; }
				.animate-particle-float-2 { animation: particleFloat2 7s ease-in-out infinite alternate; }
				.animate-particle-float-3 { animation: particleFloat3 9s ease-in-out infinite alternate; }
				.animate-particle-float-4 { animation: particleFloat4 10s ease-in-out infinite alternate; }
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