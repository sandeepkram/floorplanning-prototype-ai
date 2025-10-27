import request from "supertest";
import app from "../src/server.js";

describe("Utilization API", () => {
  test("GET /utilization should respond with object", async () => {
    const res = await request(app)
      .get("/utilization?tenant_id=bankcorp&room_id=conf_A");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("average_people");
  });
});
