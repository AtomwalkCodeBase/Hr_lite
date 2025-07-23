import { addEmpLeave, getEmpLeavedata, addClaim, getEmpClaimdata, getExpenseItemList, getProjectList, getEmpAttendanceData, getEmpHolidayData, empCheckData, processClaim, getClaimApproverList, getfiletotext, processAppointee, getEmployeeRequestList, getEmployeeRequestCategory, processEmployeeRequest, getEventResponse, processEventRes, getEventtList, setUserPinURL, forgetEmpPinURL, getEmpShiftData, getTrainingModuleData, getEmpTrainingListData, processEmpTraining, getTimeSheetList, getactivityList, getProjectLists, addTimesheet, profileDtlURL, validateApproveLimit } from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosPost, publicAxiosRequest } from "./HttpMethod";

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
    console.log("Response Data to be pass--",data.claim_data)
    const url = await processClaim();
    return authAxiosPost(url, data);
  
  }

  export async function getClaimApprover() { 
    let data = {};
    const url = await getClaimApproverList();
    return authAxios(url, data);
  }

  export async function getEmpClaim(call_type, emp_id , period) {
    let data = {};
    if (call_type ){
        data['call_mode'] = call_type;
    }
    if (emp_id){
        data['emp_id'] = emp_id;
    }
    if (period){
        data['period'] = period;
    }
    console.log("Data to be sent++--",data)
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

  export async function validateClaimItem(res) {
    let data = {
      'a_emp_id': res.emp_id,
      'm_claim_id': res.m_claim_id,
    };
    console.log("Claim Validation data to be pass--",data)
    const url = await validateApproveLimit();
    return authAxios(url, data);
  }

  export async function getEmpAttendance(res) {
    let data = {
      'emp_id': res.eId || res.emp_id,
      'month':res.month,
      'year': res.year
    };
    // console.log("At data to be pass--",data)
    const url = await getEmpAttendanceData();
    return authAxios(url, data);
  }

  export async function getEmpHoliday(res) {
    let data = {
      'year': res.year,
      'emp_id':res.eId,
    };

    console.log("Data to pass--",data)
    const url = await getEmpHolidayData();
    return authAxios(url, data);
  }

  export async function postCheckIn(checkin_data) {
    let data = {};
    if (checkin_data) {
      data['attendance_data'] = checkin_data;
    }
    const url = await empCheckData();

    console.log("Check-in data pass===",data)
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
    console.log('Request Data to be sent:', request_data);
    const url = await processEmployeeRequest();
    return authAxiosFilePost(url, request_data);
  }


  export async function getEvents(params = {}) {
    const data = {
      emp_id: params.emp_id || "",
      event_type: params.event_type || "",
      date_range: params.date_range || 'ALL'
    };
    console.log("Event fetching data--",data)
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

    // console.log("Data to be sent--->",data)
    const url = await setUserPinURL();
    return authAxiosPost(url, data);
  }


export async function forgetUserPinView(data) {
    console.log("Data to be sent--->", data);
    const url = await forgetEmpPinURL();
    return publicAxiosRequest.post(url, data);
}

export async function getEmpShift(res) {
    let data = {
      'emp_id': res.eId || res.emp_id,
      'w_start':res.w_data,
      // 'year': res.year
    };
    // console.log("At data to be pass--",data)
    const url = await getEmpShiftData();
    return authAxiosPost(url, data);
  }

  export async function getTrainingData() {
    // console.log("Data to be sent--->", data);
    const url = await getTrainingModuleData();
    return authAxios(url);
}

  export async function getEmpTrainingList(response) {
    let data ={
      'emp_id': response
    }
    console.log("Data to be sent--->", data);
    const url = await getEmpTrainingListData();
    return authAxios(url, data);
}

export async function EnrollEmpTraining(res) {
    let data = {};
    if (res) {
      data = res;
    }
    // console.log("At data to be pass--",data)
    const url = await processEmpTraining();
    return authAxiosFilePost(url, data);
  }

export async function getTimesheetData(empid,start_date, end_date) {
  let data = {
    'emp_id': empid,
    'start_date':start_date,
    'end_date': end_date,
  };
    console.log('Data to be sent:', data);
  const url = await getTimeSheetList();
  return authAxios(url, data)
}

export async function postTimeList(timedata) {
  let data = {};
  if (timedata) {
    data['ts_data'] = timedata;
  }
  console.log('Data to be sent:', data);
  const url = await addTimesheet()
  return authAxiosPost(url, data)
}


export async function getActivitylist() {
  const url = await getactivityList();
  return authAxios(url);
}

export async function getProjectlist(empId) {
  let data = {};
  if (empId) {
    data['emp_id'] = empId;
  }
  const url = await getProjectList();
  return authAxios(url,data);
}

export async function getEmplyoeeList() {
  const url = await profileDtlURL();
  return authAxios(url);
}