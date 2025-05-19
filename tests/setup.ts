import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

function createMockFont() {
	return {
		className: "mock-font-class",
		variable: "--mock-font-class",
		style: { fontFamily: "mock-font-family" },
	};
}

vi.mock("next/image", () => import("./__mocks__/next-image-mock"));

vi.mock("\\.svg$", () => "mocked.svg");

vi.mock("next/font/google", () => ({
	Manrope: () => createMockFont(),
}));
