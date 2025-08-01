import { authAxios, authAxiosGET } from "./HttpMethod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { profileInfoURL, companyInfoURL, profileDtlURL, getDbList, } from "./ConstantServies";

export async function getProfileInfo() {
  try {
    const url = await profileInfoURL(); // Await the async function
    const response = await authAxios(url);
    return response;
  } catch (error) {
    console.error("Error fetching profile info:", error);
    throw error;
  }
}


export async function getEmployeeInfo() {
    try {
      const emp_id = await AsyncStorage.getItem('empId');
      const url = typeof profileDtlURL === 'function' ? await profileDtlURL() : profileDtlURL;
  
      const data = {};
      if (emp_id) {
        data['emp_id'] = emp_id;
      }
  
      return authAxios(url, data);
    } catch (error) {
      console.error("Error fetching employee info:", error);
      throw error;
    }
  }
  

export async function getCompanyInfo() {
    const url = await companyInfoURL(); // Await the async function
    return authAxios(url);
  }
  

export function getDBListInfo() {
    let data = {
         'mobile_app_type': 'HRM_E'
      };
    return authAxiosGET(getDbList, data)
}

