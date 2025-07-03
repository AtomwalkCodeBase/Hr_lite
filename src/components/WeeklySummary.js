import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import md5 from 'md5';

const MAX_DAILY_HOURS = 9;

const WeeklySummary = ({
  tasks,
  formatDisplayDate,
  getCurrentWeekDates,
  currentWeekStart,
  isSelfView,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showExceedModal, setShowExceedModal] = useState(false);
  const [exceedingDays, setExceedingDays] = useState([]);
  const [taskHash, setTaskHash] = useState('');

  const statusConfig = {
    s: { color: '#2196F3', icon: 'schedule', label: 'SUBMITTED', bgColor: '#E3F2FD', borderColor: '#2196F3' },
    a: { color: '#4CAF50', icon: 'check-circle', label: 'APPROVED', bgColor: '#E8F5E8', borderColor: '#4CAF50' },
    r: { color: '#f44336', icon: 'cancel', label: 'REJECTED', bgColor: '#FFEBEE', borderColor: '#f44336' },
    n: { color: '#FF9800', icon: 'schedule', label: 'DRAFT', bgColor: '#FFF3E0', borderColor: '#FF9800' },
    default: { color: '#9E9E9E', icon: 'help-outline', label: 'UNKNOWN', bgColor: '#F5F5F5', borderColor: '#9E9E9E' },
  };

  // Updated parseTaskDate for DD-MMM-YYYY format (e.g., 30-Jun-2025)
  const parseTaskDate = useCallback((dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') {
      console.warn(`Invalid date string: ${dateStr}`);
      return null;
    }

    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };

    const regex = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) {
      console.warn(`Invalid date format (expected DD-MMM-YYYY): ${dateStr}`);
      return null;
    }

    const [, day, mon, year] = match;
    const monthKey = mon.charAt(0).toUpperCase() + mon.slice(1).toLowerCase();
    const month = monthMap[monthKey];
    if (month === undefined) {
      console.warn(`Invalid month in date string: ${dateStr}`);
      return null;
    }

    const parsedDay = Number(day);
    const parsedYear = Number(year);
    if (parsedDay < 1 || parsedDay > 31 || parsedYear < 1900 || parsedYear > 2100) {
      console.warn(`Invalid day or year in date string: ${dateStr}`);
      return null;
    }

    const date = new Date(parsedYear, month, parsedDay);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date parsed: ${dateStr}`);
      return null;
    }

    console.log(`Parsed ${dateStr} to ${date.toISOString()}`);
    return date;
  }, []);

  const formatDateForComparison = useCallback((date) => {
    if (!date || isNaN(date.getTime())) {
      console.warn('Invalid date in formatDateForComparison:', date);
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Calculate weekly data with memoization
  const weeklyData = useMemo(() => {
    if (!currentWeekStart || isNaN(new Date(currentWeekStart).getTime())) {
      console.error('Invalid currentWeekStart:', currentWeekStart);
      return { days: {}, projects: {}, totalHours: 0, maxDayHours: 0, exceedsLimit: false, exceedingDays: [] };
    }

    const { start } = getCurrentWeekDates(currentWeekStart);
    if (!start || isNaN(start.getTime())) {
      console.error('Invalid start date:', start);
      return { days: {}, projects: {}, totalHours: 0, maxDayHours: 0, exceedsLimit: false, exceedingDays: [] };
    }

    // Generate week days
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return isNaN(day.getTime()) ? null : day;
    }).filter(Boolean);

    if (weekDays.length === 0) {
      console.error('No valid week days generated.');
      return { days: {}, projects: {}, totalHours: 0, maxDayHours: 0, exceedsLimit: false, exceedingDays: [] };
    }

    const stats = {
      days: {},
      projects: {},
      totalHours: 0,
      maxDayHours: 0,
      exceedsLimit: false,
      exceedingDays: [],
    };

    // Initialize days
    weekDays.forEach((day) => {
      const dayStr = formatDateForComparison(day);
      stats.days[dayStr] = {
        date: day,
        tasks: [],
        totalHours: 0,
        projects: new Set(),
        statusCounts: { approved: 0, submitted: 0, rejected: 0, notSubmitted: 0 },
      };
    });

    // Process tasks
    tasks.forEach((task, index) => {
      const taskDate = parseTaskDate(task.a_date);
      if (!taskDate) {
        console.warn(`Skipping task ${index} due to invalid date: ${task.a_date}`);
        return;
      }
      const taskDateStr = formatDateForComparison(taskDate);
      if (stats.days[taskDateStr]) {
        const hours = parseFloat(task.effort) || 0;
        const status = (task.status || 'n').toLowerCase();

        // console.log(`Processing task ${index} on ${task.a_date} (${taskDateStr}): ${hours}h, Project: ${task.project_code}, Status: ${status}`);

        stats.days[taskDateStr].tasks.push(task);
        stats.days[taskDateStr].totalHours += hours;
        stats.days[taskDateStr].projects.add(task.project_code);

        switch (status) {
          case 'a':
            stats.days[taskDateStr].statusCounts.approved++;
            break;
          case 's':
            stats.days[taskDateStr].statusCounts.submitted++;
            break;
          case 'r':
            stats.days[taskDateStr].statusCounts.rejected++;
            break;
          default:
            stats.days[taskDateStr].statusCounts.notSubmitted++;
            break;
        }

        stats.totalHours += hours;

        if (!stats.projects[task.project_code]) {
          stats.projects[task.project_code] = { hours: 0, tasks: 0 };
        }
        stats.projects[task.project_code].hours += hours;
        stats.projects[task.project_code].tasks++;

        if (stats.days[taskDateStr].totalHours > stats.maxDayHours) {
          stats.maxDayHours = stats.days[taskDateStr].totalHours;
        }

        if (stats.days[taskDateStr].totalHours > MAX_DAILY_HOURS) {
          if (!stats.exceedingDays.includes(taskDateStr)) {
            stats.exceedingDays.push(taskDateStr);
          }
        }
      }
    });

    stats.exceedsLimit = stats.exceedingDays.length > 0;
    return stats;
  }, [tasks, currentWeekStart, parseTaskDate, formatDateForComparison, getCurrentWeekDates]);

  // Async storage operations for exceed modal
  useEffect(() => {
    const updateExceedModal = async () => {
      const weekKey = formatDateForComparison(new Date(currentWeekStart));
      const newTaskHash = md5(JSON.stringify(tasks));
      const storedTaskHash = await AsyncStorage.getItem(`taskHash_${weekKey}`);

      if (newTaskHash !== storedTaskHash) {
        await AsyncStorage.removeItem(`dismissedExceedModal_${weekKey}`);
        await AsyncStorage.setItem(`taskHash_${weekKey}`, newTaskHash);
      }

      const isDismissed = await AsyncStorage.getItem(`dismissedExceedModal_${weekKey}`);
      setTaskHash(newTaskHash);
      setExceedingDays(weeklyData.exceedingDays);
      setShowExceedModal(weeklyData.exceedsLimit && !isDismissed);
    };

    updateExceedModal();
  }, [weeklyData, tasks, currentWeekStart, formatDateForComparison]);

  const handleUnderstand = useCallback(async () => {
    const weekKey = formatDateForComparison(new Date(currentWeekStart));
    await AsyncStorage.setItem(`dismissedExceedModal_${weekKey}`, 'true');
    setShowExceedModal(false);
  }, [currentWeekStart, formatDateForComparison]);

  const getDayName = useCallback((date) => {
    if (!date || isNaN(date.getTime())) return 'Invalid';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }, []);

  const getStatusColor = useCallback((hours) => {
    if (hours === 0) return '#e0e0e0';
    if (hours <= 8) return '#4CAF50';
    if (hours <= MAX_DAILY_HOURS) return '#FF9800';
    return '#f44336';
  }, []);

  const getStatusText = useCallback((hours) => {
    if (hours === 0) return 'No Work';
    if (hours <= 8) return 'Normal';
    if (hours <= MAX_DAILY_HOURS) return 'Extended';
    return 'Exceeded';
  }, []);

  const getDominantStatus = useCallback((statusCounts) => {
    const { approved, submitted, rejected, notSubmitted } = statusCounts;
    if (approved > 0 && submitted === 0 && rejected === 0)
      return { status: 'approved', color: '#4CAF50', icon: 'check-circle' };
    if (submitted > 0 && approved === 0 && rejected === 0)
      return { status: 'submitted', color: '#2196F3', icon: 'schedule' };
    if (rejected > 0) return { status: 'rejected', color: '#f44336', icon: 'cancel' };
    if (approved > 0 || submitted > 0)
      return { status: 'mixed', color: '#FF9800', icon: 'warning' };
    return { status: 'not-submitted', color: '#888888', icon: 'schedule' };
  }, []);

  const openDayDetail = useCallback((dayData) => {
    setSelectedDay(dayData);
    setShowDetailModal(true);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.summaryHeader}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="analytics" size={24} color="#a970ff" />
          <Text style={styles.summaryTitle}>Weekly Overview</Text>
        </View>
        <View style={styles.totalHours}>
          <Text style={[styles.totalHoursText, { color: weeklyData.exceedsLimit ? '#f44336' : '#a970ff' }]}>
            {weeklyData.totalHours.toFixed(1)}h
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
          {Object.entries(weeklyData.days).map(([dateStr, dayData]) => {
            const statusInfo = getDominantStatus(dayData.statusCounts);
            const isExceeding = dayData.totalHours > MAX_DAILY_HOURS;

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
                  <Text style={styles.projectLabel}>{dayData.projects.size === 1 ? 'project' : 'projects'}</Text>
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

      {Object.keys(weeklyData.projects).length > 0 && (
        <View style={styles.projectSection}>
          <Text style={styles.sectionTitle}>Project Time Distribution</Text>
          <View style={styles.projectGrid}>
            {Object.entries(weeklyData.projects).map(([project, data]) => (
              <View key={project} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectCode}>{project.trim()}</Text>
                  <Text style={styles.projectHours}>{data.hours.toFixed(1)}h</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: weeklyData.totalHours ? `${(data.hours / weeklyData.totalHours) * 100}%` : '0%' },
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

      {isSelfView && (
        <Modal visible={showExceedModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.exceedModal}>
              <MaterialIcons name="warning" size={48} color="#f44336" />
              <Text style={styles.exceedTitle}>Daily Hour Limit Exceeded</Text>
              <Text style={styles.exceedMessage}>
                You have exceeded {MAX_DAILY_HOURS} hours on {exceedingDays.length} day(s):
                {'\n'}
                {exceedingDays.map((dateStr) => formatDisplayDate(new Date(dateStr))).join(', ')}
                {'\n\n'}
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
      )}

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
                          <Text style={[styles.statusText, { color: taskStatus.color }]}>{taskStatus.label}</Text>
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