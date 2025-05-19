import React from "react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { screen, render } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
	it("renders a button with default props", () => {
		render(<Button>Click Me</Button>);

		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeInTheDocument();
	});

	it("applies a custom className", () => {
		render(<Button className="custom-class">Click Me</Button>);

		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass("custom-class");
	});
});
