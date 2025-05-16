import { addEmpLeave, getEmpLeavedata, addClaim, getEmpClaimdata, getExpenseItemList, getProjectList, getEmpAttendanceData, getEmpHolidayData, empCheckData, processClaim, getClaimApproverList, getfiletotext, processAppointee, getEmployeeRequestList, getEmployeeRequestCategory, processEmployeeRequest, getEventResponse, processEventRes, getEventtList, setUserPinURL } from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosPost } from "./HttpMethod";

export async function getEmpLeave(leave_type, emp_id) {
  let data = {};
  if (leave_type) data['leave_type'] = leave_type;
  if (emp_id) data['emp_id'] = emp_id;
  const url = await getEmpLeavedata();
  return authAxios(url, data);
}

export async function postEmpLeave(leave_type) {
  let data = {};
  if (leave_type) {
    data['leave_data'] = leave_type;
  }
  const url = await addEmpLeave();
  return authAxiosPost(url, data);
}

  export async function postClaim(claim_data) {
    let data = {};
    if (claim_data) {
      data = claim_data;
    }
    const url = await addClaim();
    return authAxiosFilePost(url, claim_data);
  }

  export async function postClaimAction(claim_type) {
    let data = {};
    if (claim_type) {
      data['claim_data'] = claim_type;
    }
    const url = await processClaim();
    return authAxiosPost(url, data);
  
  }

  export async function getClaimApprover() { 
    let data = {};
    const url = await getClaimApproverList();
    return authAxios(url, data);
  }

  export async function getEmpClaim(call_type, emp_id) {
    let data = {};
    if (call_type ){
        data['call_mode'] = call_type;
    }
    if (emp_id){
        data['emp_id'] = emp_id;
    }
    console.log("Data to be sent--",data)
    const url = await getEmpClaimdata();
    return authAxios(url, data);
  }

  export async function getExpenseItem() { 
    const url = await getExpenseItemList();
    return authAxios(url);
  }


  export async function getExpenseProjectList() { 
    const url = await getProjectList();
    return authAxios(url);
  }

  export async function getEmpAttendance(res) {
    let data = {
      'emp_id':res.emp_id,
      'month':res.month,
      'year': res.year
    };
    const url = await getEmpAttendanceData();
    return authAxios(url, data);
  }

  export async function getEmpHoliday(res) {
    let data = {
      'year': res.year,
      'emp_id':res.eId,
    };
    const url = await getEmpHolidayData();
    return authAxios(url, data);
  }

  export async function postCheckIn(checkin_data) {
    let data = {};
    if (checkin_data) {
      data['attendance_data'] = checkin_data;
    }
    const url = await empCheckData();
    return authAxiosPost(url, data);
  }


  export async function imagetotext(Uri) {
    let data = {};
    data = Uri
    const url = await getfiletotext();
    return authAxiosFilePost(url, data);
  }

  export async function postAppointee(res) {
    let data = {};
    if (res) {
      data['emp_data'] = res;
    }
    const url = await processAppointee();
    return authAxiosPost(url, data);  
  }

  export async function getEmployeeRequest() { 
    const url = await getEmployeeRequestList();
    return authAxios(url);
  }

  export async function getRequestCategory() { 
    const url = await getEmployeeRequestCategory();
    return authAxios(url);
  }

  export async function postEmpRequest(request_data) {
    console.log('Data to be sent:', request_data);
    const url = await processEmployeeRequest();
    return authAxiosFilePost(url, request_data);
  }


  export async function getEvents(params = {}) {
    const data = {
      emp_id: params.emp_id || "",
      event_type: params.event_type || "",
      date_range: params.date_range || 'ALL'
    };
    const url = await getEventtList();
    return authAxios(url, data);
  }

  export async function getEventsResponse(params = {}) {
    const data = {
      event_id: params.event_id,
    };
    const url = await getEventResponse();
    return authAxios(url, data);
  }

  export async function processEventResponse(event_data) {
    let data = {};
    if (event_data) {
      data = event_data;
    }
    const url = await processEventRes();
    return authAxiosFilePost(url, data);
  }


export async function setUserPinView(o_pin, n_pin, employeeId) {
    
    const effectiveEmpoyeeId = employeeId;

    let data = {
      u_id: effectiveEmpoyeeId,
      o_pin: o_pin,
      n_pin: n_pin,
      user_type: "EMP",
    };

    console.log("Data to be sent--->",data)
    const url = await setUserPinURL();
    return authAxiosPost(url, data);
  }