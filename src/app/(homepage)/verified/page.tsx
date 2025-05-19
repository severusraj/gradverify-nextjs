import type { Metadata } from "next";
import { CheckIcon } from "lucide-react";

export const metadata: Metadata = {
	title: "Email Verified",
};

export default function VerifiedPage() {
	return (
		<div className="mx-auto max-w-3xl flex flex-col gap-4 items-center justify-center px-8 md:px-0 py-12 md:py-24 lg:py-32">
			<div className="flex flex-col justify-center text-center space-y-2">
				<div className="mx-auto flex justify-center">
					<CheckIcon className="size-24 text-green-500 transition-all duration-300 animate-bounce" />
				</div>
				<p className="text-lg font-semibold text-green-500">
					Your Email Was Successfully Verified.
				</p>
			</div>
		</div>
	);
}
