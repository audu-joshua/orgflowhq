const dotenv = require("dotenv");
const result = dotenv.config({ path: ".env.local" });
console.log("Dotenv result:", result.error ? "Error" : "Success");
if (result.error) console.error(result.error);
console.log("Injected keys:", Object.keys(result.parsed || {}));
console.log("MONGODB_URI present:", !!process.env.MONGODB_URI);
console.log("SUPABASE_URL present:", !!process.env.SUPABASE_URL);
