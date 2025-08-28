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
  Dimensions,
  BackHandler,
  StatusBar,
  // BackHandler,
} from 'react-native';
import moment from 'moment';
import { useNavigation, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import RemarksInput from '../components/RemarkInput';
import { getEmpAttendance } from '../services/productServices';
import Loader from '../components/old_components/Loader';
import SuccessModal from '../components/SuccessModal';
import HeaderComponent from '../components/HeaderComponent';
import { LinearGradient } from 'expo-linear-gradient';
import ConfirmationModal from '../components/ConfirmationModal';
import ErrorModal from '../components/ErrorModal';
import { colors } from '../Styles/appStyle';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../../context/AppContext';

const { width } = Dimensions.get('window');

const AddAttendance = () => {
  const { 
    profile,
    companyInfo,
    // Attendance states from context
    employeeData,
    setEmployeeData,
    currentDate,
    setCurrentDate,
    currentTime,
    setCurrentTime,
    attendance,
    setAttendance,
    attData,
    setAttData,
    refreshKey,
    setRefreshKey,
    remark,
    setRemark,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
    previousDayUnchecked,
    setPreviousDayUnchecked,
    dataLoaded,
    setDataLoaded,
    isYesterdayCheckout,
    setIsYesterdayCheckout,
    initialLoadComplete,
    setInitialLoadComplete,
    // Geolocation states from context
    geoLocationConfig,
    setGeoLocationConfig,
    geoLocationDataMissing,
    setGeoLocationDataMissing,
    showEffortConfirmModal,
    setShowEffortConfirmModal,
    timesheetCheckedToday,
    setTimesheetCheckedToday,
    // Attendance functions from context
    setdatatime,
    checkPreviousDayAttendance,
    processAttendanceData,
    handleError,
    handleCheck,
    handleRemarkSubmit,
    submitCheckout,
    handleYesterdayCheckout,
    handleCheckOutAttempt,
    validateLocationDistance,
    validateTimesheetForCheckout,
    calculateDistance,
    initializeGeoLocationConfig,
    loadInitialData,
    refreshData
  } = useContext(AppContext);
  const [isConnected, setIsConnected] = useState(true);
  const navigation = useNavigation();
  const router = useRouter();

  // Local modal states
  const [localRemarkModalVisible, setLocalRemarkModalVisible] = useState(false);
  const [localSuccessModalVisible, setLocalSuccessModalVisible] = useState(false);
  const [localConfirmModalVisible, setLocalConfirmModalVisible] = useState(false);
  const [localAttendanceErrorMessage, setLocalAttendanceErrorMessage] = useState({
    message: "",
    visible: false
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);



  useFocusEffect(
  useCallback(() => {
    const onBackPress = () => {
      if (navigation) {
        navigation.goBack();
        return true; // prevent default behavior
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => subscription.remove();  // ✅ correct cleanup
  }, [navigation])
);


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

  useEffect(() => {
    if (profile && !initialLoadComplete) {
      loadInitialData();
      // Initialize geolocation configuration
      if (profile && companyInfo) {
        initializeGeoLocationConfig(companyInfo, [profile], setLocalAttendanceErrorMessage);
      }
    }
  }, [profile, initialLoadComplete, companyInfo]);

  useFocusEffect(
    useCallback(() => {
      if (employeeData?.id && dataLoaded) {
        refreshData();
      }
    }, [employeeData, refreshKey])
  );

  // Determine button states - now with additional checks for data availability
  const isCheckInDisabled = !dataLoaded ||
    !employeeData ||
    (attendance && attendance.start_time && !attendance.end_time) ||
    (attendance && attendance.geo_status === 'O') ||
    geoLocationDataMissing;

  const isCheckOutDisabled = !dataLoaded ||
    !employeeData ||
    (!previousDayUnchecked && (!attendance || (attendance.end_time && attendance.end_time !== "" && attendance.end_time !== null))) ||
    geoLocationDataMissing;

  if (!initialLoadComplete || isLoading) {
    return <Loader visible={true} />;
  }

  if (!employeeData) {
    return (
      <>
      <StatusBar barStyle="light-content" />
      <View style={styles.statusBarBackground}>
      <View style={styles.container}>
        <HeaderComponent headerTitle="Attendance" onBackPress={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load employee data</Text>
        </View>
      </View>
      </View>
      </>
    );
  }

  return (
    <>
  <StatusBar barStyle="light-content" />
  {/* Status bar background only */}
  <View style={styles.statusBarBackground} />
  
  <SafeAreaView style={styles.safeArea}>

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
                  onPress={() => handleCheck('ADD', setLocalSuccessModalVisible, setLocalAttendanceErrorMessage)}
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
                        // Show confirmation for yesterday's checkout
                        setLocalConfirmModalVisible(true);
                      } else {
                        // Handle today's checkout
                        handleCheckOutAttempt(setLocalRemarkModalVisible, setLocalAttendanceErrorMessage, setShowEffortConfirmModal);
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
            onPress={() => router.replace({
              pathname: 'AttendanceStatusDisplay',
              params: employeeData
            })}
          >
            <Text style={styles.historyButtonText}>View Attendance History</Text>
            <Feather name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>


          <TouchableOpacity
            style={[styles.historyButton, { marginTop: 20, marginBottom: 70 }]}
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
      <Modal transparent visible={localRemarkModalVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isYesterdayCheckout ? 'Yesterday\'s Check Out Remarks' : 'Check Out Remarks'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {setLocalRemarkModalVisible(false); setRemark("")}}
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
              onPress={() => handleRemarkSubmit(setLocalRemarkModalVisible, setLocalAttendanceErrorMessage, setLocalSuccessModalVisible)}
            >
              <Text style={styles.modalSubmitText}>Submit Check Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={localSuccessModalVisible}
        onClose={() => setLocalSuccessModalVisible(false)}
        message="Attendance recorded successfully"
      />
      <ConfirmationModal
        visible={localConfirmModalVisible}
        message="You have an unfinished checkout from yesterday. Do you want to complete it?"
        onConfirm={() => {
          setLocalConfirmModalVisible(false);
          handleYesterdayCheckout(setLocalRemarkModalVisible);
        }}
        onCancel={() => setLocalConfirmModalVisible(false)}
        confirmText="Check Out"
        cancelText="Cancel"
      />

      {/* Error Modal */}
      <ErrorModal
        visible={localAttendanceErrorMessage.visible}
        message={localAttendanceErrorMessage.message}
        onClose={() => setLocalAttendanceErrorMessage({ message: "", visible: false })}
      />

      <ConfirmationModal
        visible={showEffortConfirmModal}
        headerTitle="Warning"
        messageColor="#EF6C00"
        message="Your timesheet hours seem unusual. Do you still want to check out ?"
        onConfirm={() => {
          setShowEffortConfirmModal(false);
          setTimesheetCheckedToday(true);
          setLocalRemarkModalVisible(true);
        }}
        onCancel={() => setShowEffortConfirmModal(false)}
        confirmText="Yes"
        cancelText="No"
      />

      {/* Loader */}
      <Loader visible={isLoading} />
    </>
  );
};

const styles = StyleSheet.create({
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StatusBar.currentHeight, // This gets the actual status bar height
    backgroundColor: '#a970ff', // Your status bar color
    zIndex: 999,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa', // Your screen background color
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
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