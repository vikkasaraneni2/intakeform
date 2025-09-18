import { sha256 } from "js-sha256";

export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;
  const real = headers.get("x-real-ip");
  if (real) return real;
  return "0.0.0.0";
}

export function hashIp(ip: string | null | undefined): string | undefined {
  if (!ip) return undefined;
  const salt = process.env.HASH_SALT || "";
  return sha256(salt + ip);
}




