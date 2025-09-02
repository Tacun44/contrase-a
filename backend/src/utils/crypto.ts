import crypto from "crypto";

const algorithm = "aes-256-ctr";
const secretKey = process.env.AES_SECRET_KEY as string;

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(hash: string) {
  const [ivHex, encryptedHex] = hash.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
} 