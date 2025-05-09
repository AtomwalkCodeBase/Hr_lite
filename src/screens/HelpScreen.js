import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useRouter } from "expo-router";
import HeaderComponent from '../components/HeaderComponent';
import EmptyMessage from '../components/EmptyMessage';
import Loader from '../components/old_components/Loader';
import { getEmployeeRequest, getRequestCategory } from '../services/productServices';
import ApplyButton from '../components/ApplyButton';
import RequestCard from '../components/RequestCard';
import ModalComponent from '../components/ModalComponent';

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveHeight = (percentage) => height * (percentage / 100);
const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));

const HelpScreen = (props) => {
  const router = useRouter();
  const call_type = 'H';
  const [helpCategories, setHelpCategories] = useState([]);
  const [helpData, setHelpData] = useState([]);
  const [filteredHelps, setFilteredHelps] = useState([]);
  const [empId, setEmpId] = useState(props?.data?.empId || ""); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredHelpCategories, setFilteredHelpCategories] = useState([]);

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
      const filtered = res.data.filter(category => category.request_type === 'H');
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
          request.request_type === 'H' && 
          request.emp_id === empId
      );
      setFilteredHelps(filtered);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleBackPress = () => {
    router.push({
      pathname: 'MoreScreen' 
    });
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

  const handleUpdateRequest = (item) => {
    router.push({
      pathname: 'AddHelp',
      params: {
        empId,
        call_type,
        item: JSON.stringify(item),
        headerTitle: "Update Request",
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent 
        headerTitle="Help Desk" 
        onBackPress={handleBackPress} 
        showActionButton={false}
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
            {filteredHelps.length > 0 ? (
              <FlatList
                data={filteredHelps}
                renderItem={({ item }) => (
                  <RequestCard 
                    item={item}
                    onPress={() => handleCardPress(item)}
                    onUpdate={() => handleUpdateRequest(item)}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyMessage 
                message="No help requests found"
                subMessage="Tap the button below to create a new request"
                iconName="help-circle"
              />
            )}
          </ScrollView>
        )}

        <ApplyButton             
          onPress={handleCreateRequest}
          buttonText="Create New Help Request"
          iconName="add"
        />
      </View>
      
      <ModalComponent
        isVisible={isModalVisible}
        helpRequest={selectedRequest}
        onClose={closeModal}
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

export default HelpScreen;