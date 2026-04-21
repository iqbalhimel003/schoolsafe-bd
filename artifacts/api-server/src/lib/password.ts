import bcrypt from "bcryptjs";

const BCRYPT_PREFIX_RE = /^\$2[abxy]\$/;

export function isBcryptHash(value: string): boolean {
  return typeof value === "string" && BCRYPT_PREFIX_RE.test(value);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  if (isBcryptHash(stored)) {
    try {
      return await bcrypt.compare(plain, stored);
    } catch {
      return false;
    }
  }
  return plain === stored;
}
