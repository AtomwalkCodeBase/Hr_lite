import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../components/old_components/Loader";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderComponent from "../components/HeaderComponent";
import { useNavigation } from "expo-router";
import { getAllocationList, postAllocationData } from "../services/productServices";

import PeriodDisplay from "../components/APMTimeSheet/PeriodDisplay";
import CustomDateRangeCard from "../components/APMTimeSheet/CustomDateRangeCard";
import ProjectList from "../components/APMTimeSheet/ProjectList";
import EmptyState from "../components/APMTimeSheet/EmptyState";
import FilterModal from "../components/FilterModal";
import UniversalProjectList from "../components/APMTimeSheet/ProjectList";
import ProjectCard from "../components/APMTimeSheet/ProjectCard";
import QuickCheckInCard from "../components/APMTimeSheet/QuickCheckInCard";

const PROJECTS_PER_PAGE = 10;

const APMTimeSheet = () => {
  const [empId, setEmpId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeProject, setActiveProject] = useState(null); // Stores full project for detail mode
const [hasActiveSession, setHasActiveSession] = useState(false); // whether user is checked-in on ANY project
const [pendingCheckInProject, setPendingCheckInProject] = useState(null); // used for quick card


  // modal-controlled filters
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    period: 'this_month'
  });
  const [pendingFilters, setPendingFilters] = useState({
    status: null,
    period: 'this_month'
  });

  // local UI states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isCustomExpanded, setIsCustomExpanded] = useState(false);

  // pagination & projects
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Date objects for DatePicker
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());

  const [activeFilter, setActiveFilter] = useState('all');

  const navigate = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];

  // period & status options (for modal)
  const periodOptions = useMemo(() => [
    { label: "This Month", value: "this_month" },
    { label: "This Week", value: "this_week" },
    { label: "Custom Date", value: "custom" },
  ], []);

  const statusOptions = useMemo(() => [
    { label: "Active", value: "active" },
    { label: "Planned", value: "submitted" },
    { label: "Completed", value: "completed" },
    { label: "All", value: "All" },
  ], []);

  const filterConfigs = useMemo(() => [
    {
      label: "Status",
      options: statusOptions,
      value: pendingFilters.status,
      setValue: (value) => setPendingFilters(prev => ({ ...prev, status: value })),
    },
    {
      label: "Period",
      options: periodOptions,
      value: pendingFilters.period,
      setValue: (value) => setPendingFilters(prev => ({ ...prev, period: value })),
    }
  ], [pendingFilters, statusOptions, periodOptions]);

  // helpers
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const parseDateString = (str) => {
    if (!str) return null;
    const parts = str.split("-");
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts.map(Number);
    if (!dd || !mm || !yyyy) return null;
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d) ? null : d;
  };

  useEffect(() => {
    const initializeDates = () => {
      const initialDateRange = getDateRangeFromPeriod('today');
      setDateRange(initialDateRange);
      const sd = parseDateString(initialDateRange.startDate) || new Date();
      const ed = parseDateString(initialDateRange.endDate) || new Date();
      setStartDateObj(sd);
      setEndDateObj(ed);
    };
    initializeDates();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedEmpId = await AsyncStorage.getItem("empId");
        if (storedEmpId) {
          setEmpId(storedEmpId);
          if (dateRange.startDate && dateRange.endDate) {
            await fetchAllActivity(storedEmpId, dateRange.startDate, dateRange.endDate);
          }
        } else {
          console.log("No Employee ID found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error loading Employee ID:", error);
        Alert.alert("Error", "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [projects]);

  useEffect(() => {
    if (!allProjects) return;

    const f = (activeFilters.status && activeFilters.status !== 'All')
      ? activeFilters.status
      : 'all';

    applyFilterAndPagination(allProjects, f, 1);
  }, [allProjects]);


  const getDateRangeFromPeriod = (period) => {
    const today = new Date();
    const format = (date) => {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    };

    switch (period) {

      case 'this_week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return { startDate: format(startOfWeek), endDate: format(endOfWeek) };
      }
      case 'this_month': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { startDate: format(firstDay), endDate: format(lastDay) };
      }
      default:
        return dateRange;
    }
  };

  const mapApiResponseToProject = (apiData) => ({
    id: apiData.id,
    activity_id: apiData.activity_id,
    title: apiData.title,
    project_code: apiData.project_code,
    activity_name: apiData.activity_name,
    no_of_items: apiData.no_of_items,
    effort: apiData.effort,
    effort_unit: apiData.effort_unit,

    planned_start_date: apiData.planned_start_date,
    planned_end_date: apiData.planned_end_date,

    actual_start_date: apiData.actual_start_date,
    actual_end_date: apiData.actual_end_date,

    status: apiData.status,
    status_display: apiData.status_display,

    hasCheckIn: apiData.hasCheckIn,
    hasCheckOut: apiData.hasCheckOut,
    checkIn: apiData.checkIn,
    checkOut: apiData.checkOut,
  });





  const fetchAllActivity = async (empId, startDate, endDate) => {
    try {
      setIsLoading(true);
      const res = await getAllocationList(empId, startDate, endDate);

      console.log("Activity list===", res.data)

      if (Array.isArray(res?.data) && res.data.length > 0) {

        // STEP 1 → Merge P + A correctly
        const processedList = processAllocationData(res.data);

        // STEP 2 → Map for UI
        const mappedProjects = processedList.map(mapApiResponseToProject);
        // Detect session (has check-in without check-out)
const activeSession = processedList.find(
  p => p.hasCheckIn && !p.hasCheckOut
);

if (activeSession) {
  setHasActiveSession(true);
  setActiveProject(activeSession); // show full card
} else {
  setHasActiveSession(false);

  // Pick the first PLANNED or IN PROGRESS project for quick card
  const nextProject = processedList.find(
    p => p.status_display === "PLANNED" || p.status_display === "IN PROGRESS"
  );

  setPendingCheckInProject(nextProject || null);
}


        // IMPORTANT STEP!!!
        // Always store UNFILTERED merged projects
        // Never store filtered results here
        setAllProjects(mappedProjects);

        // Return unfiltered list
        return mappedProjects;
      }

      // No data
      setAllProjects([]);
      return [];

    } catch (error) {
      console.error("Error fetching projects:", error);
      Alert.alert("Error", "Failed to fetch assigned projects");

      setAllProjects([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };


  const parseGeoData = (tsList) => {
    if (!Array.isArray(tsList) || tsList.length === 0) {
      return {
        hasCheckIn: false,
        hasCheckOut: false,
        checkIn: null,
        checkOut: null
      };
    }

    let latestCheckIn = null;
    let latestCheckInDate = null;
    let latestCheckOut = null;

    tsList.forEach(item => {
      const geo = item.geo_data;
      if (!geo) return;

      const date = item.a_date; // "22-Nov-2025"

      // --- CHECK-IN ---
      const iIndex = geo.indexOf("I|");
      if (iIndex !== -1) {
        const afterI = geo.substring(iIndex + 2);
        const parts = afterI.split("|");

        latestCheckIn = {
          time: parts[0] || null,
          lat: parts[1] || null,
          long: parts[2] || null
        };

        latestCheckInDate = date; // track the date of latest check-in
      }
    });

    // Now find checkout ONLY for latest check-in date
    tsList.forEach(item => {
      if (item.a_date !== latestCheckInDate) return;

      const geo = item.geo_data;
      if (!geo) return;

      const oIndex = geo.indexOf("O|");
      if (oIndex !== -1) {
        const afterO = geo.substring(oIndex + 2);
        const parts = afterO.split("|");

        if (parts[0]) {
          latestCheckOut = {
            time: parts[0] || null,
            lat: parts[1] || null,
            long: parts[2] || null,
          };
        }
      }
    });

    return {
      hasCheckIn: !!latestCheckIn,
      hasCheckOut: !!latestCheckOut,  // Only true if today's entry has checkout
      checkIn: latestCheckIn,
      checkOut: latestCheckOut
    };
  };





  const processAllocationData = (list) => {
    if (!Array.isArray(list)) return [];

    const grouped = {};

    // Group P + A
    list.forEach(item => {
      const key = `${item.activity_id}_${item.order_item_key}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    const output = [];

    Object.values(grouped).forEach(items => {
      const P = items.find(i => i.activity_type === "P") || null;
      const A = items.find(i => i.activity_type === "A") || null;

      // ---- FIX: Parse ALL TS entries, not only index 0 ----
      const geo = parseGeoData(A?.ts_data_list || []);

      // ---- STATUS LOGIC (keep your old version) ----
      let finalStatus = "planned";
      let finalStatusDisplay = "PLANNED";

      if (A) {
        if (A.status === "S") {
          finalStatus = "active";
          finalStatusDisplay = "IN PROGRESS";
        }
        if (A.status === "N") {
          finalStatus = "active";
          finalStatusDisplay = "IN PROGRESS";
        }
        if (A.status === "C") {
          finalStatus = "completed";
          finalStatusDisplay = "COMPLETED";
        }
      }

      // ---- MERGE ----
      const merged = {
        id: A?.id ?? P?.id,
        activity_id: P?.activity_id ?? A?.activity_id,
        title: P?.project_name ?? A?.project_name,
        project_code:
          (A && A.order_item_key) ||
          (P && P.order_item_key) ||
          A?.activity_id ||
          P?.activity_id,


        activity_name: P?.activity_name ?? A?.activity_name,

        no_of_items: P?.no_of_items ?? A?.no_of_items,
        effort: P?.effort ?? A?.effort,
        effort_unit: P?.effort_unit ?? A?.effort_unit,

        planned_start_date: P?.start_date,
        planned_end_date: P?.end_date,

        actual_start_date: A?.start_date,
        actual_end_date: A?.end_date,

        status: finalStatus,
        status_display: finalStatusDisplay,

        // ---- FINAL GEO (latest check-in & check-out) ----
        hasCheckIn: geo.hasCheckIn,
        hasCheckOut: geo.hasCheckOut,
        checkIn: geo.checkIn,
        checkOut: geo.checkOut,

        original_P: P,
        original_A: A,
      };

      output.push(merged);
    });

    return output;
  };





  const applyFiltersToProjects = (projectsList, filters) => {
    let filtered = [...projectsList];
    if (filters.status && filters.status !== 'All') {
      filtered = filtered.filter(project => project.status === filters.status);
    }
    return filtered;
  };

  const applyFilterAndPagination = (allProjectsList, filter, page) => {
    let filtered = applyFiltersToProjects(allProjectsList, activeFilters);
    if (filter !== "all") {
      filtered = filtered.filter(project => project.status === filter);
    }
    const startIndex = (page - 1) * PROJECTS_PER_PAGE;
    const endIndex = startIndex + PROJECTS_PER_PAGE;
    const paginatedProjects = filtered.slice(0, endIndex);
    setProjects(paginatedProjects);
    setTotalPages(Math.ceil(filtered.length / PROJECTS_PER_PAGE));
    setCurrentPage(page);
  };

  useEffect(() => {
    const f = (activeFilters.status && activeFilters.status !== 'All') ? activeFilters.status : 'all';
    setActiveFilter(f);

    if (activeFilters.period === 'custom') {
      setIsCustomExpanded(false);
    } else {
      const newDateRange = getDateRangeFromPeriod(activeFilters.period);
      setDateRange(newDateRange);
      const sd = parseDateString(newDateRange.startDate) || new Date();
      const ed = parseDateString(newDateRange.endDate) || new Date();
      setStartDateObj(sd);
      setEndDateObj(ed);
      setIsCustomExpanded(false);
    }
    applyFilterAndPagination(allProjects, f, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  const handleFilterPress = () => {
    setPendingFilters({ ...activeFilters });
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    setActiveFilters(pendingFilters);
    if (pendingFilters.period === 'custom') {
      setIsCustomExpanded(false);
    } else {
      const newDateRange = getDateRangeFromPeriod(pendingFilters.period);
      setDateRange(newDateRange);
      const sd = parseDateString(newDateRange.startDate) || new Date();
      const ed = parseDateString(newDateRange.endDate) || new Date();
      setStartDateObj(sd);
      setEndDateObj(ed);
    }
    setShowFilterModal(false);
  };

  const handleClearFilters = async () => {
    const cleared = { status: null, period: 'this_month' };

    setPendingFilters(cleared);
    setActiveFilters(cleared);

    const todayRange = getDateRangeFromPeriod('today');
    setDateRange(todayRange);

    setStartDateObj(parseDateString(todayRange.startDate));
    setEndDateObj(parseDateString(todayRange.endDate));

    setIsCustomExpanded(false);
    setShowFilterModal(false);

    if (empId) {
      const freshList = await fetchAllActivity(
        empId,
        todayRange.startDate,
        todayRange.endDate
      );

      // Now guaranteed freshList is ALWAYS an array
      applyFilterAndPagination(freshList, "all", 1);
    }
  };


  useEffect(() => {
    const startStr = formatDate(startDateObj);
    const endStr = formatDate(endDateObj);

    if (activeFilters.period === 'custom') {
      if (startDateObj && endDateObj && startDateObj > endDateObj) {
        // swap if invalid
        const s = startDateObj;
        const e = endDateObj;
        setStartDateObj(e);
        setEndDateObj(s);
        setDateRange({ startDate: formatDate(e), endDate: formatDate(s) });
      } else {
        setDateRange({ startDate: startStr, endDate: endStr });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDateObj, endDateObj]);

  const loadMoreProjects = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      applyFilterAndPagination(allProjects, activeFilter, nextPage);
      setIsLoadingMore(false);
    }
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (empId && dateRange.startDate && dateRange.endDate) {
      await fetchAllActivity(empId, dateRange.startDate, dateRange.endDate);
    }
    setRefreshing(false);
  };


  //Check-in & Check-out logic

  const buildAllocationPayload = async ({
  project,
  mode,       // "ADD" or "UPDATE"
  geoType,    // "I" or "O"
  no_of_items,
  remarks,
  file,
}) => {
  const emp_id = await AsyncStorage.getItem("empId");

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];    // YYYY-MM-DD
  const timeStr = now.toTimeString().split(" ")[0];   // HH:MM:SS

  return {
    emp_id,
    call_mode: mode,                // ADD or UPDATE
    p_id: mode === "ADD" ? project.original_P?.id : "",  
    a_id: mode === "UPDATE" ? project.original_A?.id : "",

    activity_date: dateStr,
    no_of_items: no_of_items || project.no_of_items,
    start_time: geoType === "I" ? timeStr : "",
    end_time: geoType === "O" ? timeStr : "",
    remarks: remarks || "",

    geo_type: geoType,             // I or O
    longitude_id: "77.5946",       // TODO: replace with GPS
    latitude_id: "12.9716",        // TODO: replace with GPS

    submitted_file: file || null,  // optional
  };
};

const buildFormData = async ({
  project,
  mode,        // ADD / UPDATE
  geoType,     // I / O
  remarks,
  no_of_items,
  fileUri,
  fileName,
  fileMimeType,
  longitude,
  latitude,
}) => {

  const emp_id = await AsyncStorage.getItem("empId");

  const now = new Date();

  // Format DD-MM-YYYY
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const activity_date = `${dd}-${mm}-${yyyy}`;

  // Format TIME as HH:MM AM/PM
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${hours}:${minutes} ${ampm}`;

  const formData = new FormData();

  formData.append("emp_id", emp_id);
  formData.append("call_mode", mode);

  // p_id only for ADD
  if (mode === "ADD") {
    formData.append("p_id", project.original_P?.id);
    formData.append("a_id", "");
  }

  // a_id only for UPDATE
  if (mode === "UPDATE") {
    formData.append("p_id", "");
    formData.append("a_id", project.original_A?.id || "");
  }

  formData.append("activity_date", activity_date);
  formData.append("start_time", geoType === "I" ? timeStr : "");
  formData.append("end_time", geoType === "O" ? timeStr : "");
  formData.append("remarks", remarks || "");

  formData.append("geo_type", geoType);
  formData.append("longitude_id", longitude?.toString() || "77.71337515351387");
  formData.append("latitude_id", latitude?.toString() || "12.967757234579974");

  if (fileUri) {
    formData.append("submitted_file", {
      uri: fileUri,
      name: fileName || "upload.jpg",
      type: fileMimeType || "image/jpeg"
    });
  }

  return formData;
};




 const handleCheckIn = async (project) => {
  const isFirstCheckIn = !project.original_A;

  const formData = await buildFormData({
    project,
    mode: isFirstCheckIn ? "ADD" : "UPDATE",
    geoType: "I",
    remarks: "Task start",     // add user input later
    no_of_items: project.no_of_items,
    fileUri: null,
  });

  try {
    await postAllocationData(formData);
    console.log("Check-in success!");

    setActiveProject(project);
    setHasActiveSession(true);
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Check-in failed");
  }
};



const handleCheckOut = async (project) => {
  console.log("Check-Out clicked for", project.project_code);

  const formData = await buildFormData({
    project,
    mode: "UPDATE",
    geoType: "O",
    no_of_items: project.no_of_items,
    remarks: "",
    fileUri: null,
  });

  try {
    await postAllocationData(formData);
    console.log("Check-Out saved!");

    setActiveProject(null);
    setHasActiveSession(false);
    onRefresh();
  } catch (err) {
    console.error("Checkout API Error:", err);
    Alert.alert("Error", "Failed to check-out");
  }
};




  const handleStartProject = (project) => {
    const hasActiveProject = allProjects.some(p =>
      p.status === "active" && p.activity_id !== project.activity_id
    );
    if (hasActiveProject) {
      Alert.alert(
        "Active Project Found",
        "You already have an active project. Please end the current project before starting a new one.",
        [
          { text: "End Current Project", onPress: () => console.log("Navigate to active project") },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }

    Alert.alert(
      "Start Project",
      `Are you sure you want to start working on ${project.title}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start", onPress: () => {
            const updatedProjects = allProjects.map(p =>
              p.activity_id === project.activity_id
                ? { ...p, status: "active", actual_start_date: new Date().toISOString(), original_status: 'P' }
                : p
            );
            setAllProjects(updatedProjects);
            applyFilterAndPagination(updatedProjects, activeFilter, currentPage);
          }
        }
      ]
    );
  };

  const handleViewDetails = (project) => {
    Alert.alert(
      "Project Details",
      `Project: ${project.title}\nActivity: ${project.activity_name}\nCode: ${project.project_code}\nStatus: ${project.status_display || project.status}\nStart Date: ${project.planned_start_date || 'Not set'}\nEnd Date: ${project.due_date || 'Not set'}\nEffort: ${project.effort || 0} ${project.effort_unit || ''}\nItems: ${project.no_of_items || 0}`,
      [{ text: "Close", style: "cancel" }]
    );
  };

  const filteredProjects = projects;

  if (isLoading) {
    return <Loader visible={true} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <HeaderComponent
        headerTitle="Projects TimeSheet"
        onBackPress={() => navigate.goBack()}
        icon1Name="filter"
        icon1OnPress={handleFilterPress}
        filterCount={(activeFilters.status ? 1 : 0) + (activeFilters.period && activeFilters.period !== 'this_month' ? 1 : 0)}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onClearFilters={handleClearFilters}
        onApplyFilters={handleApplyFilters}
        filterConfigs={filterConfigs}
        modalTitle="Filter Projects"
        applyButtonText="Apply Filters"
        clearButtonText="Clear Filters"
      />

      {activeFilters.period === 'custom' && (
        <CustomDateRangeCard
          isExpanded={isCustomExpanded}
          setIsExpanded={setIsCustomExpanded}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          startObj={startDateObj}
          endObj={endDateObj}
          setStartObj={setStartDateObj}
          setEndObj={setEndDateObj}
          onApply={() => {
            if (startDateObj && endDateObj && startDateObj > endDateObj) {
              Alert.alert("Invalid Range", "Start date can't be after end date");
              return;
            }
            setDateRange({ startDate: formatDate(startDateObj), endDate: formatDate(endDateObj) });
            setIsCustomExpanded(false);
          }}
          onCancel={() => {
            setIsCustomExpanded(false);
            const sd = parseDateString(dateRange.startDate) || new Date();
            const ed = parseDateString(dateRange.endDate) || new Date();
            setStartDateObj(sd);
            setEndDateObj(ed);
          }}
        />
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          activeFilters.period !== 'custom' && styles.scrollContainerWithoutDateRange
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) loadMoreProjects();
        }}
        scrollEventThrottle={400}
      >
        {empId ? (
  <>
    <PeriodDisplay
      label={
        activeFilters.period === "custom"
          ? `Custom Range (${dateRange.startDate} to ${dateRange.endDate})`
          : periodOptions.find(opt => opt.value === activeFilters.period)?.label || 'This Month'
      }
    />

    {/* RULE #1 — If user has NOT checked-in → Show QUICK CHECK-IN card only */}
    {!hasActiveSession && !activeProject && pendingCheckInProject && (
      <QuickCheckInCard
        project={pendingCheckInProject}
        onCheckIn={() => handleCheckIn(pendingCheckInProject)}
        onDetails={() => setActiveProject(pendingCheckInProject)}
      />
    )}

    {/* RULE #2 — If user clicked Check-In OR Details → Show ONLY the ProjectCard */}
    {activeProject && (
      <ProjectCard
        project={activeProject}
        onCheckIn={handleCheckIn}
        onCheckOut={(p) => handleCheckOut(p)}
        onViewDetails={() => {}}
      />
    )}

    {/* RULE #3 — NEVER show project list */}
  </>
) : (
  <EmptyState
    title="No Employee ID"
    subtitle="Please check your profile settings"
  />
)}

      </ScrollView>
    </SafeAreaView>
  );
};

export default APMTimeSheet;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  scrollContainerWithoutDateRange: {
    paddingTop: 16,
  },
  pageInfo: {
    alignItems: "center",
    padding: 8,
  },
  pageInfoText: {
    color: "#666",
    fontSize: 12,
  },
});
