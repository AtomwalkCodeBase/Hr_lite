import React, { createContext, useState, useEffect } from 'react';
import { publicAxiosRequest } from "../src/services/HttpMethod";
import { empLoginURL } from "../src/services/ConstantServies";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCompanyInfo, getEmployeeInfo } from '../src/services/authServices';
import { useRouter } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import NetworkErrorModal from '../src/components/NetworkErrorModal';
import moment from 'moment';
import * as Location from 'expo-location';
import { getEmpAttendance, getTimesheetData, postCheckIn } from '../src/services/productServices';
import { Alert } from 'react-native';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [dbName, setDbName] = useState(null);
    const [isConnected, setIsConnected] = useState(true);
    const [profile, setProfile] = useState({});
    const [reLoad, setReload] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Attendance related states
    const [employeeData, setEmployeeData] = useState(null);
    const [currentDate, setCurrentDate] = useState(moment().format('DD-MM-YYYY'));
    const [currentTimeStr, setCurrentTimeStr] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [checkedIn, setCheckedIn] = useState(false);
    const [attendance, setAttendance] = useState(null);
    const [attData, setAttData] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [remark, setRemark] = useState('');
    const [errors, setErrors] = useState({});
    const [previousDayUnchecked, setPreviousDayUnchecked] = useState(false);
    const [isYesterdayCheckout, setIsYesterdayCheckout] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Geolocation related states
    const [geoLocationConfig, setGeoLocationConfig] = useState({
        isEnabled: false,
        allowedRadius: undefined,
        originLatitude: null,
        originLongitude: null,
        mode: null // "T", "N", "A"
    });
    const [showEffortConfirmModal, setShowEffortConfirmModal] = useState(false);
    const [timesheetCheckedToday, setTimesheetCheckedToday] = useState(false);

    const router = useRouter();

    // Geolocation utility functions
    const parseGeoLocationString = (geoString) => {
        if (!geoString || geoString === '' || geoString === null) {
            return { latitude: null, longitude: null };
        }
        const parts = geoString.split(',').map(s => s.trim());
        if (parts.length === 2) {
            const latitude = parseFloat(parts[0]);
            const longitude = parseFloat(parts[1]);
            if (!isNaN(latitude) && !isNaN(longitude)) {
                return { latitude, longitude };
            }
        }
        return { latitude: null, longitude: null };
    };

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

    const validateLocationDistance = async (setErrorModal) => {
        try {
            const location = await Location.getCurrentPositionAsync({});
            const distance = calculateDistance(
                geoLocationConfig.originLatitude,
                geoLocationConfig.originLongitude,
                location.coords.latitude,
                location.coords.longitude
            );

            if (distance > geoLocationConfig.allowedRadius) {
                setErrorModal({
                    message: `You are ${Math.round(distance)} meters away from the allowed location.\n\nMaximum allowed distance is ${geoLocationConfig.allowedRadius} meters.`,
                    visible: true
                });
                return { isValid: false, distance };
            }
            return { isValid: true, distance };
        } catch (error) {
            setErrorModal({
                message: 'Unable to fetch location. Please try again.',
                visible: true
            });
            return { isValid: false, distance: 0 };
        }
    };

    const validateTimesheetForCheckout = async (empId, date) => {
        try {
            const res = await getTimesheetData(empId, date, date);
            const timesheetEntries = res.data || [];
            const MAX_DAILY_HOURS = 9;
            
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

    const initializeGeoLocationConfig = (companyData, profileData, setErrorModal) => {
        try {
            // Extract company geolocation settings
            const companyGeoEnabled = companyData?.is_geo_location_enabled;
            const companyAllowedDistance = companyData?.geo_allowed_distance;
            let companyOriginLat = null;
            let companyOriginLon = null;

            // Parse company geo_location_data if present
            if (companyData?.geo_location_data) {
                const { latitude, longitude } = parseGeoLocationString(companyData.geo_location_data);
                companyOriginLat = latitude;
                companyOriginLon = longitude;
            }

            // Check profile data for override
            let finalOriginLat = companyOriginLat;
            let finalOriginLon = companyOriginLon;

            if (profileData && Array.isArray(profileData) && profileData.length > 0) {
                const profile = profileData[0];
                if (profile.geo_location_data) {
                    const { latitude, longitude } = parseGeoLocationString(profile.geo_location_data);
                    // Only override if profile data is valid
                    if (latitude !== null && longitude !== null) {
                        finalOriginLat = latitude;
                        finalOriginLon = longitude;
                    }
                }
            }

            // Validate geolocation configuration
            if ((companyGeoEnabled === "T" || companyGeoEnabled === "A") && (!finalOriginLat || !finalOriginLon)) {
                setErrorModal({
                    message: "You did not set company geo location data in company parameter",
                    visible: true
                });
                return false;
            }

            // Set geolocation configuration
            setGeoLocationConfig({
                isEnabled: !!companyGeoEnabled && !!companyAllowedDistance, 
                allowedRadius: companyAllowedDistance,
                originLatitude: finalOriginLat,
                originLongitude: finalOriginLon,
                mode: companyGeoEnabled
            });

            return true;
        } catch (error) {
            console.error('Error initializing geolocation config:', error);
            return false;
        }
    };

    const checkNetwork = async () => {
        const netState = await NetInfo.fetch();
        setIsConnected(netState.isConnected);
        return netState.isConnected;
    };

    const onRetry = async () => {
        const networkStatus = await checkNetwork();
        if (networkStatus) {
            setIsConnected(true);
        }
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        isLoggedIn();
    }, []);



    const login = async (username, password, dbName) => {
        setIsLoading(true);
        setErrorMessage(null);

        if (!isConnected) {
            setIsLoading(false);
            setErrorMessage('No internet connection. Please check your network.');
            return;
        }

        try {
            // Update dbName if provided
            if (dbName) {
                await AsyncStorage.multiSet([
                    ['dbName', dbName],
                    ['previousDbName', dbName]
                ]);
                setDbName(dbName);
            }

            // Determine if the input is a mobile number (10 digits) or employee ID
            const isMobileNumber = /^\d{10}$/.test(username);

            const payload = isMobileNumber
                ? {
                    mobile_number: username,
                    pin: password,
                }
                : {
                    emp_id: username,
                    pin: password,
                };

            const url = await empLoginURL();
            const response = await publicAxiosRequest.post(url, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.status === 200) {
                const { token, emp_id, e_id } = response.data;

                // Calculate token expiration date (15 days from now)
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 15);
                const expirationDateString = expirationDate.toISOString();

                // Store appropriate identifier based on input type
                if (isMobileNumber) {
                    await AsyncStorage.setItem('mobileNumber', username);
                } else {
                    await AsyncStorage.setItem('empId', username);
                }

                // Store token and expiration date
                await AsyncStorage.multiSet([
                    ['userToken', token],
                    ['tokenExpiration', expirationDateString],
                    ['empId', emp_id],
                    ['empNoId', String(e_id)],
                    ['userPin', password]
                ]);

                try {
                    const companyInfoResponse = await getCompanyInfo();
                    const companyInfo = companyInfoResponse.data;
                    await AsyncStorage.setItem('companyInfo', JSON.stringify(companyInfo));
                    setCompanyInfo(companyInfo);
                } catch (error) {
                    console.error('Error fetching company info:', error.message);
                }

                setUserToken(token); // Update the token in state
                setReload(true);
                router.replace({ pathname: 'home' });
            } else {
                setErrorMessage('Invalid credentials');
            }
        } catch (error) {
            console.error('API call error:', error.response?.data || error.message);
            if (error.response) {
                if (error.response.data?.error) {
                    const errorMessage = error.response.data.error;

                    // Handle "Wrong Attempt [X]" case
                    const wrongAttemptMatch = errorMessage.match(/Wrong Attempt \[(\d+)\]/);
                    if (wrongAttemptMatch) {
                        const attemptCount = parseInt(wrongAttemptMatch[1]);

                        if (attemptCount >= 6) {
                            setErrorMessage('Your account has been blocked due to too many failed attempts. Please contact support.');
                            return;
                        } else {
                            setErrorMessage(`Incorrect PIN. You have ${6 - attemptCount} attempts remaining before your account gets blocked.`);
                            return;
                        }
                    }

                    // Handle other error messages with brackets
                    if (errorMessage.includes('Multiple wrong attempt. Employee login is Inactive now.')) {
                        setErrorMessage('Multiple wrong attempts. Your account is now inactive. Please contact respective manager.');
                    } else {
                        setErrorMessage(errorMessage);
                    }
                } else {
                    setErrorMessage('Invalid credentials. Please try again.');
                }
            } else if (error.request) {
                setErrorMessage('No response from the server. Please check your connection.');
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);

        try {
            router.replace('PinScreen');
            await AsyncStorage.multiRemove([
                'userToken',
            ]);

            setUserToken(null);
            setProfile({});
            setReload(false);
        } catch (err) {
            console.log("Logout error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const completLogout = async () => {
        setIsLoading(true);

        try {
            router.replace('AuthScreen');
            await AsyncStorage.multiRemove([
                'userToken', 'empId', 'tokenExpiration', 'dbName', 'empNoId', 'userPin', 'profilename', 'useFingerprint'
            ]);

            setUserToken(null);
            setProfile({});
            setReload(false);
        } catch (err) {
            console.log("Logout error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const isLoggedIn = async () => {
        const networkStatus = await checkNetwork();
        if (!networkStatus) {
            return;
        }

        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            const Dbname = await AsyncStorage.getItem('dbName');
            if (!userToken && !Dbname) {
                router.replace('AuthScreen');
                return;
            }

            if (!userToken) {
                router.replace('PinScreen'); // You might want to double-check this logic
                return;
            }


            setUserToken(userToken);

            // Retrieve all stored data
            const [
                companyInfo,
                dbName,
                userPin
            ] = await Promise.all([
                AsyncStorage.getItem('companyInfo'),
                AsyncStorage.getItem('dbName'),
                AsyncStorage.getItem('userPin')
            ]);

            if (companyInfo) {
                setCompanyInfo(JSON.parse(companyInfo));
            }
            if (dbName) {
                setDbName(dbName);
            }


            if (userPin) {
                router.replace('PinScreen');
            } else {
                setReload(true);
            }
        } catch (e) {
            console.log('Login Status Error:', e);
        } finally {
            setIsLoading(false);
        }
    };


    const refreshProfileData = async () => {
        try {
            setIsLoading(true);
            setReload(true); // This will trigger the useEffect that fetches data
        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
    };


    useEffect(() => {
        if (reLoad) {
            setIsLoading(true);
            const fetchData = async () => {
                try {
                    // Fetch both profile and company data in parallel
                    const [profileRes, companyRes] = await Promise.all([
                        getEmployeeInfo(),
                        getCompanyInfo()
                    ]);

                    console.log("company data", companyRes.data)
                    console.log("profile data", profileRes.data)

                    // Set profile data
                    if (profileRes?.data?.[0]) {
                        setProfile(profileRes.data[0]);
                        if (profileRes.data[0].name) {
                            await AsyncStorage.setItem('profilename', profileRes.data[0].name);
                        }
                    }

                    // Set company data
                    if (companyRes?.data) {
                        setCompanyInfo(companyRes.data);
                        await AsyncStorage.setItem('companyInfo', JSON.stringify(companyRes.data));
                    }

                    // Initialize geolocation configuration - we'll handle this in individual screens
                    // initializeGeoLocationConfig(companyRes?.data, profileRes?.data);

                    // Navigate to home
                    router.replace({ pathname: 'home' });
                } catch (error) {
                    console.error('Failed to fetch data:', error);
                } finally {
                    setIsLoading(false);
                    setReload(false); // Reset reload flag
                }
            };

            fetchData();
        }
    }, [reLoad]);

    // Attendance functions
    const setdatatime = async () => {
        let time = moment().format('hh:mm A');
        if (moment().isBetween(moment().startOf('day').add(12, 'hours').add(1, 'minute'), moment().startOf('day').add(13, 'hours'))) {
            time = time.replace(/^12/, '00');
        }
        return time;
    };

    const checkPreviousDayAttendance = (attendanceData) => {
        if (profile) {
            if (!profile?.is_shift_applicable) {
                setPreviousDayUnchecked(false);
                return;
            }
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
            setCheckedIn(todayAttendance.end_time === null);
            setAttendance(todayAttendance);
        } else {
            setCheckedIn(false);
            setAttendance(null);
        }
    };

    const handleError = (error, input) => {
        setErrors(prevState => ({ ...prevState, [input]: error }));
    };

    // Common location access utility function
    const getLocationWithPermission = async (setErrorModal) => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            setErrorModal({
                message: 'Location permission is required to check in/out. Please enable location access in settings.',
                visible: true
            });
            return null;
        }

        let location = null;
        let retries = 0;

        while (!location && retries < 1) {
            try {
                location = await Location.getCurrentPositionAsync({});
            } catch (error) {
                retries += 1;
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }

        if (!location) {
            setErrorModal({
                message: 'Unable to fetch location. Please check your GPS settings and try again.',
                visible: true
            });
            return null;
        }

        return location;
    };

    const handleCheck = async (data, setSuccessModal, setErrorModal) => {
        if (!employeeData) return;

        setIsLoading(true);
        
        // Check geolocation validation for check-in
        if (data === 'ADD' && geoLocationConfig.isEnabled && (geoLocationConfig.mode === "T" || geoLocationConfig.mode === "A")) {
            const { isValid } = await validateLocationDistance(setErrorModal);
            if (!isValid) {
                setIsLoading(false);
                return;
            }
        }

        const location = await getLocationWithPermission(setErrorModal);
        
        if (!location) {
            setIsLoading(false);
            return;
        }

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
            setCheckedIn(data === 'ADD');
            setRefreshKey((prevKey) => prevKey + 1);
            setSuccessModal(true);
            if (data === 'UPDATE') setRemark('');
            
            // Refresh attendance data to update UI immediately
            await refreshData();
        } catch (error) {
            console.error('Check in/out error:', error);
            setErrorModal({message: "Failed to Check.", visible: true});
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemarkSubmit = (setRemarkModal, setErrorModal, setSuccessModal) => {
        if (!remark.trim()) {
            handleError('Remark cannot be empty', 'remarks');
            return;
        }

        setRemarkModal(false);

        if (isYesterdayCheckout) {
            // Handle yesterday's checkout
            const yesterdayRecord = attData.find(item =>
                item.a_date === moment().subtract(1, 'day').format('DD-MM-YYYY') &&
                item.end_time === null
            );

            if (!yesterdayRecord) {
                setErrorModal({message: "No pending checkout found for yesterday", visible: true});
                return;
            }

            const payload = {
                emp_id: employeeData.id,
                call_mode: 'UPDATE',
                time: currentTimeStr,
                geo_type: 'O',
                e_date: currentDate,
                id: yesterdayRecord.id,
                remarks: remark || 'Check-out from Mobile (completed next day)'
            };

            submitCheckout(payload, setSuccessModal, setErrorModal);
        } else {
            // Handle today's checkout
            handleCheck('UPDATE', setSuccessModal, setErrorModal);
        }
    };

    const submitCheckout = async (payload, setSuccessModal, setErrorModal) => {
        try {
            setIsLoading(true);
            const location = await getLocationWithPermission(setErrorModal);
            
            if (!location) {
                setIsLoading(false);
                return;
            }

            // Add location data to payload
            payload.latitude_id = `${location.coords.latitude}`;
            payload.longitude_id = `${location.coords.longitude}`;

            await postCheckIn(payload);
            setRefreshKey(prev => prev + 1);
            setSuccessModal(true);
            setRemark('');
            setIsYesterdayCheckout(false);
            
            // Refresh attendance data to update UI immediately
            await refreshData();
        } catch (error) {
            console.error('Checkout error:', error);
            setErrorModal({message: "Failed to complete checkout", visible: true});
        } finally {
            setIsLoading(false);
        }
    };

    const handleYesterdayCheckout = async (setRemarkModal) => {
        setIsYesterdayCheckout(true);
        setRemarkModal(true);
    };

   const handleCheckOutAttempt = async (setRemarkModal, setErrorModal, setShowEffortConfirmModal) => {
    setIsLoading(true);
    try {
        const geoLocationEnabled = geoLocationConfig.mode;

        // Step 1: Ask for location permission if required
        if (geoLocationEnabled === "T" || geoLocationEnabled === "A") {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorModal({
                    message: 'Location permission is required to check out.',
                    visible: true
                });
                return;
            }
        }

        // Step 2: Timesheet validations (only in "T")
        if (geoLocationEnabled === "T") {
            const { notFilled, isEffortOutOfRange } = await validateTimesheetForCheckout(employeeData.emp_id, currentDate);

            if (notFilled) {
                setErrorModal({
                    message: "You did not fill today's timesheet. Please fill it before checking out.",
                    visible: true
                });
                return;
            }

            if (isEffortOutOfRange) {
                setShowEffortConfirmModal(true);
                return;
            }
        }

        // Step 3: Geo-distance validation
        if (geoLocationEnabled === "T" || geoLocationEnabled === "A") {
            const { isValid } = await validateLocationDistance(setErrorModal);
            if (!isValid) return;
        }

        // Step 4: If all passed, show remark modal
        setTimesheetCheckedToday(true);
        setRemarkModal(true);
        
        } catch (error) {
            console.error("Error during check-out attempt:", error);
            setErrorModal({
                message: 'Something went wrong. Please try again.',
                visible: true
            });
        } finally {
            setIsLoading(false);
        }
    };


    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            setDataLoaded(false);

            if (!profile) {
                throw new Error("Employee profile data not found.");
            }

            setEmployeeData(profile);

            // Set current date and time
            const now = moment();
            setCurrentDate(now.format('DD-MM-YYYY'));
            const time = await setdatatime();
            setCurrentTime(time);

            // Fetch attendance data
            const data = {
                eId: profile.id,
                month: now.format('MM'),
                year: now.format('YYYY'),
            };

            const res = await getEmpAttendance(data);
            setAttData(res.data);
            processAttendanceData(res.data);
            checkPreviousDayAttendance(res.data);

            setDataLoaded(true);
            setInitialLoadComplete(true);
        } catch (error) {
            console.error("Error loading initial data:", error);
            setAttData([]);
            setAttendance(null);
            setDataLoaded(true);
            setInitialLoadComplete(true);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshData = async () => {
        if (!employeeData?.id) return;

        try {
            const data = {
                eId: employeeData.id,
                month: moment().format('MM'),
                year: moment().format('YYYY'),
            };

            const res = await getEmpAttendance(data);
            setAttData(res.data);
            processAttendanceData(res.data);
            checkPreviousDayAttendance(res.data);
        } catch (error) {
            console.error("Error refreshing data:", error);
        }
    };

    return (
        <AppContext.Provider value={{
            login,
            logout,
            completLogout,
            refreshProfileData,
            isLoading,
            userToken,
            companyInfo,
            dbName,
            isConnected,
            checkNetwork,
            setIsLoading,
            profile,
            setReload,
            errorMessage,
            setErrorMessage,
            // Attendance states
            employeeData,
            setEmployeeData,
            currentDate,
            setCurrentDate,
            currentTimeStr,
            setCurrentTimeStr,
            currentTime,
            setCurrentTime,
            checkedIn,
            setCheckedIn,
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
            previousDayUnchecked,
            setPreviousDayUnchecked,
            isYesterdayCheckout,
            setIsYesterdayCheckout,
            dataLoaded,
            setDataLoaded,
            initialLoadComplete,
            setInitialLoadComplete,
            // Geolocation states
            geoLocationConfig,
            setGeoLocationConfig,
            showEffortConfirmModal,
            setShowEffortConfirmModal,
            timesheetCheckedToday,
            setTimesheetCheckedToday,
            // Attendance functions
            setdatatime,
            checkPreviousDayAttendance,
            processAttendanceData,
            handleError,
            getLocationWithPermission,
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
        }}>
            {children}
            <NetworkErrorModal
                visible={!isConnected}
                onRetry={onRetry}
                onNetworkRestore={() => setIsConnected(true)}
            />
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };