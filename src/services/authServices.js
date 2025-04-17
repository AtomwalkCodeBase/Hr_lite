import { authAxios } from "./HttpMethod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { profileInfoURL, companyInfoURL, profileDtlURL, } from "./ConstantServies";

export function getProfileInfo() {
    // console.log('getProfileInfo')
    return authAxios(profileInfoURL)
}

export async function getEmployeeInfo() {
    try {
        const emp_id = await AsyncStorage.getItem('empId');
        // console.log("Auth Employee ID:", emp_id);

        let data = {};
        if (emp_id) {
            data['emp_id'] = emp_id;
        }

        return authAxios(profileDtlURL, data);
    } catch (error) {
        console.error("Error fetching profile info:", error);
        throw error;
    }
}

export function getCompanyInfo() {
    return authAxios(companyInfoURL)
}

