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
import RequestCard from '../components/RequestCard'; // Import the new component

const { width, height } = Dimensions.get('window');

const responsiveWidth = (percentage) => width * (percentage / 100);
const responsiveHeight = (percentage) => height * (percentage / 100);
const responsiveFontSize = (percentage) => Math.round(width * (percentage / 100));

const HelpScreen = (props) => {
  const router = useRouter();
  const [requestCategories, setRequestCategories] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [empId, setEmpId] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredCategories, setFilteredCategories] = useState([]);
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
        setRequestCategories(res.data);
        const filtered = res.data.filter(category => category.request_type === 'R');
        setFilteredCategories(filtered);
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleBackPress = () => {
    router.push({
      pathname: 'MoreScreen' 
    });
  };

  const fetchRequest = () => {
    setLoading(true);
    getEmployeeRequest()
      .then((res) => {
        setRequestData(res.data);
        const filtered = res.data.filter(
          (request) => 
            request.request_type === 'H' && 
            request.emp_id === empId
        );
        setFilteredRequests(filtered);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCardPress = (item) => {
    // Handle card press if needed
    console.log("Card Pressed")
  };
  
  const handleCreateRequest = () => {
    router.push('/CreateRequestScreen');
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
            
            
            {filteredRequests.length > 0 ? (
              // In your RequestScreen.js
            <FlatList
              data={filteredRequests}
              renderItem={({ item }) => (
                <RequestCard 
                  item={item}
                  onPress={filteredRequests.length > 0 ? () => handleCardPress(item) : undefined}
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
    // paddingHorizontal: responsiveWidth(4),
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