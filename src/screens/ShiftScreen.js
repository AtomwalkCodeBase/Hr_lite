import React, { useEffect, useState, useRef } from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Dimensions,
  Text 
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { getEmpShift } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import ErrorModal from '../components/ErrorModal';
import moment from 'moment';
import { colors } from '../Styles/appStyle';
import ApplyButton from '../components/ApplyButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ShiftScreen = (props) => {
  const [currentDate, setCurrentDate] = useState(moment().startOf('week'));
  const [shiftData, setShiftData] = useState(null);
  const [empId, setEmpId] = useState("");
  const [empShift, setEmpShift] = useState("");
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const scrollViewRef = useRef();
  const navigate = useNavigation();
  const router = useRouter();

  // Shift color mapping for better visibility
  const shiftColors = {
    1: { bg: '#E3F2FD', text: '#0D47A1', icon: 'brightness-7', name: 'Day Shift' },
    2: { bg: '#FFFCF0', text: '#A74900', icon: 'brightness-3', name: 'Evening Shift' },
    3: { bg: '#F3E5F5', text: '#4A148C', icon: 'nights-stay', name: 'Night Shift' },
    COMPANY_OFF: { bg: '#E8F5E9', text: '#1B5E20', icon: 'beach-access', name: 'Company Holiday' },
    WEEKLY_OFF: { bg: '#FFEBEE', text: '#B71C1C', icon: 'weekend', name: 'Weekly Off' }
  };

  useEffect(() => {
    if (props?.data?.empId) {
      setEmpId(props?.data.empId);
    }
    if (props?.data?.empShift) {
      setEmpShift(props?.data.empShift);
    }
  }, [props?.data?.empId, props?.data?.empShift]);

  useEffect(() => {
    const fetchShiftData = async () => {
      if (!empId) return;

      try {
        const response = await getEmpShift({
          eId: empId,
          w_data: currentDate.format('YYYYMMDD')
        });

        if (response.data?.w_shift_list?.[0]) {
          setShiftData(response.data.w_shift_list[0]);
        } else {
          setErrorMessage("No shift data available");
          setIsErrorVisible(true);
        }
      } catch (error) {
        console.error("Error fetching shift data:", error);
        setErrorMessage("Failed to fetch shift data");
        setIsErrorVisible(true);
      }
    };

    fetchShiftData();
  }, [currentDate, empId]);

  const changeWeek = (direction) => {
    const newDate = moment(currentDate).add(direction * 7, 'days').startOf('week');
    setCurrentDate(newDate);
  };

  const scrollToCurrentWeek = () => {
    setCurrentDate(moment().startOf('week'));
    // Scroll to top after a small delay to ensure the state has updated
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const handleChangeShiftRequest = () => {
    router.push({
      pathname: 'AddHelp',
      params: { empId, call_type: 'R', shift_request: true },
    });
  };

  const renderCurrentShiftCard = () => {
    if (!empShift) return null;

    const shiftInfo = shiftColors[empShift] || shiftColors[1];
    const today = shiftData?.shift_list?.find(shift => 
      moment(shift.date, 'DD-MMM-YYYY').isSame(moment(), 'day')
    );

    return (
      <TouchableOpacity 
        style={[styles.currentShiftCard, { backgroundColor: shiftInfo.bg }]}
        onPress={scrollToCurrentWeek}
        activeOpacity={0.8}
      >
        <View style={styles.currentShiftHeader}>
          <MaterialIcons name="schedule" size={24} color={shiftInfo.text} />
          <Text style={[styles.currentShiftTitle, { color: shiftInfo.text }]}>
            Your Current Shift
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={shiftInfo.text}/>
        </View>
        
        <View style={styles.currentShiftContent}>
          <View style={styles.currentShiftIconContainer}>
            <MaterialIcons 
              name={shiftInfo.icon} 
              size={36} 
              color={shiftInfo.text} 
            />
          </View>
          <View style={styles.currentShiftTextContainer}>
            <Text style={[styles.currentShiftName, { color: shiftInfo.text }]}>
              {shiftInfo.name}
            </Text>
            <Text style={[styles.currentShiftDate, { color: shiftInfo.text }]}>
              {moment().format('dddd, MMMM Do')}
            </Text>
            {today && (
              <Text style={[styles.currentShiftStatus, { color: shiftInfo.text }]}>
                {today?.holiday_type !== 'NA' ? 
                  (today?.holiday_type === 'COMPANY_OFF' ? 'Company Holiday' : 'Weekly Off') : 
                  'Working Day'}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderShiftDays = () => {
    if (!shiftData || !shiftData.shift_list) return null;

    return shiftData.shift_list.map((shift, index) => {
      const date = moment(shift.date, 'DD-MMM-YYYY');
      const isToday = date.isSame(moment(), 'day');
      const isHoliday = shift?.holiday_type !== 'NA';
      const shiftType = isHoliday ? shift?.holiday_type : shift.shift_no;
      const colors = shiftColors[shiftType] || { bg: '#FAFAFA', text: '#000', icon: 'schedule' };
      
      return (
        <View key={index} style={[
          styles.shiftItem, 
          { 
            backgroundColor: colors.bg,
            borderWidth: isToday ? 2 : 0,
            borderColor: isToday ? colors.text : 'transparent'
          }
        ]}>
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: colors.text }]}>{date.format('DD MMM')}</Text>
            <Text style={[styles.dayText, { color: colors.text }]}>{date.format('ddd')}</Text>
          </View>
          
          <View style={styles.shiftContainer}>
            <MaterialIcons 
              name={colors.icon} 
              size={24} 
              color={colors.text} 
              style={styles.shiftIcon}
            />
            <Text style={[styles.shiftText, { color: colors.text }]}>
              {isHoliday ? 
                (shift?.holiday_type === 'COMPANY_OFF' ? 'Holiday' : 'Weekly Off') : 
                `Shift ${shift.shift_no}`}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: isToday ? colors.text : 'transparent' }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: isToday ? '#fff' : colors.text }
              ]}>
                {isToday ? 'Today' : isHoliday ? 'Day Off' : 'Working'}
              </Text>
            </View>
          </View>
        </View>
      );
    });
  };

  const getWeekRangeText = () => {
    const startOfWeek = moment(currentDate).format('MMM DD');
    const endOfWeek = moment(currentDate).add(6, 'days').format('MMM DD, YYYY');
    return `${startOfWeek} - ${endOfWeek}`;
  };


