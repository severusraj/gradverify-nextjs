import { PrismaClient } from "@/generated/prisma";
import { Prisma } from "@/generated/prisma";

// Add type for the global prisma instance
declare global {
	var prisma: PrismaClient | undefined;
}

// Create a function to handle Prisma errors
const handlePrismaError = (error: unknown) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		// Handle known Prisma errors
		console.error('Prisma Client Error:', {
			code: error.code,
			message: error.message,
			meta: error.meta,
		});
	} else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
		// Handle unknown Prisma errors
		console.error('Unknown Prisma Error:', error.message);
	} else if (error instanceof Prisma.PrismaClientRustPanicError) {
		// Handle Prisma client panic errors
		console.error('Prisma Client Panic:', error.message);
	} else if (error instanceof Prisma.PrismaClientInitializationError) {
		// Handle initialization errors
		console.error('Prisma Client Initialization Error:', error.message);
	} else {
		// Handle other errors
		console.error('Unexpected Error:', error);
	}
};

// Create the Prisma client with error handling
const prismaClientSingleton = () => {
	const client = new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	});

	// Add error handling middleware
	client.$use(async (params, next) => {
		try {
			return await next(params);
		} catch (error) {
			handlePrismaError(error);
			throw error;
		}
	});

	return client;
};

// Export the singleton instance
export const prisma = global.prisma ?? prismaClientSingleton();

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma;
}

// Export Prisma types for use in other files
export type { Prisma };
