import request from "supertest";
import app from "../src/server.js";

describe("Events API", () => {
  test("GET /events should return array", async () => {
    const res = await request(app)
      .get("/events?tenant_id=bankcorp")
      .set("x-user-role", "admin")
      .set("x-user-region", "IN")
      .set("x-tenant-id", "bankcorp");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /events should accept new event", async () => {
    const event = {
      tenant_id: "bankcorp",
      office_id: "blr_finops",
      room_id: "conf_A",
      timestamp: new Date().toISOString(),
      present: true,
      people_count: 3,
    };
    const res = await request(app)
      .post("/events")
      .set("x-user-role", "admin")
      .set("x-user-region", "IN")
      .set("x-tenant-id", "bankcorp")
      .send(event);

    expect([200, 201]).toContain(res.status);
  });
});
