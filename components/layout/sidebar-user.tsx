import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { AccountMenu } from "./account-menu";

export async function SidebarUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) return null;

  return (
    <AccountMenu name={user.name} email={user.email} image={user.image} />
  );
}
