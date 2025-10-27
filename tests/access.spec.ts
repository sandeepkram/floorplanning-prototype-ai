import { canAccessOffice } from "../src/services/access.js";
import { UserContext } from "../src/models/types.js";

describe("Access policy", () => {
  const ctxAdmin: UserContext = { tenantId: "bankcorp", userId: "1", role: "Admin", region: "IN" };
  const ctxAnalyst: UserContext = { tenantId: "bankcorp", userId: "2", role: "Analyst", region: "IN" };
  const ctxAnalystUS: UserContext = { tenantId: "bankcorp", userId: "3", role: "Analyst", region: "US" };

  test("Admin can access any region", () => {
    expect(canAccessOffice(ctxAdmin, "bankcorp", "blr_finops")).toBe(true);
  });

  test("Analyst with same region allowed", () => {
    expect(canAccessOffice(ctxAnalyst, "bankcorp", "blr_finops")).toBe(true);
  });

  test("Analyst with diff region denied", () => {
    expect(canAccessOffice(ctxAnalystUS, "bankcorp", "blr_finops")).toBe(false);
  });
});
