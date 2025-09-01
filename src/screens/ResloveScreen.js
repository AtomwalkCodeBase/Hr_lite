import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
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
import { getEmployeeRequest, getRequestCategory } from '../services/productServices';
import ApplyButton from '../components/ApplyButton';
import RequestCard from '../components/RequestCard';
import ModalComponent from '../components/ModalComponent';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterModal from '../components/FilterModal';

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveHeight = (percentage) => height * (percentage / 100);
const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));

const ResolveScreen = (props) => {
  const navigate = useNavigation();
  const router = useRouter();
  const call_type = 'R';
  const [helpCategories, setHelpCategories] = useState([]);
  const [helpData, setHelpData] = useState([]);
  const [filteredHelps, setFilteredHelps] = useState([]);
  const [empId, setEmpId] = useState(props?.data?.empId || ""); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredHelpCategories, setFilteredHelpCategories] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({ category: "", status: "" });
  const [pendingFilters, setPendingFilters] = useState({ category: "", status: "" });
    
    
  const appliedFilterCount = Object.values(filters).filter(v => v && v !== "").length;

  useEffect(() => {
    if (empId) {
      fetchData();
    }
  }, [empId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchRequestCategory(), fetchRequest()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRequestCategory = async () => {
    try {
      const res = await getRequestCategory();
      setHelpCategories(res.data);
      const filtered = res.data;
      setFilteredHelpCategories(filtered);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchRequest = async () => {
    try {
      const res = await getEmployeeRequest();
      setHelpData(res.data);
      const filtered = res.data.filter(
        (request) => 
          request.resolved_by === empId
      );
      setFilteredHelps(filtered);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

    useFocusEffect(
      React.useCallback(() => {
        if (empId) {
          fetchRequest();
        }
      }, [empId])
    );

  const handleBackPress = () => {
    router.back();
  };

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
  
  const handleCreateRequest = () => {  
    router.push({
      pathname: 'AddHelp',
      params: {
        empId,
        call_type
      },
    });
  };

  const handleUpdateHelp = (item) => {
    router.push({
      pathname: 'AddHelp',
      params: {
        empId,
        call_type,
        item: JSON.stringify(item),
        headerTitle: "Update Help",
      },
    });
  };

  const handleResolveHelp = (item) => {
    router.push({
      pathname: 'ResolveRequestScreen',
      params: {
        empId,
        call_type,
        item: JSON.stringify(item),
        headerTitle: "Resolve Help",
      },
    });
  };

  function getDropdownOptions(data, key) {
    const uniqueValues = [...new Set(data.map(item => item[key]))];
    return uniqueValues.map(value => ({ label: value, value }));
  }

const displayedHelps = useMemo(() => {
  return filteredHelps.filter(item => {
    const matchesCategory = !filters.category || item.request_sub_type === filters.category;
    const matchesStatus = !filters.status || item.status_display === filters.status;

    return matchesCategory && matchesStatus;
  });
}, [filteredHelps, filters]);


const filterConfigs = useMemo(() => [
  {
    label: "Category",
    options: getDropdownOptions(filteredHelpCategories, "name"),
    value: pendingFilters.category,
    setValue: (value) => setPendingFilters((prev) => ({ ...prev, category: value })),
  },
  {
    label: "Status",
    options: getDropdownOptions(filteredHelps, "status_display"),
    value: pendingFilters.status,
    setValue: (value) => setPendingFilters((prev) => ({ ...prev, status: value })),
  }
], [pendingFilters]);


  const openFilterModal = () => {
    setPendingFilters(filters);
    setShowFilterModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <HeaderComponent 
        headerTitle="Resolve Desk" 
        onBackPress={() => navigate.goBack()} 
        showActionButton={false}
        icon1Name="filter"
        icon1OnPress={openFilterModal}
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
            {displayedHelps.length > 0 ? (
              <FlatList
                data={displayedHelps}
                renderItem={({ item }) => (
                  <RequestCard 
                    item={item}
                    onPress={() => handleCardPress(item)}
                    onUpdate={() => handleUpdateHelp(item)}
                    onResolve={() => handleResolveHelp(item)}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyMessage 
                message="No resolve requests found"
                subMessage="Nothing needs your attention at the moment."
                iconName="help-circle"
              />
            )}
          </ScrollView>
        )}
      </View>
      
      <ModalComponent
        isVisible={isModalVisible}
        helpRequest={selectedRequest}
        onClose={closeModal}
      />

      <FilterModal visible={showFilterModal} onClose={() => setShowFilterModal(false)}
        onClearFilters={() => {
          setPendingFilters({
            category: "",
            status: "",
          });
          setFilters({
            category: "",
            status: "",
          });
        }}
        filterConfigs={filterConfigs}
        modalTitle="Filter TimeSheet"
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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
});

export default ResolveScreen;