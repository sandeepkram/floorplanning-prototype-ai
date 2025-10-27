import request from "supertest";
import app from "../src/server.js";

describe("NLQ Endpoint Access Control", () => {
  test("POST /query allows correct region", async () => {
    const res = await request(app)
      .post("/query")
      .set("x-tenant-id", "bankcorp")
      .set("x-user-role", "Analyst")
      .set("x-user-region", "IN")
      .send({ q: "recommend rooms for blr_finops in bankcorp" });
    expect(res.status).toBe(200);
    expect(res.body.result).toBeDefined();
  });

  test("POST /query denies wrong region", async () => {
    const res = await request(app)
      .post("/query")
      .set("x-tenant-id", "bankcorp")
      .set("x-user-role", "Analyst")
      .set("x-user-region", "US")
      .send({ q: "recommend rooms for blr_finops in bankcorp" });
    expect(res.status).toBe(200); // app always returns 200
    expect(res.body.result.error || "").toMatch(/Access denied/);
  });
});
