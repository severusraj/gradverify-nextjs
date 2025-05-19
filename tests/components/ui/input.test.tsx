import React from "react";
import "@testing-library/jest-dom";
import { it, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
	it("renders an input with default props", () => {
		render(<Input placeholder="Type here" />);

		const input = screen.getByPlaceholderText("Type here");
		expect(input).toBeInTheDocument();
	});

	it("applies a custom className", () => {
		render(<Input className="custom-class" placeholder="Email" />);

		const input = screen.getByPlaceholderText("Email");
		expect(input).toBeInTheDocument();
		expect(input).toHaveClass("custom-class");
	});
});
