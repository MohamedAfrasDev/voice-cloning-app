import assert from "node:assert/strict";
import { test } from "node:test";
import { isOrgAdmin, parseRoles } from "@/lib/auth/roles";

test("owners and admins can administer an organization", () => {
  assert.ok(isOrgAdmin(parseRoles("owner")));
  assert.ok(isOrgAdmin(parseRoles("admin")));
  assert.ok(isOrgAdmin(parseRoles("member,admin")));
});

test("members and unknown roles cannot", () => {
  assert.ok(!isOrgAdmin(parseRoles("member")));
  assert.ok(!isOrgAdmin(parseRoles("administrator")));
  assert.ok(!isOrgAdmin(parseRoles("")));
});
