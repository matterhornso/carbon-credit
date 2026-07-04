import { expect } from 'chai';
import { CreateProject } from '../project/CreateProject';

describe('Test class CreateProject', () => {

  it('CreateProject-uuid', () => {
    // Arguments
    const project1: any = {
      company_name: "test_company",
      start_date: new Date(),
      type: "project_type",
      location: "Banglore",
      duration: 1223,
      area: "BTM"
    };
    const uuid1 = 'Oha';

    // Property call
    const createProject = new CreateProject(project1);
    createProject.uuid = uuid1;
    const result = createProject.uuid;

    // Expect result
    expect(result).equals(uuid1);
  });

  it('CreateProject-company_name', () => {
    // Arguments
    const project2: any = {
      company_name: "test_company",
      start_date: new Date(),
      type: "project_type",
      location: "Banglore",
      duration: 1223,
      area: "BTM"
    };
    const company_name1 = 'Oha';

    // Property call
    const createProject = new CreateProject(project2);
    createProject.company_name = company_name1;
    const result = createProject.company_name;

    // Expect result
    expect(result).equals(company_name1);
  });

  it('CreateProject-type', () => {
    // Arguments
    const project3: any = {
      company_name: "test_company",
      start_date: new Date(),
      type: "project_type",
      location: "Banglore",
      duration: 1223,
      area: "BTM"
    };
    const type1 = 'Oha';

    // Property call
    const createProject = new CreateProject(project3);
    createProject.type = type1;
    const result = createProject.type;

    // Expect result
    expect(result).equals(type1);
  });

  it('CreateProject-location', () => {
    // Arguments
    const project4: any = {
      company_name: "test_company",
      start_date: new Date(),
      type: "project_type",
      location: "Banglore",
      duration: 1223,
      area: "BTM"
    };
    const location1 = 'Oha';

    // Property call
    const createProject = new CreateProject(project4);
    createProject.location = location1;
    const result = createProject.location;

    // Expect result
    expect(result).equals(location1);
  });

  it('CreateProject-duration', () => {
    // Arguments
    const project5: any = {
      company_name: "test_company",
      start_date: new Date(),
      type: "project_type",
      location: "Banglore",
      duration: 1223,
      area: "BTM"
    };
    const duration1 = 123;

    // Property call
    const createProject = new CreateProject(project5);
    createProject.duration = duration1;
    const result = createProject.duration;

    // Expect result
    expect(result).equals(duration1);
  });

  it('CreateProject-area', () => {
    // Arguments
    const project6: any = {
      company_name: "test_company",
      start_date: new Date(),
      type: "project_type",
      location: "Banglore",
      duration: 1223,
      area: "BTM"
    };
    const area1 = 'Oha';

    // Property call
    const createProject = new CreateProject(project6);
    createProject.area = area1;
    const result = createProject.area;

    // Expect result
    expect(result).equals(area1);
  });

});
