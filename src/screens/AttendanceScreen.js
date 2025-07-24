import React, { useState, useEffect, useLayoutEffect, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Alert, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Dimensions 
} from 'react-native';
import moment from 'moment';
import * as Location from 'expo-location';
import { useNavigation, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import RemarksInput from '../components/RemarkInput';
import { getEmpAttendance, postCheckIn } from '../services/productServices';
import Loader from '../components/old_components/Loader';
import SuccessModal from '../components/SuccessModal';
import HeaderComponent from '../components/HeaderComponent';
import { LinearGradient } from 'expo-linear-gradient';
import ConfirmationModal from '../components/ConfirmationModal';
import { colors } from '../Styles/appStyle';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../../context/AppContext';
import ErrorModal from '../components/ErrorModal';
import { getTimesheetData } from '../services/productServices';

const { width } = Dimensions.get('window');

const AddAttendance = () => {
  const { profile } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [attendance, setAttendance] = useState(null); // Changed from {} to null for better initial state
  const [attData, setAttData] = useState([]);
  const [employeeData, setEmployeeData] = useState(null); // Changed to null initially
  // const [checkedIn, setCheckedIn] = useState(false);
  // const [startTime, setStartTime] = useState(null);
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRemarkModalVisible, setIsRemarkModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [previousDayUnchecked, setPreviousDayUnchecked] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // New state to track if all data is loaded
  const [isYesterdayCheckout, setIsYesterdayCheckout] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showTimesheetErrorModal, setShowTimesheetErrorModal] = useState(false);
  const [showEffortConfirmModal, setShowEffortConfirmModal] = useState(false);
  const [timesheetCheckedToday, setTimesheetCheckedToday] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();


    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, [navigation]);

  const setdatatime = async () => {
    let time = moment().format('hh:mm A');
    if (moment().isBetween(moment().startOf('day').add(12, 'hours').add(1, 'minute'), moment().startOf('day').add(13, 'hours'))) {
      time = time.replace(/^12/, '00');
    }
    return time;
  }

  // Initialize date and time
  useEffect(() => {
    const date = moment().format('DD-MM-YYYY');
    let time = moment().format('hh:mm A');

    if (moment().isBetween(moment().startOf('day').add(12, 'hours').add(1, 'minute'), moment().startOf('day').add(13, 'hours'))) {
      time = time.replace(/^12/, '00');
    }

    setCurrentDate(date);
    setCurrentTime(time);
  }, []);

  // Load employee data and then attendance data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // 1. First ensure we have employee data
        if (!profile) {
          console.log('Waiting for profile data...');
          return;
        }
        
        setEmployeeData(profile);
        
        // 2. Load attendance data
        const data = {
          eId: profile.id,
          month: moment().format('MM'),
          year: moment().format('YYYY'),
        };
        
        const attRes = await getEmpAttendance(data);
        setAttData(attRes.data);
        processAttendanceData(attRes.data);
        checkPreviousDayAttendance(attRes.data);
        
        setDataLoaded(true);
        setInitialLoadComplete(true);
        
      } catch (error) {
        console.error('Error loading initial data:', error);
        Alert.alert('Error', 'Failed to load attendance data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      if (initialLoadComplete && employeeData) {
        const refreshData = async () => {
          try {
            setIsLoading(true);
            const data = {
              eId: employeeData.id,
              month: moment().format('MM'),
              year: moment().format('YYYY'),
            };
            
            const attRes = await getEmpAttendance(data);
            setAttData(attRes.data);
            processAttendanceData(attRes.data);
            checkPreviousDayAttendance(attRes.data);
          } catch (error) {
            console.error('Error refreshing data:', error);
          } finally {
            setIsLoading(false);
          }
        };
        
        refreshData();
      }
    }, [initialLoadComplete, employeeData])
  );

  // const fetchAttendanceDetails = (data) => {
  //   setIsLoading(true);
  //   getEmpAttendance(data)
  //     .then((res) => {
  //       setAttData(res.data);
  //       processAttendanceData(res.data);
  //       checkPreviousDayAttendance(res.data);
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching attendance:', error);
  //       Alert.alert('Error', 'Failed to fetch attendance details');
  //     })
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // };

  const checkPreviousDayAttendance = (attendanceData) => {
    if (!employeeData?.is_shift_applicable) {
      setPreviousDayUnchecked(false);
      return;
    }

    const yesterday = moment().subtract(1, 'day').format('DD-MM-YYYY');
    const yesterdayAttendance = attendanceData.find(item => 
      item.a_date === yesterday && 
      item.attendance_type !== "L" && 
      item.end_time === null
    );

    setPreviousDayUnchecked(!!yesterdayAttendance);
  };



  const processAttendanceData = (data) => {
    const today = currentDate;
    const todayAttendance = data.find(item => 
      item.a_date === today && 
      item.attendance_type !== "L"
    );

    if (todayAttendance) {
      // setCheckedIn(todayAttendance.end_time === null);
      // setStartTime(todayAttendance.start_time);
      setAttendance(todayAttendance);
    } else {
      // setCheckedIn(false);
      // setStartTime(null);
      setAttendance(null);
    }
  };

  const handleError = (error, input) => {
    setErrors(prevState => ({...prevState, [input]: error}));
  };

  // Add these constants at the top of your file
