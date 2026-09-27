// Live integration check for the project controller.
//
// History worth knowing: the previous version of this file wrapped the whole
// test in a try/catch whose only assertion was commented out. It printed a full
// 500 error dump and then reported a pass — for years, on every commit, since
// the pre-commit hook runs this suite. A test that cannot fail is a test that
// has already failed.
//
// It needs two things it cannot provision for itself: a running server and a
// JWT that server will accept. When either is missing the suite is SKIPPED —
// mocha reports it as pending, which is visibly different from passing. When
// both are present, it asserts for real and nothing is swallowed.

import * as SuperAgent from "superagent";
import { expect } from "chai";
import { ICreateProjectRequest } from "../controllers/RequestInterfaces";

const ServerUrl = process.env["INTEGRATION_SERVER_URL"] || "http://localhost:4001";
const JWT = process.env["INTEGRATION_JWT"];

async function serverIsUp(): Promise<boolean> {
  try {
    await SuperAgent.get(ServerUrl + "/healthz").timeout({ response: 2000, deadline: 3000 }).ok(() => true);
    return true;
  } catch {
    return false;
  }
}

describe("Project Controller (live)", function () {

  before(async function () {
    if (!JWT) {
      // No token literal is kept in this file. The one that used to be here was
      // issued in 2022 and sat in a public repository for four years.
      console.log("  skipped: set INTEGRATION_JWT to a token the server accepts");
      this.skip();
    }
    if (!(await serverIsUp())) {
      console.log(`  skipped: no server answering at ${ServerUrl}`);
      this.skip();
    }
  });

  it("POST /api/v1/project/create returns the created project", async () => {
    const payload: ICreateProjectRequest = {
      name: "integration_test_project",
      sector: "AFOLU",
    };

    // No try/catch. A non-2xx status rejects here and fails the test, which
    // is the entire point.
    const response = await SuperAgent
      .post(ServerUrl + "/api/v1/project/create")
      .send(payload)
      .set("Authorization", "Bearer " + JWT)
      .accept("application/json");

    expect(response.status).to.equal(200);
    expect(response.body.success).to.equal(true);
    expect(response.body.data).to.have.property("uuid");
  });
});
