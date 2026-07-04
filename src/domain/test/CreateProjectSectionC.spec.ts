import { expect } from 'chai';
import { CreateProjectSectionC } from '../project_section_c/CreateProjectSectionC';

describe('Test class CreateProject section C', () => {

  it('CreateSectionC-project_id', () => {
    // Arguments
    const project1: any = {
      project_id: "1"
    };

    // Property call
    const createProject = new CreateProjectSectionC().createSectionC(project1);
    const result = createProject.project_id;

    // Expect result
    expect(result).equals(project1.project_id);
  });

  it('CreateSectionC-project_id-missing', () => {
    // Arguments
    const project1: any = {
      project_id: ""
    };

    // Property call
    // const createProject = new CreateProjectSectionC().createSectionC(project1);
    // const result = createProject.project_id;

    // Expect result
    expect(function () { new CreateProjectSectionC().createSectionC(project1) }).to.throw('project id  missing!');
  });

  it('CreateSectionC-step1-all-ok', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        description: "some random text",
        monitoring_plan: "test",
        attach_org_structure_and_responsibilities_chart: "test",
        specific_data_monitored: "test"
      }
    };

    // Property call
    const createProject = new CreateProjectSectionC().createStep1(project1);
    const result = createProject.step1;

    // Expect result
    expect(result).equals(project1.step1);
  });

  it('CreateSectionC-step1-description-missing', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        description: "",
        monitoring_plan: "test",
        attach_org_structure_and_responsibilities_chart: "test",
        specific_data_monitored: "test"
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionC().createStep1(project1);
    // const result = createProject.step1;

    // Expect result
    expect(function () { new CreateProjectSectionC().createStep1(project1) }).to.throw('section_C step1 -> description missing!');
  });

  it('CreateSectionC-step1-monitoring_plan-missing', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        description: "test",
        monitoring_plan: "",
        attach_org_structure_and_responsibilities_chart: "test",
        specific_data_monitored: "test"
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionC().createStep1(project1);
    // const result = createProject.step1;

    // Expect result
    expect(function () { new CreateProjectSectionC().createStep1(project1) }).to.throw('section_C step1 -> monitoring_plan missing!');
  });

  it('CreateSectionC-step1-attach_org_structure_and_responsibilities_chart-missing1', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        description: "test",
        monitoring_plan: "test",
        specific_data_monitored: "test"
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionC().createStep1(project1);
    // const result = createProject.step1;

    // Expect result
    expect(function () { new CreateProjectSectionC().createStep1(project1) }).to.throw('section_C step1 -> attach_org_structure_and_responsibilities_chart missing!');
  });

  it('CreateSectionC-step1-attach_org_structure_and_responsibilities_chart-missing2', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        description: "test",
        monitoring_plan: "test",
        attach_org_structure_and_responsibilities_chart: [],
        specific_data_monitored: "test"
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionC().createStep1(project1);
    // const result = createProject.step1;

    // Expect result
    expect(function () { new CreateProjectSectionC().createStep1(project1) }).to.throw('section_C step1 -> attach_org_structure_and_responsibilities_chart missing!');
  });

  it('CreateSectionC-step1-specific_data_monitored-missing2', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        description: "test",
        monitoring_plan: "test",
        attach_org_structure_and_responsibilities_chart: ["test"],
        specific_data_monitored: ""
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionC().createStep1(project1);
    // const result = createProject.step1;

    // Expect result
    expect(function () { new CreateProjectSectionC().createStep1(project1) }).to.throw('section_C step1 -> specific_data_monitored missing!');
  });
});
