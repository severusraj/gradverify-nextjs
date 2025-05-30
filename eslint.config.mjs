import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	{
		files: ["**/*"],
		ignores: [
			// Generated files
			"src/generated/**",
			"**/generated/**",
			"**/prisma/**",
			
			// Build output
			".next/**",
			"out/**",
			"build/**",
			"dist/**",
			
			// Dependencies
			"node_modules/**",
			
			// Cache
			".cache/**"
		],
	},
	...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