return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <HeaderComponent 
        headerTitle="My Shift Schedule" 
        onBackPress={() => navigate.goBack()} 
      />
      
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {shiftData && (
          <View style={styles.employeeCard}>
            <View style={styles.employeeAvatar}>
              <MaterialIcons name="person" size={32} color="#fff" />
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>{shiftData.emp_name}</Text>
              <Text style={styles.employeeDetail}>ID: {shiftData.emp_id}</Text>
              <Text style={styles.employeeDetail}>Department: {shiftData.dept_name || 'N/A'}</Text>
            </View>
          </View>
        )}
        
        {renderCurrentShiftCard()}

        <View style={styles.card}>
          <View style={styles.weekNavigation}>
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={() => changeWeek(-1)}
            >
              <MaterialIcons name="chevron-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.weekRangeText}>{getWeekRangeText()}</Text>
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={() => changeWeek(1)}
            >
              <MaterialIcons name="chevron-right" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.shiftTableHeader}>
            <Text style={styles.headerText}>Date</Text>
            <Text style={styles.headerText}>Shift</Text>
            <Text style={styles.headerText}>Status</Text>
          </View>

          {renderShiftDays()}
        </View>

        <ApplyButton 
          onPress={handleChangeShiftRequest}
          buttonText="Request Shift Change"
          icon="swap-horiz"
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Shift Color Guide</Text>
          {Object.entries(shiftColors).map(([key, value]) => (
            <View key={key} style={styles.colorGuideItem}>
              <View style={[styles.colorBox, { backgroundColor: value.bg }]}>
                <MaterialIcons name={value.icon} size={16} color={value.text} />
              </View>
              <Text style={styles.infoText}>{value.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <ErrorModal
        visible={isErrorVisible}
        message={errorMessage}
        onClose={() => setIsErrorVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 30
  },

  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30
  },
  employeeCard: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center'
  },
  employeeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  employeeInfo: {
    flex: 1
  },
  employeeName: {
    fontSize: width < 400 ? 18 : 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  employeeDetail: {
    fontSize: width < 400 ? 12 : 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3f87f9',
    borderRadius: 20,
  },
  weekRangeText: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center'
  },
  shiftTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 8
  },
  headerText: {
    fontSize: width < 400 ? 12 : 14,
    fontWeight: '600',
    color: '#64748b',
    flex: 1,
    textAlign: 'center'
  },
  shiftItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center'
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center'
  },
  dateText: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '600',
  },
  dayText: {
    fontSize: width < 400 ? 12 : 14,
    fontWeight: '500'
  },
  shiftContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  shiftIcon: {
    marginRight: 8
  },
  shiftText: {
    fontSize: width < 400 ? 13 : 15,
    fontWeight: '500'
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center'
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center'
  },
  statusText: {
    fontSize: width < 400 ? 11 : 12,
    fontWeight: '600'
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  infoTitle: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12
  },
  colorGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  infoText: {
    fontSize: width < 400 ? 12 : 14,
    color: '#64748b'
  },
  currentShiftCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  currentShiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between'
  },
  currentShiftTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1
  },
  currentShiftContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  currentShiftIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  currentShiftTextContainer: {
    flex: 1
  },
  currentShiftName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  currentShiftDate: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4
  },
  currentShiftStatus: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9
  }
});

export default ShiftScreen;