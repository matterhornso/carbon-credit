import * as SuperAgent from "superagent"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.NODE_TLS_ACCEPT_UNTRUSTED_CERTIFICATES_THIS_IS_INSECURE = '1'

let USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3000';

export class UserService {
  constructor() { }

  // TODO jwttoken
  getUserDepartment(user_uuid: string, jwtToken: string): any {
    return new Promise((resolve, reject) => {
      if (!user_uuid) reject(new Error('type missing'));
      if (!jwtToken) return reject(new Error("jwtToken missing"));
      SuperAgent
        .get(USER_SERVICE_URL + '/user/api/v1/users/getUserDepartment')
        .set('Authorization', 'Bearer ' + jwtToken)
        .query({
          user_uuid
        })
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the user service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the user service, err: ' + err));
          resolve(res.body);
        });
    });
  }
  getUsersByOrgType(type: string, jwtToken: string): any {
    return new Promise((resolve, reject) => {
      if (!type) reject(new Error('type missing'));
      if (!jwtToken) return reject(new Error("jwtToken missing"));
      SuperAgent
        .get(USER_SERVICE_URL + '/user/api/v1/department/getUsersByOrgType')
        .set('Authorization', 'Bearer ' + jwtToken)
        .query({
          type
        })
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the user service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the user service, err: ' + err));
          resolve(res.body);
        });
    });
  }
  getDepartmentByOrgType(type: string, jwtToken: string): any {
    return new Promise((resolve, reject) => {
      if (!type) reject(new Error('user_uuid missing'));
      if (!jwtToken) return reject(new Error("jwtToken missing"));
      SuperAgent
        .get(USER_SERVICE_URL + '/user/api/v1/department/getAllDepartmentByOrganizationType')
        .set('Authorization', 'Bearer ' + jwtToken)
        .query({
          type
        })
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the user service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the user service, err: ' + err));
          resolve(res.body);
        });
    });
  }
  getUsersById(id: string, jwtToken: string): any {
    return new Promise((resolve, reject) => {
      if (!id) reject(new Error('id missing'));
      if (!jwtToken) return reject(new Error("jwtToken missing"));
      SuperAgent
        .get(USER_SERVICE_URL + '/user/api/v1/users/getUsersById?id=' + id)
        .set('Authorization', 'Bearer ' + jwtToken)
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the user service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the user service, err: ' + err));
          resolve(res.body);
        });
    });
  }

  findUserByUUID(user_uuid: string, jwtToken: string): any {
    return new Promise((resolve, reject) => {
      if (!user_uuid) reject(new Error('user_uuid missing'));
      if (!jwtToken) return reject(new Error("jwtToken missing"));
      //console.log(USER_SERVICE_URL + '/user/user/api/v1/users/user/' + user_uuid);
      SuperAgent
        .get(USER_SERVICE_URL + '/user/api/v1/users/user/' + user_uuid)
        .set('Authorization', 'Bearer ' + jwtToken)
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the user service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the user service, err: ' + err));
          resolve(res.body);
        });
    });
  }
  findDepartmentById(id: string, jwtToken: string): any {
    return new Promise((resolve, reject) => {
      if (!id) reject(new Error('id missing'));
      if (!jwtToken) return reject(new Error("jwtToken missing"));
      //console.log(USER_SERVICE_URL + '/user/user/api/v1/department/findDepartment?id=' + id);
      SuperAgent
        .get(USER_SERVICE_URL + '/user/api/v1/department/findDepartment?id=' + id)
        .set('Authorization', 'Bearer ' + jwtToken)
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the user service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the user service, err: ' + err));
          resolve(res.body);
        });
    });
  }
  getOrgByDepartmentId(id: string, jwtToken: string): any {
    return new Promise((resolve, reject) => {
      if (!id) reject(new Error('id missing'));
      if (!jwtToken) return reject(new Error("jwtToken missing"));
      console.log(USER_SERVICE_URL + '/user/api/v1/department/getOrgByDepartmentId?id=' + id)
      SuperAgent
        .get(USER_SERVICE_URL + '/user/api/v1/department/getOrgByDepartmentId?id=' + id)
        .set('Authorization', 'Bearer ' + jwtToken)
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the user service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the user service, err: ' + err));
          resolve(res.body);
        });
    });
  }

  onBoardingSuperAdmin(superAdminRequest: any): any {
    return new Promise((resolve, reject) => {
      // console.log('onBoardingSuperAdmin', superAdminRequest)
      SuperAgent
        .post(USER_SERVICE_URL + '/user/api/v1/onboarding/create-super-admin')
        .send({
          username: superAdminRequest.username,
          password: superAdminRequest.password,
          permission: superAdminRequest.permission
        })
        .end((err, res) => {
          // Calling the end function will send the request
          if (err) {
            return reject(new Error('An error occurred with the user service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the user service, err: ' + err));
          resolve(res.body);
        });
    });
  }
  onBoardingByOrgType(type: string, permissions: any, jwtToken: string): any {
    return new Promise((resolve, reject) => {
      SuperAgent
        .post(USER_SERVICE_URL + '/user/api/v1/onboarding/onBoardingByOrgType')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({
          type: type,
          permissions: permissions
        })
        .end((err, res) => {
          if (err) {
            return reject(new Error('An error occurred with the user service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the user service, err: ' + err));
          resolve(res.body);
        });
    });
  }
  onBoardingByRoleName(role_name: string, departmentId: string, permissions: any, jwtToken: string): any {
    return new Promise((resolve, reject) => {
      SuperAgent
        .post(USER_SERVICE_URL + '/user/api/v1/onboarding/onBoardingByRole')
        .set('Authorization', 'Bearer ' + jwtToken)
        .send({
          role_name: role_name,
          departmentId: departmentId,
          permissions: permissions
        })
        .end((err, res) => {
          if (err) {
            return reject(new Error('An error occurred with the user service, err: ' + err));
          }
          if (!res || !res.body) return reject(new Error('An error occurred with the user service, err: ' + err));
          resolve(res.body);
        });
    });
  }


}