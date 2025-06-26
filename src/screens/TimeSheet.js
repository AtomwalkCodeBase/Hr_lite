import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, StatusBar, Dimensions, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DropdownPicker from "../components/DropdownPicker";
import { getActivitylist, getProjectlist, getTimesheetData, postTimeList } from "../services/productServices";
import DatePicker from "../components/DatePicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../components/old_components/Loader";
import { router, useLocalSearchParams } from "expo-router";
import HeaderComponent from "../components/HeaderComponent";

const { width, height } = Dimensions.get("window");

const TaskCard = ({ task, onEdit, getStatusColor, formatDisplayDate, isSelfView }) => {
    const statusConfig = {
    s: { 
      color: '#008000', // Green
      icon: 'check-circle-outline',
      label: 'SUBMITTED',
      bgColor: '#4CD96415'
    },
    a: { 
      color: '#2196F3', // Blue
      icon: 'schedule',
      label: 'APPROVED',
      bgColor: '#5AC8FA15'
    },
    // 'in progress': { 
    //   color: '#5856D6', // Purple
    //   icon: 'autorenew',
    //   label: 'In Progress',
    //   bgColor: '#5856D615'
    // },
    r: { 
      color: '#FF6B6B', // Red
      icon: 'delete-outline',
      label: 'Deleted',
      bgColor: '#FF6B6B15'
    },
    // pending: { 
    //   color: '#FFC107', // Yellow/Amber
    //   icon: 'hourglass-empty',
    //   label: 'Pending',
    //   bgColor: '#FFC10715'
    // },
    // 'on hold': { 
    //   color: '#FF9500', // Orange
    //   icon: 'pause-circle-outline',
    //   label: 'On Hold',
    //   bgColor: '#FF950015'
    // },
    // hold: { 
    //   color: '#FF9500', // Orange
    //   icon: 'pause-circle-outline',
    //   label: 'On Hold',
    //   bgColor: '#FF950015'
    // },
    // 'waiting for response': { 
    //   color: '#34AADC', // Light Blue
    //   icon: 'chat-bubble-outline',
    //   label: 'Waiting for Response',
    //   bgColor: '#34AADC15'
    // },
    n: { 
      color: '#888888', // Gray
      icon: 'schedule',
      label: 'Not Submitted',
      bgColor: '#88888815'
    },
    // 'not planned': { 
    //   color: '#888888', // Gray
    //   icon: 'schedule',
    //   label: 'Not Planned',
    //   bgColor: '#88888815'
    // },
    default: {
      color: '#888888', // Gray
      icon: 'help-outline',
      label: 'Unknown',
      bgColor: '#88888815'
    }
  };
  const statusKey = (task.status || 'default').toLowerCase();
  const status = statusConfig[statusKey] || statusConfig.default;
  return(
  <View style={styles.taskCard}>
    <View style={styles.taskHeader}>
      <Text style={styles.taskProject}>{task.project_code}</Text>
      <View style={styles.taskHeaderRight}>

        { isSelfView && 
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(task)}>
          <Ionicons name="create-outline" size={20} color="#a970ff" />
        </TouchableOpacity>
        }
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status.bgColor }
          ]}
        >
          <MaterialIcons name={status.icon} size={16} color={status.color} />
          <Text style={[styles.statusText,, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
    </View>

    <Text style={styles.taskActivity}>{task.activity_name}</Text>

    <View style={styles.taskDetails}>
      <View style={styles.taskDetailItem}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.taskDetailText}>
          {formatDisplayDate(task.a_date)}
        </Text>
      </View>

      <View style={styles.taskDetailItem}>
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.taskDetailText}>{task.effort}h</Text>
      </View>
    </View>

    {task.remarks && <Text style={styles.taskRemarks}>{task.remarks}</Text>}
  </View>
)};

const WeekNavigation = ({ currentWeekStart, onNavigate, formatDisplayDate, getCurrentWeekDates }) => {
  const { start: weekStart, end: weekEnd } = getCurrentWeekDates(currentWeekStart);
  return (
    <View style={styles.weekNavigation}>
      <TouchableOpacity
        style={styles.weekNavButton}
        onPress={() => onNavigate(-1)}
      >
        <Ionicons name="chevron-back" size={24} color="#a970ff" />
      </TouchableOpacity>

      <View style={styles.weekInfo}>
        <Text style={styles.weekText}>
          {formatDisplayDate(weekStart)} - {formatDisplayDate(weekEnd)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.weekNavButton}
        onPress={() => onNavigate(1)}
      >
        <Ionicons name="chevron-forward" size={24} color="#a970ff" />
      </TouchableOpacity>
    </View>
  );
};

