import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Suspense } from "react";

export default function ResetPasswordPage() {
	return (
		<div className="min-h-screen flex">
			{/* Left side - Form */}
			<div className="flex items-center justify-center min-h-screen p-4 relative z-10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 w-full lg:w-1/2">
				<div className="w-full max-w-md">
					{/* Glassmorphism container */}
					<div className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
						<div className="space-y-6">
							<div className="text-center space-y-4">
								<div className="flex items-center justify-center">
									<div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
										<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
									</div>
								</div>
								<div className="space-y-2">
									<h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
										Reset Password
									</h1>
									<p className="text-muted-foreground">
										Enter your new password below to secure your account.
									</p>
								</div>
							</div>
							
							<Suspense fallback={<div>Loading...</div>}>
								<ResetPasswordForm />
							</Suspense>
						</div>
					</div>
				</div>
			</div>

			{/* Right side - Enhanced branding (hidden on mobile) */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-600 to-purple-700">
				<AnimatedBackground />
				
				{/* Animated grid overlay */}
				<div className="absolute inset-0 opacity-20">
					<div className="grid-pattern"></div>
				</div>

				{/* Content */}
				<div className="absolute inset-0 flex items-center justify-center text-white text-center p-8 z-10">
					<div className="max-w-md space-y-8">
						<div className="animate-fade-in-up">
							<div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl animate-float">
								<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5-7a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							
							<h2 className="text-4xl font-bold mb-4 animate-fade-in-up animation-delay-200">
								Almost There!
							</h2>
							<p className="text-xl text-green-100 leading-relaxed animate-fade-in-up animation-delay-400">
								You're just one step away from securing your account with a new password.
							</p>
						</div>
						
						<div className="grid grid-cols-1 gap-6 animate-fade-in-up animation-delay-600">
							<div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
								<div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
									<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
								</div>
								<div className="text-left">
									<h3 className="font-semibold text-white">Strong Password</h3>
									<p className="text-green-100 text-sm">Choose a secure password</p>
								</div>
							</div>
							
							<div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
								<div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
									<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div className="text-left">
									<h3 className="font-semibold text-white">Account Recovery</h3>
									<p className="text-green-100 text-sm">Regain full access instantly</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
} 