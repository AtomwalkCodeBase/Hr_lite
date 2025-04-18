import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Animated,
  Easing,
  StyleSheet,
  SafeAreaView,
  ScrollView
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
  const [empId, setEmpId] = useState(""); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredHelpCategories, setFilteredHelpCategories] = useState([]);
  const scaleValue = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    fetchRequestCategory();
    fetchRequest();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();
  }, [empId]);

  useEffect(() => {
    if (props?.data?.empId) {
      setEmpId(props.data.empId);
    }
  }, [props?.data?.empId]);

  const fetchRequestCategory = () => {
    setLoading(true);
    getRequestCategory()
      .then((res) => {
        setHelpCategories(res.data);
        const filtered = res.data.filter(category => category.request_type === 'H');
        setFilteredHelpCategories(filtered);
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  console.log("Emp Id====", empId);

  const handleBackPress = () => {
    router.push({
      pathname: 'MoreScreen' 
    });
  };

  const fetchRequest = () => {
    setLoading(true);
    getEmployeeRequest()
      .then((res) => {
        setHelpData(res.data);
        const filtered = res.data.filter(
          (request) => 
            request.request_type === 'H' && 
            request.emp_id === empId
        );
        setFilteredHelps(filtered);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
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
         // ✅ stringify here
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
          >
            {filteredHelps.length > 0 ? (
              <FlatList
                data={filteredHelps}
                renderItem={({ item }) => (
                  <RequestCard 
                    item={item}
                    onPress={filteredHelps.length > 0 ? () => handleCardPress(item) : undefined}
                    onUpdate={() => handleUpdateRequest(item)}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyMessage 
                message="No resource requests found"
                subMessage="Tap the button below to create a new request"
                iconName="folder-open"
              />
            )}
          </ScrollView>
        )}

        <ApplyButton             
          onPress={handleCreateRequest}
          buttonText="Create New Request"
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
    paddingBlockStart: responsiveWidth(5),
  },
  scrollContent: {
    paddingBottom: responsiveHeight(12),
  },
  listContent: {
    paddingBottom: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(5),
    fontWeight: '600',
    color: '#34495e',
    marginVertical: responsiveHeight(2.5),
    marginLeft: responsiveWidth(2),
    letterSpacing: 0.5,
  },
});

export default HelpScreen;