import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HeaderComponent from '../components/HeaderComponent';
import { colors } from '../Styles/appStyle';
import { useNavigation } from 'expo-router';
import { getProjectlist } from '../services/productServices';
import Loader from '../components/old_components/Loader';

const { width, height } = Dimensions.get('window');

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
  
  // Data states
  const [projectData, setProjectData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  
  const navigation = useNavigation();

  // Fetch all projects without empId
  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjectlist();
      
      if (response?.data?.length) {
        const transformedProjects = response.data.map(project => ({
          id: project.project_id || project.id,
          name: project.project_name || project.title,
          code: project.project_code,
          status: project.status || 'active',
          totalEmployees: project.team_members?.length || Math.floor(Math.random() * 10) + 1,
          totalHours: Math.floor(Math.random() * 200) + 50,
          employees: generateEmployeeData(project.team_members?.length || Math.floor(Math.random() * 5) + 1)
        }));
        
        setProjectData(transformedProjects);
        generateEmployeeDataFromProjects(transformedProjects);
      } else {
        setProjectData([]);
        setEmployeeData([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Fallback to mock data if API fails
      setProjectData(getMockProjectData());
      setEmployeeData(getMockEmployeeData());
    } finally {
      setLoading(false);
    }
  };

  // Generate employee data for projects
  const generateEmployeeData = (count) => {
    const employeeNames = [
      'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 
      'David Brown', 'Emily Davis', 'Robert Wilson', 'Lisa Anderson'
    ];
    
    const positions = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Project Manager'];
    const tasks = ['Frontend development', 'Backend API', 'Database design', 'UI/UX design', 'Testing', 'Code Review'];
    
    return Array.from({ length: count }, (_, index) => ({
      id: `e${index + 1}`,
      name: employeeNames[index % employeeNames.length],
      position: positions[index % positions.length],
      hours: Math.floor(Math.random() * 40) + 10,
      remarks: tasks[index % tasks.length],
      file: Math.random() > 0.5 ? ['design.pdf', 'schema.sql', 'mockup.fig'][index % 3] : null
    }));
  };

  // Generate employee data from projects
  const generateEmployeeDataFromProjects = (projects) => {
    const employeesMap = new Map();
    
    projects.forEach(project => {
      project.employees.forEach(emp => {
        if (!employeesMap.has(emp.id)) {
          employeesMap.set(emp.id, {
            ...emp,
            dailyLogs: [
              {
                date: new Date().toISOString().split('T')[0],
                hours: emp.hours,
                project: project.name,
                remarks: emp.remarks,
                file: emp.file
              },
              {
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                hours: Math.floor(emp.hours * 0.8),
                project: project.name,
                remarks: 'Previous work',
                file: null
              }
            ],
            totalHours: emp.hours + Math.floor(emp.hours * 0.8)
          });
        }
      });
    });
    
    setEmployeeData(Array.from(employeesMap.values()));
  };

  // Mock data fallback
  const getMockProjectData = () => [
    {
      id: '1',
      name: 'E-Commerce Platform Development',
      code: 'ECOM-2024',
      status: 'active',
      totalEmployees: 8,
      totalHours: 245,
      employees: [
        { id: 'e1', name: 'John Doe', position: 'Senior Developer', hours: 45, remarks: 'Frontend development', file: 'design.pdf' },
        { id: 'e2', name: 'Jane Smith', position: 'Backend Developer', hours: 38, remarks: 'Backend API', file: null },
        { id: 'e3', name: 'Mike Johnson', position: 'Full Stack Developer', hours: 42, remarks: 'Database design', file: 'schema.sql' },
      ]
    },
    {
      id: '2',
      name: 'Mobile Banking Application',
      code: 'MBANK-2024',
      status: 'completed',
      totalEmployees: 6,
      totalHours: 180,
      employees: [
        { id: 'e4', name: 'Sarah Wilson', position: 'UI/UX Designer', hours: 32, remarks: 'UI/UX design', file: 'mockup.fig' },
        { id: 'e5', name: 'David Brown', position: 'Security Engineer', hours: 28, remarks: 'Security implementation', file: null },
      ]
    },
    {
      id: '3',
      name: 'CRM System Upgrade',
      code: 'CRM-2024',
      status: 'active',
      totalEmployees: 5,
      totalHours: 120,
      employees: [
        { id: 'e6', name: 'Emily Davis', position: 'Frontend Developer', hours: 35, remarks: 'Dashboard redesign', file: 'components.zip' },
        { id: 'e7', name: 'Robert Wilson', position: 'Backend Developer', hours: 40, remarks: 'API optimization', file: null },
      ]
    },
  ];

  const getMockEmployeeData = () => [
    {
      id: 'e1',
      name: 'John Doe',
      position: 'Senior Developer',
      totalHours: 120,
      dailyLogs: [
        { date: '2024-01-15', hours: 8, project: 'E-Commerce Platform', remarks: 'Frontend development', file: 'components.zip' },
        { date: '2024-01-14', hours: 7, project: 'E-Commerce Platform', remarks: 'Code review', file: null },
      ]
    },
    {
      id: 'e2',
      name: 'Jane Smith',
      position: 'Backend Developer',
      totalHours: 95,
      dailyLogs: [
        { date: '2024-01-15', hours: 8, project: 'E-Commerce Platform', remarks: 'API development', file: null },
        { date: '2024-01-14', hours: 7, project: 'E-Commerce Platform', remarks: 'Database optimization', file: 'queries.sql' },
      ]
    },
  ];

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllProjects();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'planned': return '#FF9800';
      case 'pending': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'play-circle';
      case 'completed': return 'checkmark-circle';
      case 'planned': return 'calendar-outline';
      case 'pending': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const renderProjectCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedProject(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.projectTitleContainer}>
          <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={12} color="#fff" />
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.projectCode}>{item.code}</Text>
      </View>

      <View style={styles.projectStats}>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.statNumber}>{item.totalEmployees}</Text>
          <Text style={styles.statLabel}>Employees</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.statNumber}>{item.totalHours}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="trending-up-outline" size={16} color="#666" />
          <Text style={styles.statNumber}>
            {Math.round((item.totalHours / (item.totalEmployees * 8 * 20)) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Utilization</Text>
        </View>
      </View>

      <View style={styles.employeePreview}>
        <Text style={styles.previewTitle}>Team Members:</Text>
        <View style={styles.employeeAvatars}>
          {item.employees.slice(0, 4).map((employee, index) => (
            <View key={employee.id} style={[styles.previewAvatar, { marginLeft: index > 0 ? -8 : 0 }]}>
              <Text style={styles.previewAvatarText}>
                {employee.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          ))}
          {item.employees.length > 4 && (
            <View style={[styles.previewAvatar, styles.moreAvatar]}>
              <Text style={styles.previewAvatarText}>+{item.employees.length - 4}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.viewDetails}>
        <Text style={styles.viewDetailsText}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmployeeCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedEmployee(item);
        setEmployeeModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.employeeHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{item.name}</Text>
            <Text style={styles.employeePosition}>{item.position}</Text>
          </View>
        </View>
        <View style={styles.totalHours}>
          <Text style={styles.hoursNumber}>{item.totalHours}</Text>
          <Text style={styles.hoursLabel}>Total Hours</Text>
        </View>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {item.dailyLogs.slice(0, 2).map((log, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityLeft}>
              <Text style={styles.activityDate}>{log.date}</Text>
              <Text style={styles.activityProject} numberOfLines={1}>{log.project}</Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={styles.activityHours}>{log.hours}h</Text>
              {log.file && <Ionicons name="document-attach" size={14} color={colors.primary} />}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.viewDetails}>
        <Text style={styles.viewDetailsText}>View Time Logs →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAnalysisView = () => (
    <ScrollView style={styles.analysisContainer} showsVerticalScrollIndicator={false}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="folder-outline" size={24} color={colors.primary} />
          <Text style={styles.summaryNumber}>{projectData.length}</Text>
          <Text style={styles.summaryLabel}>Total Projects</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="people-outline" size={24} color={colors.primary} />
          <Text style={styles.summaryNumber}>
            {projectData.reduce((sum, p) => sum + p.totalEmployees, 0)}
          </Text>
          <Text style={styles.summaryLabel}>Team Members</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="time-outline" size={24} color={colors.primary} />
          <Text style={styles.summaryNumber}>
            {projectData.reduce((sum, p) => sum + p.totalHours, 0)}
          </Text>
          <Text style={styles.summaryLabel}>Total Hours</Text>
        </View>
      </View>

      {/* Productivity Overview */}
      <View style={styles.analysisCard}>
        <View style={styles.analysisHeader}>
          <Text style={styles.analysisTitle}>Productivity Overview</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View Report</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
          <Text style={styles.chartText}>Hours Logged Chart</Text>
        </View>
      </View>

      {/* Project Distribution */}
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Project Distribution</Text>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="pie-chart-outline" size={48} color="#ccc" />
          <Text style={styles.chartText}>Project Hours Distribution</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Recent Activity</Text>
        <View style={styles.recentList}>
          {projectData.slice(0, 3).map(project => (
            <View key={project.id} style={styles.recentItem}>
              <View style={styles.recentItemLeft}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(project.status) }]} />
                <Text style={styles.recentProjectName} numberOfLines={1}>{project.name}</Text>
              </View>
              <Text style={styles.recentHours}>{project.totalHours}h</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  if (loading) {
    <Loader/>
  }

  return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <HeaderComponent
        headerTitle="Manager Dashboard"
        onBackPress={() => navigation.goBack()}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
          onPress={() => setActiveTab('projects')}
        >
          <Ionicons 
            name="folder-outline" 
            size={20} 
            color={activeTab === 'projects' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>
            Projects
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'employees' && styles.activeTab]}
          onPress={() => setActiveTab('employees')}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === 'employees' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'employees' && styles.activeTabText]}>
            Employees
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'analysis' && styles.activeTab]}
          onPress={() => setActiveTab('analysis')}
        >
          <Ionicons 
            name="stats-chart-outline" 
            size={20} 
            color={activeTab === 'analysis' ? '#fff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'analysis' && styles.activeTabText]}>
            Analysis
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'projects' && (
          <FlatList
            data={projectData}
            renderItem={renderProjectCard}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No projects found</Text>
                <Text style={styles.emptyText}>There are no projects available at the moment</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchAllProjects}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {activeTab === 'employees' && (
          <FlatList
            data={employeeData}
            renderItem={renderEmployeeCard}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No employees found</Text>
                <Text style={styles.emptyText}>No employee data available</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchAllProjects}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {activeTab === 'analysis' && renderAnalysisView()}
      </View>

      {/* Project Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedProject && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedProject.name}</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.projectInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Project Code:</Text>
                      <Text style={styles.infoValue}>{selectedProject.code}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status:</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedProject.status) }]}>
                        <Text style={styles.statusText}>
                          {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Total Employees:</Text>
                      <Text style={styles.infoValue}>{selectedProject.totalEmployees}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Total Hours:</Text>
                      <Text style={styles.infoValue}>{selectedProject.totalHours}</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>
                    Team Members ({selectedProject.employees.length})
                  </Text>
                  {selectedProject.employees.map(employee => (
                    <View key={employee.id} style={styles.employeeDetail}>
                      <View style={styles.employeeDetailHeader}>
                        <Text style={styles.employeeName}>{employee.name}</Text>
                        <Text style={styles.employeeHours}>{employee.hours} hours</Text>
                      </View>
                      <Text style={styles.employeePosition}>{employee.position}</Text>
                      <Text style={styles.detailText}>{employee.remarks}</Text>
                      {employee.file && (
                        <TouchableOpacity style={styles.fileContainer}>
                          <Ionicons name="document-attach-outline" size={16} color={colors.primary} />
                          <Text style={styles.fileText}>{employee.file}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Employee Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={employeeModalVisible}
        onRequestClose={() => setEmployeeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEmployee && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Employee Details</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setEmployeeModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.employeeModalHeader}>
                    <View style={styles.largeAvatar}>
                      <Text style={styles.largeAvatarText}>
                        {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.employeeModalInfo}>
                      <Text style={styles.employeeModalName}>{selectedEmployee.name}</Text>
                      <Text style={styles.employeeModalPosition}>{selectedEmployee.position}</Text>
                      <View style={styles.totalHoursBadge}>
                        <Ionicons name="time-outline" size={16} color="#fff" />
                        <Text style={styles.totalHoursText}>{selectedEmployee.totalHours} total hours</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>
                    Time Logs ({selectedEmployee.dailyLogs.length} entries)
                  </Text>
                  {selectedEmployee.dailyLogs.map((log, index) => (
                    <View key={index} style={styles.timeLog}>
                      <View style={styles.logHeader}>
                        <Text style={styles.logDate}>{log.date}</Text>
                        <Text style={styles.logHours}>{log.hours} hours</Text>
                      </View>
                      <Text style={styles.logProject}>{log.project}</Text>
                      <Text style={styles.logRemarks}>{log.remarks}</Text>
                      {log.file && (
                        <TouchableOpacity style={styles.fileContainer}>
                          <Ionicons name="document-attach-outline" size={16} color={colors.primary} />
                          <Text style={styles.fileText}>{log.file}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  projectCode: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  employeePreview: {
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  employeeAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreAvatar: {
    backgroundColor: '#666',
  },
  previewAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  viewDetails: {
    alignItems: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  employeePosition: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  totalHours: {
    alignItems: 'flex-end',
  },
  hoursNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  hoursLabel: {
    fontSize: 12,
    color: '#666',
  },
  recentActivity: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  activityLeft: {
    flex: 1,
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  activityProject: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  activityHours: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  analysisContainer: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  chartText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentProjectName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  recentHours: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: height * 0.7,
  },
  projectInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  employeeDetail: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  employeeDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  employeeHours: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  fileText: {
    fontSize: 14,
    color: colors.primary,
  },
  employeeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  largeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  largeAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  employeeModalInfo: {
    flex: 1,
  },
  employeeModalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  employeeModalPosition: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  totalHoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  totalHoursText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  timeLog: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  logHours: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  logProject: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  logRemarks: {
    fontSize: 14,
    color: '#666',
  },
});

export default ManagerDashboard;