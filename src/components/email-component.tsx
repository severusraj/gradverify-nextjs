import * as React from "react";
import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Text,
	Heading,
	Section,
	Link,
} from "@react-email/components";

type EmailFromGradVerifyProps = {
	email: string;
	originalPassword: string;
	hashedPassword: string;
};

export function EmailFromGradVerify({
	email,
	originalPassword,
	hashedPassword,
}: EmailFromGradVerifyProps) {
	return (
		<Html>
			<Head />
			<Preview>Welcome to GradVerify – Your Super Admin Login Info</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading as="h2" style={heading}>
						🎉 Super Admin Account Created
					</Heading>

					<Text style={text}>
						Your account has been successfully created with extended permissions
						as a <strong>SUPER_USER</strong>.
					</Text>

					<Section style={infoBox}>
						<Text style={label}>📧 Email:</Text>
						<Text style={value}>{email}</Text>
						<Text style={label}>🔑 Password:</Text>
						<Text style={value}>
							{originalPassword}
							<br />
							<small>(Hashed: {hashedPassword})</small>
						</Text>
					</Section>

					<Text style={text}>
						Please keep your credentials secure. If compromised, contact us
						immediately at{" "}
						<Link href="mailto:gradverify@example.com">
							gradverify@example.com
						</Link>
						.
					</Text>

					<Section style={ctaWrapper}>
						<Link
							href="http://localhost:3000/login"
							rel="noreferrer"
							target="_blank"
							style={button}
						>
							Login Now
						</Link>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

type EmailToGradVerifyProps = {
	name: string;
	email: string;
	role: "ADMIN" | "STUDENT";
};

export function EmailToGradVerify({
	name,
	email,
	role,
}: EmailToGradVerifyProps) {
	return (
		<Html>
			<Head />
			<Preview>
				{name} is requesting a {role} account on GradVerify
			</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading as="h2" style={heading}>
						📩 Account Creation Request
					</Heading>

					<Text style={text}>
						The following user has requested account creation with the{" "}
						<strong>{role}</strong> role:
					</Text>

					<Section style={infoBox}>
						<Text style={label}>👤 Full Name:</Text>
						<Text style={value}>{name}</Text>

						<Text style={label}>📧 Email:</Text>
						<Text style={value}>{email}</Text>

						<Text style={label}>🎓 Requested Role:</Text>
						<Text style={value}>{role}</Text>
					</Section>

					<Text style={text}>
						They have acknowledged reading the Terms of Service and Privacy
						Policy for account creation.
					</Text>

					<Section style={ctaWrapper}>
						<Link
							href="http://localhost:3000/login"
							target="_blank"
							rel="noreferrer"
							style={button}
						>
							Review Request
						</Link>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: "#f4f4f4",
	padding: "40px 20px",
};

const container = {
	backgroundColor: "#ffffff",
	borderRadius: "10px",
	padding: "30px",
	maxWidth: "600px",
	margin: "0 auto",
	boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const heading = {
	fontSize: "20px",
	color: "#111827",
	marginBottom: "20px",
};

const text = {
	fontSize: "16px",
	color: "#374151",
	lineHeight: "1.6",
	marginBottom: "20px",
};

const infoBox = {
	backgroundColor: "#f9fafb",
	border: "1px solid #e5e7eb",
	borderRadius: "8px",
	padding: "16px",
	marginBottom: "20px",
};

const label = {
	fontSize: "14px",
	color: "#6b7280",
	fontWeight: "bold" as const,
};

const value = {
	fontSize: "16px",
	color: "#111827",
	marginBottom: "10px",
};

const ctaWrapper = {
	textAlign: "center" as const,
	marginTop: "30px",
};

const button = {
	display: "inline-block",
	padding: "14px 28px",
	backgroundColor: "#3b82f6",
	color: "#ffffff",
	borderRadius: "8px",
	textDecoration: "none",
	fontWeight: 600,
	fontSize: "16px",
};
