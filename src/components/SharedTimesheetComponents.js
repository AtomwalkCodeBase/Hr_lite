import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import ConfirmationModal from './ConfirmationModal';
// import SelectedDayDetail from './SelectedDayDetail';

// Employee info card for timesheet view
export const EmployeeInfoCard = ({ employee }) => (
  <View style={styles.employeeContainer}>
    <View style={styles.avatarContainer}>
      {employee.image && (
        <Image source={{ uri: employee.image }} style={styles.avatar} />
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
);

// Table row for each day in the weekly summary
export const DailyTableRow = ({ dayData, getDayName, getStatusColor, getStatusText, openDayDetail }) => {
  const isExceeding = dayData.totalHours > 9;
  const projectCount = dayData.projects.size;
  const taskCount = dayData.tasks.length;
  return (
    <TouchableOpacity
      style={[styles.tableRow, isExceeding && styles.exceedingRow]}
      onPress={() => openDayDetail(dayData)}
    >
      <View style={styles.dayColumn}>
        <Text style={styles.dayName}>{getDayName(dayData.date)}</Text>
        <Text style={styles.dayDate}>{dayData.date.getDate()}</Text>
      </View>
      <View style={styles.hoursColumn}>
        <Text style={[styles.hoursText, { color: getStatusColor(dayData.totalHours) }]}> {dayData.totalHours.toFixed(1)}h </Text>
        <Text style={styles.hoursStatus}>{getStatusText(dayData.totalHours)}</Text>
      </View>
      <View style={styles.projectsColumn}>
        <Text style={styles.projectLabel}>{`Projects: ${projectCount} `}</Text>
        <Text style={styles.projectLabel}>{` Tasks: ${taskCount}`}</Text>
      </View>
      <View style={styles.projectsColumn}>
        <AntDesign name="eyeo" size={20} color="#a970ff" />
        <Text style={styles.projectLabel}>View</Text>
      </View>
    </TouchableOpacity>
  );
};

// Modal for exceeding daily hours in weekly summary
export const ExceedModal = ({ visible, exceedingDays, formatDisplayDate, onUnderstand }) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1}>
      <View style={styles.exceedModal}>
        <MaterialIcons name="warning" size={48} color="#f44336" />
        <Text style={styles.exceedTitle}>Daily Hour Limit Exceeded</Text>
        <Text style={styles.exceedMessage}>
          You have exceeded 9 hours on {exceedingDays.length} day(s):
          {'\n'}
          {exceedingDays.map((dateStr) => formatDisplayDate(new Date(dateStr))).join('/ ')}
          {'\n\n'}
          Consider redistributing your work hours for better work-life balance.
        </Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onUnderstand}>
            <Text style={styles.modalButtonText}>Understand</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
);

// Modal for day detail weekly summary
export const DetailModal = ({ visible, selectedDay, formatDisplayDate, isSelfView, onEdit, onDelete, onClose, SelectedDayDetail, showAddModal, showAddIcon }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay} >
      <View style={styles.detailModal}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>
            {selectedDay && formatDisplayDate(selectedDay.date)} Details
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        {/* Pass SelectedDayDetail as a prop for flexibility */}
        {SelectedDayDetail && (
          <SelectedDayDetail selectedDay={selectedDay} formatDisplayDate={formatDisplayDate} isSelfView={isSelfView} onEdit={onEdit} onDelete={onDelete} showAddModal={showAddModal} showAddIcon={showAddIcon} />
        )}
      </View>
    </View>
  </Modal>
);