const ORIGIN_LATITUDE = 12.967688425929936; // Replace with your origin latitude
const ORIGIN_LONGITUDE = 77.71320980043427; // Replace with your origin longitude
const ALLOWED_RADIUS = 100; // Radius in meters

// Add this utility function to calculate distance between coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

const MAX_DAILY_HOURS = 9;

// Utility to validate timesheet for check-out
const validateTimesheetForCheckout = async (empId, date) => {
  try {
    const res = await getTimesheetData(empId, date, date);
    const timesheetEntries = res.data || [];
    if (!timesheetEntries.length) {
      return { notFilled: true, totalEffort: 0, isEffortOutOfRange: false, isValid: false };
    }
    const totalEffort = timesheetEntries.reduce((sum, entry) => sum + (parseFloat(entry.effort) || 0), 0);
    const isEffortOutOfRange = totalEffort < 2 || totalEffort > MAX_DAILY_HOURS;
    return {
      notFilled: false,
      totalEffort,
      isEffortOutOfRange,
      isValid: !isEffortOutOfRange,
    };
  } catch (e) {
    return { notFilled: true, totalEffort: 0, isEffortOutOfRange: false, isValid: false };
  }
};


  const handleCheck = async (data) => {
  if (!employeeData) return;
  
  setIsLoading(true);
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert('Permission denied', 'Location permission is required to check.');
    setIsLoading(false);
    return;
  }

  let location = null;

  try {
    location = await Location.getCurrentPositionAsync({});
    
    // Calculate distance from origin
    const distance = calculateDistance(
      ORIGIN_LATITUDE,
      ORIGIN_LONGITUDE,
      location.coords.latitude,
      location.coords.longitude
    );

    if (distance > ALLOWED_RADIUS) {
      Alert.alert(
        'Location Out of Range',
        `You are ${Math.round(distance)} meters away from the allowed location. ` +
        `Maximum allowed distance is ${ALLOWED_RADIUS} meters.`
      );
      setIsLoading(false);
      return;
    }
  } catch (error) {
    Alert.alert('Error', 'Unable to fetch location. Please try again.');
    setIsLoading(false);
    return;
  }

  // Rest of your existing handleCheck code...
  const todayAttendance = attData.find((item) => item.a_date === currentDate);
  const attendanceId = todayAttendance ? todayAttendance.id : null;
  const time = await setdatatime();
  
  const checkPayload = {
    emp_id: employeeData?.id,
    call_mode: data,
    time: time,
    geo_type: data === 'ADD' ? 'I' : 'O',
    a_date: currentDate,
    latitude_id: `${location?.coords?.latitude}`,
    longitude_id: `${location?.coords?.longitude}`,
    remarks: data === 'ADD' ? 'Check-in from Mobile' : remark,
    id: attendanceId,
  };

  try {
    await postCheckIn(checkPayload);
    setRefreshKey((prevKey) => prevKey + 1);
    router.replace('/attendance');
    setIsSuccessModalVisible(true);
    if (data === 'UPDATE') setRemark('');
  } catch (error) {
    console.error('Check in/out error:', error);
    Alert.alert('Check Failure', 'Failed to Check.');
  } finally {
    setIsLoading(false);
  }
};
  
  const handleRemarkSubmit = () => {
  if (!remark.trim()) {
    handleError('Remark cannot be empty', 'remarks');
    return;
  }

  setIsRemarkModalVisible(false);
  
  if (isYesterdayCheckout) {
    // Handle yesterday's checkout
    const yesterdayRecord = attData.find(item => 
      item.a_date === moment().subtract(1, 'day').format('DD-MM-YYYY') &&
      item.end_time === null
    );
    
    if (!yesterdayRecord) {
      Alert.alert('Error', 'No pending checkout found for yesterday');
      return;
    }
    
    const payload = {
      emp_id: employeeData.id,
      call_mode: 'UPDATE',
      time: currentTime,
      geo_type: 'O',
      e_date: currentDate,
      id: yesterdayRecord.id,
      remarks: remark || 'Check-out from Mobile (completed next day)'
    };
    
    submitCheckout(payload);
  } else {
    // Handle today's checkout
    handleCheck('UPDATE');
  }
};


