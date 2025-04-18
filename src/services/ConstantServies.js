import AsyncStorage from '@react-native-async-storage/async-storage';

const getDbName = async () => {
  let dbName = await AsyncStorage.getItem('dbName');
  return dbName;
}
// const localhost = "https://www.atomwalk.com"
const localhost = "https://www.atomwalk.com"

const apiURL = "/api";
const db_name = "PMA_00001";

// console.log("Db name===",AsyncStorage.getItem('dbName'));

export const endpoint = `${localhost}${apiURL}`;

export const productListURL = `${endpoint}/products/${db_name}/`;
export const productDetailURL = id => `${endpoint}/products/${db_name}/${id}/`;
export const addToCartURL = `${endpoint}/add_to_cart/${db_name}/`;
export const orderSummaryURL = `${endpoint}/order_summary/${db_name}/`;
export const orderListURL = `${endpoint}/customer_orders/${db_name}/`;
export const orderItemDeleteURL = `${endpoint}/order_item/remove_item/${db_name}/`;
export const orderItemUpdateQuantityURL = `${endpoint}/order_item/update_quantity/${db_name}/`;
export const addCouponURL = `${endpoint}/add-coupon/${db_name}/`;
export const countryListURL = `${endpoint}/countries/`;
export const userIDURL = `${endpoint}/user_id/`;
export const customerIDURL = `${endpoint}/user_customer_id/${db_name}/`;
export const addressListURL = addressType =>
  `${endpoint}/addresses/${db_name}/?address_type=${addressType}`;
export const addressCreateURL = `${endpoint}/address/create/${db_name}/`;
export const addressUpdateURL = id => `${endpoint}/address/update/${db_name}/${id}/`;
export const addressDeleteURL = id => `${endpoint}/address/delete/${db_name}/${id}/`;
export const userSignUpURL = `${endpoint}/customer_sign_up/${db_name}/`;
export const userLoginURL = `${endpoint}/customer_login/${db_name}/`;
export const loginURL = `${localhost}/rest-auth/login/`;
export const empLoginURL = `${endpoint}/emp_user_login/${db_name}/`;
export const resetPasswordURL = `${endpoint}/reset_password/${db_name}/`;
export const resetPasswordConfirmURL = `${endpoint}/reset_password_confirm/`;
export const changePasswordURL = `${endpoint}/change_password/`;
export const checkoutURL = `${endpoint}/order_checkout/${db_name}/`;
export const userTaskListURL = `${endpoint}/user_task/${db_name}/`;
export const addLeadURL = `${endpoint}/add_lead/${db_name}/`;
export const getCustomerListURL = `${endpoint}/customer_list/${db_name}/`;
export const getCustomerDetailListURL = `${endpoint}/customer_detail_list/${db_name}/`;
export const getLeadListURL = `${endpoint}/lead_list/${db_name}/`;
export const getLeadDataListURL = `${endpoint}/lead_data_list/${db_name}/`;
export const addTaskURL = `${endpoint}/add_task/${db_name}/`;
export const profileInfoURL = `${endpoint}/profile_info/${db_name}/`;
export const profileDtlURL = `${endpoint}/get_employee_list/${db_name}/`;
export const companyInfoURL = `${endpoint}/company_info/${db_name}/`;
export const getTaskInterestListURL = `${endpoint}/task_interest_list/${db_name}/`;
export const getProductCategoryListURL = `${endpoint}/product_category_list/${db_name}/`;
export const getVariationNameListURL = `${endpoint}/variation_name_list/${db_name}/`;
export const getLeadStatusListURL = `${endpoint}/lead_status_list/${db_name}/`;
export const getTaskTypeListURL = `${endpoint}/task_type_list/${db_name}/`;
export const updateTaskInterestURL = `${endpoint}/update_task_interest/${db_name}/`;
export const getOrderListURL = `${endpoint}/order_list/${db_name}/`;
export const updateTaskURL = `${endpoint}/update_task/${db_name}/`;
export const updateLeadStatusURL = `${endpoint}/update_lead_status/${db_name}/`;
export const getUserListURL = `${endpoint}/user_list/${db_name}/`;
export const getEmpLeavedata = `${endpoint}/get_employee_leave/${db_name}/`;
export const addEmpLeave = `${endpoint}/process_employee_leave/${db_name}/`;
export const addClaim = `${endpoint}/add_claim/${db_name}/`;
export const processClaim= `${endpoint}/process_claim/${db_name}/`;
export const getEmpClaimdata = `${endpoint}/get_claim_list/${db_name}/`;
export const getExpenseItemList = `${endpoint}/expense_item_list/${db_name}/`;
export const getProjectList = `${endpoint}/project_list/${db_name}/`;
export const getEmpAttendanceData = `${endpoint}/get_employee_attendance/${db_name}/`;
export const getEmpHolidayData = `${endpoint}/get_holiday_data/${db_name}/`;
export const empCheckData = `${endpoint}/process_employee_attendance/${db_name}/`;
export const getClaimApproverList = `${endpoint}/get_claim_approve_list/${db_name}/`;
export const getfiletotext = `${endpoint}/get_file_to_text/${db_name}/`;
// export const getAppointeeList = `${endpoint}/products/${db_name}/`;
export const processAppointee = `${endpoint}/process_employee_job/${db_name}/`;
export const getEmployeeRequestList = `${endpoint}/get_employee_request/${db_name}/`;
export const getEmployeeRequestCategory = `${endpoint}/get_request_category/${db_name}/`;
export const processEmployeeRequest = `${endpoint}/process_employee_request/${db_name}/`;

