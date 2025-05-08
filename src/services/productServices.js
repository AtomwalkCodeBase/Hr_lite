import { addEmpLeave, getEmpLeavedata, addClaim, getEmpClaimdata, getExpenseItemList, getProjectList, getEmpAttendanceData, getEmpHolidayData, empCheckData, processClaim, getClaimApproverList, getfiletotext, getAppointeeList, processAppointee, getEmployeeRequestList, getEmployeeRequestCategory, processEmployeeRequest, getEventResponse, processEventRes, getEventtList } from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosPost } from "./HttpMethod";

export async function getEmpLeave(leave_type, emp_id) {
  let data = {};
  if (leave_type) data['leave_type'] = leave_type;
  if (emp_id) data['emp_id'] = emp_id;

  // console.log('Emp leave payload service', data);
  const url = await getEmpLeavedata();
  return authAxios(url, data);
}

export async function postEmpLeave(leave_type) {
  let data = {};
  if (leave_type) {
    data['leave_data'] = leave_type;
  }
  // console.log('Emp leave payload service', data);
  const url = await addEmpLeave();
  return authAxiosPost(url, data);
}
  
  // export function postEmpLeave(leave_type) {
  //   let data = {};
  //   if (leave_type) {
  //     data['leave_data'] = leave_type;
  //   }
  //   console.log('Data to be sent for leave:', data);
  //   return authAxiosPost(addEmpLeave, data)
  
  // }

  export async function postClaim(claim_data) {
    let data = {};
    if (claim_data) {
      data = claim_data;
    }
    console.log('Data to be sent:', claim_data);
    const url = await addClaim();
    return authAxiosFilePost(url, claim_data);
    // return authAxiosFilePost(addClaim, claim_data)
  }

  export async function postClaimAction(claim_type) {
    let data = {};
    if (claim_type) {
      data['claim_data'] = claim_type;
    }
    console.log('Data to be sent:', data);
    const url = await processClaim();
    return authAxiosPost(url, data);
    // return authAxiosPost(processClaim, data)
  
  }

  export async function getClaimApprover() { 
    let data = {};
    const url = await getClaimApproverList();
    return authAxios(url, data);
    // return authAxios(getClaimApproverList)
  }

  export async function getEmpClaim(call_type, emp_id) {
    let data = {};
    if (call_type ){
        data['call_mode'] = call_type;
    }
    if (emp_id){
        data['emp_id'] = emp_id;
    }
    console.log('Claim===',data)
    const url = await getEmpClaimdata();
    return authAxios(url, data);
    // return authAxios(getEmpClaimdata, data)
  }

  export async function getExpenseItem() { 
    const url = await getExpenseItemList();
    return authAxios(url);
    // return authAxios(getExpenseItemList)
  }


  export async function getExpenseProjectList() { 
    const url = await getProjectList();
    return authAxios(url);
    // return authAxios(getProjectList)
  }

  export async function getEmpAttendance(res) {
    let data = {
      'emp_id':res.emp_id,
      'month':res.month,
      'year': res.year
    };
    console.log('Final response data',data)
    const url = await getEmpAttendanceData();
    return authAxios(url, data);
    // return authAxios(getEmpAttendanceData, data)
  }

  export async function getEmpHoliday(res) {
    let data = {
      'year': res.year,
      'emp_id':res.eId,
    };
    console.log('Final response data', data)
    const url = await getEmpHolidayData();
    return authAxios(url, data);
    // return authAxios(getEmpHolidayData, data)
  }

  export async function postCheckIn(checkin_data) {
    let data = {};
    if (checkin_data) {
      data['attendance_data'] = checkin_data;
      // data = checkin_data;
    }
    console.log('Data to be sent:', data);
    const url = await empCheckData();
    return authAxiosPost(url, data);
    // return authAxiosPost(empCheckData, data)
  }


  export async function imagetotext(Uri) {
    // console.log('getUserList3434',Uri)
    let data = {};
    data = Uri
    const url = await getfiletotext();
    return authAxiosFilePost(url, data);
    // return authAxiosFilePost(getfiletotext, data);
  }

  // export function getAppointee() { 
  //   return authAxios(getAppointeeList)
  // }

  export async function postAppointee(res) {
    let data = {};
    if (res) {
      data['emp_data'] = res;
    }
    // console.log('Data to be sent:', data);
    const url = await processAppointee();
    return authAxiosPost(url, data);
    // return authAxiosPost(processAppointee, data)
  
  }

  export async function getEmployeeRequest() { 
    const url = await getEmployeeRequestList();
    return authAxios(url);
    // return authAxios(getEmployeeRequestList)
  }

  export async function getRequestCategory() { 
    const url = await getEmployeeRequestCategory();
    return authAxios(url);
    // return authAxios(getEmployeeRequestCategory)
  }

  export async function postEmpRequest(request_data) {
    console.log('Data to be sent:', request_data);
    const url = await processEmployeeRequest();
    return authAxiosFilePost(url, request_data);
    // return authAxiosFilePost(processEmployeeRequest, request_data)
  }

  
  // export function getEvents(params = {}) {
  //   const data = {
  //     emp_id: params.emp_id || "",
  //     event_type: params.event_type || "",
  //     date_range: params.date_range || 'ALL'
  //   };
  //   console.log("Passed payload===>",data)
  //   return authAxios(getEventtList, data);
  // }

  export async function getEvents(params = {}) {
    const data = {
      emp_id: params.emp_id || "",
      event_type: params.event_type || "",
      date_range: params.date_range || 'ALL'
    };
    // console.log('Emp leave payload service', data);
    const url = await getEventtList();
    return authAxios(url, data);
  }

  export async function getEventsResponse(params = {}) {
    const data = {
      event_id: params.event_id,
      // event_type: params.event_type || "",
      // date_range: params.date_range || 'ALL'
    };
    console.log("Passed payload for getting response===>",data)
    const url = await getEventResponse();
    return authAxios(url, data);
    // return authAxios(getEventResponse, data);
  }

  export async function processEventResponse(event_data) {
    let data = {};
    if (event_data) {
      data = event_data;
    }
    console.log('Data to be sent:', data);
    const url = await processEventRes();
    return authAxiosFilePost(url, data);
    // return authAxiosFilePost(processEventRes, data)
  }