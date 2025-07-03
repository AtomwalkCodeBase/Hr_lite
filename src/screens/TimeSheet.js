import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, Dimensions, Image, Alert, TouchableOpacity } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getActivitylist, getProjectlist, getTimesheetData, postTimeList } from "../services/productServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../components/old_components/Loader";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import HeaderComponent from "../components/HeaderComponent";
import TimeSheetCard from "../components/TimeSheetCard";
import TimeSheetWeekNavigation from "../components/TimeSheetWeekNavigation";
import AddEditTaskModal from '../components/TimeSheetAddEditTaskModal';
import RemarkModal from '../components/RemarkModal';
import SuccessModal from "../components/SuccessModal";
import ErrorModal from "../components/ErrorModal";
import ApplyButton from "../components/ApplyButton";
import WeeklySummary from "../components/WeeklySummary";
import FilterModal from "../components/FilterModal";
import ConfirmationModal from "../components/ConfirmationModal";

const TimeSheet = () => {
  const { employee: employeeParam } = useLocalSearchParams();
  const employee = employeeParam ? JSON.parse(employeeParam) : null;
  const [EmpId, setEmpId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelfView, setIsSelfView] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [remark, setRemark] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showWeeklySummary, setShowWeeklySummary] = useState(true);
  const [activeTab, setActiveTab] = useState('timesheet'); // New state for active tab
  const navigate = useNavigation();
  const route = useRouter();
  const [SubmitConfirmModalVisible, setSubmitConfirmModalVisible] = useState(false);
  const [ApproveConfirmModalVisible, setApproveConfirmModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const storedEmpId = await AsyncStorage.getItem('empId');
      if (employee?.emp_id) {
        setEmpId(employee.emp_id);
        setIsSelfView(false);
        if (storedEmpId === employee.emp_id) {
          route.replace("TimeSheet");
          return;
        }
      } else {
        setEmpId(storedEmpId);
        setIsSelfView(true); 
      }
    })();
  }, []);

  const [formData, setFormData] = useState({
    project: "",
    activity: "",
    date: new Date(),
    startTime: "",
    endTime: "",
    hours: "",
    remarks: "",
  });

  // Filter states
  const [filters, setFilters] = useState({

    project: "",
    status: "",
    activity: "",
    year: '',
    month: '',
  });
  const [pendingFilters, setPendingFilters] = useState(filters);

  const statuses = ["SUBMITTED", "APPROVED", "REJECTED"];

  // Check if any filters are active
  const hasActiveFilters = () => {
    return  filters.project || filters.status || filters.activity || filters.month || filters.year;
  };

  const formatDateForAPI = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTimeForAPI = (date) => {
    if (!(date instanceof Date)) return "";
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strTime =
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;
    return strTime;
  };

  const formatDisplayDate = (dateString) => {
    if (dateString instanceof Date) {
      return dateString.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    if (typeof dateString === "string" && dateString.includes("-")) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }
    }

    return dateString;
  };

  const getCurrentWeekDates = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return { start, end };
  };

  useEffect(() => {
    fetchActivityCategories();
    fetchProjectCategories();
  }, []);

  const fetchActivityCategories = async () => {
    try {
      const res = await getActivitylist();
      setActivities(res.data);
    } catch (err) {
      console.error("Error fetching activities:", err);
      Alert.alert("Error", "Failed to fetch activities");
    }
  };

  const fetchProjectCategories = async () => {
     const empId = await AsyncStorage.getItem("empId");
    try {
      const res = await getProjectlist(empId);
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      Alert.alert("Error", "Failed to fetch projects");
    }
  };

  const getTimeSheetList = async () => {
    if (!EmpId) return;
    setIsLoading(true);

    const { start, end } = getFilterDateRange(filters, currentWeekStart);
    const formattedStartDate = formatDateForAPI(start);
    const formattedEndDate = formatDateForAPI(end);

    try {
      const res = await getTimesheetData(EmpId, formattedStartDate, formattedEndDate);
      console.log("dtaadsas", res.data)
      setTasks(res.data.reverse() || []);
    } catch (err) {
      console.error("Error fetching timesheet data:", err);
      Alert.alert("Error", "Failed to fetch timesheet data");
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect dependency to include filters
  useEffect(() => {
    if (EmpId) {
      getTimeSheetList();
    }
  }, [EmpId, currentWeekStart, filters.year, filters.month]);

  const handleSubmit = async (callMode) => {
    if (callMode !== 'APPROVE' && callMode !== 'REJECT') {
      if (!formData.activity || !formData.hours) {
        setIsErrorModalVisible(true);
        setErrorMessage("Please fill in all required fields")
        return;
      }
    }

    setIsLoading(true);
    
    const empId = await AsyncStorage.getItem("empId");
    let submittedData;
    
    if (callMode === 'APPROVE' || callMode === 'REJECT') {
      const formattedDate = formatDateForAPI(formData.date);
      submittedData = {
        emp_id: empId,
        a_emp_id: EmpId,
        ts_id: selectedTask.id,
        a_remarks: remark,
        a_date: formattedDate,
        call_mode: callMode,
      };
    } else {
      const formattedDate = formatDateForAPI(formData.date);
      const formattedStartTime = formatTimeForAPI(formData.startTime);
      const formattedEndDate = formatTimeForAPI(formData.endTime);
      submittedData = {
        emp_id: empId,
        project_code: formData.project || "",
        activity_id: formData.activity,
        a_date: formattedDate,
        start_time: formattedStartTime,
        end_time: formattedEndDate,
        effort: Number.parseFloat(formData.hours),
        remarks: formData.remarks,
        call_mode: callMode,
      };
      if (callMode === "UPDATE" && editingTask) {
        submittedData.ts_id = editingTask.id;
      }
    }

    console.log("data of the api",submittedData)

    try {
      const res = await postTimeList(submittedData);
      if (res.status === 200) {
        setIsSuccessModalVisible(true)
        setSuccessMessage(`Timesheet ${callMode ==="SUBMIT" ? "submitted" : "saved"} successfully!`)
        if (callMode === 'APPROVE' || callMode === 'REJECT') {
          setShowRemarkModal(false);
          setSelectedTask(null);
          setSelectedAction(null);
          setRemark('');
        } else {
          setFormData({
            project: "",
            activity: "",
            date: new Date(),
            hours: "",
            remarks: "",
          });
          setShowAddModal(false);
          setEditingTask(null);
        }
        getTimeSheetList(); // Refresh the list
      } else {
        setIsErrorModalVisible(true);
        setErrorMessage(`Failed to ${callMode.toLowerCase()} timesheet. Please try again.`)
      }
    } catch (error) {
      console.error(`Error ${callMode.toLowerCase()}ing timesheet:`, error);
      setIsErrorModalVisible(true);
       if (
          error?.response?.data?.message.includes('Invalid request - Project/ Activity already present')
        ) {
          setErrorMessage('Project/ Activity already present for date 01-07-2025');
        } else {
          setErrorMessage(error?.response?.data?.message || error.message);
        }
    } finally {
      setIsLoading(false);
    }
  };

const parseTimeToDate = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

const editTask = (task) => {
  const safeParse = (timeStr) => (timeStr ? parseTimeToDate(timeStr) : null);

  let taskDate = new Date();
  if (task.a_date) {
    const parsedDate = new Date(task.a_date);
    if (!isNaN(parsedDate.getTime())) {
      taskDate = parsedDate;
    }
  }

  setFormData({
    project: task.project_code || "",
    activity: task.activity_id || "",
    date: taskDate,
    startTime: safeParse(task.start_time),
    endTime: safeParse(task.end_time),
    hours: task.effort ? task.effort.toString() : "",
    remarks: task.remarks || "",
  });

  setEditingTask(task);
  setShowAddModal(true);
};

  const handleDelete = async (task) => {
    setIsLoading(true);
    try {
      const empId = await AsyncStorage.getItem('empId');
      const submittedData = {
        emp_id: empId,
        ts_id: task.id,
        call_mode: 'DELETE',
      };
      const res = await postTimeList(submittedData);
      if (res.status === 200) {
        setIsSuccessModalVisible(true);
        setSuccessMessage('Task deleted successfully!');
        getTimeSheetList(); // Refresh tasks
      } else {
        setIsErrorModalVisible(true);
        setErrorMessage('Failed to delete task. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setIsErrorModalVisible(true);
      setErrorMessage(error?.response?.data?.message || 'Failed to delete task.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeekStart(newDate);
  };

  const handleApproveReject = async (task, action) => {
    setSelectedTask(task);
    setSelectedAction(action);
    setRemark('');
    setShowRemarkModal(true);
  };

  const handleWeeklySubmit = async (callMode) => {
    const { start, end } = getCurrentWeekDates(currentWeekStart);
    const formattedStartDate = formatDateForAPI(start);
    const formattedEndDate = formatDateForAPI(end);
    setIsLoading(true);
    try {
      const empId = await AsyncStorage.getItem("empId");
      const submittedData = {
        a_emp_id: EmpId,
        emp_id: empId,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        call_mode: callMode,
      };
      console.log("Submitting weekly timesheet:", submittedData);
      const res = await postTimeList(submittedData);
      if (res.status === 200) {
        setIsSuccessModalVisible(true);
        setSuccessMessage(`Weekly Timesheet ${callMode === "WEEKLY_SUBMIT" ? "submitted" : "approved"} successfully for: ${formattedStartDate} to ${formattedEndDate}`);
        await getTimeSheetList();
      } else {
        setIsErrorModalVisible(true);
        setErrorMessage(`Failed to ${callMode === "WEEKLY_SUBMIT" ? "submit" : "approve"} weekly Timesheet`);
      }
    } catch (err) {
      console.error(`Error ${callMode === "WEEKLY_SUBMIT" ? "submitting" : "approving"} weekly Timesheet:`, err);
      setIsErrorModalVisible(true);
      setErrorMessage(err?.response?.data?.message || `Failed to ${callMode === "WEEKLY_SUBMIT" ? "submit" : "approve"} weekly Timesheet`);
    } finally {
      setIsLoading(false);
      setSubmitConfirmModalVisible(false);
      setApproveConfirmModalVisible(false);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setEditingTask(null);
    setFormData({
      project: "",
      activity: "",
      date: new Date(),
      hours: "",
      remarks: "",
    });
  };
  
  const getProjectDropdownOptions = (labelKey, valueKey) => {
    return projects.map(item => ({
      label: `${item[labelKey]} (${item[valueKey]})`,
      value: item[valueKey],
    }));
  };

  const getActivityDropdownOptions = (key) => {
    const uniqueValues = [...new Set(activities.map(item => item[key]))];
    return uniqueValues.map(value => ({ label: value, value }));
  };

  const getFilterDateRange = (filters, currentWeekStart) => {
    const getLastDayOfMonth = (year, month) => new Date(year, month, 0).getDate();
    const defaultYear = currentYear;

    if (filters.month) {
      const year = filters.year ? Number(filters.year) : defaultYear;
      const month = Number(filters.month);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month - 1, getLastDayOfMonth(year, month));
      // console.log(`Selected Month Filter: ${month}-${year} (Start: ${formatDateForAPI(start)}, End: ${formatDateForAPI(end)})`);
      return { start, end, type: 'month', year }; // Include year for navigation
    } else if (filters.year) {
      const year = Number(filters.year);
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      // console.log(`Selected Year Filter: ${year} (Start: ${formatDateForAPI(start)}, End: ${formatDateForAPI(end)})`);
      return { start, end, type: 'year', year };
    } else {
      const { start, end } = getCurrentWeekDates(currentWeekStart);
      // console.log(`Default Week Filter: (Start: ${formatDateForAPI(start)}, End: ${formatDateForAPI(end)})`);
      return { start, end, type: 'week', year: defaultYear };
    }
  };

  const currentYear = new Date().getFullYear();
    const yearOptions = useMemo(() => {
    const range = 5; // Configurable range (±5 years from current year)
    return Array.from({ length: range * 2 + 1 }, (_, i) => {
      const year = currentYear - range + i;
      return { label: year.toString(), value: year };
    });
  }, []);

  const monthOptions = useMemo(() => [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ], []);

  const filterConfigs = useMemo(() => [
    {
      label: "Project",
      options: getProjectDropdownOptions("title", "project_code"),
      value: pendingFilters.project,
      setValue: (value) => setPendingFilters((prev) => ({ ...prev, project: value })),
    },
    {
      label: "Activity",
      options: getActivityDropdownOptions("name"),
      value: pendingFilters.activity,
      setValue: (value) => setPendingFilters((prev) => ({ ...prev, activity: value })),
    },
    {
      label: "Status",
      options: statuses.map((status) => ({ label: status, value: status })),
      value: pendingFilters.status,
      setValue: (value) => setPendingFilters((prev) => ({ ...prev, status: value })),
    },
    {
      label: "Year",
      options: yearOptions,
      value: pendingFilters.year,
      setValue: (value) => setPendingFilters((prev) => ({ ...prev, year: value, month: "" })),
    },
    {
      label: "Month",
      options: monthOptions,
      value: pendingFilters.month,
      setValue: (value) => setPendingFilters((prev) => ({ ...prev, month: value })),
    },
  ], [pendingFilters, projects, activities, statuses, yearOptions, monthOptions]);

  // Filter tasks based on current filters
useEffect(() => {
  let filtered = [...tasks];

  if (filters.project) {
    filtered = filtered.filter(
      (task) => task.project_code === filters.project
    );
  }

  if (filters.status) {
    filtered = filtered.filter(
      (task) => task.status_display === filters.status
    );
  }

  if (filters.activity) {
    filtered = filtered.filter(
      (task) => task.activity_name === filters.activity
    );
  }
  setFilteredTasks(filtered);
}, [tasks, filters]);

  const getTaskStatuses = (tasksArr) => tasksArr.map(task => (task.status || '').toLowerCase());
  // const statusesInTasks = getTaskStatuses(filteredTasks);
  // const hasStatus = (status) => statusesInTasks.includes(status);
  // const allStatus = (status) => filteredTasks.length > 0 && statusesInTasks.every(s => s === status);

  // const showSubmitWeeklyButton = isSelfView &&
  //   filteredTasks.length > 0 &&
  //   !allStatus('s') &&
  //   allStatus('n') &&
  //   // hasStatus('n') 
  //   !(hasStatus('r') && hasStatus('a')) &&
  //   !statusesInTasks.some(s => s === 'r' || s === 'a');

  // const showApproveWeeklyButton = !isSelfView &&
  //   filteredTasks.length > 0 &&
  //   allStatus('s');

  const taskStatuses = getTaskStatuses(filteredTasks);
  const showSubmitWeeklyButton = isSelfView && filteredTasks.length > 0 && taskStatuses.every(status => status === 'n');
  const showAddIcon = isSelfView && (filteredTasks.length === 0 || taskStatuses.every(status => status === 'n'));
  const showApproveWeeklyButton = !isSelfView && filteredTasks.length > 0 && taskStatuses.every(status => status === 's' || status === 'r');

  const openFilterModal = () => {
    setPendingFilters(filters);
    setShowFilterModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#a970ff" barStyle="light-content" />

      <HeaderComponent 
        headerTitle="Timesheet" 
        onBackPress={() => navigate.goBack()}
        icon1Name="filter"
        icon1OnPress={openFilterModal}
        icon2Name={showAddIcon ? "add" : undefined}
        icon2OnPress={showAddIcon ? () => setShowAddModal(true) : undefined}
      />

      {/* Tab Navigation  */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'timesheet' && styles.activeTab]}
            onPress={() => setActiveTab('timesheet')}
          >
            <Text style={[styles.tabText, activeTab === 'timesheet' && styles.activeTabText]}>
          Timesheet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'summary' && styles.activeTab]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
          Summary
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'timesheet' && (
          <ScrollView
            style={styles.taskList}
            showsVerticalScrollIndicator={false}
          >
            <TimeSheetWeekNavigation
          currentWeekStart={currentWeekStart}
          onNavigate={navigateWeek}
          formatDisplayDate={formatDisplayDate}
          getCurrentWeekDates={getCurrentWeekDates}
          filterRange={{ year: filters.year, month: filters.month, setFilters }}
          getFilterDateRange={getFilterDateRange}
          monthOptions={monthOptions}
            />

            {employee && (
          <View style={styles.employeeContainer}>
            <View style={styles.avatarContainer}>
              {employee.image && (
            <Image
              source={{ uri: employee.image }}
              style={styles.avatar}
            />
              )}
              {employee.is_manager && (
            <View style={styles.managerBadge}>
              <Feather name="award" size={12} color="#fff" />
            </View>
              )}
            </View>

            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>{employee.name}</Text>
              <Text style={styles.employeeId}>{employee.emp_id}</Text>
            </View>
          </View>
            )}

            {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {employee
            ? hasActiveFilters()
              ? "No timesheet entries match your current filters for this employee"
              : "No Timesheet found for this employee"
            : hasActiveFilters()
              ? "No timesheet entries match your current filters"
              : "No Timesheet found for this period"
              }
            </Text>
            {hasActiveFilters() && (
              <Text style={styles.emptySubText}>
            Try adjusting your filters to see more results
              </Text>
            )}
          </View>
            ) : (
          filteredTasks.map((task) => (
            <TimeSheetCard
              key={task.id}
              task={task}
              onEdit={editTask}
              isSelfView={isSelfView}
              onApprove={handleApproveReject}
              onReject={handleApproveReject}
              onDelete={handleDelete}
            />
          ))
            )}
          </ScrollView>
        )}

        {activeTab === 'summary' && (
          <ScrollView
            style={styles.taskList}
            showsVerticalScrollIndicator={false}
          >
            {showWeeklySummary && filteredTasks.length > 0 ? (
          <WeeklySummary
            tasks={filteredTasks}
            formatDisplayDate={formatDisplayDate}
            getCurrentWeekDates={getCurrentWeekDates}
            currentWeekStart={currentWeekStart}
            isSelfView={isSelfView}
            onToggleSummary={() => setShowWeeklySummary(!showWeeklySummary)}
          />
            ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              No summary available for this period
            </Text>
          </View>
            )}
          </ScrollView>
        )}

        {showApproveWeeklyButton && (
          <View style={styles.actionButtonContainer}>
            <ApplyButton 
          // onPress={() => handleWeeklySubmit("WEEKLY_APPROVE")}
          onPress={() => setApproveConfirmModalVisible(true)}
          buttonText="Approve Weekly TimeSheet"
          // icon='add-circle'
            />
          </View>
        )}
        
        {showSubmitWeeklyButton && (
          <View style={styles.actionButtonContainer}>
            <ApplyButton 
          // onPress={() => handleWeeklySubmit("WEEKLY_SUBMIT")}
          onPress={() => setSubmitConfirmModalVisible(true)}
          buttonText="Submit Weekly TimeSheet"
            />
          </View>
        )}

        <AddEditTaskModal
          visible={showAddModal}
          onClose={closeAddModal}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          formData={formData}
          setFormData={setFormData}
          editingTask={editingTask}
          projects={projects}
          activities={activities}
        />
        <FilterModal
            visible={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            onClearFilters={() => {
              setPendingFilters({
                project: "",
                status: "",
                activity: "",
                year: "",
                month: "",
              });
              setFilters({
                project: "",
                status: "",
                activity: "",
                year: "",
                month: "",
              });
              setCurrentWeekStart(new Date()); // <-- This resets the week view!
            }}
            filterConfigs={filterConfigs}
            modalTitle="Filter TimeSheet"
            onApplyFilters={() => {
              setFilters(pendingFilters);
              setShowFilterModal(false);
            }}
          />
          
        {/* Remark modal for weekly Approve and reject */}
        <RemarkModal
          visible={showRemarkModal}
          onClose={() => setShowRemarkModal(false)}
          remark={remark}
          setRemark={setRemark}
          isLoading={isLoading}
          selectedAction={selectedAction}
          onSubmit={handleSubmit}
        />

        <SuccessModal
          visible={isSuccessModalVisible}
          onClose={() => {
          setIsSuccessModalVisible(false);
        }}
        message={successMessage}
      />

      <ErrorModal
        // label="Duplicate Entry Detected"
        visible={isErrorModalVisible}
        message={errorMessage}
        onClose={() => setIsErrorModalVisible(false)}
      />

      <ConfirmationModal
          visible={SubmitConfirmModalVisible || ApproveConfirmModalVisible}
          message={
            SubmitConfirmModalVisible
              ? "Once you submit timesheet you can not add new task for this week. Are you sure to submit it?"
              : "Are you sure you want to approve this timesheet for this particular employee?"
          }
          onConfirm={() => {
            handleWeeklySubmit(SubmitConfirmModalVisible ? "WEEKLY_SUBMIT" : "WEEKLY_APPROVE");
          }}
          onCancel={() => {
            setSubmitConfirmModalVisible(false);
            setApproveConfirmModalVisible(false);
          }}
          confirmText={SubmitConfirmModalVisible ? "Submit" : "Approve"}
          cancelText="Cancel"
      />
      
      <Loader visible={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  taskList: {
    flex: 1,
    // padding: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  employeeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#a970ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#a970ff",
    marginBottom: 10,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    borderWidth: 2,
    borderColor: "#a970ff",
  },
  managerBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#a970ff",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 14,
    color: "#a970ff",
    fontWeight: "600",
  },
  actionButtonContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#fff",
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#a970ff',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#a970ff',
  },
});

export default TimeSheet;