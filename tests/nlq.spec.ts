import { nlqAnswer } from "../src/services/nlq.js";
import { UserContext } from "../src/models/types.js";

describe("NLQ stub", () => {
  const ctx: UserContext = { tenantId: "bankcorp", userId: "1", role: "Admin", region: "IN" };

  test("Handles utilization query gracefully", async () => {
    const res = await nlqAnswer(ctx, "utilization of conf_A in bankcorp");
    expect(res.intent || res.error).toBeDefined();
  });

  test("Handles recommend query gracefully", async () => {
    const res = await nlqAnswer(ctx, "recommend rooms for blr_finops in bankcorp");
    expect(res.intent || res.error).toBeDefined();
  });

  test("Handles list rooms query gracefully", async () => {
    const res = await nlqAnswer(ctx, "list rooms in blr_finops for bankcorp");
    expect(res.intent || res.error).toBeDefined();
  });
});