const TimeSheet = () => {
  const { employee: employeeParam } = useLocalSearchParams();
  const employee = employeeParam ? JSON.parse(employeeParam) : null;
  const [empId, setEmpId] = useState(null);
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

  const statuses = ["PENDING", "SUBMITTED", "APPROVED", "REJECTED"];

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
    if (!empId) return; 
    setIsLoading(true);
    try {
      const res = await getTimesheetData( empId, formattedStartDate, formattedEndDate);
      setTasks(res.data.reverse() || []);
       setIsLoading(false);
    } catch (err) {
      console.error("Error fetching timesheet data:", err);
      Alert.alert("Error", "Failed to fetch timesheet data");
    }
  };

  useEffect(() => {
    if (empId) {
      getTimeSheetList();
    }
  }, [empId, currentWeekStart]);

  const handleSubmit = async (callMode) => {
    if (!formData.project || !formData.activity || !formData.hours) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    const empId = await AsyncStorage.getItem("empId");
    const formattedDate = formatDateForAPI(formData.date);

    let submittedData = {
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
    console.log("data", submittedData);
    try {
      const res = await postTimeList(submittedData);
      if (res.status === 200) {
        Alert.alert("Success", "Timesheet submitted successfully!");
        setFormData({
          project: "",
          activity: "",
          date: new Date(),
          hours: "",
          remarks: "",
        });
        setShowAddModal(false);
        setEditingTask(null);
        getTimeSheetList(); // Refresh the list
      } else {
        Alert.alert("Error", "Failed to submit timesheet. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      Alert.alert(
        "Error",
        `Failed to submit: ${error.response?.data?.detail || error.message}`
      );
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

  const handleWeeklySubmit = async (callMode) => {
    const { start, end } = getCurrentWeekDates(currentWeekStart);
    const formattedStartDate = formatDateForAPI(start);
    const formattedEndDate = formatDateForAPI(end);

    setIsLoading(true);

    const EmpId = await AsyncStorage.getItem("empId");

    let submittedData = {
      a_emp_id: empId,
      emp_id: EmpId,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      call_mode: callMode,
    };
    try {
      const res = await postTimeList(submittedData);
      if (res.status === 200) {
        Alert.alert(
          "Success",
          `Weekly Timesheet submitted successfully for: ${formattedStartDate} to ${formattedEndDate}`
        );
      }
    } catch (err) {
      console.error("Error Weekly Timesheet not Submitted:", err);
      Alert.alert("Error", "Failed to submit weekly Timesheet ");
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
  };

    const handleBackPress = () => {
      router.navigate({
        pathname: 'home',
        params: { screen: 'HomePage' }
      });
    };

  useEffect(() => {
    getTimeSheetList();
  }, [currentWeekStart]);

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

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.a_date);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        return taskDate >= startDate && taskDate <= endDate;
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, filters]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#a970ff" barStyle="light-content" />

      {/* Header */}
        <HeaderComponent 
        headerTitle="Timesheet" 
        onBackPress={handleBackPress}
        icon1Name="filter"
        icon1OnPress={() => setShowFilterModal(true)}
         icon2Name={isSelfView ? "add" : undefined}
        icon2OnPress={isSelfView ? () => setShowAddModal(true) : undefined}
      />


      {/* Week Navigation */}
      <WeekNavigation
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
                    <MaterialIcons name="star" size={14} color="#fff" />
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
                {employee ? "No timesheet found for this period" : "No Timesheet found for this employee"}
              </Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={editTask}
                isSelfView={isSelfView}
                formatDisplayDate={formatDisplayDate}
              />
            ))
          )}

          {/* Weekly Submit Button */}
        </ScrollView>
        <TouchableOpacity
          style={styles.weeklySubmitButton}
          onPress={isSelfView ? () => handleWeeklySubmit("WEEKLY_SUBMIT") : () => handleWeeklySubmit("WEEKLY_APPROVE")}
        >
          {/* <Ionicons name="cloud-upload-outline" size={20} color="white" /> */}
          <Text style={styles.weeklySubmitText}>{isSelfView ? "Submit Weekly TimeSheet" : "Approve Weekly TimeSheet" }</Text>
        </TouchableOpacity>
      </>

      {/* Add/Edit Task Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={closeAddModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask ? "Edit Task" : "Add New Task"}
              </Text>
              <TouchableOpacity onPress={closeAddModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <DropdownPicker
                  label="Project *"
                  data={projects.map((project) => ({
                    label: project[0],
                    value: project[0],
                  }))}
                  value={formData.project}
                  setValue={(value) =>
                    setFormData((prev) => ({ ...prev, project: value }))
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <DropdownPicker
                  label="Activity *"
                  data={activities.map((activity) => ({
                    label: activity.name,
                    value: activity.activity_id,
                  }))}
                  value={formData.activity}
                  setValue={(value) =>
                    setFormData((prev) => ({ ...prev, activity: value }))
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <DatePicker
                  cDate={formData.date}
                  label="Date *"
                  setCDate={(date) =>
                    setFormData((prev) => ({ ...prev, date }))
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Working Hours *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hours}
                  onChangeText={(value) =>
                    setFormData((prev) => ({ ...prev, hours: value }))
                  }
                  placeholder="Enter hours"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Remarks</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.remarks}
                  onChangeText={(value) =>
                    setFormData((prev) => ({ ...prev, remarks: value }))
                  }
                  placeholder="Add remarks..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
              </View>

              {editingTask ? (
                <TouchableOpacity
                  style={[styles.addButton, styles.addOnlyButton]}
                  onPress={() => handleSubmit("UPDATE")}
                  disabled={isLoading}
                >
                  <Text style={styles.addButtonText}>
                    {isLoading ? "UPDATING..." : "UPDATE"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.addButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.addButton, styles.addOnlyButton]}
                    onPress={() => handleSubmit("ADD_AND_SAVE")}
                    disabled={isLoading}
                  >
                    <Text style={styles.addButtonText}>
                      {isLoading ? "SAVING..." : "SAVE"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.addButton, styles.addAndSaveButton]}
                    onPress={() => handleSubmit("SUBMIT")}
                    disabled={isLoading}
                  >
                    <Text style={styles.addButtonText}>
                      {isLoading ? "SUBMITTING..." : "SUBMIT"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
        <Loader visible={isLoading} />
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Tasks</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <DropdownPicker
                  label="Project"
                  data={projects.map((project) => ({
                    label: project[0],
                    value: project[0],
                  }))}
                  value={filters.project}
                  setValue={(value) =>
                    setFilters((prev) => ({ ...prev, project: value }))
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <DropdownPicker
                  label="Activity"
                  data={activities.map((activity) => ({
                    label: activity.name,
                    value: activity.id,
                  }))}
                  value={filters.activity}
                  setValue={(value) =>
                    setFilters((prev) => ({ ...prev, activity: value }))
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <DropdownPicker
                  label="Status"
                  data={statuses.map((status) => ({
                    label: status,
                    value: status,
                  }))}
                  value={filters.status}
                  setValue={(value) =>
                    setFilters((prev) => ({ ...prev, status: value }))
                  }
                />
              </View>

              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default TimeSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  weekNavigation: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  weekNavButton: {
    padding: 5,
  },
  weekInfo: {
    flex: 1,
    alignItems: "center",
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskProject: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  taskActivity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  taskDetails: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 8,
  },
  taskDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  taskDetailText: {
    fontSize: 14,
    color: "#666",
  },
  taskRemarks: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    marginTop: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#a970ff",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    flex: 1,
  },
  addButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  addOnlyButton: {
    backgroundColor: "#8B5CF6",
  },
  addAndSaveButton: {
    backgroundColor: "#a970ff",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    marginTop: 20,
    marginBottom: 20,
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
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  confirmModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  confirmModalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  confirmModalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmCancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmYesButton: {
    flex: 1,
    backgroundColor: "#a970ff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmYesText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  filterButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#a970ff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#a970ff",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#a970ff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  taskHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: "#f8f4ff",
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
