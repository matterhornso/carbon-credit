import { expect } from 'chai';
import { CreateProjectSectionD } from '../project_section_d/CreateProjectSectionD';

describe('Test class CreateProject section D', () => {

  it('CreateSectionD-project_id', () => {
    // Arguments
    const project1: any = {
      project_id: "1"
    };

    // Property call
    const createProject = new CreateProjectSectionD().createSectionD(project1);
    const result = createProject.project_id;

    // Expect result
    expect(result).equals(project1.project_id);
  });

  it('CreateSectionD-step1', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        data_and_parameter_fixed_ExAnte: "some random text",
        attach_ex_ante_table: ["45678"]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionD().createStep1(project1);
    const result = createProject.step1;

    // Expect result
    expect(result).equals(project1.step1);
  });

  it('CreateSectionD-step1-no-data', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        data_and_parameter_fixed_ExAnte: "",
        attach_ex_ante_table: ["esrdfg"]
      }
    };
    expect(function () { new CreateProjectSectionD().createStep1(project1) }).to.throw('section_D step1 -> description missing!');
  });

  it('CreateSectionD-step1-no-attachment', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        data_and_parameter_fixed_ExAnte: "some random text",
        attach_ex_ante_table: []
      }
    };
    expect(function () { new CreateProjectSectionD().createStep1(project1) }).to.throw('section_D step1 -> attach_ex_ante_table missing!');
  });

  it('CreateSectionD-step2-no-data', () => {
    // Arguments
    const project1: any = {
      project_id: "2",
      step2: {
        data_and_parameter_monitored_ExPost: "",
        attach_ex_ante_table: ["55"]
      }
    };
    expect(function () { new CreateProjectSectionD().createStep2(project1) }).to.throw('section_D step2 -> description missing!');
  });

  it('CreateSectionD-step2-no-attachment', () => {
    // Arguments
    const project1: any = {
      project_id: "3",
      step2: {
        data_and_parameter_monitored_ExPost: "some random text",
        attach_ex_ante_table: []
      }
    };
    expect(function () { new CreateProjectSectionD().createStep2(project1) }).to.throw('section_D step2 -> monitoring_plan missing!');
  });

  it('CreateSectionD-step3-no-text', () => {
    // Arguments
    const project1: any = {
      project_id: "3",
      step3: {
        implementation_of_sampling_plan: ""
      }
    };
    expect(function () { new CreateProjectSectionD().createStep3(project1) }).to.throw('section_D step3 -> implementation_of_sampling_plan missing!');
  });
});
