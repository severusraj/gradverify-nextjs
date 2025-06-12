"use client";
import { useState, useEffect } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { RegisterForm } from "@/components/forms/register-form";
import { AnimatedBackground } from "@/components/ui/animated-background";

export default function LoginPage() {
	const [isRegister, setIsRegister] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleForm = () => {
		setIsRegister(!isRegister);
	};

	return (
		<div className="w-full min-h-screen lg:grid lg:grid-cols-2 relative overflow-hidden">
			{/* Floating particles - static to avoid hydration issues */}
			<div className="fixed inset-0 pointer-events-none z-0">
				<div className="floating-particles">
					<div className="particle" style={{ left: '10%', animationDelay: '0s' }} />
					<div className="particle" style={{ left: '20%', animationDelay: '2s' }} />
					<div className="particle" style={{ left: '30%', animationDelay: '4s' }} />
					<div className="particle" style={{ left: '40%', animationDelay: '6s' }} />
					<div className="particle" style={{ left: '50%', animationDelay: '8s' }} />
					<div className="particle" style={{ left: '60%', animationDelay: '10s' }} />
					<div className="particle" style={{ left: '70%', animationDelay: '12s' }} />
					<div className="particle" style={{ left: '80%', animationDelay: '14s' }} />
					<div className="particle" style={{ left: '90%', animationDelay: '16s' }} />
					<div className="particle" style={{ left: '15%', animationDelay: '18s' }} />
				</div>
			</div>

			{/* Left side - Forms */}
			<div className="flex items-center justify-center min-h-screen p-4 relative z-10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
				<div className="w-full max-w-md">
					{/* Glassmorphism container */}
					<div className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
						{/* Form container with proper overflow handling */}
						<div className="relative overflow-hidden">
							<div
								className={`flex transition-transform duration-700 ease-in-out`}
								style={{
									transform: isRegister ? 'translateX(-50%)' : 'translateX(0%)',
									width: '200%'
								}}
							>
								{/* Login Form */}
								<div className="w-1/2 pr-4">
									<div className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
										<div className="text-center space-y-4">
											<div className="flex items-center justify-center">
												<div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
													<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
													</svg>
												</div>
											</div>
											<div className="space-y-2">
												<h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
													Welcome Back
												</h1>
												<p className="text-muted-foreground">
													Enter your credentials to access your account
												</p>
											</div>
										</div>
										
										<LoginForm />
										
										<div className="text-center text-sm pt-4 border-t border-slate-200 dark:border-slate-700">
											<span className="text-muted-foreground">Don&apos;t have an account? </span>
											<button 
												onClick={toggleForm} 
												className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
											>
												Create one
											</button>
										</div>
									</div>
								</div>

								{/* Register Form */}
								<div className="w-1/2 pl-4">
									<div className="space-y-6">
										<div className="text-center space-y-4">
											<div className="flex items-center justify-center">
												<div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
													<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
													</svg>
												</div>
											</div>
											<div className="space-y-2">
												<h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
													Join GradVerify
												</h1>
												<p className="text-muted-foreground">
													Create your account to get started
												</p>
											</div>
										</div>
										
										<RegisterForm />
										
										<div className="text-center text-sm pt-4 border-t border-slate-200 dark:border-slate-700">
											<span className="text-muted-foreground">Already have an account? </span>
											<button 
												onClick={toggleForm} 
												className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
											>
												Sign in
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right side - Enhanced branding */}
			<div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
				<AnimatedBackground />
				
				{/* Animated grid overlay */}
				<div className="absolute inset-0 opacity-20">
					<div className="grid-pattern"></div>
				</div>

				{/* Content */}
				<div className="absolute inset-0 flex items-center justify-center text-white text-center p-8 z-10">
					<div className="max-w-md space-y-8">
						<div className="animate-fade-in-up">
							<div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-float">
								<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
								</svg>
							</div>
							<div className="space-y-6">
								<h2 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
									GradVerify
								</h2>
								<p className="text-xl text-blue-100 leading-relaxed">
									Secure and Efficient Academic Verification Platform
								</p>
								<div className="space-y-4 text-left max-w-sm mx-auto">
									<div className="flex items-center space-x-3 text-blue-200">
										<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
										<span className="text-sm">Instant document verification</span>
									</div>
									<div className="flex items-center space-x-3 text-blue-200">
										<div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
										<span className="text-sm">Secured verification process</span>
									</div>
									<div className="flex items-center space-x-3 text-blue-200">
										<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
										<span className="text-sm">Developed by Gordon College CCS</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Decorative elements */}
				<div className="absolute top-10 right-10 w-32 h-32 border border-white/10 rounded-full animate-spin-slow"></div>
				<div className="absolute bottom-10 left-10 w-24 h-24 border border-white/10 rounded-full animate-spin-slow" style={{animationDirection: 'reverse'}}></div>
			</div>
		</div>
	);
}
