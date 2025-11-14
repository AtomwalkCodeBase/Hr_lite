import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../components/old_components/Loader";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderComponent from "../components/HeaderComponent";
import { useNavigation } from "expo-router";
import { getProjectlist } from "../services/productServices";
import { Ionicons } from "@expo/vector-icons";
import { colors } from '../Styles/appStyle';
import ProjectCard from "../components/ProjectCard";

const { width } = Dimensions.get("window");
const PROJECTS_PER_PAGE = 10;

const APMTimeSheet = () => {
  const [empId, setEmpId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const navigate = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedEmpId = await AsyncStorage.getItem("empId");
        if (storedEmpId) {
          setEmpId(storedEmpId);
          await fetchAllProjects(storedEmpId);
        } else {
          console.log("No Employee ID found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error loading Employee ID:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [projects]);

  // Determine project status based on business rules
  const determineProjectStatus = (project) => {
    // This should come from your API response
    const currentDate = new Date();
    const plannedStartDate = project.planned_start_date ? new Date(project.planned_start_date) : null;
    const actualStartDate = project.actual_start_date ? new Date(project.actual_start_date) : null;
    const isCompleted = project.status === 'completed' || project.is_completed;
    
    if (isCompleted) {
      return "completed";
    }
    
    if (actualStartDate) {
      return "active";
    }
    
    if (plannedStartDate && plannedStartDate < currentDate) {
      return "pending";
    }
    
    return "planned";
  };

  // Fetch all projects initially
  const fetchAllProjects = async (empId) => {
    try {
      const res = await getProjectlist(empId);
      if (res?.data?.length) {
        const projectsWithStatus = res.data.map((project) => {
          const status = determineProjectStatus(project);
          
          return {
            ...project,
            status: status,
            // Remove progress and hoursLogged as they're no longer needed
            planned_start_date: project.planned_start_date || null,
            actual_start_date: project.actual_start_date || null,
            due_date: project.due_date || null,
          };
        });
        setAllProjects(projectsWithStatus);
        applyFilterAndPagination(projectsWithStatus, activeFilter, 1);
      } else {
        setAllProjects([]);
        setProjects([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      Alert.alert("Error", "Failed to fetch assigned projects");
    }
  };

  // Apply filter and pagination
  const applyFilterAndPagination = (allProjectsList, filter, page) => {
    const filtered = allProjectsList.filter(project => {
      if (filter === "all") return true;
      return project.status === filter;
    });

    const startIndex = (page - 1) * PROJECTS_PER_PAGE;
    const endIndex = startIndex + PROJECTS_PER_PAGE;
    const paginatedProjects = filtered.slice(0, endIndex);
    
    setProjects(paginatedProjects);
    setTotalPages(Math.ceil(filtered.length / PROJECTS_PER_PAGE));
    setCurrentPage(page);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilterAndPagination(allProjects, filter, 1);
  };

  // Load more projects
  const loadMoreProjects = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      applyFilterAndPagination(allProjects, activeFilter, nextPage);
      setIsLoadingMore(false);
    }
  };

  // Check if user is near the end of the list
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (empId) {
      await fetchAllProjects(empId);
    }
    setRefreshing(false);
  };

  const handleStartProject = (project) => {
    // Check if there's any other active project
    const hasActiveProject = allProjects.some(p => 
      p.status === "active" && p.project_code !== project.project_code
    );

    if (hasActiveProject) {
      Alert.alert(
        "Active Project Found",
        "You already have an active project. Please end the current project before starting a new one.",
        [
          { 
            text: "End Current Project", 
            onPress: () => {
              // Navigate to active project to end it
              console.log("Navigate to active project");
            }
          },
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
          text: "Start", 
          style: "default",
          onPress: () => {
            // Update project status to active
            const updatedProjects = allProjects.map(p => 
              p.project_code === project.project_code 
                ? { ...p, status: "active", actual_start_date: new Date().toISOString() }
                : p
            );
            setAllProjects(updatedProjects);
            applyFilterAndPagination(updatedProjects, activeFilter, currentPage);
            console.log("Starting project:", project.title);
          }
        }
      ]
    );
  };

  const handleViewDetails = (project) => {
    Alert.alert(
      "Project Details",
      `Project: ${project.title}\nCode: ${project.project_code}\nStatus: ${project.status}\nPlanned Start: ${project.planned_start_date || 'Not set'}\nDue Date: ${project.due_date || 'Not set'}`,
      [
        { text: "Close", style: "cancel" },
        { 
          text: "View Full Details", 
          onPress: () => {
            console.log("Viewing full details for:", project.title);
          }
        }
      ]
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
      />

      {/* Fixed Employee Card */}
      <View style={styles.fixedEmployeeCard}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{allProjects.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {allProjects.filter(p => p.status === "active").length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {allProjects.filter(p => p.status === "planned").length}
            </Text>
            <Text style={styles.statLabel}>Planned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {allProjects.filter(p => p.status === "pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            loadMoreProjects();
          }
        }}
        scrollEventThrottle={400}
      >
        {empId ? (
          <>
            {/* Filter Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              {["active", "planned", "pending", "completed", "all"].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterPill,
                    activeFilter === filter && styles.filterPillActive
                  ]}
                  onPress={() => handleFilterChange(filter)}
                >
                  <Text style={[
                    styles.filterText,
                    activeFilter === filter && styles.filterTextActive
                  ]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Projects List */}
            {filteredProjects.length > 0 ? (
              <>
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={`${project.project_code}-${index}`}
                    project={project}
                    onStartProject={handleStartProject}
                    onViewDetails={handleViewDetails}
                  />
                ))}
                
                {/* Load More Indicator */}
                {currentPage < totalPages && (
                  <View style={styles.loadMoreContainer}>
                    {isLoadingMore ? (
                      <Text style={styles.loadingText}>Loading more projects...</Text>
                    ) : (
                      <TouchableOpacity 
                        style={styles.loadMoreButton}
                        onPress={loadMoreProjects}
                      >
                        <Text style={styles.loadMoreText}>Load More Projects</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Page Info */}
                <View style={styles.pageInfo}>
                  <Text style={styles.pageInfoText}>
                    Showing {filteredProjects.length} of {allProjects.filter(project => {
                      if (activeFilter === "all") return true;
                      return project.status === activeFilter;
                    }).length} projects
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No projects found</Text>
                <Text style={styles.emptyText}>
                  {activeFilter !== "all" 
                    ? `No ${activeFilter} projects available` 
                    : "No assigned projects found"
                  }
                </Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={onRefresh}
                >
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Employee ID</Text>
            <Text style={styles.emptyText}>Please check your profile settings</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default APMTimeSheet;

// Keep all the styles from your original APMTimeSheet component
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
  fixedEmployeeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e2e8f0",
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  refreshButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadMoreContainer: {
    alignItems: "center",
    padding: 16,
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
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