const submitCheckout = async (payload) => {
  try {
    setIsLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
  
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to check out.');
      setIsLoading(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    if (!location) {
      Alert.alert('Error', 'Unable to fetch location. Please try again.');
      setIsLoading(false);
      return;
    }

    // Calculate distance from origin
    const distance = calculateDistance(
      ORIGIN_LATITUDE,
      ORIGIN_LONGITUDE,
      location.coords.latitude,
      location.coords.longitude
    );

    if (distance > ALLOWED_RADIUS) {
      Alert.alert(
        'Location Out of Range',
        `You are ${Math.round(distance)} meters away from the allowed location. ` +
        `Maximum allowed distance is ${ALLOWED_RADIUS} meters.`
      );
      setIsLoading(false);
      return;
    }

    // Add location data to payload
    payload.latitude_id = `${location.coords.latitude}`;
    payload.longitude_id = `${location.coords.longitude}`;

    await postCheckIn(payload);
    setRefreshKey(prev => prev + 1);
    setIsSuccessModalVisible(true);
    setRemark('');
    setIsYesterdayCheckout(false);
  } catch (error) {
    console.error('Checkout error:', error);
    Alert.alert('Error', 'Failed to complete checkout');
  } finally {
    setIsLoading(false);
  }
};

  const closeSuccessModal = () => {
    setIsSuccessModalVisible(false);
  };

  // Determine button states - now with additional checks for data availability

  const handleYesterdayCheckout = async () => {
  setIsYesterdayCheckout(true);
  setIsRemarkModalVisible(true);
};

  const isCheckInDisabled = !dataLoaded || 
                        !employeeData ||
                        (attendance && attendance.start_time && !attendance.end_time) || 
                        (attendance && attendance.geo_status === 'O');
                          
const isCheckOutDisabled = !dataLoaded || 
                         !employeeData || 
                         (!previousDayUnchecked && (!attendance || (attendance.end_time && attendance.end_time !== "" && attendance.end_time !== null)));

const handleCheckOutAttempt = async () => {
  if (timesheetCheckedToday) {
    setIsRemarkModalVisible(true);
    return;
  }
  if (!employeeData) return;
   const { notFilled, isEffortOutOfRange } = await validateTimesheetForCheckout(employeeData.emp_id, currentDate);
  if (notFilled) {
    setShowTimesheetErrorModal(true);
    return;
  }
  if (isEffortOutOfRange) {
    setShowEffortConfirmModal(true);
    return;
  }
  setTimesheetCheckedToday(true);
  setIsRemarkModalVisible(true);
};


  if (!initialLoadComplete || isLoading) {
    return <Loader visible={true} />;
  }

  if (!employeeData) {
    return (
      <View style={styles.container}>
        <HeaderComponent headerTitle="Attendance" onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load employee data</Text>
        </View>
      </View>
    );
  }

  return (
    <>
    <SafeAreaView>
      <HeaderComponent headerTitle="Attendance" onBackPress={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Date and Time Card */}
        <LinearGradient
          colors={['#2575fc', '#6a11cb']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.datetimeCard}
        >
          <Text style={styles.currentDate}>Date: {currentDate}</Text>
          <Text style={styles.currentTime}>Time: {currentTime}</Text>
        </LinearGradient>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: employeeData?.image || 'https://via.placeholder.com/80' }}
              style={styles.profileImage}
            />
            <View style={styles.profileTitle}>
              <Text style={styles.employeeName}>{employeeData?.name || 'Employee Name'}</Text>
              <Text style={styles.employeeId}>{employeeData?.emp_id || '--'}</Text>
            </View>
          </View>
          
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Designation</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {employeeData?.grade_name || '--'}
              </Text>
            </View>
            {employeeData?.is_shift_applicable &&
              <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Shift</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {employeeData?.current_shift || '--'}
              </Text>
            </View>
            }
            
          </View>
        </View>

        {/* Attendance Action Card */}
        <View style={styles.actionCard}>
    <Text style={styles.cardTitle}>Today's Attendance</Text>
    
    {attendance && attendance.start_time === null ? (
      <View style={styles.leaveBadge}>
        <Text style={styles.leaveBadgeText}>On Leave / Holiday</Text>
      </View>
    ) : (
      <View style={[
        styles.actionButtons,
        (!attendance?.start_time && !previousDayUnchecked) && styles.singleButtonContainer
      ]}>
        {/* Check In Button */}
        <TouchableOpacity
          onPress={() => handleCheck('ADD')}
          disabled={isCheckInDisabled}
          style={[
            styles.attendanceButton,
            styles.checkInButton,
            isCheckInDisabled && styles.disabledButton,
            (!attendance?.start_time && !previousDayUnchecked) && { width: '70%' }
          ]}
        >
          <Entypo name="location-pin" size={22} color={isCheckInDisabled ? '#fff' : '#4CAF50'} />
          <Text style={[
            styles.buttonText,
            isCheckInDisabled && styles.disabledButtonText
          ]}>
            {attendance?.start_time 
              ? `Checked In • ${attendance.start_time}`
              : 'Check In'}
          </Text>
        </TouchableOpacity>

        {/* Check Out Button - show if start_time exists or previous day is unchecked */}
        {(previousDayUnchecked || (attendance && attendance.start_time)) && (
          <TouchableOpacity
            onPress={() => {
              if (previousDayUnchecked) {
                setIsConfirmModalVisible(true);
              } else {
                setIsYesterdayCheckout(false);
                handleCheckOutAttempt();
              }
            }}
            disabled={isCheckOutDisabled}
            style={[
              styles.attendanceButton,
              styles.checkOutButton,
              isCheckOutDisabled && styles.disabledButton
            ]}
          >
            <Feather name="log-out" size={20} color={isCheckOutDisabled ? '#fff' : '#F44336'} />
            <Text style={[
              styles.buttonText,
              isCheckOutDisabled && styles.disabledButtonText
            ]}>
              {previousDayUnchecked ? 'Complete Yesterday' : attendance?.end_time ? `Checked Out • ${attendance.end_time}` : 'Check Out'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>

        {/* Attendance History Button */}
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => router.push({ 
            pathname: 'AttendanceStatusDisplay', 
            params: employeeData
          })}
        >
          <Text style={styles.historyButtonText}>View Attendance History</Text>
          <Feather name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        
        <TouchableOpacity 
          style={[styles.historyButton, {marginTop: 20, marginBottom: 70}]}
          onPress={() => router.push({ 
            pathname: 'TimeSheet', 
            params: employeeData
          })}
        >
          <Text style={styles.historyButtonText}>Track Timesheet</Text>
          <Feather name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
      </SafeAreaView>

      {/* Remark Modal */}
      <Modal transparent visible={isRemarkModalVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isYesterdayCheckout ? 'Yesterday\'s Check Out Remarks' : 'Check Out Remarks'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsRemarkModalVisible(false)}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <RemarksInput
              remark={remark}
              setRemark={setRemark}
              error={errors.remarks}
              placeholder="Please enter your check out remark"
            />

            <TouchableOpacity 
              style={styles.modalSubmitButton}
              onPress={handleRemarkSubmit}
            >
              <Text style={styles.modalSubmitText}>Submit Check Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={isSuccessModalVisible}
        onClose={closeSuccessModal}
        message="Attendance recorded successfully"
      />
      <ConfirmationModal
  visible={isConfirmModalVisible}
  message="You have an unfinished checkout from yesterday. Do you want to complete it?"
  onConfirm={() => {
    setIsConfirmModalVisible(false);
    handleYesterdayCheckout();
  }}
  onCancel={() => setIsConfirmModalVisible(false)}
  confirmText="Check Out"
  cancelText="Cancel"
/>

      {/* Loader */}
      <Loader visible={isLoading} />
      <ErrorModal
        visible={showTimesheetErrorModal}
        message="You did not fill today's timesheet. Please fill it before checking out."
        onClose={() => setShowTimesheetErrorModal(false)}
      />
      <ConfirmationModal
        visible={showEffortConfirmModal}
        headerTitle="Warning"
        messageColor="#EF6C00"
        message="Your timesheet hours seem unusual. Do you still want to check out ?"
        onConfirm={() => {
          setShowEffortConfirmModal(false);
          setTimesheetCheckedToday(true);
          setIsRemarkModalVisible(true);
        }}
        onCancel={() => setShowEffortConfirmModal(false)}
        confirmText="Yes"
        cancelText="No"
      />
    </>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  distanceText: {
  fontSize: 14,
  fontFamily: 'Inter-Medium',
  textAlign: 'center',
  marginTop: 8,
  color: '#666',
},
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    fontFamily: 'Inter-SemiBold',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
    backgroundColor: '#f5f7fa',
  },
  datetimeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  currentDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  currentTime: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#e3f2fd',
  },
  profileTitle: {
    marginLeft: 16,
  },
  employeeId: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  employeeName: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    marginTop: 2,
  },
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Medium',
    width: '30%',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    width: '70%',
    textAlign: 'right',
  },
  actionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  leaveBadge: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef9a9a',
    alignItems: 'center',
  },
  leaveBadgeText: {
    color: '#d32f2f',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  actionButtons: {
  flexDirection: width > 400 ? 'row' : 'column',
  justifyContent: 'space-between',
  gap: 12, // Add gap between buttons
},
singleButtonContainer: {
  justifyContent: 'center',
  alignItems: 'center', // Center the single button
},
  singleButton: {
    width: '70%', // Make single button slightly narrower
    alignSelf: 'center', // Center the button
  },
  attendanceButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 8,
  width: width > 400 ? '48%' : '100%', // Adjust width for single button case
  borderWidth: 1,
},
  checkInButton: {
    borderColor: '#c8e6c9',
    backgroundColor: '#f1f8e9',
  },
  checkOutButton: {
    borderColor: '#ffcdd2',
    backgroundColor: '#ffebee',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    borderColor: '#bdbdbd',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 10,
  },
  disabledButtonText: {
    color: '#757575',
  },
  historyButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  historyButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginRight: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalSubmitButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSubmitText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});

export default AddAttendance;