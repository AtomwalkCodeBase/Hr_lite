import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import md5 from "md5"; // Import md5 for task hashing

const WeeklySummary = ({
  tasks,
  formatDisplayDate,
  getCurrentWeekDates,
  currentWeekStart,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [weeklyData, setWeeklyData] = useState({});
  const [showExceedModal, setShowExceedModal] = useState(false);
  const [exceedingDays, setExceedingDays] = useState([]);
  const [taskHash, setTaskHash] = useState(""); // Store hash of tasks to detect changes

    const statusConfig = {
    s: {
      color: '#2196F3',
      icon: 'schedule',
      label: 'SUBMITTED',
      bgColor: '#E3F2FD',
      borderColor: '#2196F3'
    },
    a: {
      color: '#4CAF50',
      icon: 'check-circle',
      label: 'APPROVED',
      bgColor: '#E8F5E8',
      borderColor: '#4CAF50'
    },
    r: {
      color: '#f44336',
      icon: 'cancel',
      label: 'REJECTED',
      bgColor: '#FFEBEE',
      borderColor: '#f44336'
    },
    n: {
      color: '#FF9800',
      icon: 'schedule',
      label: 'DRAFT',
      bgColor: '#FFF3E0',
      borderColor: '#FF9800'
    },
    default: {
      color: '#9E9E9E',
      icon: 'help-outline',
      label: 'UNKNOWN',
      bgColor: '#F5F5F5',
      borderColor: '#9E9E9E'
    }
  };



  // console.log("data", tasks)

  useEffect(() => {
    calculateWeeklyData();
  }, [tasks, currentWeekStart]);

  const parseTaskDate = (dateStr) => {
    if (!dateStr) {
      console.warn("Null or undefined date string received");
      return null;
    }
    let date;
    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    if (dateStr.match(/^\d{2}-[A-Za-z]{3}-\d{4}$/)) {
      const [day, mon, year] = dateStr.split("-");
      const monthKey = mon.charAt(0).toUpperCase() + mon.slice(1).toLowerCase();
      const month = monthMap[monthKey];
      if (month !== undefined) {
        date = new Date(Number(year), month, Number(day));
        // console.log(`Parsed ${dateStr} to ${date.toISOString()}`);
      } else {
        console.warn(`Invalid month in date string: ${dateStr}`);
      }
    } else if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          date = new Date(dateStr);
        } else {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
    } else {
      date = new Date(dateStr);
    }
    if (isNaN(date?.getTime())) {
      console.warn(`Invalid date parsed from ${dateStr}`);
      return null;
    }
    return date;
  };

  const formatDateForComparison = (date) => {
    if (!date || isNaN(date.getTime())) {
      console.warn("Invalid date in formatDateForComparison:", date);
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const calculateWeeklyData = async () => {
    if (!currentWeekStart || isNaN(new Date(currentWeekStart).getTime())) {
      console.error("Invalid currentWeekStart date:", currentWeekStart);
      Alert.alert("Error", "Invalid week start date provided.");
      return;
    }

    const { start } = getCurrentWeekDates(currentWeekStart);
    if (!start || isNaN(start.getTime())) {
      console.error("Invalid start date from getCurrentWeekDates:", start);
      Alert.alert("Error", "Failed to calculate week start date.");
      return;
    }

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      try {
        const day = new Date(start.getTime());
        day.setDate(start.getDate() + i);
        if (isNaN(day.getTime())) {
          console.error(`Invalid date generated for day ${i}:`, day);
          continue;
        }
        weekDays.push(day);
      } catch (error) {
        console.error(`Error generating date for day ${i}:`, error);
      }
    }

    if (weekDays.length === 0) {
      console.error("No valid week days generated.");
      Alert.alert("Error", "Unable to generate valid week dates.");
      return;
    }

    const weeklyStats = {
      days: {},
      projects: {},
      totalHours: 0,
      maxDayHours: 0,
      exceedsLimit: false,
      exceedingDays: [],
    };

    weekDays.forEach((day) => {
      const dayStr = formatDateForComparison(day);
      weeklyStats.days[dayStr] = {
        date: day,
        tasks: [],
        totalHours: 0,
        projects: new Set(),
        statusCounts: { approved: 0, submitted: 0, rejected: 0, notSubmitted: 0 },
      };
    });

    // Calculate task hash to detect changes
    const newTaskHash = md5(JSON.stringify(tasks));
    const storedTaskHash = await AsyncStorage.getItem(`taskHash_${formatDateForComparison(new Date(currentWeekStart))}`);

    // If tasks have changed, clear the dismissed flag
    if (newTaskHash !== storedTaskHash) {
      await AsyncStorage.removeItem(`dismissedExceedModal_${formatDateForComparison(new Date(currentWeekStart))}`);
      await AsyncStorage.setItem(`taskHash_${formatDateForComparison(new Date(currentWeekStart))}`, newTaskHash);
    }

    tasks.forEach((task, index) => {
      try {
        const taskDate = parseTaskDate(task.a_date);
        if (!taskDate) {
          console.warn(`Skipping task ${index} due to invalid date: ${task.a_date}`);
          return;
        }
        const taskDateStr = formatDateForComparison(taskDate);

        if (weeklyStats.days[taskDateStr]) {
          const hours = parseFloat(task.effort) || 0;
          const status = (task.status || "n").toLowerCase();

        //   console.log(`Assigning task on ${task.a_date} (${taskDateStr}): ${hours}h, Project: ${task.project_code}, Status: ${status}`);

          weeklyStats.days[taskDateStr].tasks.push(task);
          weeklyStats.days[taskDateStr].totalHours += hours;
          weeklyStats.days[taskDateStr].projects.add(task.project_code);

          switch (status) {
            case "a":
              weeklyStats.days[taskDateStr].statusCounts.approved++;
              break;
            case "s":
              weeklyStats.days[taskDateStr].statusCounts.submitted++;
              break;
            case "r":
              weeklyStats.days[taskDateStr].statusCounts.rejected++;
              break;
            default:
              weeklyStats.days[taskDateStr].statusCounts.notSubmitted++;
              break;
          }

          weeklyStats.totalHours += hours;

          if (!weeklyStats.projects[task.project_code]) {
            weeklyStats.projects[task.project_code] = { hours: 0, tasks: 0 };
          }
          weeklyStats.projects[task.project_code].hours += hours;
          weeklyStats.projects[task.project_code].tasks++;

          if (weeklyStats.days[taskDateStr].totalHours > weeklyStats.maxDayHours) {
            weeklyStats.maxDayHours = weeklyStats.days[taskDateStr].totalHours;
          }

          if (weeklyStats.days[taskDateStr].totalHours > 9) {
            if (!weeklyStats.exceedingDays.includes(taskDateStr)) {
              weeklyStats.exceedingDays.push(taskDateStr);
            }
          }
		}
        // } else {
        //   console.log(`Task on ${task.a_date} (${taskDateStr}) is outside the current week`);
        // }
      } catch (error) {
        console.warn(`Error processing task ${index}:`, task, error);
      }
    });

    // console.log("Calculated weekly stats:", JSON.stringify(weeklyStats, null, 2));

    weeklyStats.exceedsLimit = weeklyStats.exceedingDays.length > 0;
    setWeeklyData(weeklyStats);
    setExceedingDays(weeklyStats.exceedingDays);
    setTaskHash(newTaskHash);

    // Check AsyncStorage for dismissed flag
    const dismissedKey = `dismissedExceedModal_${formatDateForComparison(new Date(currentWeekStart))}`;
    const isDismissed = await AsyncStorage.getItem(dismissedKey);

    if (weeklyStats.exceedsLimit && !isDismissed) {
      setShowExceedModal(true);
    } else {
      setShowExceedModal(false);
    }
  };

  const handleUnderstand = async () => {
    const dismissedKey = `dismissedExceedModal_${formatDateForComparison(new Date(currentWeekStart))}`;
    await AsyncStorage.setItem(dismissedKey, "true");
    setShowExceedModal(false);
  };

  const getDayName = (date) => {
    if (!date || isNaN(date.getTime())) return "Invalid";
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getStatusColor = (hours) => {
    if (hours === 0) return "#e0e0e0";
    if (hours > 0 && hours <= 8) return "#4CAF50";
    if (hours > 8 && hours <= 9) return "#FF9800";
    return "#f44336";
  };

  const getStatusText = (hours) => {
    if (hours === 0) return "No Work";
    if (hours > 0 && hours <= 8) return "Normal";
    if (hours > 8 && hours <= 9) return "Extended";
    return "Exceeded";
  };

  const openDayDetail = (dayData) => {
    setSelectedDay(dayData);
    setShowDetailModal(true);
  };

  const getDominantStatus = (statusCounts) => {
    const { approved, submitted, rejected, notSubmitted } = statusCounts;
    if (approved > 0 && submitted === 0 && rejected === 0)
      return { status: "approved", color: "#4CAF50", icon: "check-circle" };
    if (submitted > 0 && approved === 0 && rejected === 0)
      return { status: "submitted", color: "#2196F3", icon: "schedule" };
    if (rejected > 0) return { status: "rejected", color: "#f44336", icon: "cancel" };
    if (approved > 0 || submitted > 0)
      return { status: "mixed", color: "#FF9800", icon: "warning" };
    return { status: "not-submitted", color: "#888888", icon: "schedule" };
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryHeader}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="analytics" size={24} color="#a970ff" />
          <Text style={styles.summaryTitle}>Weekly Overview</Text>
        </View>
        <View style={styles.totalHours}>
          <Text
            style={[styles.totalHoursText, { color: weeklyData.exceedsLimit ? "#f44336" : "#a970ff" }]}
          >
            {weeklyData.totalHours?.toFixed(1) || "0.0"}h
          </Text>
          <Text style={styles.totalLabel}>Weekly Total Hours</Text>
        </View>
      </View>

      <View style={styles.dailyTable}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Day</Text>
          <Text style={styles.tableHeaderText}>Hours</Text>
          <Text style={styles.tableHeaderText}>Projects</Text>
          <Text style={styles.tableHeaderText}>Status</Text>
        </View>

        <ScrollView style={styles.tableBody} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {Object.entries(weeklyData.days || {}).map(([dateStr, dayData]) => {
            const statusInfo = getDominantStatus(dayData.statusCounts);
            const isExceeding = dayData.totalHours > 9;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[styles.tableRow, isExceeding && styles.exceedingRow]}
                onPress={() => openDayDetail(dayData)}
              >
                <View style={styles.dayColumn}>
                  <Text style={styles.dayName}>{getDayName(dayData.date)}</Text>
                  <Text style={styles.dayDate}>{dayData.date.getDate()}</Text>
                </View>

                <View style={styles.hoursColumn}>
                  <Text style={[styles.hoursText, { color: getStatusColor(dayData.totalHours) }]}>
                    {dayData.totalHours.toFixed(1)}h
                  </Text>
                  <Text style={styles.hoursStatus}>{getStatusText(dayData.totalHours)}</Text>
                </View>

                <View style={styles.projectsColumn}>
                  <Text style={styles.projectCount}>{dayData.projects.size}</Text>
                  <Text style={styles.projectLabel}>
                    {dayData.projects.size === 1 ? "project" : "projects"}
                  </Text>
                </View>

                <View style={styles.statusColumn}>
                  <MaterialIcons name={statusInfo.icon} size={20} color={statusInfo.color} />
                  {isExceeding && (
                    <MaterialIcons name="warning" size={16} color="#f44336" style={styles.warningIcon} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {Object.keys(weeklyData.projects || {}).length > 0 && (
        <View style={styles.projectSection}>
          <Text style={styles.sectionTitle}>Project Time Distribution</Text>
          <View style={styles.projectGrid}>
            {Object.entries(weeklyData.projects || {}).map(([project, data]) => (
              <View key={project} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectCode}>{project.trim()}</Text>
                  <Text style={styles.projectHours}>{data.hours.toFixed(1)}h</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: weeklyData.totalHours ? `${(data.hours / weeklyData.totalHours) * 100}%` : "0%" },
                    ]}
                  />
                </View>
                <Text style={styles.projectTasks}>{data.tasks} tasks</Text>
                <Text style={styles.projectPercentage}>
                  {weeklyData.totalHours ? ((data.hours / weeklyData.totalHours) * 100).toFixed(0) : 0}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Modal visible={showExceedModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.exceedModal}>
            <MaterialIcons name="warning" size={48} color="#f44336" />
            <Text style={styles.exceedTitle}>Daily Hour Limit Exceeded</Text>
            <Text style={styles.exceedMessage}>
              You have exceeded 9 hours on {exceedingDays.length} day(s) this week:
              {"\n"}
              {exceedingDays.map(dateStr => {
                const date = new Date(dateStr);
                return formatDisplayDate(date);
              }).join(", ")}
              {"\n\n"}
              Consider redistributing your work hours for better work-life balance.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleUnderstand}>
                <Text style={styles.modalButtonText}>Understand</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDetailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>
                {selectedDay && formatDisplayDate(selectedDay.date)} Details
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedDay && (
              <ScrollView style={styles.detailContent}>
                <View style={styles.dayStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Hours</Text>
                    <Text style={styles.statValue}>{selectedDay.totalHours.toFixed(1)}h</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Projects</Text>
                    <Text style={styles.statValue}>{selectedDay.projects.size}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Tasks</Text>
                    <Text style={styles.statValue}>{selectedDay.tasks.length}</Text>
                  </View>
                </View>

                <Text style={styles.tasksTitle}>Tasks</Text>
                {selectedDay.tasks.map((task, index) => {
                const taskStatusKey = (task.status || 'default').toLowerCase();
                const taskStatus = statusConfig[taskStatusKey] || statusConfig.default;
                return (
                  <View key={index} style={styles.taskDetailCard}>
                    <View style={styles.taskDetailHeader}>
                      <Text style={styles.taskProject}>{task.project_code.trim()}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: taskStatus.bgColor }]}>
                        <MaterialIcons name={taskStatus.icon} size={16} color={taskStatus.color} />
                        <Text style={[styles.statusText, { color: taskStatus.color }]}>
                          {taskStatus.label}
                        </Text>
                      </View>
                      <Text style={styles.taskHours}>{task.effort}h</Text>
                    </View>
                    <Text style={styles.taskActivity}>{task.activity_name}</Text>
                    {task.remarks && <Text style={styles.taskRemarks}>{task.remarks}</Text>}
                  </View>
                );
              })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  totalHours: {
    alignItems: "center",
  },
  totalHoursText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#a970ff",
  },
  totalLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  dailyTable: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#a970ff",
    textAlign: "center",
  },
  tableBody: {
    maxHeight: 240,
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
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  statusColumn: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  warningIcon: {
    position: "absolute",
    top: -8,
    right: 8,
  },
  projectSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  projectGrid: {
    gap: 8,
  },
  projectCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#a970ff",
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  projectCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  projectHours: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#a970ff",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#a970ff",
    borderRadius: 3,
  },
  projectTasks: {
    fontSize: 12,
    color: "#666",
  },
  projectPercentage: {
    fontSize: 12,
    color: "#a970ff",
    fontWeight: "bold",
    textAlign: "right",
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
  },
  detailModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
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
  detailContent: {
    flex: 1,
    padding: 20,
  },
  dayStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#a970ff",
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  taskDetailCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#a970ff",
  },
  taskDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  taskProject: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  taskHours: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#a970ff",
  },
  taskActivity: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  taskRemarks: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
    statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.2
  },
});

export default WeeklySummary;