import * as React from "react";
import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Section,
	Text,
	Button,
} from "@react-email/components";

type VerifyEmailMessageProps = {
	verifyUrl: string;
	name: string;
};

export function VerifyEmailMessage({
	verifyUrl,
	name,
}: VerifyEmailMessageProps) {
	return (
		<Html>
			<Head />
			<Preview>Verify your email address</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section>
						<Text style={heading}>{name ? `Hi ${name},` : "Hello,"}</Text>
						<Text style={text}>
							Thanks for signing up! Please verify your email by clicking the
							button below.
						</Text>
						<Button style={button} href={verifyUrl}>
							Verify Email
						</Button>
						<Text style={footer}>
							If you didn’t create this account, you can ignore this email.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: "#f9f9f9",
	padding: "20px 0",
};

const container = {
	backgroundColor: "#ffffff",
	borderRadius: "8px",
	padding: "40px",
	width: "100%",
	maxWidth: "480px",
	margin: "0 auto",
};

const heading = {
	fontSize: "20px",
	fontWeight: "bold",
	marginBottom: "16px",
};

const text = {
	fontSize: "16px",
	lineHeight: "24px",
	marginBottom: "24px",
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

const footer = {
	fontSize: "12px",
	color: "#888888",
	marginTop: "32px",
};
