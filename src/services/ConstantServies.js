import AsyncStorage from '@react-native-async-storage/async-storage';

// const getDbName = async () => {
//   let dbName = await AsyncStorage.getItem('dbName');
//   console.log("Db name===",dbName);
//   return dbName;
// }

const getDbName = async (path) => {
  let dbData = await AsyncStorage.getItem('dbName');
  console.log("Current dbName:", dbData);
  return dbData
};


const localhost = "https://www.atomwalk.com"
const newlocalhost = "https://crm.atomwalk.com"

const apiURL = "/api";
const apiURLHR = "/hr_api";
const db_name = 'TR_012';

console.log("Out db===>",db_name)


//End Points
export const endpoint = `${localhost}${apiURL}`;
export const newendpoint = `${newlocalhost}${apiURLHR}`;
export const newendpointAll = `${newlocalhost}${apiURL}`;


//URLs
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
export const empLoginURL = `${newendpoint}/emp_user_login/`;
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
export const profileDtlURL = `${newendpoint}/get_employee_list/${db_name}/`;
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
export const getEmpLeavedata = `${newendpoint}/get_employee_leave/${db_name}/`;
export const addEmpLeave = `${newendpoint}/process_employee_leave/${db_name}/`;
export const addClaim = `${endpoint}/add_claim/${db_name}/`;
export const processClaim= `${endpoint}/process_claim/${db_name}/`;
export const getEmpClaimdata = `${endpoint}/get_claim_list/${db_name}/`;
export const getExpenseItemList = `${endpoint}/expense_item_list/${db_name}/`;
export const getProjectList = `${endpoint}/project_list/${db_name}/`;
export const getEmpAttendanceData = `${newendpoint}/get_employee_attendance/${db_name}/`;
export const getEmpHolidayData = `${newendpoint}/get_holiday_data/${db_name}/`;
export const empCheckData = `${newendpoint}/process_employee_attendance/${db_name}/`;
export const getClaimApproverList = `${endpoint}/get_claim_approve_list/${db_name}/`;
export const getfiletotext = `${endpoint}/get_file_to_text/${db_name}/`;
// export const getAppointeeList = `${endpoint}/products/${db_name}/`;
export const processAppointee = `${newendpoint}/process_employee_job/${db_name}/`;
export const getEmployeeRequestList = `${newendpoint}/get_employee_request/${db_name}/`;
export const getEmployeeRequestCategory = `${newendpoint}/get_request_category/${db_name}/`;
export const processEmployeeRequest = `${newendpoint}/process_employee_request/${db_name}/`;
export const getEventtList = `${newendpoint}/get_employee_events/${db_name}/`;
export const getEventResponse = `${newendpoint}/get_event_response/${db_name}/`;
export const processEventRes = `${newendpoint}/process_emp_event_response/${db_name}/`;
export const getDbList = `${newendpointAll}/get_applicable_site/`;
export const getEmpSal = `${newendpoint}/get_emp_salary_data/${db_name}/`;

