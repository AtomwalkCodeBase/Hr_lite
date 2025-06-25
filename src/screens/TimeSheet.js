import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropdownPicker from '../components/DropdownPicker';
import { getActivitylist, getProjectlist, getTimesheetData, postTimeList } from '../services/productServices';
import DatePicker from '../components/DatePicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../components/old_components/Loader';

const { width, height } = Dimensions.get('window');

const CustomDropdown = ({ items, selected, onSelect, placeholder, dropdown, dropdownStates, toggleDropdown }) => (
  <View style={styles.dropdownContainer}>
    <TouchableOpacity
      style={styles.dropdownButton}
      onPress={() => toggleDropdown(dropdown)}
    >
      <Text style={[styles.dropdownText, !selected && styles.placeholderText]}>
        {selected || placeholder}
      </Text>
      <Ionicons 
        name={dropdownStates[dropdown] ? "chevron-up" : "chevron-down"} 
        size={20} 
        color="#666" 
      />
    </TouchableOpacity>
    
    {dropdownStates[dropdown] && (
      <View style={styles.dropdownList}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dropdownItem}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.dropdownItemText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

const TaskCard = ({ task, onEdit, getStatusColor, formatDisplayDate }) => (
  <View style={styles.taskCard}>
    <View style={styles.taskHeader}>
      <Text style={styles.taskProject}>{task.project_code}</Text>
      <View style={styles.taskHeaderRight}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(task)}
        >
          <Ionicons name="create-outline" size={20} color="#a970ff" />
        </TouchableOpacity>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status_display) }]}>
          <Text style={styles.statusText}>{task.status_display}</Text>
        </View>
      </View>
    </View>
    
    <Text style={styles.taskActivity}>{task.activity_name}</Text>
    
    <View style={styles.taskDetails}>
      <View style={styles.taskDetailItem}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.taskDetailText}>{formatDisplayDate(task.a_date)}</Text>
      </View>
      
      <View style={styles.taskDetailItem}>
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.taskDetailText}>{task.effort}h</Text>
      </View>
    </View>
    
    {task.remarks && (
      <Text style={styles.taskRemarks}>{task.remarks}</Text>
    )}
  </View>
);

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
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    project: '',
    activity: '',
    date: new Date(),
    hours: '',
    remarks: ''
  });

   // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    project: '',
    status: '',
    activity: ''
  });

  const [dropdownStates, setDropdownStates] = useState({
    project: false,
    activity: false,
    status: false,
    filterProject: false,
    filterStatus: false,
    filterActivity: false
  });

    const statuses = ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'];

    const formatDateForAPI = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDisplayDate = (dateString) => {
    if (dateString instanceof Date) {
      return dateString.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    // Handle API date format (23-Jun-2025)
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#10B981';
      case 'SUBMITTED': return '#F59E0B';
      case 'PENDING': return '#EF4444';
      case 'REJECTED': return '#6B7280';
      default: return '#6B7280';
    }
  };

   // API Functions
  const fetchActivityCategories = async () => {
    try {
      const res = await getActivitylist();
      setActivities(res.data);
    } catch (err) {
      console.error("Error fetching activities:", err);
      Alert.alert('Error', 'Failed to fetch activities');
    }
  };

  const fetchProjectCategories = async () => {
    try {
      const res = await getProjectlist();
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      Alert.alert('Error', 'Failed to fetch projects');
    }
  };

  const getTimeSheetList = async () => {
    const { start, end } = getCurrentWeekDates(currentWeekStart);
    const formattedStartDate = formatDateForAPI(start);
    const formattedEndDate = formatDateForAPI(end);

    const empId = await AsyncStorage.getItem('empId');
    
    try {
      const res = await getTimesheetData(empId, formattedStartDate, formattedEndDate);
      setTasks(res.data.reverse() || []);
    } catch (err) {
      console.error("Error fetching timesheet data:", err);
      Alert.alert('Error', 'Failed to fetch timesheet data');
    }
  };

  const handleSubmit = async (callMode) => {
    if (!formData.project || !formData.activity || !formData.hours) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const empId = await AsyncStorage.getItem('empId');

    setIsLoading(true);
    const formattedDate = formatDateForAPI(formData.date);
    
    const submittedData = {
      emp_id: empId,
      project_code: formData.project,
      activity_id: formData.activity,
      a_date: formattedDate,
      effort: Number.parseFloat(formData.hours),
      remarks: formData.remarks,
      call_mode: callMode
    };
console.log("data", submittedData)
    try {
      const res = await postTimeList(submittedData);
      if (res.status === 200) {
        Alert.alert('Success', 'Timesheet submitted successfully!');
        setFormData({
          project: '',
          activity: '',
          date: new Date(),
          hours: '',
          remarks: ''
        });
        setShowAddModal(false);
        setEditingTask(null);
        getTimeSheetList(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to submit timesheet. Please try again.');
      }
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      Alert.alert('Error', `Failed to submit: ${error.response?.data?.detail || error.message}`);
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
      remarks: task.remarks || ''
    });
    setEditingTask(task);
    setShowAddModal(true);
  };

    const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  const handleWeeklySubmit = async () => {
    const { start, end } = getCurrentWeekDates(currentWeekStart);
    const formattedStartDate = formatDateForAPI(start);
    const formattedEndDate = formatDateForAPI(end);
    
    try {
      const res = await getTimesheetData("EMP_005", formattedStartDate, formattedEndDate);
      setTasks(res.data || []);
      Alert.alert('Success', `Weekly tasks submitted for: ${formattedStartDate} to ${formattedEndDate}`);
    } catch (err) {
      console.error("Error fetching timesheet data:", err);
      Alert.alert('Error', 'Failed to submit weekly tasks');
    }
  };

    const closeAddModal = () => {
    setShowAddModal(false);
    setEditingTask(null);
    setFormData({
      project: '',
      activity: '',
      date: new Date(),
      hours: '',
      remarks: ''
    });
  };

    const toggleDropdown = (dropdown) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

   const selectDropdownValue = (dropdown, value, isFilter = false) => {
    if (isFilter) {
      setFilters(prev => ({ ...prev, [dropdown]: value }));
    } else {
      setFormData(prev => ({ ...prev, [dropdown]: value }));
    }
    setDropdownStates(prev => ({ ...prev, [dropdown]: false }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      project: '',
      status: '',
      activity: ''
    });
  };

   useEffect(() => {
    fetchActivityCategories();
    fetchProjectCategories();
    getTimeSheetList();
  }, []);

  useEffect(() => {
    getTimeSheetList();
  }, [currentWeekStart]);

  // Filter tasks based on current filters
  useEffect(() => {
    let filtered = [...tasks];

    if (filters.project) {
      filtered = filtered.filter(task => task.project_code === filters.project);
    }

    if (filters.status) {
      filtered = filtered.filter(task => task.status_display === filters.status);
    }

    if (filters.activity) {
      filtered = filtered.filter(task => task.activity_name === filters.activity);
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(task => {
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Tasks</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Week Navigation */}
      <WeekNavigation 
        currentWeekStart={currentWeekStart}
        onNavigate={navigateWeek}
        formatDisplayDate={formatDisplayDate}
        getCurrentWeekDates={getCurrentWeekDates}
      />
<>
      {/* Task List */}
      <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No tasks found for this period</Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard 
              key={task.id}
              task={task}
              onEdit={editTask}
              getStatusColor={getStatusColor}
              formatDisplayDate={formatDisplayDate}
            />
          ))
        )}
        
        {/* Weekly Submit Button */}
      </ScrollView>
        <TouchableOpacity style={styles.weeklySubmitButton} onPress={handleWeeklySubmit}>
          <Ionicons name="cloud-upload-outline" size={20} color="white" />
          <Text style={styles.weeklySubmitText}>Submit Weekly Tasks</Text>
        </TouchableOpacity>

      </>

      {/* Add/Edit Task Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask ? 'Edit Task' : 'Add New Task'}
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
                  setValue={(value) => setFormData(prev => ({ ...prev, project: value }))}
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
                  setValue={(value) => setFormData(prev => ({ ...prev, activity: value }))}
                />
              </View>

              <View style={styles.formGroup}>
                <DatePicker 
                  cDate={formData.date} 
                  label="Date *" 
                  setCDate={(date) => setFormData(prev => ({ ...prev, date }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Working Hours *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hours}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, hours: value }))}
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
                  onChangeText={(value) => setFormData(prev => ({ ...prev, remarks: value }))}
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
                    {isLoading ? 'UPDATING...' : 'UPDATE'}
                  </Text>
                </TouchableOpacity>
              ): (<View style={styles.addButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.addButton, styles.addOnlyButton]} 
                  onPress={() => handleSubmit("ADD_AND_SAVE")}
                  disabled={isLoading}
                >
                  <Text style={styles.addButtonText}>
                    {isLoading ? 'sAVING...' : 'SAVE'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.addButton, styles.addAndSaveButton]} 
                  onPress={() => handleSubmit("SUBMIT")}
                  disabled={isLoading}
                >
                  <Text style={styles.addButtonText}>
                    {isLoading ? 'SUBMITTING...' : 'SUBMIT'}
                  </Text>
                </TouchableOpacity>
              </View>)}

              
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
                  setValue={(value) => setFilters(prev => ({ ...prev, project: value }))}
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
                  setValue={(value) => setFilters(prev => ({ ...prev, activity: value }))}
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
                  setValue={(value) => setFilters(prev => ({ ...prev, status: value }))}
                />
              </View>

              <View style={styles.filterButtons}>
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
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
          </View>
        </View>
      </Modal>
      <Loader visible={isLoading} />
    </SafeAreaView>
  );
};

export default TimeSheet

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#a970ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 5,
  },
  weekNavigation: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  weekNavButton: {
    padding: 5,
  },
  weekInfo: {
    flex: 1,
    alignItems: 'center',
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taskList: {
    flex: 1,
    padding: 20,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskProject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  taskActivity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  taskDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  taskDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDetailText: {
    fontSize: 14,
    color: '#666',
  },
  taskRemarks: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#a970ff',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    flex: 1,
  },
  addButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  addOnlyButton: {
    backgroundColor: '#8B5CF6',
  },
  addAndSaveButton: {
    backgroundColor: '#a970ff',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weeklySubmitButton: {
    marginHorizontal: 10,
    backgroundColor: '#a970ff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weeklySubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  confirmModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  confirmModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmYesButton: {
    flex: 1,
    backgroundColor: '#a970ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmYesText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#a970ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#a970ff',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#a970ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskHeaderRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
editButton: {
  padding: 4,
  borderRadius: 6,
  backgroundColor: '#f8f4ff',
},
});
