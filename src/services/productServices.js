import { addEmpLeave, getEmpLeavedata, addClaim, getEmpClaimdata, getExpenseItemList, getProjectList, getEmpAttendanceData, getEmpHolidayData, empCheckData, processClaim, getClaimApproverList, getfiletotext, getAppointeeList, processAppointee, getEmployeeRequestList, getEmployeeRequestCategory } from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosPost } from "./HttpMethod";

export function getEmpLeave(leave_type , emp_id) {
    let data = {};
    if (leave_type ){
        data['leave_type '] = leave_type;
    }
    if (emp_id){
        data['emp_id'] = emp_id;
    }
    console.log('Epm leave payload service', data)
    return authAxios(getEmpLeavedata, data)
  }
  
  export function postEmpLeave(leave_type) {
    let data = {};
    if (leave_type) {
      data['leave_data'] = leave_type;
    }
    console.log('Data to be sent for leave:', data);
    return authAxiosPost(addEmpLeave, data)
  
  }

  export function postClaim(claim_data) {
    let data = {};
    if (claim_data) {
      data = claim_data;
    }
    // console.log('Data to be sent:', claim_data);
    return authAxiosFilePost(addClaim, claim_data)
  }

  export function postClaimAction(claim_type) {
    let data = {};
    if (claim_type) {
      data['claim_data'] = claim_type;
    }
    console.log('Data to be sent:', data);
    return authAxiosPost(processClaim, data)
  
  }

  export function getClaimApprover() { 
    let data = {};
    return authAxios(getClaimApproverList)
  }

  export function getEmpClaim(call_type, emp_id) {
    let data = {};
    if (call_type ){
        data['call_mode'] = call_type;
    }
    if (emp_id){
        data['emp_id'] = emp_id;
    }
    console.log('Claim===',data)
    return authAxios(getEmpClaimdata, data)
  }

  export function getExpenseItem() { 
    return authAxios(getExpenseItemList)
  }


  export function getExpenseProjectList() { 
    return authAxios(getProjectList)
  }

  export function getEmpAttendance(res) {
    let data = {
      'emp_id':res.emp_id,
      'month':res.month,
      'year': res.year
    };
    console.log('Final response data',data)
    return authAxios(getEmpAttendanceData, data)
  }

  export function getEmpHoliday(res) {
    let data = {
      'year': res.year
    };
    // console.log(data,'Final response data')
    return authAxios(getEmpHolidayData, data)
  }

  export function postCheckIn(checkin_data) {
    let data = {};
    if (checkin_data) {
      data['attendance_data'] = checkin_data;
      // data = checkin_data;
    }
    // console.log('Data to be sent:', data);
    return authAxiosPost(empCheckData, data)
  }


  export function imagetotext(Uri) {
    // console.log('getUserList3434',Uri)
    let data = {};
    data = Uri
    return authAxiosFilePost(getfiletotext, data);
  }

  // export function getAppointee() { 
  //   return authAxios(getAppointeeList)
  // }

  export function postAppointee(res) {
    let data = {};
    if (res) {
      data['emp_data'] = res;
    }
    // console.log('Data to be sent:', data);
    return authAxiosPost(processAppointee, data)
  
  }

  export function getEmployeeRequest() { 
    let data = {
      'emp_id':"EMP-001",
      'request_sub_type':"Technical Support",
      'request_type': "H"
    };
    return authAxios(getEmployeeRequestList)
  }

  export function getRequestCategory() { 
    return authAxios(getEmployeeRequestCategory)
  }