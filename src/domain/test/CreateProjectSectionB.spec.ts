import { expect } from 'chai';
import { CreateProjectSectionB } from '../project_section_b/CreateProjectSectionB';

describe('Test class CreateProject section B', () => {

  it('CreateSectionB-project_id', () => {
    // Arguments
    const project1: any = {
      project_id: "1"
    };

    // Property call
    const createProject = new CreateProjectSectionB().createSectionB(project1);
    const result = createProject.project_id;

    // Expect result
    expect(result).equals(project1.project_id);
  });

  it('CreateSectionB-project_id-missing', () => {
    // Arguments
    const project1: any = {
      project_id: ""
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createSectionB(project1);
    // const result = createProject.project_id;

    // Expect result
    expect(function () { new CreateProjectSectionB().createSectionB(project1) }).to.throw('project id  missing!');
  });

  it('CreateSectionB-step1-all-ok', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        general_description: "some random text",
        technical_description: "test",
        data_tables_technical_description_attach: "test",
        operational_description: "test",
        shut_down_details: [
          {
            "sl_no": 1,
            "stopping_date": "1/2/3",
            "start_date": "1/2/3",
            "duration": "365",
            "reason": "lorem"
          }
        ]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionB().createStep1(project1);
    const result = createProject.step1;

    // Expect result
    expect(result).equals(project1.step1);
  });

  it('CreateSectionB-step1-general-desc-missing', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        general_description: "",
        technical_description: "test",
        data_tables_technical_description_attach: "test",
        operational_description: "test",
        shut_down_details: [
          {
            "sl_no": 1,
            "stopping_date": "1/2/3",
            "start_date": "1/2/3",
            "duration": "365",
            "reason": "lorem"
          }
        ]
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep1(project1);
    // const result = createProject.step1;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep1(project1) }).to.throw('section_B step1 -> general_description missing!');
  });

  it('CreateSectionB-step1-technical-desc-missing', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        general_description: "test",
        technical_description: "",
        data_tables_technical_description_attach: "test",
        operational_description: "test",
        shut_down_details: [
          {
            "sl_no": 1,
            "stopping_date": "1/2/3",
            "start_date": "1/2/3",
            "duration": "365",
            "reason": "lorem"
          }
        ]
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep1(project1);
    // const result = createProject.step1;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep1(project1) }).to.throw('section_B step1 -> technical_description missing!');
  });

  it('CreateSectionB-step1-data_tables_technical_description_attach-missing', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        general_description: "test",
        technical_description: "test",
        data_tables_technical_description_attach: "",
        operational_description: "test",
        shut_down_details: [
          {
            "sl_no": 1,
            "stopping_date": "1/2/3",
            "start_date": "1/2/3",
            "duration": "365",
            "reason": "lorem"
          }
        ]
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep1(project1);
    // const result = createProject.step1;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep1(project1) }).to.throw('section_B step1 -> data_tables_technical_description_attach missing!');
  });

  it('CreateSectionB-step1-operational_description-missing', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        general_description: "test",
        technical_description: "test",
        data_tables_technical_description_attach: "test",
        operational_description: "",
        shut_down_details: [
          {
            "sl_no": 1,
            "stopping_date": "1/2/3",
            "start_date": "1/2/3",
            "duration": "365",
            "reason": "lorem"
          }
        ]
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep1(project1);
    // const result = createProject.step1;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep1(project1) }).to.throw('section_B step1 -> operational_description missing!');
  });

  it('CreateSectionB-step1-shut_down_details-missing', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        general_description: "test",
        technical_description: "test",
        data_tables_technical_description_attach: "test",
        operational_description: "test",
        // shut_down_details: []
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep1(project1);
    // const result = createProject.step1;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep1(project1) }).to.throw('section_B step1 -> shut_down_details missing!');
  });

  it('CreateSectionB-step2-all-ok', () => {
    // Arguments
    const project2: any = {
      project_id: "1",
      step2: {
        temporary_deviation: "some random text",
        corrections: "test",
        permanent_changes_from_registered_monitoring_plan: "test",
        change_project_design: "test",
        change_startDate_creditPeriod: "test",
        typeOf_changes_specific: "test"
      }
    };

    // Property call
    const createProject = new CreateProjectSectionB().createStep2(project2);
    const result = createProject.step2;

    // Expect result
    expect(result).equals(project2.step2);
  });

  it('CreateSectionB-step2-temporary_deviation-missing', () => {
    // Arguments
    const project2: any = {
      project_id: "1",
      step2: {
        temporary_deviation: "",
        corrections: "test",
        permanent_changes_from_registered_monitoring_plan: "test",
        change_project_design: "test",
        change_startDate_creditPeriod: "test",
        typeOf_changes_specific: "test"
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep2(project2);
    // const result = createProject.step2;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep2(project2) }).to.throw('section_B step2 -> temporary_deviation missing!');
  });

  it('CreateSectionB-step2-corrections-missing', () => {
    // Arguments
    const project2: any = {
      project_id: "1",
      step2: {
        temporary_deviation: "test",
        corrections: "",
        permanent_changes_from_registered_monitoring_plan: "test",
        change_project_design: "test",
        change_startDate_creditPeriod: "test",
        typeOf_changes_specific: "test"
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep2(project2);
    // const result = createProject.step2;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep2(project2) }).to.throw('section_B step2 -> corrections missing!');
  });

  it('CreateSectionB-step2-permanent_changes_from_registered_monitoring_plan-missing', () => {
    // Arguments
    const project2: any = {
      project_id: "1",
      step2: {
        temporary_deviation: "test",
        corrections: "test",
        permanent_changes_from_registered_monitoring_plan: "",
        change_project_design: "test",
        change_startDate_creditPeriod: "test",
        typeOf_changes_specific: "test"
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep2(project2);
    // const result = createProject.step2;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep2(project2) }).to.throw('section_B step2 -> permanent_changes_from_registered_monitoring_plan missing!');
  });

  it('CreateSectionB-step2-change_project_design-missing', () => {
    // Arguments
    const project2: any = {
      project_id: "1",
      step2: {
        temporary_deviation: "test",
        corrections: "test",
        permanent_changes_from_registered_monitoring_plan: "test",
        change_project_design: "",
        change_startDate_creditPeriod: "test",
        typeOf_changes_specific: "test"
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep2(project2);
    // const result = createProject.step2;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep2(project2) }).to.throw('section_B step2 -> change_project_design missing!');
  });

  it('CreateSectionB-step2-change_startDate_creditPeriod-missing', () => {
    // Arguments
    const project2: any = {
      project_id: "1",
      step2: {
        temporary_deviation: "test",
        corrections: "test",
        permanent_changes_from_registered_monitoring_plan: "test",
        change_project_design: "test",
        change_startDate_creditPeriod: "",
        typeOf_changes_specific: "test"
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep2(project2);
    // const result = createProject.step2;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep2(project2) }).to.throw('section_B step2 -> change_startDate_creditPeriod missing!');
  });

  it('CreateSectionB-step2-typeOf_changes_specific-missing', () => {
    // Arguments
    const project2: any = {
      project_id: "1",
      step2: {
        temporary_deviation: "test",
        corrections: "test",
        permanent_changes_from_registered_monitoring_plan: "test",
        change_project_design: "test",
        change_startDate_creditPeriod: "test",
        typeOf_changes_specific: ""
      }
    };

    // Property call
    // const createProject = new CreateProjectSectionB().createStep2(project2);
    // const result = createProject.step2;

    // Expect result
    expect(function () { new CreateProjectSectionB().createStep2(project2) }).to.throw('section_B step2 -> typeOf_changes_specific missing!');
  });

});
