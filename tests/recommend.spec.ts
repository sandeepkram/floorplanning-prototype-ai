import request from "supertest";
import app from "../src/server.js";

describe("Recommend API", () => {
  test("GET /recommend should return list", async () => {
    const res = await request(app)
      .get("/recommend?tenant_id=bankcorp&office_id=blr_finops");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("underutilized_rooms");
  });
});
