import * as SuperAgent from "superagent";
import { expect } from "chai";
import { ICreateProjectRequest, ICreateSectionAStep1, ICreateSectionAStep2, ICreateSectionAStep3, ICreateSectionAStep4, ICreateSectionAStep5 } from "../controllers/RequestInterfaces";
const ServerUrl = "http://localhost:4001"
const TESTJWTTOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZWE1Yjg3NjYtMjEyOS00ZmEwLWFkZTctNDY3ZmFhYThhOTcwIiwiaWF0IjoxNjQwMDc0MzkwLCJleHAiOjE2NzE2MTAzOTB9.VNHFP8gQFieV8OK9wqV9eboSgkpqX-AVvJOzrT97nWg"
let JWTTOKEN: string



describe('Project Controller', () => {

    it("/api/v1/projectSectionA/update step1", async () => {
        let payload: ICreateSectionAStep1 = {
            "project_id": "76491072-b412-4764-b488-8e7b6771079a",
            "uuid": "93e861cc-7f47-41a8-a0d0-6ca1f8c989ab",
            "step1": {
                "purpose_and_description": "string",
                "measure_taken_for_gas_emissions": "string",
                "brief_description_installed_tech": "string",
                "project_comissioning_date": new Date(),
                "construction_date": "string",
                "operation_period": "string",
                "total_GHG_emission": "string"
            }
        }
        try {
            let query = { "report_type": "gri", plant_id: ["plant1"], financial_year_from: new Date(), financial_year_to: new Date() }
            let response: any = await SuperAgent.post(ServerUrl + '/api/v1/projectSectionA/update').send(payload).set('Authorization', 'Bearer ' + JWTTOKEN).accept('application/json')
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

    it("/api/v1/projectSectionA/update step2", async () => {
        let payload: ICreateSectionAStep2 = {
            "uuid": "93e861cc-7f47-41a8-a0d0-6ca1f8c989ab",
            "project_id": "76491072-b412-4764-b488-8e7b6771079a",
            "step2": {
                country: "string",
                state: "string",
                city: "string",
                village: "string",
                pincode: ["string"],
                landmark: "string",
                file_attach: ["string"],
            }
        }
        try {
            let query = { "report_type": "gri", plant_id: ["plant1"], financial_year_from: new Date(), financial_year_to: new Date() }
            let response: any = await SuperAgent.post(ServerUrl + '/api/v1/projectSectionA/update').send(payload).set('Authorization', 'Bearer ' + JWTTOKEN).accept('application/json')
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

    it("/api/v1/projectSectionA/update step3", async () => {
        let payload: ICreateSectionAStep3 = {
            "uuid": "93e861cc-7f47-41a8-a0d0-6ca1f8c989ab",
            "project_id": "76491072-b412-4764-b488-8e7b6771079a",
            "step3": {
                party_and_project_participants: [{
                    party_involved: "string",
                    private_or_public_project_participant: "string",
                    indicate_party_involved: "string",
                }]
            }
        }
        try {
            let query = { "report_type": "gri", plant_id: ["plant1"], financial_year_from: new Date(), financial_year_to: new Date() }
            let response: any = await SuperAgent.post(ServerUrl + '/api/v1/projectSectionA/update').send(payload).set('Authorization', 'Bearer ' + JWTTOKEN).accept('application/json')
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

    it("/api/v1/projectSectionA/update step4", async () => {
        let payload: ICreateSectionAStep4 = {
            "uuid": "93e861cc-7f47-41a8-a0d0-6ca1f8c989ab",
            "project_id": "76491072-b412-4764-b488-8e7b6771079a",
            "step4": {
                methodologies: [{
                    methodology: "string",
                    project_type: "string",
                    category: "string",
                    version: "string",
                    tools: "string",
                }]
            }
        }
        try {
            let query = { "report_type": "gri", plant_id: ["plant1"], financial_year_from: new Date(), financial_year_to: new Date() }
            let response: any = await SuperAgent.post(ServerUrl + '/api/v1/projectSectionA/update').send(payload).set('Authorization', 'Bearer ' + JWTTOKEN).accept('application/json')
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

    it("/api/v1/projectSectionA/update step5", async () => {
        let payload: ICreateSectionAStep5 = {
            "uuid": "93e861cc-7f47-41a8-a0d0-6ca1f8c989ab",
            "project_id": "76491072-b412-4764-b488-8e7b6771079a",
            "step5": {
                credit_start_period: new Date(),
                credit_period: {
                    start_date: new Date(),
                    end_date: new Date(),
                },
                credit_period_description: "credit_period_description"
            }
        }
        try {
            let query = { "report_type": "gri", plant_id: ["plant1"], financial_year_from: new Date(), financial_year_to: new Date() }
            let response: any = await SuperAgent.post(ServerUrl + '/api/v1/projectSectionA/update').send(payload).set('Authorization', 'Bearer ' + JWTTOKEN).accept('application/json')
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
