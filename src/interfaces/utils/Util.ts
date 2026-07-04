import { RoleService } from '../services/Role.service'
import { UserService } from "../services/User.service";
import _, { map } from 'underscore'
import logger from "./Logger";
export class Util {
  adminShineKeys: any = []
  constructor() { }

  async getDepartmentInfo(user: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!user) return reject(new Error("user not found"));

      let _user_uuid = user._user_uuid;
      if (!_user_uuid) return reject(new Error("user_uuid not found"));

      let jwtToken = user.jwtToken;
      if (!jwtToken) return reject(new Error("jwtToken not found"));
      let _department = await new UserService().getUserDepartment(_user_uuid, jwtToken).catch((error: any) => logger.error(error.stack));
      // if (!_department || !_department.roles || _department.roles.length == 0 || !_department.organization_id) return reject(new Error("department details missing!"));
      if (!_department || !_department.data) return reject(new Error("department details missing!"));
      return resolve(_department.data);
    });
  }

  async getUserInfo(user: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!user) return reject(new Error("user not found"));

      let _user_uuid = user._user_uuid;
      if (!_user_uuid) return reject(new Error("user_uuid not found"));

      let jwtToken = user.jwtToken;
      if (!jwtToken) return reject(new Error("jwtToken not found"));
      let _user = await new UserService().findUserByUUID(_user_uuid, jwtToken).catch((error: any) => logger.error(error.stack));;
      if (!_user || !_user.success || !_user.data) return reject(new Error("user details not found gold->user service error! " + _user.data));
      return resolve(_user.data);
    });
  }

  async hasPermission(user: any, isOwnerOrMember: boolean, action: string, roles: string[], resource: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let jwtToken = user.jwtToken;
      if (!jwtToken) return reject(new Error("jwtToken not found"));

      let userPermissionResponse = await new RoleService().isPermissionGranted(jwtToken, isOwnerOrMember, action, roles, resource).catch((error: any) => logger.error(error.stack));;

      if (!userPermissionResponse || !userPermissionResponse.data) return reject(new Error("permission not found"));

      let granted: boolean = userPermissionResponse.data;

      if (granted == true) return resolve(true);

      return resolve(false);
    });
  }
  async validateTransportProvider(user: any, transport_provider: string) {
    //TODO get preferences call and validate the allowed transport provider
    return new Promise(async (resolve, reject) => {
      let jwtToken = user.jwtToken;
      if (!jwtToken) return reject(new Error("jwtToken not found"));
      let transport_providers = await new UserService().getDepartmentByOrgType('transport', jwtToken).catch((error: any) => logger.error(error.stack));;
      if (!transport_providers || !transport_providers.success || !transport_providers.data) return reject(new Error("user details not found gold->user service error! " + transport_providers.data));
      let checkTpId = transport_providers.data.filter((key: any) => key._id === transport_provider).length > 0;
      return resolve(checkTpId);
    })
  }
  async validateVaultProvider(user: any, vault_provider: string) {
    //TODO get preferences call and validate the allowed vault provider
    return new Promise(async (resolve, reject) => {
      let jwtToken = user.jwtToken;
      if (!jwtToken) return reject(new Error("jwtToken not found"));
      let vault_providers = await new UserService().getDepartmentByOrgType('vault', jwtToken).catch((error: any) => logger.error(error.stack));;
      if (!vault_providers || !vault_providers.success || !vault_providers.data) return reject(new Error("user details not found gold->user service error! " + vault_providers.data));
      let checkVId = vault_providers.data.filter((key: any) => key._id === vault_provider).length > 0;
      return resolve(checkVId);
    })
  }
  async getDepartmentByOrgType(user: any, type: string) {
    //TODO get preferences call and validate the allowed vault provider
    return new Promise<any>(async (resolve, reject) => {
      let jwtToken = user.jwtToken;
      if (!jwtToken) return reject(new Error("jwtToken not found"));
      let providers = await new UserService().getDepartmentByOrgType(type, jwtToken).catch((error: any) => logger.error(error.stack));;
      if (!providers || !providers.data) return reject(new Error("user details not found gold->user service error! " + providers.data));
      return resolve(providers.data);
    })
  }

  async calculateTotalRemainingGold(data: any) {
    let in_result = data.in_result;
    let out_result = data.out_result;
    // console.log('data',data)
    let totalInWeight = 0
    let totalOutWeight = 0
    for (let i = 0; i < in_result.length; i++) {
      totalInWeight += in_result[i].weight
      // console.log('totalInWeight',totalInWeight)
    }
    for (let i = 0; i < out_result.length; i++) {
      totalOutWeight += out_result[i].weight
      // console.log('totalOutWeight',totalOutWeight)
    }
    console.log(totalInWeight, totalOutWeight)
    return (totalInWeight - totalOutWeight)
  }
  async leftOverGoldList(data: any) {
    // console.log("leftOverGoldList",data);
    let in_result = data.in_result;
    let out_result = data.out_result;
    let temp_in_result = [];
    for (let i = 0; i < in_result.length; i++) {
      if (in_result[i].weight) {
        // totalInWeight += in_result[i].remaining_gold[0].weight
        let uin = in_result[i].uin
        let temp_in = []
        let in_data = {
          uin: in_result[i].uin,
          weight: in_result[i].weight,
          _id: in_result[i]._id,
          fineness: in_result[i].fineness
        }
        temp_in.push(in_data)
        let findInsideOutGold = out_result.filter((key: any) => key.uin === uin)
        temp_in_result.push({
          in: temp_in,
          out: findInsideOutGold
        })
      }
    }
    return temp_in_result
  }
  getTotalWeight = (filteredRecords: any) => {
    let filteredDoreWeight;
    return filteredDoreWeight = filteredRecords.reduce((doreWeight: any, doreRecord: any) => {
      const doreWeightSum = doreRecord?.dore?.dore_bars?.reduce(
        (singleDoreWeight: any, dore: any) => {
          return singleDoreWeight + dore?.weight;
        }, 0
      );
      return doreWeight + doreWeightSum;
    }, 0);
  }
  getTotalGoldBarWeight = (filteredRecords: any) => {
    if (filteredRecords) {
      let total = 0;
      filteredRecords.map((key: any) => {
        if (key.goldbar) {
          key.goldbar.map((k: any) => {
            total = total + k.weight
          })
        }

      })
      return total
    } else {
      return 0
    }
  }
  getTotalSoldGoldBarWeight = (filteredRecords: any) => {
    if (filteredRecords) {
      let total = 0;
      filteredRecords.map((key: any) => {
        if (key.goldbar) {
          key.goldbar.map((k: any) => {
            if (k.goldBarSold) {
              total = total + k.weight
            }
          })
        }

      })
      return total
    } else {
      return 0
    }
  }

  getTotalSampleReturn = (filteredRecords: any) => {
    if (filteredRecords) {
      let total = 0;
      filteredRecords.map((key: any) => {
        if (key.goldbar) {
          total = total + key.goldbar.length
        }

      })
      return total
    } else {
      return 0
    }
  }
  getTotalWeightOfScrap = (filteredScrapRecords: any) => {
    let filteredScrapWeight;
    return filteredScrapWeight = filteredScrapRecords.reduce((scrapWeight: any, scrapRecord: any) => {
      const scrapWeightSun = scrapRecord?.scrap?.scrap_golds?.reduce(
        (singleScrapWeight: any, scrap: any) => {
          return singleScrapWeight + scrap?.weight;
        }, 0
      )
      return scrapWeight + scrapWeightSun
    }, 0)
  }
  refinerDashboardStats(dashBoardStats: any) {
    let totalSample;
    if (dashBoardStats.totalSampleReturn.length > 0) {
      let count_array = dashBoardStats.totalSampleReturn.map((key: any) => key.count)
      totalSample = _.reduce(count_array, function (memo, num) { return memo + num; }, 0);
    } else {
      totalSample = 0;
    }
    let dashboardStats = [
      {
        "label": "Dore Imported",
        "key": "doreImport",
        "value": dashBoardStats.totalDore.length > 0 ? dashBoardStats.totalDore[0].total : 0
      },
      {
        "label": "Scrap Sourced",
        "key": "scrapSource",
        "value": dashBoardStats.totalScrap.length > 0 ? dashBoardStats.totalScrap[0].total : 0
      },
      {
        "label": "Bars produced",
        "key": "barProduced",
        "value": dashBoardStats.totalGoldProduced.length > 0 ? dashBoardStats.totalGoldProduced[0].total : 0
      },
      {
        "label": "NSE Approved",
        "key": "nseApproved",
        "value": dashBoardStats.totalGoldSettled.length > 0 ? dashBoardStats.totalGoldSettled[0].total : 0
      },
      {
        "label": "Bar sold",
        "key": "barSold",
        "value": dashBoardStats.totalGoldSold.length > 0 ? dashBoardStats.totalGoldSold[0].total : 0
      },
      {
        "label": "Samples returned by lab",
        "key": "sampleReturn",
        "value": totalSample
      }
    ]
    return dashboardStats
  }

  labDashboardStats(dashBoardStats: any) {
    let dashboardStats = [
      {
        "label": "Samples Received",
        "key": "sampleReceived",
        "value": dashBoardStats.sampleReceived 
      },
      {
        "label": "Samples Approved",
        "key": "samplePassed",
        "value": dashBoardStats.samplePassed
      },
      {
        "label": "Samples Sent Back",
        "key": "sampleReturn",
        "value": dashBoardStats.sampleReturn
      },
      {
        "label": "Sample Retained",
        "key": "sampleRetained",
        "value": dashBoardStats.sampleRetained
      },
      {
        "label": "Sample Accuracy",
        "key": "sampleAccuracy",
        "value": dashBoardStats.sampleAccuracy
      },
    ]
    return dashboardStats
  }
  labDefaultDashboardStats() {
    let dashboardStats = [
      {
        "label": "Samples Received",
        "key": "sampleReceived",
        "value": 0
      },
      {
        "label": "Samples Approved",
        "key": "samplePassed",
        "value": 0
      },
      {
        "label": "Samples Sent Back",
        "key": "sampleReturn",
        "value": 0
      },
      {
        "label": "Sample Retained",
        "key": "sampleRetained",
        "value": 0
      },
      {
        "label": "Sample Accuracy",
        "key": "sampleAccuracy",
        "value": 0
      },
    ]
    return dashboardStats
  }
  refinerDefaultDashboardStats() {
    let dashboardStats = [
      {
        "label": "Dore Imported",
        "key": "doreImport",
        "value": 0
      },
      {
        "label": "Scrap Sourced",
        "key": "scrapSource",
        "value": 0
      },
      {
        "label": "Bars produced",
        "key": "barProduced",
        "value": 0
      },
      {
        "label": "NSE Approved",
        "key": "nseApproved",
        "value": 0
      },
      {
        "label": "Bar sold",
        "key": "barSold",
        "value": 0
      },
      {
        "label": "Samples returned by lab",
        "key": "sampleReturn",
        "value": 0
      }
    ]
    return dashboardStats
  }

  async getAdminShineKeys() {
    let users = await new UserService().getUsersByOrgType('admin', 'jwt').catch((error: any) => { logger.error(error.stack); throw new Error("An error occurred while getAdminShineKeys api --> user service! ") });
    if (users.success) {
      for (let index = 0; index < users.data.length; index++) {
        this.adminShineKeys.push(users.data[index].shineKey)
      }
      return this.adminShineKeys
    }
  }
  async getMinorData(type: string, data: any) {
    let minorData = [];
    if (type === 'dore') {
      for (let index = 0; index < data.length; index++) {
        let tmp = {
          minor_name: data[index].dore.miner_details.name,
          address: data[index].dore.miner_details.address,
          shipper_name: data[index].dore.shipper.name,
          third_party_name: data[index].dore.shipper.third_party_name,
          aggregator: data[index].dore.shipper.third_party_name,
          aggregator_address: data[index].aggregator_address,
          aggregator_kyc_done: data[index].aggregator_kyc_done,
          aggregator_kyc: data[index].aggregator_kyc,
          roc_documents_kyc: data[index].roc_documents_kyc
        }
        minorData.push(tmp)

      }
      return _.chain(minorData).groupBy('minor_name')
    } else {
      for (let index = 0; index < data.length; index++) {
        let tmp = {
          aggregator: data[index].aggregator,
          aggregator_address: data[index].aggregator_address,
          aggregator_kyc_done: data[index].aggregator_kyc_done,
          aggregator_kyc: data[index].aggregator_kyc,
          roc_documents_kyc: data[index].roc_documents_kyc
        }
        minorData.push(tmp)
      }
      return _.chain(minorData).groupBy('aggregator')
    }



  }
  async saveDoreBar(sourcing: any, addDore: any, souring_id: any, useCase: any, uin: string) {
    let temp_dore_bars = sourcing.dore.dore_bars;
    let dore_bars = temp_dore_bars.map((obj: any) => ({ ...obj, uin: uin, souring_id: souring_id }))
    await addDore.addDore(dore_bars, useCase);

  }
  async saveScrapBar(sourcing: any, addScrap: any, souring_id: any, useCase: any, uin: string) {
    let temp_scrap_bars = sourcing.scrap?.scrap_golds;
    let scrap_bars = temp_scrap_bars.map((obj: any) => ({ ...obj, uin: uin, souring_id: souring_id }))
    await addScrap.addScrap(scrap_bars, useCase);

  }
  async saveInRemainingGold(remaining_gold: any, goldbar: any, refiner: string, useCase: any) {
    let temp = remaining_gold[0];
    if (temp && temp.uin && temp.weight && temp.fineness) {
      let temp_object = { ...temp, refiner }
      await goldbar.addRemainingGold(temp_object, useCase);
    }
  }
  async saveOutRemainingGold(out_remaining_gold: any, goldbar: any, refiner: string, userCase: any) {
    if (out_remaining_gold) {
      let temp_golds = out_remaining_gold;
      let r_gold = temp_golds.map((obj: any) => ({ ...obj, refiner: refiner }));
      await goldbar.addUsedRemainingGold(r_gold, userCase);
    }

  }
  async updateDoreInBulk(data: any, uin: string, useCase: any, getSourcingUseCase: any) {
    if (data.length > 0) {
      let dore_bars = await getSourcingUseCase.getDore(uin)
      let delete_dore = this.checkForDeleteRecordForDore(dore_bars.record, data)
      if (delete_dore.length > 0) {
        let temp_delete = delete_dore.map((obj: any) => ({ ...obj, status: 'delete' }));
        let mergeArrayWithDeleteDore = data.concat(temp_delete);
        let dore_gold = mergeArrayWithDeleteDore.map((obj: any) => ({ ...obj, uin: uin }));
        await useCase.updateDoreInBulk(dore_gold);
      } else {
        let dore_gold = data.map((obj: any) => ({ ...obj, uin: uin }));
        await useCase.updateDoreInBulk(dore_gold);
      }

    }

  }
  async updateScrapInBulk(data: any, uin: string, useCase: any, getSourcingUseCase: any) {
    if (data.length > 0) {
      let scrap_golds = data.map((obj: any) => ({ ...obj, uin: uin }));
      await useCase.updateScrapInBulk(scrap_golds);
    }

  }
  checkForDeleteRecordForDore(a: any, b: any) {
    let filteredData = a.filter((item1: any) => {
      for (var i in b) {
        if (item1.number === b[i].number) { return false; }
      };
      return true;
    })
    return filteredData
  }
  checkForDeleteRecordForGoldBar(a: any, b: any) {
    let filteredData = a.filter((item1: any) => {
      for (var i in b) {
        if (item1.serial === b[i].serial) { return false; }
      };
      return true;
    })
    return filteredData
  }

}