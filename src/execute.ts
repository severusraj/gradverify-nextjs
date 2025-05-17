import { createSuperUser } from "./lib/create-super-user";

(async () => {
	try {
		console.log("Started sending email...");
		await createSuperUser({
			email: process.env.SUPERUSER_ADMIN_EMAIL!,
			name: process.env.SUPERUSER_ADMIN_NAME!,
			password: process.env.SUPERUSER_ADMIN_PASSWORD!,
		});
		console.log("Successfully sent the email.");
	} catch (error_) {
		const error = error_ as Error;
		console.error(error.message, error);
	}
})();
