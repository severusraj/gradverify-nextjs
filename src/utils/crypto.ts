import crypto from "node:crypto";

export function generateRandom32() {
    return crypto.randomBytes(32).toString("hex");
}

console.log(generateRandom32());