import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export async function SidebarUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) return null;

  return (
    <div className="flex items-center gap-2.5 rounded-lg p-2">
      {user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt=""
          className="size-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials(user.name || user.email) || "?"}
        </span>
      )}
      <div className="grid min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate text-sm font-medium">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {user.email}
        </span>
      </div>
    </div>
  );
}
