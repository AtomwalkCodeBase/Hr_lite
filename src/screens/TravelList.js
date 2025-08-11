import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import HeaderComponent from '../components/HeaderComponent';
import EmptyMessage from '../components/EmptyMessage';
import Loader from '../components/old_components/Loader';
import { getEmployeeTravel } from '../services/productServices';
import ApplyButton from '../components/ApplyButton';
import ModalComponent from '../components/ModalComponent';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterModal from '../components/FilterModal';
import TravelCard from '../components/TravelCard';
import TravelModal from '../components/TravelModal';

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveHeight = (percentage) => height * (percentage / 100);
const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));

const TravelList = (props) => {
  const router = useRouter();
  const navigate = useNavigation();
  const [filteredTravels, setFilteredTravels] = useState([]);
  const [empId, setEmpId] = useState(props?.data?.empId || ""); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({ 
    status: "", 
    mode: "",
    project: "" 
  });
  const [pendingFilters, setPendingFilters] = useState({ 
    status: "", 
    mode: "",
    project: ""
  });
    
  const appliedFilterCount = Object.values(filters).filter(v => v && v !== "").length;

  useEffect(() => {
    if (empId) {
      fetchData();
    }
  }, [empId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await fetchTravelRequest();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTravelRequest = async () => {
    try {
      const res = await getEmployeeTravel(empId);
      setFilteredTravels(res.data);
    } catch (err) {
      console.error("Error fetching travel requests:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (empId) {
        fetchTravelRequest();
      }
    }, [empId])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCardPress = (item) => {
    setSelectedRequest(item);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
  };

  const handleCancelRequest = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
  };
  
  const handleTravelAction = (mode, travelId = null, travelData = null) => {
  const params = {
    mode: mode || 'ADD', // Default to ADD if no mode specified
    empId: empId, // Always include the employee ID
  };

  if (travelId) {
    params.travelId = travelId;
  }

  if (travelData) {
    params.travelData = JSON.stringify(travelData);
  }

  router.push({
    pathname: 'TravelForm',
    params
  });
};

// Then you can use it for both create and update:
const handleCreateRequest = () => handleTravelAction('ADD');
const handleUpdateRequest = (item) => handleTravelAction('EDIT', item.travel_id, item);


  function getDropdownOptions(data, key) {
    const uniqueValues = [...new Set(data.map(item => item[key]))];
    return uniqueValues.map(value => ({ label: value, value }));
  }

  function getProjectOptions(data) {
  const projects = data.map(item => ({
    label: `${item.project_name} (${item.project_code})`,
    value: item.project_code
  }));
  
  // Convert the Map values to an array
  return Array.from(
    new Map(projects.map(item => [item.value, item])).values()
  );
}

  const displayedTravels = useMemo(() => {
    return filteredTravels.filter(item => {
      const matchesStatus = !filters.status || item.status_display === filters.status;
      const matchesMode = !filters.mode || item.travel_mode === filters.mode;
      const matchesProject = !filters.project || item.project_code === filters.project;

      return matchesStatus && matchesMode && matchesProject;
    });
  }, [filteredTravels, filters]);

  const filterConfigs = useMemo(() => [
    {
      label: "Status",
      options: getDropdownOptions(filteredTravels, "status_display"),
      value: pendingFilters.status,
      setValue: (value) => setPendingFilters((prev) => ({ ...prev, status: value })),
    },
    {
      label: "Travel Mode",
      options: getDropdownOptions(filteredTravels, "travel_mode"),
      value: pendingFilters.mode,
      setValue: (value) => setPendingFilters((prev) => ({ ...prev, mode: value })),
    },
    {
      label: "Project",
      options: [...getProjectOptions(filteredTravels)],
      value: pendingFilters.project,
      setValue: (value) => setPendingFilters((prev) => ({ ...prev, project: value })),
    }
  ], [pendingFilters, filteredTravels]);

  const openFilterModal = () => {
    setPendingFilters(filters);
    setShowFilterModal(true);
  };

  const renderTravelCard = ({ item }) => (
    <TravelCard 
      item={item}
      onPress={() => handleCardPress(item)}
      onUpdate={() => handleUpdateRequest(item)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent 
        headerTitle="Travel Requests" 
        onBackPress={() => navigate.goBack()} 
        showActionButton={false}
        icon1Name="filter"
        icon1OnPress={filteredTravels.length > 0 ? openFilterModal : null} // Hide filter when no data
        filterCount={appliedFilterCount}
      />
      <View style={styles.container}>
        {loading ? (
          <Loader visible={loading} />
        ) : (
          <ScrollView 
            style={styles.contentContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            {displayedTravels.length > 0 ? (
              <FlatList
                data={displayedTravels}
                renderItem={renderTravelCard}
                keyExtractor={(item) => item.travel_id}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyMessage 
                message="No travel requests found"
                subMessage="Tap the button below to create a new travel request"
                iconName="flight"
              />
            )}
          </ScrollView>
        )}

        <ApplyButton             
          onPress={handleCreateRequest}
          buttonText="Create Travel Request"
          iconName="add"
        />
      </View>
      
      <TravelModal
        isVisible={isModalVisible}
        travelRequest={selectedRequest}
        onClose={closeModal}
        onCancelRequest={handleCancelRequest}
        showCancelButton={selectedRequest?.status_display === "Submitted"}
      />

      <FilterModal 
        visible={showFilterModal} 
        onClose={() => setShowFilterModal(false)}
        onClearFilters={() => {
          setPendingFilters({
            status: "",
            mode: "",
            project: ""
          });
          setFilters({
            status: "",
            mode: "",
            project: ""
          });
        }}
        filterConfigs={filterConfigs}
        modalTitle="Filter Travel Requests"
        onApplyFilters={() => {
          setFilters(pendingFilters);
          setShowFilterModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: responsiveWidth(4),
  },
  contentContainer: {
    flex: 1,
    paddingTop: responsiveWidth(5),
  },
  scrollContent: {
    paddingBottom: responsiveHeight(12),
  },
  listContent: {
    paddingBottom: responsiveHeight(2),
    paddingTop: responsiveHeight(1),
  },
});

export default TravelList;