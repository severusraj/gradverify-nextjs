"use client";
import { useState } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LoginPage() {
	const [showTerms, setShowTerms] = useState(false);
	const [showPrivacy, setShowPrivacy] = useState(false);

	return (
		<div className="mx-auto max-w-3xl px-8 md:px-0 h-screen w-screen flex flex-col items-center justify-center gap-4">
			<LoginForm />
			<div className="flex items-center justify-center text-center">
				<p className="text-sm">
					By signing in, you agree to our{" "}
					<button
						type="button"
						className="text-blue-500 underline font-medium hover:text-blue-700 focus:outline-none"
						onClick={() => setShowTerms(true)}
					>
						Terms of Service
					</button>{" "}
					and{" "}
					<button
						type="button"
						className="text-blue-500 underline font-medium hover:text-blue-700 focus:outline-none"
						onClick={() => setShowPrivacy(true)}
					>
						Privacy Policy
					</button>
					.
				</p>
			</div>

			{/* Terms of Service Modal */}
			<Dialog open={showTerms} onOpenChange={setShowTerms}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Terms of Service</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p>Welcome to GradVerify! By using this application, you agree to the following terms and conditions:</p>
						<ul className="list-disc pl-6 space-y-2 mb-4">
							<li>You will use this service only for its intended purpose of graduate verification and related academic processes.</li>
							<li>You will not share your account credentials with others.</li>
							<li>You are responsible for the accuracy of the information you provide.</li>
							<li>All data is handled in accordance with our privacy policy.</li>
							<li>We reserve the right to update these terms at any time.</li>
						</ul>
						<p className="text-muted-foreground">If you have questions about these terms, please contact the system administrator.</p>
					</div>
				</DialogContent>
			</Dialog>

			{/* Privacy Policy Modal */}
			<Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Privacy Policy</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<p>Your privacy is important to us. This policy explains how GradVerify collects, uses, and protects your information:</p>
						<ul className="list-disc pl-6 space-y-2 mb-4">
							<li>We collect only the information necessary for graduate verification and academic processes.</li>
							<li>Your data is stored securely and is not shared with unauthorized third parties.</li>
							<li>We use industry-standard security measures to protect your information.</li>
							<li>You may request to view or update your personal information at any time.</li>
							<li>By using this application, you consent to this privacy policy.</li>
						</ul>
						<p className="text-muted-foreground">If you have questions about this policy, please contact the system administrator.</p>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
