import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, StatusBar, Dimensions, Image } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DropdownPicker from "../components/DropdownPicker";
import { getActivitylist, getProjectlist, getTimesheetData, postTimeList } from "../services/productServices";
import DatePicker from "../components/DatePicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../components/old_components/Loader";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import HeaderComponent from "../components/HeaderComponent";
import TimeSheetCard from "../components/TimeSheetCard";
import TimeSheetWeekNavigation from "../components/TimeSheetWeekNavigation";
import AddEditTaskModal from '../components/TimeSheetAddEditTaskModal';
import FilterModal from '../components/TimeSheetFilterModal';
import RemarkModal from '../components/RemarkModal';
import SuccessModal from "../components/SuccessModal";
import ErrorModal from "../components/ErrorModal";

const { width, height } = Dimensions.get("window");

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
  const [selectedAction, setSelectedAction] = useState(null); // 'APPROVE' or 'REJECT'
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigation();

  useEffect(() => {
    (async () => {
      if (employee?.emp_id) {
        setEmpId(employee.emp_id);
        setIsSelfView(false); // viewing someone else's sheet
      } else {
        const storedEmpId = await AsyncStorage.getItem('empId');
        setEmpId(storedEmpId);
        setIsSelfView(true); // viewing your own sheet
      }
    })();
  }, []);

  const [formData, setFormData] = useState({
    project: "",
    activity: "",
    date: new Date(),
    hours: "",
    remarks: "",
  });

  // Filter states
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    project: "",
    status: "",
    activity: "",
  });

  const statuses = ["NOT SUBMITTED", "SUBMITTED", "APPROVED", "REJECTED"];

  const formatDateForAPI = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDisplayDate = (dateString) => {
    if (dateString instanceof Date) {
      return dateString.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    // Handle API date format (23-Jun-2025)
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

  // useEffect call
  useEffect(() => {
    fetchActivityCategories();
    fetchProjectCategories();
  }, []);

  // API Functions
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
    try {
      const res = await getProjectlist();
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      Alert.alert("Error", "Failed to fetch projects");
    }
  };

  const getTimeSheetList = async () => {
    const { start, end } = getCurrentWeekDates(currentWeekStart);
    const formattedStartDate = formatDateForAPI(start);
    const formattedEndDate = formatDateForAPI(end);
    if (!EmpId) return; 
    setIsLoading(true);
    try {
      const res = await getTimesheetData( EmpId, formattedStartDate, formattedEndDate);
      setTasks(res.data.reverse() || []);
       setIsLoading(false);
    } catch (err) {
      console.error("Error fetching timesheet data:", err);
      Alert.alert("Error", "Failed to fetch timesheet data");
    }
  };

  useEffect(() => {
    if (EmpId) {
      getTimeSheetList();
    }
  }, [EmpId, currentWeekStart]);

const handleSubmit = async (callMode) => {
  if (callMode !== 'APPROVE' && callMode !== 'REJECT') {
    if (!formData.project || !formData.activity || !formData.hours) {
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
    submittedData = {
      emp_id: empId,
      project_code: formData.project,
      activity_id: formData.activity,
      a_date: formattedDate,
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
    setErrorMessage( `Failed to ${callMode.toLowerCase()}: ${error.response?.data?.detail || error.message}`)
  } finally {
    setIsLoading(false);
  }
};

  const editTask = (task) => {
    // Convert API date format to Date object
    let taskDate = new Date();
    if (task.a_date) {
      const parsedDate = new Date(task.a_date);
      if (!isNaN(parsedDate.getTime())) {
        taskDate = parsedDate;
      }
    }

    setFormData({
      project: task.project_code,
      activity: task.activity_id,
      date: taskDate,
      hours: task.effort.toString(),
      remarks: task.remarks || "",
    });
    setEditingTask(task);
    setShowAddModal(true);
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

    const empId = await AsyncStorage.getItem("empId");

    let submittedData = {
      a_emp_id: EmpId,
      emp_id: empId,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      call_mode: callMode,
    };
    console.log("data for weekly Submit", submittedData);
    try {
      const res = await postTimeList(submittedData);
      if (res.status === 200) {
      setIsSuccessModalVisible(true)
      setSuccessMessage(`Weekly Timesheet submitted successfully for: ${formattedStartDate} to ${formattedEndDate}`)
      }
    } catch (err) {
      console.error("Error Weekly Timesheet not Submitted:", err);
      setIsErrorModalVisible(true);
      setErrorMessage("Failed to submit weekly Timesheet ")
    } finally {
      setIsLoading(false);
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

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      project: "",
      status: "",
      activity: "",
    });
    setShowFilterModal(false)
  };

  useEffect(() => {
    getTimeSheetList();
  }, [currentWeekStart]);

  const allTasksSubmitted = filteredTasks.length > 0 && filteredTasks.every(task => task.status.toLowerCase() === 's');

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

    // if (filters.startDate && filters.endDate) {
    //   filtered = filtered.filter((task) => {
    //     const taskDate = new Date(task.a_date);
    //     const startDate = new Date(filters.startDate);
    //     const endDate = new Date(filters.endDate);
    //     return taskDate >= startDate && taskDate <= endDate;
    //   });
    // }

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#a970ff" barStyle="light-content" />

      {/* Header */}
        <HeaderComponent 
        headerTitle="Timesheet" 
        onBackPress={()=> navigate.goBack()}
        icon1Name="filter"
        icon1OnPress={() => setShowFilterModal(true)}
        icon2Name={isSelfView ? "add" : undefined}
        icon2OnPress={isSelfView ? () => setShowAddModal(true) : undefined}
      />


      {/* Week Navigation */}
      <TimeSheetWeekNavigation
        currentWeekStart={currentWeekStart}
        onNavigate={navigateWeek}
        formatDisplayDate={formatDisplayDate}
        getCurrentWeekDates={getCurrentWeekDates}
      />
      <>
        {/* Task List */}
        <ScrollView
          style={styles.taskList}
          showsVerticalScrollIndicator={false}
        >
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
                {employee ? "No Timesheet found for this employee" : "No timesheet found for this period"  }
              </Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TimeSheetCard
                key={task.id}
                task={task}
                onEdit={editTask}
                isSelfView={isSelfView}
                formatDisplayDate={formatDisplayDate}
                onApprove={handleApproveReject}
                onReject={handleApproveReject}
              />
            ))
          )}

          {/* Weekly Submit Button */}
        </ScrollView>
                  {!isSelfView && allTasksSubmitted && (
            <TouchableOpacity
              style={styles.weeklySubmitButton}
              onPress={() => handleWeeklySubmit("WEEKLY_APPROVE")}
            >
              <Text style={styles.weeklySubmitText}>Approve Weekly TimeSheet</Text>
            </TouchableOpacity>
          )}
          {isSelfView && !allTasksSubmitted && (
            <TouchableOpacity
              style={styles.weeklySubmitButton}
              onPress={() => handleWeeklySubmit("WEEKLY_SUBMIT")}
            >
              <Text style={styles.weeklySubmitText}>Submit Weekly TimeSheet</Text>
            </TouchableOpacity>
          )}
      </>

      {/* Add/Edit Task Modal */}
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

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        projects={projects}
        activities={activities}
        statuses={statuses}
        clearFilters={clearFilters}
      />

      {/* Remark Modal */}
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
          router.back(); 
        }}
        message={successMessage}
      />

        <ErrorModal
          visible={isErrorModalVisible}
          message={errorMessage}
          onClose={() => setIsErrorModalVisible(false)}
        />
    </SafeAreaView>
  );
};

export default TimeSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
  },
  weeklySubmitButton: {
    marginHorizontal: 10,
    backgroundColor: "#a970ff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weeklySubmitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    marginBottom: 10
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
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(169, 112, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
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
});
