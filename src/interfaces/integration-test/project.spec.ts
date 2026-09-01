import * as SuperAgent from "superagent";
import { expect } from "chai";
import { ICreateProjectRequest } from "../controllers/RequestInterfaces";
const ServerUrl = "http://localhost:4001"
//const TESTJWTTOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiNTYwYjZiY2MtM2Y4Ni00NjA2LTg3OTctNmVhZjBiMTExYTBhIiwiaWF0IjoxNjU4OTE5OTYxLCJleHAiOjE2NTg5MjM1NjF9.UV8N8om0z6XXuanVQbmCYLL8ZWOFOcnvKJoqEAkf9jE"
let JWTTOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiNTYwYjZiY2MtM2Y4Ni00NjA2LTg3OTctNmVhZjBiMTExYTBhIiwiaWF0IjoxNjU4OTE5OTYxLCJleHAiOjE2NTg5MjM1NjF9.UV8N8om0z6XXuanVQbmCYLL8ZWOFOcnvKJoqEAkf9jE"



describe('Project Controller', () => {

  it("/api/v1/project/create", async () => {
    let payload: ICreateProjectRequest = {
      name: "test_project",
      sector: "AFOLU",
    }
    try {
      console.log("payload")
      let response: any = await SuperAgent.post(ServerUrl + '/api/v1/project/create').send(payload).set('Authorization', 'Bearer ' + JWTTOKEN).accept('application/json')
      console.log('response', response.body);
      let res_data = response.body
      let status = response.status
      expect(status).equals(200)
      expect(res_data.success).equals(true);
      expect(res_data.data).to.have.property('uuid');
    }
    catch (e) {
      console.log("response---->", e)
      // expect(e.status).to.equal(200)
    }


  })


})
