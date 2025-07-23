import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import HeaderComponent from '../components/HeaderComponent';
import EmptyMessage from '../components/EmptyMessage';
import Loader from '../components/old_components/Loader';
import { getEvents } from '../services/productServices';
import ApplyButton from '../components/ApplyButton';
import ModalComponent from '../components/ModalComponent';
import EventCard from '../components/EventCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterModal from '../components/FilterModal';

const { width } = Dimensions.get('window');

const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));

const FilterChip = ({ label, selected, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.filterChip, 
      selected && styles.selectedFilterChip,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.filterChipText, selected && styles.selectedFilterChipText]}>
      {label}
    </Text>
    {selected && (
      <View style={styles.selectedIndicator}>
        <Ionicons name="checkmark" size={16} color="#fff" />
      </View>
    )}
  </TouchableOpacity>
);

const EventScreen = (props) => {
  const router = useRouter();
  const [eventData, setEventData] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [empId, setEmpId] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateRange, setDateRange] = useState('D0'); // 'ALL', 'D0' (today), 'D1' (upcoming)
  const [pendingFilters, setPendingFilters] = useState({
  dateRange: dateRange,
  eventType: activeFilter,
});

  const appliedFilterCount = Object.values(pendingFilters).filter(v => v && v !== "").length;

  const eventTypes = [
    { code: 'All', display: 'My Events' },
    { code: 'B', display: 'Birthday' },
    { code: 'A', display: 'Work Anniversary' },
    { code: 'C', display: 'Company Event' },
    { code: 'M', display: 'Marriage Anniversary' },
    { code: 'P', display: 'Promotion Event' },
    { code: 'O', display: 'Other' }
  ];

  const dateRangeOptions = [
    { code: 'D0', display: 'Today' },
    { code: 'D1', display: 'Tomorrow' },
    { code: 'PAST', display: 'Past' },
    { code: 'D15', display: 'Next 15 Days' }
  ];

  useEffect(() => {
    if (props?.data?.empId) {
      setEmpId(props.data.empId);
    }
  }, [props?.data?.empId]);
  
  // useEffect(() => {
  //   fetchEvents();
  // }, [empId, pendingFilters.dateRange, pendingFilters.eventType]);
  useEffect(() => {
  fetchEvents();
}, [empId, dateRange, activeFilter]);

  const handleBackPress = () => {
    router.push('MoreScreen');
  };

  const fetchEvents = () => {
  setLoading(true);
  setRefreshing(true);
  
  // Use the actual filter values (dateRange and activeFilter) instead of pendingFilters
  const params = {
    emp_id: (activeFilter === 'All' || activeFilter === 'P') ? empId : '',
    event_type: activeFilter === 'All' ? '' : activeFilter,
    date_range: dateRange
  };
  
  getEvents(params)
    .then((res) => {
      const filteredData = res.data.filter(event => 
        event.event_status === 'A' || event.event_status === 'P'
      );
      setEventData(filteredData);
      applyFilter(activeFilter, filteredData);
    })
    .catch((error) => {
      console.error("Fetch Event Error:", error?.response?.data);
    })
    .finally(() => {
      setLoading(false);
      setRefreshing(false);
    });
};


  const applyFilter = (typeCode, data) => {
    if (typeCode === 'All') {
      setFilteredEvents(data);
    } else {
      const filtered = data.filter(event => event.event_type === typeCode);
      setFilteredEvents(filtered);
    }
  };

  const handleCardPress = (event) => {
    const formattedEventDetails = typeof event === 'object'
      ? JSON.stringify(event)
      : event;
  
      router.push({
        pathname: 'EventDetails',
        params: {
          eventDetails: formattedEventDetails
        },
    });
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  const onRefresh = () => {
    fetchEvents();
  };

  const openFilterModal = () => {
    setPendingFilters({
      dateRange: dateRange,
      eventType: activeFilter,
    });
    setShowFilterModal(true);
  };

    const DropdownOptions = (data,labelKey, valueKey) => {
    return data.map(item => ({
      label: item[labelKey],
      value: item[valueKey],
    }));
  };

  const filterConfigs = [
    {
      label: "Select Time Period",
      options: DropdownOptions(dateRangeOptions, 'display', 'code'),
      value: pendingFilters.dateRange,
      setValue: (value) => setPendingFilters((prev) => ({ ...prev, dateRange: value })),
    },
    {
      label: "Select Event",
      options: DropdownOptions(eventTypes, 'display', 'code'),
      value: pendingFilters.eventType,
      setValue: (value) => setPendingFilters((prev) => ({ ...prev, eventType: value })),
    }
  ];

  const handleApplyFilters = () => {
  // Update the actual filter states with the pending values
  setDateRange(pendingFilters.dateRange);
  setActiveFilter(pendingFilters.eventType);
  
  // Now fetch events with the new filters
  fetchEvents();
  
  setShowFilterModal(false);
};


const handleClearFilters = () => {
  // Reset pending filters to default values
  setPendingFilters({
    dateRange: 'D0',  // Default value
    eventType: 'All', // Default value
  });
  
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent 
        headerTitle="Event Updates" 
        onBackPress={handleBackPress} 
        icon1Name="filter"
        icon1OnPress={openFilterModal}
        filterCount={appliedFilterCount}
      />
      
      <View style={styles.container}>
        {loading ? (
          <Loader visible={loading} />
        ) : (
          <FlatList
            data={filteredEvents}
            renderItem={({ item }) => (
              <EventCard 
                event={item}
                onPress={() => handleCardPress(item)}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyMessage 
                message="No events found"
                subMessage={`There are no ${activeFilter === 'All' ? '' : activeFilter.toLowerCase() + ' '}events scheduled`}
                iconName="calendar-remove-outline"
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3498db']}
                tintColor="#3498db"
              />
            }
          />
        )}
      </View>
      
      <ModalComponent
        isVisible={isModalVisible}
        helpRequest={selectedEvent}
        onClose={closeModal}
      />

        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onClearFilters={handleClearFilters}
          onApplyFilters={handleApplyFilters}
          filterConfigs={filterConfigs}
          modalTitle="Filter Events"
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
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  headerSection: {
    paddingHorizontal: responsiveWidth(5),
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: responsiveFontSize(6),
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterContent: {
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f2f6',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#f1f2f6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedFilterChip: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterChipText: {
    fontSize: responsiveFontSize(3.2),
    fontWeight: '500',
    color: '#7f8c8d',
  },
  selectedFilterChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  selectedIndicator: {
    marginLeft: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
});

export default EventScreen;