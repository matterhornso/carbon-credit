import { expect } from 'chai';
import { CreateProjectSectionE } from '../project_section_e/CreateProjectSectionE';

describe('Test class CreateProject section E', () => {

  it('CreateSectionE-project_id', () => {
    // Arguments
    const project1: any = {
      project_id: "1"
    };

    // Property call
    const createProject = new CreateProjectSectionE().createSectionE(project1);
    const result = createProject.project_id;

    // Expect result
    expect(result).equals(project1.project_id);
  });

  // step1
  it('CreateSectionE-step1-all-ok', () => {
    // Arguments
    const project1: any = {
      project_id: "1",
      step1: {
        calculation_of_baselineEmissions_or_net_GHG: "some random text",
        attach_relevant_docs: ["45678"]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionE().createStep1(project1);
    const result = createProject.step1;

    // Expect result
    expect(result).equals(project1.step1);
  });

  it('CreateSectionE-step1-calculation_of_baselineEmissions_or_net_GHG-missing', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        calculation_of_baselineEmissions_or_net_GHG: "",
        attach_relevant_docs: ["esrdfg"]
      }
    };
    expect(function () { new CreateProjectSectionE().createStep1(project1) }).to.throw('section_E step1 -> calculation_of_baselineEmissions_or_net_GHG missing!');
  });

  it('CreateSectionE-step1-attach_relevant_docs-missing1', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        calculation_of_baselineEmissions_or_net_GHG: "some random text"
      }
    };
    expect(function () { new CreateProjectSectionE().createStep1(project1) }).to.throw('section_E step1 -> attach_relevant_docs missing!');
  });
  
  it('CreateSectionE-step1-attach_relevant_docs-missing2', () => {
    // Arguments
    const project1: any = {
      project_id: "test",
      step1: {
        calculation_of_baselineEmissions_or_net_GHG: "some random text",
        attach_relevant_docs: []
      }
    };
    expect(function () { new CreateProjectSectionE().createStep1(project1) }).to.throw('section_E step1 -> attach_relevant_docs missing!');
  });

  // step2
  it('CreateSectionE-step2-all-ok', () => {
    // Arguments
    const project2: any = {
      project_id: "1",
      step2: {
        calculation_of_projectEmissions_or_net_GHG: "some random text",
        attach_relevant_docs: ["45678"]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionE().createStep2(project2);
    const result = createProject.step2;

    // Expect result
    expect(result).equals(project2.step2);
  });

  it('CreateSectionE-step2-calculation_of_projectEmissions_or_net_GHG-missing', () => {
    // Arguments
    const project2: any = {
      project_id: "test",
      step2: {
        calculation_of_projectEmissions_or_net_GHG: "",
        attach_relevant_docs: ["esrdfg"]
      }
    };
    expect(function () { new CreateProjectSectionE().createStep2(project2) }).to.throw('section_E step2 -> calculation_of_projectEmissions_or_net_GHG missing!');
  });

  it('CreateSectionE-step2-attach_relevant_docs-missing1', () => {
    // Arguments
    const project2: any = {
      project_id: "test",
      step2: {
        calculation_of_projectEmissions_or_net_GHG: "some random text"
      }
    };
    expect(function () { new CreateProjectSectionE().createStep2(project2) }).to.throw('section_E step2 -> attach_relevant_docs missing!');
  });
  
  it('CreateSectionE-step2-attach_relevant_docs-missing2', () => {
    // Arguments
    const project2: any = {
      project_id: "test",
      step2: {
        calculation_of_projectEmissions_or_net_GHG: "some random text",
        attach_relevant_docs: []
      }
    };
    expect(function () { new CreateProjectSectionE().createStep2(project2) }).to.throw('section_E step2 -> attach_relevant_docs missing!');
  });

  // step3
  it('CreateSectionE-step3-all-ok', () => {
    // Arguments
    const project3: any = {
      project_id: "1",
      step3: {
        calculation_of_leakage: "some random text",
        attach_relevant_docs: ["45678"]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionE().createStep3(project3);
    const result = createProject.step3;

    // Expect result
    expect(result).equals(project3.step3);
  });

  it('CreateSectionE-step3-calculation_of_leakage-missing', () => {
    // Arguments
    const project3: any = {
      project_id: "test",
      step3: {
        calculation_of_leakage: "",
        attach_relevant_docs: ["esrdfg"]
      }
    };
    expect(function () { new CreateProjectSectionE().createStep3(project3) }).to.throw('section_E step3 -> calculation_of_leakage missing!');
  });

  it('CreateSectionE-step3-attach_relevant_docs-missing1', () => {
    // Arguments
    const project3: any = {
      project_id: "test",
      step3: {
        calculation_of_leakage: "some random text"
      }
    };
    expect(function () { new CreateProjectSectionE().createStep3(project3) }).to.throw('section_E step3 -> attach_relevant_docs missing!');
  });
  
  it('CreateSectionE-step3-attach_relevant_docs-missing2', () => {
    // Arguments
    const project3: any = {
      project_id: "test",
      step3: {
        calculation_of_leakage: "some random text",
        attach_relevant_docs: []
      }
    };
    expect(function () { new CreateProjectSectionE().createStep3(project3) }).to.throw('section_E step3 -> attach_relevant_docs missing!');
  });

  // step4
  it('CreateSectionE-step4-all-ok', () => {
    // Arguments
    const project4: any = {
      project_id: "1",
      step4: {
        calculation_of_emissions_reduction: "some random text",
        attach_relevant_docs: ["45678"]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionE().createStep4(project4);
    const result = createProject.step4;

    // Expect result
    expect(result).equals(project4.step4);
  });

  it('CreateSectionE-step4-calculation_of_emissions_reduction-missing', () => {
    // Arguments
    const project4: any = {
      project_id: "test",
      step4: {
        calculation_of_emissions_reduction: "",
        attach_relevant_docs: ["esrdfg"]
      }
    };
    expect(function () { new CreateProjectSectionE().createStep4(project4) }).to.throw('section_E step4 -> calculation_of_emissions_reduction missing!');
  });

  it('CreateSectionE-step4-attach_relevant_docs-missing1', () => {
    // Arguments
    const project4: any = {
      project_id: "test",
      step4: {
        calculation_of_emissions_reduction: "some random text"
      }
    };
    expect(function () { new CreateProjectSectionE().createStep4(project4) }).to.throw('section_E step4 -> attach_relevant_docs missing!');
  });
  
  it('CreateSectionE-step4-attach_relevant_docs-missing2', () => {
    // Arguments
    const project4: any = {
      project_id: "test",
      step4: {
        calculation_of_emissions_reduction: "some random text",
        attach_relevant_docs: []
      }
    };
    expect(function () { new CreateProjectSectionE().createStep4(project4) }).to.throw('section_E step4 -> attach_relevant_docs missing!');
  });

  // step5
  it('CreateSectionE-step5-all-ok', () => {
    // Arguments
    const project5: any = {
      project_id: "1",
      step5: {
        comparison_of_actual_emission_reduction: "some random text",
        attach_relevant_docs: ["45678"]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionE().createStep5(project5);
    const result = createProject.step5;

    // Expect result
    expect(result).equals(project5.step5);
  });

  it('CreateSectionE-step5-comparison_of_actual_emission_reduction-missing', () => {
    // Arguments
    const project5: any = {
      project_id: "test",
      step5: {
        comparison_of_actual_emission_reduction: "",
        attach_relevant_docs: ["esrdfg"]
      }
    };
    expect(function () { new CreateProjectSectionE().createStep5(project5) }).to.throw('section_E step5 -> comparison_of_actual_emission_reduction missing!');
  });

  it('CreateSectionE-step5-attach_relevant_docs-missing1', () => {
    // Arguments
    const project5: any = {
      project_id: "test",
      step5: {
        comparison_of_actual_emission_reduction: "some random text"
      }
    };
    expect(function () { new CreateProjectSectionE().createStep5(project5) }).to.throw('section_E step5 -> attach_relevant_docs missing!');
  });
  
  it('CreateSectionE-step5-attach_relevant_docs-missing2', () => {
    // Arguments
    const project5: any = {
      project_id: "test",
      step5: {
        comparison_of_actual_emission_reduction: "some random text",
        attach_relevant_docs: []
      }
    };
    expect(function () { new CreateProjectSectionE().createStep5(project5) }).to.throw('section_E step5 -> attach_relevant_docs missing!');
  });

  // step6
  it('CreateSectionE-step6-all-ok', () => {
    // Arguments
    const project6: any = {
      project_id: "1",
      step6: {
        remark_on_difference_from_estimate_value: "some random text",
        attach_relevant_docs: ["45678"]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionE().createStep6(project6);
    const result = createProject.step6;

    // Expect result
    expect(result).equals(project6.step6);
  });

  it('CreateSectionE-step6-remark_on_difference_from_estimate_value-missing', () => {
    // Arguments
    const project6: any = {
      project_id: "test",
      step6: {
        remark_on_difference_from_estimate_value: "",
        attach_relevant_docs: ["esrdfg"]
      }
    };
    expect(function () { new CreateProjectSectionE().createStep6(project6) }).to.throw('section_E step6 -> remark_on_difference_from_estimate_value missing!');
  });

  it('CreateSectionE-step6-attach_relevant_docs-missing1', () => {
    // Arguments
    const project6: any = {
      project_id: "test",
      step6: {
        remark_on_difference_from_estimate_value: "some random text"
      }
    };
    expect(function () { new CreateProjectSectionE().createStep6(project6) }).to.throw('section_E step6 -> attach_relevant_docs missing!');
  });
  
  it('CreateSectionE-step6-attach_relevant_docs-missing2', () => {
    // Arguments
    const project6: any = {
      project_id: "test",
      step6: {
        remark_on_difference_from_estimate_value: "some random text",
        attach_relevant_docs: []
      }
    };
    expect(function () { new CreateProjectSectionE().createStep6(project6) }).to.throw('section_E step6 -> attach_relevant_docs missing!');
  });

  // step7
  it('CreateSectionE-step7-all-ok', () => {
    // Arguments
    const project7: any = {
      project_id: "1",
      step7: {
        actual_emission_reductions: "some random text",
        attach_relevant_docs: ["45678"]
      }
    };

    // Property call
    const createProject = new CreateProjectSectionE().createStep7(project7);
    const result = createProject.step7;

    // Expect result
    expect(result).equals(project7.step7);
  });

  it('CreateSectionE-step7-actual_emission_reductions-missing', () => {
    // Arguments
    const project7: any = {
      project_id: "test",
      step7: {
        actual_emission_reductions: "",
        attach_relevant_docs: ["esrdfg"]
      }
    };
    expect(function () { new CreateProjectSectionE().createStep7(project7) }).to.throw('section_E step7 -> actual_emission_reductions missing!');
  });

  it('CreateSectionE-step7-attach_relevant_docs-missing1', () => {
    // Arguments
    const project7: any = {
      project_id: "test",
      step7: {
        actual_emission_reductions: "some random text"
      }
    };
    expect(function () { new CreateProjectSectionE().createStep7(project7) }).to.throw('section_E step7 -> attach_relevant_docs missing!');
  });
  
  it('CreateSectionE-step7-attach_relevant_docs-missing2', () => {
    // Arguments
    const project7: any = {
      project_id: "test",
      step7: {
        actual_emission_reductions: "some random text",
        attach_relevant_docs: []
      }
    };
    expect(function () { new CreateProjectSectionE().createStep7(project7) }).to.throw('section_E step7 -> attach_relevant_docs missing!');
  });
});
