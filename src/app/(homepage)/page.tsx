import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HomePage() {
	return (
		<div className="fixed inset-0 w-full h-full overflow-hidden flex items-center justify-center">
			<div className="max-w-3xl px-6 sm:px-4 md:px-4 lg:px-0 flex flex-col items-center justify-center">
				<div className="flex flex-col gap-8">
					<h1 className="text-4xl text-center font-bold tracking-tighter sm:text-5xl md:text-6xl">
						Secure Graduation Verification for Your Institution
					</h1>
					<p className="text-muted-foreground text-xl text-center">
						Our platform provides a reliable, secure way to verify graduation
						status, protecting the integrity of your academic credentials.
					</p>
					<div className="flex items-center justify-center gap-3">
						<Link href="/login" className={cn(buttonVariants())}>
							Get Started
						</Link>
						<Link
							href="/register"
							className={cn(buttonVariants({ variant: "outline" }))}
						>
							Create an Account
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
