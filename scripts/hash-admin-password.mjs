import { pbkdf2Sync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Передайте пароль длиной не менее 12 символов.");
  process.exitCode = 1;
} else {
  const iterations = 210_000;
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  const encode = (value) => value.toString("base64url");

  console.log(`pbkdf2_sha256$${iterations}$${encode(salt)}$${encode(hash)}`);
}
