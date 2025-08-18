import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { version as uuidVersion } from "uuid";
import { validate as uuidValidate } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateUUID(uuid: string) {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}
