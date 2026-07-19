// Eén centrale plek voor de admin-sessielogica, gebruikt door de admin-acties,
// de preview-route en de CSV-export. Alles op één plek voorkomt dat een van
// de drie per ongeluk een zwakkere (of andere) controle krijgt.
// De pure crypto-logica staat in admin-auth-core.ts (los testbaar); dit
// bestand voegt de cookiestore-integratie toe en is server-only.
import "server-only";
import { cookies } from "next/headers";
import { isValidSessionCookie } from "./admin-auth-core";

export { sessionValue, timingSafeStringEqual } from "./admin-auth-core";

export const ADMIN_COOKIE = "mw_admin";

// Leesgemak voor Route Handlers en server actions die de cookiestore van
// next/headers gebruiken.
export function isAdminRequestAuthed(): boolean {
  return isValidSessionCookie(
    cookies().get(ADMIN_COOKIE)?.value,
    process.env.ADMIN_PASSWORD
  );
}
