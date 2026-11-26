import { headers } from "next/headers";
import { auth } from "./server";
import { getMemberRoles } from "./membership";

/**
 * Authorization for route handlers: a signed-in user who is currently a member
 * of their active organization. Returns the error response otherwise.
 */
export async function getOrgAccess() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const orgId = session.session.activeOrganizationId;
  const roles = orgId ? await getMemberRoles(session.user.id, orgId) : null;

  if (!orgId || !roles) {
    return {
      error: Response.json(
        { error: "An active organization is required" },
        { status: 403 },
      ),
    };
  }

  return { userId: session.user.id, orgId, roles };
}
