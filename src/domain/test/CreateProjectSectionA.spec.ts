import { expect } from 'chai';
import { CreateProjectSectionA } from '../project_section_a/CreateProjectSectionA';

describe('Test class CreateProject', () => {

  it('CreateSectionA-project_id', () => {
    // Arguments
    const project1: any = {
      project_id: "test"
    };

    // Property call
    const createProject = new CreateProjectSectionA().createSectionA(project1);
    const result = createProject.project_id;

    // Expect result
    expect(result).equals(project1.project_id);
  });

  it('CreateSectionA-step1', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        brief_description_installed_tech: "brief",
        project_comissioning_date: new Date(),
        construction_date: "construct",
        measure_taken_for_gas_emissions: "measure",
        operation_period: "operation",
        purpose_and_description: "purpose",
        total_GHG_emission: "total"
      }
    };

    // Property call
    const createProject = new CreateProjectSectionA().createStep1(project1);
    const result = createProject.step1;

    // Expect result
    expect(result).equals(project1.step1);
  });

  it('CreateSectionA-step1-no brief', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        construction_date: "construct",
        project_comissioning_date: new Date(),
        measure_taken_for_gas_emissions: "measure",
        operation_period: "operation",
        purpose_and_description: "purpose",
        total_GHG_emission: "total"
      }
    };
    expect(function () { new CreateProjectSectionA().createStep1(project1) }).to.throw('section_A step1 -> brief_description_installed_tech missing!');
  });

  it('CreateSectionA-step1-no construction', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        brief_description_installed_tech: "brief",
        project_comissioning_date: new Date(),
        measure_taken_for_gas_emissions: "measure",
        operation_period: "operation",
        purpose_and_description: "purpose",
        total_GHG_emission: "total"
      }
    };
    expect(function () { new CreateProjectSectionA().createStep1(project1) }).to.throw('section_A step1 -> construction_date missing!');
  });

  it('CreateSectionA-step1-no measure', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        brief_description_installed_tech: "brief",
        project_comissioning_date: new Date(),
        construction_date: "construct",
        operation_period: "operation",
        purpose_and_description: "purpose",
        total_GHG_emission: "total"
      }
    };
    expect(function () { new CreateProjectSectionA().createStep1(project1) }).to.throw('section_A step1 -> measure_taken_for_gas_emissions missing!');
  });

  it('CreateSectionA-step1-no operation', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        brief_description_installed_tech: "brief",
        project_comissioning_date: new Date(),
        construction_date: "construct",
        measure_taken_for_gas_emissions: "measure",
        purpose_and_description: "purpose",
        total_GHG_emission: "total"
      }
    };
    expect(function () { new CreateProjectSectionA().createStep1(project1) }).to.throw('section_A step1 -> operation_period missing!');
  });

  it('CreateSectionA-step1-no purpose', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        brief_description_installed_tech: "brief",
        project_comissioning_date: new Date(),
        construction_date: "construct",
        measure_taken_for_gas_emissions: "measure",
        operation_period: "operation",
        total_GHG_emission: "total"
      }
    };
    expect(function () { new CreateProjectSectionA().createStep1(project1) }).to.throw('section_A step1 -> purpose_and_description missing!');
  });

  it('CreateSectionA-step1-no total', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        brief_description_installed_tech: "brief",
        project_comissioning_date: new Date(),
        construction_date: "construct",
        measure_taken_for_gas_emissions: "measure",
        operation_period: "operation",
        purpose_and_description: "purpose",
      }
    };
    expect(function () { new CreateProjectSectionA().createStep1(project1) }).to.throw('section_A step1 -> total_GHG_emission missing!');
  });

  it('CreateSectionA-step2', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step2: {
        country: "country",
        state: "state",
        city: "city",
        village: "village",
        pincode: ["pincode"],
        landmark: "landmark",
        file_attach: ["file"]
      }
    };

    const createProject = new CreateProjectSectionA().createStep2(project1);
    const result = createProject.step2;

    // Expect result
    expect(result).equals(project1.step2);
  });

  it('CreateSectionA-step2-no country', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step2: {
        state: "state",
        city: "city",
        village: "village",
        pincode: ["pincode"],
        landmark: "landmark",
        file_attach: ["file"]
      }
    };
    expect(function () { new CreateProjectSectionA().createStep2(project1) }).to.throw('section_A step2 -> country missing!');
  });

  it('CreateSectionA-step2-no state', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step2: {
        country: "country",
        city: "city",
        village: "village",
        pincode: ["pincode"],
        landmark: "landmark",
        file_attach: ["file"]
      }
    };
    expect(function () { new CreateProjectSectionA().createStep2(project1) }).to.throw('section_A step2 -> state missing!');
  });

  it('CreateSectionA-step2-no city', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step2: {
        country: "country",
        state: "state",
        village: "village",
        pincode: ["pincode"],
        landmark: "landmark",
        file_attach: ["file"]
      }
    };
    expect(function () { new CreateProjectSectionA().createStep2(project1) }).to.throw('section_A step2 -> city missing!');
  });

  it('CreateSectionA-step2-no village', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step2: {
        country: "country",
        state: "state",
        city: "city",
        pincode: ["pincode"],
        landmark: "landmark",
        file_attach: ["file"]
      }
    };
    expect(function () { new CreateProjectSectionA().createStep2(project1) }).to.throw('section_A step2 -> village missing!');
  });

  it('CreateSectionA-step2-no pincode', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step2: {
        country: "country",
        state: "state",
        city: "city",
        village: "village",
        landmark: "landmark",
        file_attach: ["file"]
      }
    };
    expect(function () { new CreateProjectSectionA().createStep2(project1) }).to.throw('section_A step2 -> pincode missing!');
  });

  it('CreateSectionA-step2-no landmark', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step2: {
        country: "country",
        state: "state",
        city: "city",
        village: "village",
        pincode: ["pincode"],
        file_attach: ["file"]
      }
    };
    expect(function () { new CreateProjectSectionA().createStep2(project1) }).to.throw('section_A step2 -> landmark missing!');
  });

  it('CreateSectionA-step2-no file', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step2: {
        country: "country",
        state: "state",
        city: "city",
        village: "village",
        pincode: ["pincode"],
        landmark: "landmark",
      }
    };
    expect(function () { new CreateProjectSectionA().createStep2(project1) }).to.throw('section_A step2 -> file_attach missing!');
  });

  // it('CreateSectionA-step2-no country', () => {
  //     // Arguments
  //     const project1: any = {
  //         project_id: "test",
  //         step2: {
  //             country: "country",
  //             state: "state",
  //             city: "city",
  //             village: "village",
  //             pincode: ["pincode"],
  //             file_attach: ["file"]
  //         }
  //     };
  //     expect(function(){new CreateProjectSectionA().createStep2(project1)}).to.throw('section_A step2 -> country missing!');
  // });

  it('CreateSectionA-step3', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step3: {
        party_and_project_participants: [{
          party_involved: "string",
          private_or_public_project_participant: "string",
          indicate_party_involved: "string"
        }
        ]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionA().createStep3(project1);
    const result = createProject.step3;

    // Expect result
    expect(result).equals(project1.step3);
  });

  it('CreateSectionA-step4-single-object', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step4: {
        methodologies: [{
          methodology: "string",
          project_type: "string",
          category: "string",
          version: "string",
          tools: "string"
        }]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionA().createStep4(project1);
    const result = createProject.step4;

    // Expect result
    expect(result).equals(project1.step4);
  });

  it('CreateSectionA-step4-multiple-object', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step4: {
        methodologies: [{
          methodology: "string",
          project_type: "string",
          category: "string",
          version: "string",
          tools: "string"
        },{
          methodology: "string",
          project_type: "string",
          category: "string",
          version: "string",
          tools: "string"
        }]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionA().createStep4(project1);
    const result = createProject.step4;

    // Expect result
    expect(result).equals(project1.step4);
  });

  it('CreateSectionA-step5', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step5: {
        credit_start_period: new Date(),
        credit_period: {
          start_date: new Date(),
          end_date: new Date()
        },
        credit_period_description: "credit_period_description"
      }
    };

    // Property call
    const createProject = new CreateProjectSectionA().createStep5(project1);
    const result = createProject.step5;

    // Expect result
    expect(result).equals(project1.step5);
  });

});