// Project hours breakdown section weekly summary
export const ProjectHoursBreakdown = ({ selectedDay, progressColor }) => {
  const statusConfig = {
    s: { color: '#2196F3', icon: 'schedule', label: 'SUBMITTED', bgColor: '#E3F2FD', borderColor: '#2196F3' },
    a: { color: '#4CAF50', icon: 'check-circle', label: 'APPROVED', bgColor: '#E8F5E8', borderColor: '#4CAF50' },
    r: { color: '#f44336', icon: 'cancel', label: 'REJECTED', bgColor: '#FFEBEE', borderColor: '#f44336' },
    n: { color: '#FF9800', icon: 'schedule', label: 'DRAFT', bgColor: '#FFF3E0', borderColor: '#FF9800' },
    default: { color: '#9E9E9E', icon: 'help-outline', label: 'UNKNOWN', bgColor: '#F5F5F5', borderColor: '#9E9E9E' },
  };

  if (selectedDay.projects.size === 0) {
    return (
      <View style={styles.projectHoursCard}>
        <Text style={styles.projectHoursTitle}>Project Hours</Text>
        <Text style={{ color: '#999', fontSize: 13, marginTop: 8 }}>No project data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.projectHoursCard}>
      <Text style={styles.projectHoursTitle}>Project Hours</Text>
      {Array.from(selectedDay.projects).map(projectCode => {
        // Find the first task with this project code to get the project name
        const firstTask = selectedDay.tasks.find(task => task.project_code.trim() === projectCode.trim());
        const projectName = firstTask ? firstTask.project_name : '';
        const displayName = projectName
          ? `${projectName} (${projectCode})`
          : projectCode;

        // Sum hours for this project code
        const projectTasks = selectedDay.tasks.filter(task => task.project_code.trim() === projectCode.trim());
        const projectHours = projectTasks.reduce((sum, task) => sum + (parseFloat(task.effort) || 0), 0);

        // Group activities by activity_id and status
        const activities = projectTasks.map(task => ({
          activityName: task.activity_name,
          status: (task.status || 'n').toLowerCase(),
          effort: task.effort,
        }));

        // Determine color for projectHourValue
        let projectHourValueColor = progressColor;
        if (activities.length === 1) {
          const status = statusConfig[activities[0].status] || statusConfig.default;
          projectHourValueColor = status.color;
        } else if (activities.length > 1) {
          const allSameStatus = activities.every(a => a.status === activities[0].status);
          if (allSameStatus) {
            const status = statusConfig[activities[0].status] || statusConfig.default;
            projectHourValueColor = status.color;
          }
        }

        return (
          <View key={projectCode} style={styles.projectHourItem}>
            <View style={styles.projectHourInfo}>
              <Text style={[styles.projectHourName]}>{displayName}</Text>
              <Text style={[styles.projectHourValue, {color: projectHourValueColor}]}>{projectHours.toFixed(1)}h</Text>
            </View>
            <View style={styles.projectHourBar}>
              {/* Segmented bar for each activity by status */}
              {activities.length > 0 ? (
                <View style={{flexDirection: 'row', height: '100%', width: '100%'}}>
                  {activities.map((activity, idx) => {
                    const status = statusConfig[activity.status] || statusConfig.default;
                    const widthPercent = projectHours > 0 ? ((parseFloat(activity.effort) || 0) / projectHours) * 100 : 0;
                    return (
                      <View
                        key={idx}
                        style={{
                          height: '100%',
                          width: `${widthPercent}%`,
                          backgroundColor: status.color,
                          borderTopLeftRadius: idx === 0 ? 3 : 0,
                          borderBottomLeftRadius: idx === 0 ? 3 : 0,
                          borderTopRightRadius: idx === activities.length - 1 ? 3 : 0,
                          borderBottomRightRadius: idx === activities.length - 1 ? 3 : 0,
                        }}
                      />
                    );
                  })}
                </View>
              ) : (
                <View
                  style={[
                    styles.projectHourFill,
                    {
                      width: `${(projectHours / selectedDay.totalHours) * 100}%`,
                      backgroundColor: progressColor
                    }
                  ]}
                />
              )}
            </View>
            {/* Activity breakdown */}
            <View style={{marginTop: 6, marginLeft: 4}}>
              {activities.map((activity, idx) => {
                const status = statusConfig[activity.status] || statusConfig.default;
                return (
                  <View key={idx} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                    <MaterialIcons name={status.icon} size={14} color={status.color} style={{marginRight: 4}} />
                    <Text style={{fontSize: 13, color: status.color, fontWeight: '600'}}>{activity.activityName}</Text>
                    <Text style={{fontSize: 12, color: '#555', marginLeft: 4}}>
                      ({parseFloat(activity.effort) || 0}h)
                    </Text>
                    <Text style={{fontSize: 12, color: '#888', marginLeft: 6}}>{status.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

// Task detail card for each task
export const TaskDetailCard = ({ task, selectedDay, isSelfView, onEdit, onDelete, statusConfig }) => {
  const taskStatusKey = (task.status || 'n').toLowerCase();
  const taskStatus = statusConfig[taskStatusKey] || statusConfig.default;
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskHeaderLeft}>
          <Text style={styles.taskProject}>{task.project_code.trim()}</Text>
          <Text style={styles.taskActivity}>{task.activity_name}</Text>
        </View>
        <View style={styles.taskHeaderRight}>
          <View style={[styles.statusBadge, { backgroundColor: taskStatus.bgColor }]}> 
            <MaterialIcons name={taskStatus.icon} size={14} color={taskStatus.color} />
            <Text style={[styles.statusText, { color: taskStatus.color }]}>
              {taskStatus.label}
            </Text>
          </View>
          <Text style={styles.taskHours}>{task.effort}h</Text>
        </View>
      </View>
      {task.remarks && (
        <View style={styles.taskRemarks}>
          <MaterialIcons name="comment" size={14} color="#666" />
          <Text style={styles.remarksText}>{task.remarks}</Text>
        </View>
      )}
      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          <MaterialIcons name="schedule" size={12} color="#666" />
          <Text style={styles.taskTime}>
            {((parseFloat(task.effort) || 0) / selectedDay.totalHours * 100).toFixed(1)}% of day
          </Text>
        </View>
        {isSelfView && (String(task.status || 'n').toLowerCase() === 'n') && (
          <View style={{flexDirection: "row", gap: 8}}>
          <TouchableOpacity style={[styles.editButton, {backgroundColor: "#FFEBEE"}]} onPress={() => setIsConfirmModalVisible(true)}>
            <MaterialIcons name="delete-outline" size={16} color="#f44336" />
            <Text style={[styles.editButtonText, {color: "#f44336"}]}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editButton} onPress={() => onEdit(task)}>
            <Ionicons name="create-outline" size={16} color="#a970ff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          </View>
        )}
      </View>

      <ConfirmationModal
        visible={isConfirmModalVisible}
        message="Your task will be Deleted. Are you sure you want to delete it ?"
       onConfirm={() => {
          onDelete(task);
          setIsConfirmModalVisible(false);
        }}
        onCancel={() => setIsConfirmModalVisible(false)}
        confirmText="Delete"
        cancelText="Cancel"
        color="red"
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  exceedingRow: {
    backgroundColor: "#ffebee",
    borderLeftWidth: 3,
    borderLeftColor: "#f44336",
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
  },
  dayName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  dayDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  hoursColumn: {
    flex: 1,
    alignItems: "center",
  },
  hoursText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  hoursStatus: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  projectsColumn: {
    flex: 1,
    alignItems: "center",
  },
  projectCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  projectLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  exceedModal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    margin: 20,
    maxWidth: 320,
  },
  exceedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f44336",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  exceedMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButtons: {
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#a970ff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 10
  },
  detailModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  projectHoursCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectHoursTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  projectHourItem: {
    marginBottom: 12,
  },
  projectHourInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectHourName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    maxWidth: 300
  },
  projectHourValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#a970ff',
  },
  projectHourBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  projectHourFill: {
    height: '100%',
    // backgroundColor: '#a970ff',
    borderRadius: 3,
  },
  taskCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#a970ff',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskHeaderLeft: {
    flex: 1,
  },
  taskProject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  taskActivity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  taskHeaderRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskHours: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a970ff',
  },
  taskRemarks: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 6,
  },
  remarksText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    flex: 1,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskTime: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#f3f0ff',
    gap: 4,
  },
  editButtonText: {
    fontSize: 13,
    color: '#a970ff',
    fontWeight: '600',
  },
}); 