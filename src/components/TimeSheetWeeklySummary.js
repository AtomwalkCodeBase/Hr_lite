import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import md5 from 'md5';
// import ProjectTimeDistribution from './ProjectTimeDistribution';
import { DailyTableRow, ExceedModal, DetailModal } from './SharedTimesheetComponents';
import SelectedDayDetail from "./SelectedDayDetail"

const MAX_DAILY_HOURS = 9;

const TimeSheetWeeklySummary = ({
  tasks,
  formatDisplayDate,
  getCurrentWeekDates,
  currentWeekStart,
  isSelfView,
  onEdit,
  onDelete,
  monthFilter,
  currentMonthStart,
  showAddModal,
  showAddIcon
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

  const summaryData = useMemo(() => {
    const isMonthly = !!monthFilter;
    let startDate, endDate, periodDays;

    if (isMonthly) {
      if (!currentMonthStart || isNaN(new Date(currentMonthStart).getTime())) {
        console.error('Invalid currentMonthStart:', currentMonthStart);
        return { days: {}, projects: {}, totalHours: 0, maxDayHours: 0, exceedsLimit: false, exceedingDays: [] };
      }
      startDate = new Date(currentMonthStart);
      const currentDate = new Date();
      const isCurrentMonth =
        startDate.getFullYear() === currentDate.getFullYear() &&
        startDate.getMonth() === currentDate.getMonth();

      if (isCurrentMonth) {
        // Find the latest task date
        const taskDates = tasks
          .map(task => parseTaskDate(task.a_date))
          .filter(date => date && !isNaN(date.getTime()));
        if (taskDates.length === 0) {
          console.warn('No valid task dates found for current month, using current date as end date.');
          endDate = new Date(Math.max(currentDate.getTime(), startDate.getTime())); // Ensure endDate >= startDate
        } else {
          endDate = new Date(Math.max(Math.max(...taskDates), startDate.getTime())); // Ensure endDate >= startDate
        }
      } else {
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // Last day of the month
      }

      periodDays = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        periodDays.push(new Date(d));
      }
    } else {
      if (!currentWeekStart || isNaN(new Date(currentWeekStart).getTime())) {
        console.error('Invalid currentWeekStart:', currentWeekStart);
        return { days: {}, projects: {}, totalHours: 0, maxDayHours: 0, exceedsLimit: false, exceedingDays: [] };
      }
      const { start } = getCurrentWeekDates(currentWeekStart);
      if (!start || isNaN(start.getTime())) {
        console.error('Invalid start date:', start);
        return { days: {}, projects: {}, totalHours: 0, maxDayHours: 0, exceedsLimit: false, exceedingDays: [] };
      }
      periodDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        return isNaN(day.getTime()) ? null : day;
      }).filter(Boolean);
    }

    if (periodDays.length === 0) {
      console.error(`No valid ${isMonthly ? 'month' : 'week'} days generated.`);
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

    periodDays.forEach((day) => {
      const dayStr = formatDateForComparison(day);
      stats.days[dayStr] = {
        date: day,
        tasks: [],
        totalHours: 0,
        projects: new Set(),
        statusCounts: { approved: 0, submitted: 0, rejected: 0, notSubmitted: 0 },
      };
    });

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
  }, [tasks, currentWeekStart, currentMonthStart, monthFilter, parseTaskDate, formatDateForComparison, getCurrentWeekDates]);

  useEffect(() => {
    const updateExceedModal = async () => {
      const key = monthFilter
        ? `${currentMonthStart.getFullYear()}-${currentMonthStart.getMonth() + 1}`
        : formatDateForComparison(new Date(currentWeekStart));
      const newTaskHash = md5(JSON.stringify(tasks));
      const storedTaskHash = await AsyncStorage.getItem(`taskHash_${key}`);

      if (newTaskHash !== storedTaskHash) {
        await AsyncStorage.removeItem(`dismissedExceedModal_${key}`);
        await AsyncStorage.setItem(`taskHash_${key}`, newTaskHash);
      }

      const isDismissed = await AsyncStorage.getItem(`dismissedExceedModal_${key}`);
      setTaskHash(newTaskHash);
      setExceedingDays(summaryData.exceedingDays);
      setShowExceedModal(summaryData.exceedsLimit && !isDismissed);
    };

    updateExceedModal();
  }, [summaryData, tasks, currentWeekStart, currentMonthStart, monthFilter, formatDateForComparison]);

  const handleUnderstand = useCallback(async () => {
    const key = monthFilter
      ? `${currentMonthStart.getFullYear()}-${currentMonthStart.getMonth() + 1}`
      : formatDateForComparison(new Date(currentWeekStart));
    await AsyncStorage.setItem(`dismissedExceedModal_${key}`, 'true');
    setShowExceedModal(false);
  }, [currentWeekStart, currentMonthStart, monthFilter, formatDateForComparison]);

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
          <Text style={styles.summaryTitle}>{monthFilter ? 'Monthly Overview' : 'Weekly Overview'}</Text>
        </View>
        <View style={styles.totalHours}>
          <Text style={[styles.totalHoursText, { color: summaryData.exceedsLimit ? '#f44336' : '#a970ff' }]}>
            {summaryData.totalHours.toFixed(1)}h
          </Text>
          <Text style={styles.totalLabel}>{monthFilter ? 'Monthly Total Hours' : 'Weekly Total Hours'}</Text>
        </View>
      </View>

      <View style={styles.dailyTable}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Day</Text>
          <Text style={styles.tableHeaderText}>Hours</Text>
          {/* <Text style={styles.tableHeaderText}>Projects</Text> */}
          <Text style={styles.tableHeaderText}>Action</Text>
        </View>
        <ScrollView style={styles.tableBody} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {Object.entries(summaryData.days).map(([dateStr, dayData]) => (
            <DailyTableRow
              key={dateStr}
              dayData={dayData}
              getDayName={getDayName}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              getDominantStatus={getDominantStatus}
              openDayDetail={openDayDetail}
            />
          ))}
        </ScrollView>
      </View>

      {isSelfView && 
      <ExceedModal
        visible={showExceedModal}
        exceedingDays={exceedingDays}
        formatDisplayDate={formatDisplayDate}
        onUnderstand={handleUnderstand}
      />}

      <DetailModal
        visible={showDetailModal}
        selectedDay={selectedDay}
        formatDisplayDate={formatDisplayDate}
        isSelfView={isSelfView}
        onEdit={onEdit}
        onDelete={onDelete}
        onClose={() => setShowDetailModal(false)}
        SelectedDayDetail={SelectedDayDetail}
        showAddModal={(date) => showAddModal(date)}
        showAddIcon={showAddIcon}
      />
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
    // maxHeight: 240,
  },
});

export default TimeSheetWeeklySummary;