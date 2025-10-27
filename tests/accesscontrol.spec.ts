import request from "supertest";
import app from "../src/server.js";

describe("Lightweight RBAC Middleware", () => {
  test("should reject missing tenant header", async () => {
    const res = await request(app).get("/events");
    expect(res.status).toBe(400);
  });

test("should reject viewer trying POST", async () => {
  const res = await request(app)
    .post("/events")
    .set("x-tenant-id", "bankcorp")
    .set("x-user-role", "viewer")
    .send({
      tenant_id: "bankcorp",
      room_id: "confA",
      timestamp: new Date().toISOString(),
      people_count: 2,
      office_id: "blr-hq",
    });
  expect(res.status).toBe(403);
});

  test("should allow admin to POST", async () => {
    const res = await request(app)
      .post("/events")
      .set("x-tenant-id", "bankcorp")
      .set("x-user-role", "admin")
      .send({
        tenant_id: "bankcorp",
        room_id: "confA",
        timestamp: new Date().toISOString(),
        people_count: 3,
        office_id: "blr-hq",
      });
    expect([200, 201]).toContain(res.status);
  });
});
