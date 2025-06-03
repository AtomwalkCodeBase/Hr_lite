import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Dimensions,
  Text 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRouter } from 'expo-router';
import { getEmpShift } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import ErrorModal from '../components/ErrorModal';
import moment from 'moment';
import ApplyButton from '../components/ApplyButton';

const { width } = Dimensions.get('window');

const ShiftScreen = (props) => {
  const [currentDate, setCurrentDate] = useState(moment().startOf('week'));
  const [shiftData, setShiftData] = useState(null);
  const [empId, setEmpId] = useState("");
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [todayShift, setTodayShift] = useState(null);
  const navigation = useNavigation();
    const router = useRouter();

  // Shift color mapping for better visibility
  const shiftColors = {
    1: { bg: '#E3F2FD', text: '#0D47A1', icon: 'brightness-7' }, // Day shift (blue)
    2: { bg: '#FFF8E1', text: '#FF6F00', icon: 'brightness-3' }, // Evening shift (orange)
    3: { bg: '#F3E5F5', text: '#4A148C', icon: 'nights-stay' },   // Night shift (purple)
    COMPANY_OFF: { bg: '#E8F5E9', text: '#1B5E20', icon: 'beach-access' }, // Company holiday (green)
    WEEKLY_OFF: { bg: '#FFEBEE', text: '#B71C1C', icon: 'weekend' }       // Weekly off (red)
  };

  useEffect(() => {
    if (props?.data?.empId) {
      setEmpId(props.data.empId);
    }
  }, [props?.data?.empId]);

  useEffect(() => {
    const fetchShiftData = async () => {
      if (!empId) return;

      const mondayDate = currentDate.format('YYYYMMDD');
      const data = {
        eId: empId,
        w_data: mondayDate
      };

      try {
        const response = await getEmpShift(data);
        if (response.data && response.data.w_shift_list && response.data.w_shift_list.length > 0) {
          setShiftData(response.data.w_shift_list[0]);
        } else {
          setErrorMessage("No shift data available for this week");
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
    setCurrentDate(prevDate => {
      const newDate = moment(prevDate).add(direction * 7, 'days');
      return newDate.startOf('week');
    });
  };

  const handleChangeShiftRequest = () => {
    // Implement change shift request functionality
    router.push({
      pathname: 'AddHelp',
      params: {
        empId,
        call_type: 'R',
        shift_request: true
      },
    });
  };

  const renderShiftDays = () => {
    if (!shiftData || !shiftData.shift_list) return null;

    return shiftData.shift_list.map((shift, index) => {
      const date = moment(shift.date, 'DD-MMM-YYYY');
      const isHoliday = shift.holiday_type !== 'NA';
      const shiftType = isHoliday ? shift.holiday_type : shift.shift_no;
      const colors = shiftColors[shiftType] || { bg: '#FAFAFA', text: '#000', icon: 'schedule' };
      
      return (
        <View key={index} style={[
          styles.shiftItem, 
          { backgroundColor: colors.bg }
        ]}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{date.format('DD MMM')}</Text>
            <Text style={styles.dayText}>{date.format('dddd')}</Text>
          </View>
          
          <View style={styles.shiftContainer}>
            <Icon 
              name={colors.icon} 
              size={24} 
              color={colors.text} 
              style={styles.shiftIcon}
            />
            {!isHoliday && (
              <Text style={[styles.shiftText, { color: colors.text }]}>
                Shift {shift.shift_no}
              </Text>
            )}
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: isHoliday ? colors.bg : 'transparent' }
            ]}>
              <Text style={[styles.statusText, { color: colors.text }]}>
                {isHoliday ? 
                  (shift.holiday_type === 'COMPANY_OFF' ? 'Holiday' : 'Weekly Off') : 
                  'Working Day'}
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
    <View style={styles.mainContainer}>
      <HeaderComponent 
        headerTitle="My Shift Schedule" 
        onBackPress={() => router.push('MoreScreen')} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {shiftData && (
          <View style={styles.employeeCard}>
            <Text style={styles.employeeName}>{shiftData.emp_name}</Text>
            <Text style={styles.employeeDetail}>Employee ID: {shiftData.emp_id}</Text>
            {/* <Text style={styles.employeeDetail}>
              {shiftData.is_shift_applicable ? 
                "Shift Applicable" : "Shift Not Applicable"} • {shiftData.emp_type === 'P' ? 'Permanent' : 'Contract'}
            </Text> */}
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.weekNavigation}>
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={() => changeWeek(-1)}
            >
              <Icon name="chevron-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.weekRangeText}>{getWeekRangeText()}</Text>
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={() => changeWeek(1)}
            >
              <Icon name="chevron-right" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.shiftTableHeader}>
            <Text style={styles.headerText}>Date</Text>
            <Text style={styles.headerText}>Shift</Text>
            <Text style={styles.headerText}>Status</Text>
          </View>

          {renderShiftDays()}
        </View>

        {/* Replaced the old button with the new ApplyButton component */}
        <ApplyButton 
          onPress={handleChangeShiftRequest}
          buttonText="Request Shift Change"
          icon="swap-horiz"
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Shift Color Guide</Text>
          <View style={styles.colorGuideItem}>
            <View style={[styles.colorBox, { backgroundColor: shiftColors[1].bg }]}>
              <Icon name={shiftColors[1].icon} size={16} color={shiftColors[1].text} />
            </View>
            <Text style={styles.infoText}>Blue - Day Shift</Text>
          </View>
          <View style={styles.colorGuideItem}>
            <View style={[styles.colorBox, { backgroundColor: shiftColors[2].bg }]}>
              <Icon name={shiftColors[2].icon} size={16} color={shiftColors[2].text} />
            </View>
            <Text style={styles.infoText}>Orange - Evening Shift</Text>
          </View>
          <View style={styles.colorGuideItem}>
            <View style={[styles.colorBox, { backgroundColor: shiftColors[3].bg }]}>
              <Icon name={shiftColors[3].icon} size={16} color={shiftColors[3].text} />
            </View>
            <Text style={styles.infoText}>Purple - Night Shift</Text>
          </View>
          <View style={styles.colorGuideItem}>
            <View style={[styles.colorBox, { backgroundColor: shiftColors.COMPANY_OFF.bg }]}>
              <Icon name={shiftColors.COMPANY_OFF.icon} size={16} color={shiftColors.COMPANY_OFF.text} />
            </View>
            <Text style={styles.infoText}>Green - Company Holiday</Text>
          </View>
          <View style={styles.colorGuideItem}>
            <View style={[styles.colorBox, { backgroundColor: shiftColors.WEEKLY_OFF.bg }]}>
              <Icon name={shiftColors.WEEKLY_OFF.icon} size={16} color={shiftColors.WEEKLY_OFF.text} />
            </View>
            <Text style={styles.infoText}>Red - Weekly Off</Text>
          </View>
        </View>
      </ScrollView>

      <ErrorModal
        visible={isErrorVisible}
        message={errorMessage}
        onClose={() => setIsErrorVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30
  },
  employeeCard: {
    backgroundColor: '#3f87f9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  employeeName: {
    fontSize: width < 400 ? 18 : 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  employeeDetail: {
    fontSize: width < 400 ? 12 : 14,
    color: 'rgba(255,255,255,0.9)'
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
    flex: 1
  },
  dateText: {
    fontSize: width < 400 ? 13 : 15,
    fontWeight: '500',
    color: '#334155'
  },
  dayText: {
    fontSize: width < 400 ? 11 : 13,
    color: '#64748b'
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
    padding: 4,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center'
  },
  statusText: {
    fontSize: width < 400 ? 11 : 12,
    fontWeight: '500'
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
  }
});

export default ShiftScreen;