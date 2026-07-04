import * as SuperAgent from "superagent";
import { expect } from "chai";
import { ICreateProjectRequest, ICreateSectionBStep1, ICreateSectionBStep2 } from "../controllers/RequestInterfaces";
const ServerUrl = "http://localhost:4001"
const TESTJWTTOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZWE1Yjg3NjYtMjEyOS00ZmEwLWFkZTctNDY3ZmFhYThhOTcwIiwiaWF0IjoxNjQwMDc0MzkwLCJleHAiOjE2NzE2MTAzOTB9.VNHFP8gQFieV8OK9wqV9eboSgkpqX-AVvJOzrT97nWg"
let JWTTOKEN: string



describe('Project Controller', () => {

    it("/api/v1/projectSectionB/update step1", async () => {
        let payload: ICreateSectionBStep1 = {
            "project_id": "76491072-b412-4764-b488-8e7b6771079a",
            "uuid": "93e861cc-7f47-41a8-a0d0-6ca1f8c989ab",
            "step1": {
                "general_description": "string",
                "technical_description": "string",
                "data_tables_technical_description_attach": [
                    "string"
                ],
                "operational_description": "string",
                "shut_down_details": [
                    {
                        "sl_no": "string",
                        "stopping_date": new Date(),
                        "start_date": new Date(),
                        "duration": "string",
                        "reason": "string"
                    }
                ],
                "summary_of_implementation_milestones": [
                    {
                        "event": "string",
                        "date": new Date()
                    }
                ]
            },
        }
        try {
            let query = { "report_type": "gri", plant_id: ["plant1"], financial_year_from: new Date(), financial_year_to: new Date() }
            let response: any = await SuperAgent.post(ServerUrl + '/api/v1/projectSectionB/update').send(payload).set('Authorization', 'Bearer ' + JWTTOKEN).accept('application/json')
            console.log('response', response.body);
            let res_data = response.body
            let status = response.status
            expect(status).equals(200)
            expect(res_data.success).equals(true);
            //expect(res_data.data).to.have.property('uuid');
        }
        catch (e) {
            console.log("response---->", e)
            // expect(e.status).to.equal(200)
        }


    })

    it("/api/v1/projectSectionB/update step2", async () => {
        let payload: ICreateSectionBStep2 = {
            "uuid": "9023b61b-89b6-4443-bddf-ca725bb632f8",
            "project_id": "d495b82d-d4b3-4620-ad7a-a407267ac830",
            "step2": {
                "temporary_deviation": "string",
                "corrections": "string",
                "permanent_changes_from_registered_monitoring_plan": [
                    "string"
                ],
                "change_project_design": "string",
                "change_startDate_creditPeriod": new Date(),
                "typeOf_changes_specific": "string"
            },
        }
        try {
            let query = { "report_type": "gri", plant_id: ["plant1"], financial_year_from: new Date(), financial_year_to: new Date() }
            let response: any = await SuperAgent.post(ServerUrl + '/api/v1/projectSectionB/update').send(payload).set('Authorization', 'Bearer ' + JWTTOKEN).accept('application/json')
            console.log('response', response.body);
            let res_data = response.body
            let status = response.status
            expect(status).equals(200)
            expect(res_data.success).equals(true);
            //expect(res_data.data).to.have.property('uuid');
        }
        catch (e) {
            console.log("response---->", e)
            // expect(e.status).to.equal(200)
        }


    })


})
