"use client";

export function AnimatedBackground() {
	return (
		<div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
			{/* Animated gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 animate-gradient-xy"></div>
			
			{/* Floating circles */}
			<ul className="circles">
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
			</ul>

			{/* Additional geometric shapes */}
			<div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-white/10 rounded-full animate-pulse"></div>
			<div className="absolute top-3/4 right-1/4 w-24 h-24 border-2 border-blue-300/20 rotate-45 animate-spin-slow"></div>
			<div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg animate-float"></div>
			
			{/* Subtle light rays */}
			<div className="absolute inset-0 opacity-30">
				<div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent transform rotate-12"></div>
				<div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blue-300/20 to-transparent transform -rotate-12"></div>
			</div>
		</div>
	);
} 