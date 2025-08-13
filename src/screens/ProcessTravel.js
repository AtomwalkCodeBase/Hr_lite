import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Keyboard, Alert, View, Text, Switch } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { getTravelModeList, postTravel, getExpenseProjectList } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import DropdownPicker from '../components/DropdownPicker';
import AmountInput from '../components/AmountInput';
import DatePicker from '../components/DatePicker';
import RemarksTextArea from '../components/RemarkInput';
import SubmitButton from '../components/SubmitButton';
import SuccessModal from '../components/SuccessModal';
import Loader from '../components/old_components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { colors } from '../Styles/appStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../components/old_components/Input';

const Container = styled.ScrollView`
  flex: 1;
  padding: 10px;
  background-color: #fff;
  height: 100%;
`;

const SwitchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding-horizontal: 5px;
  border-radius: 8px;
  margin-bottom: 15px;
  margin-top: 15px;
`;

const ProcessTravel = (props) => {
    const [travelMode, setTravelMode] = useState('');
    const [toCity, setToCity] = useState('');
    const [remarks, setRemarks] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isAccommodation, setIsAccommodation] = useState(false);
    const [advanceRequired, setAdvanceRequired] = useState(false);
    const [advanceAmount, setAdvanceAmount] = useState('');
    const [travelPurpose, setTravelPurpose] = useState('');
    const [projectList, setProjectList] = useState([]);
    const [project, setProject] = useState('');
    const [travelModeData, setTravelModeData] = useState([]);
    const [empId, setEmpId] = useState('');
    const [errors, setErrors] = useState({});
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation();
    const router = useRouter();

    // Parse props data
    const { mode, travelData } = props.data || {};
    const isAddMode = mode === 'ADD';
    const isEditMode = mode === 'EDIT';
    const isViewMode = mode === 'VIEW';

    // Parse travel data if available
    const parsedTravelData = travelData ? JSON.parse(travelData) : null;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    const parseTaskDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') {
            console.log('parseTaskDate: Invalid date string:', dateStr);
            return null;
        }
        const regex = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/;
        const match = dateStr.match(regex); 
        if (!match) {
            console.log('parseTaskDate: Date format does not match DD-MMM-YYYY pattern');
            return null;
        }   
        const [, day, mon, year] = match;
        const monthMap = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        };
        const month = monthMap[mon.charAt(0).toUpperCase() + mon.slice(1).toLowerCase()];
        if (month === undefined) {
            return null;
        } 
        const parsedDate = new Date(Number(year), month, Number(day));
        if (isNaN(parsedDate.getTime())) {
            return null;
        }
        return parsedDate;
    };

    useEffect(() => {
        fetchModeList();
        fetchProjectList();
        fetchEmpId();

        // Pre-fill form if in EDIT mode with received data
        if (isEditMode && parsedTravelData) {
            setTravelMode(parsedTravelData.travel_mode || '');
            setToCity(parsedTravelData.to_city || '');
            setRemarks(parsedTravelData.remarks || '');
            setTravelPurpose(parsedTravelData.travel_purpose || '');
            setIsAccommodation(parsedTravelData.is_accommodation || false);
            setAdvanceRequired(parsedTravelData.advance_required || false);
            setAdvanceAmount(parsedTravelData.advance_amt || '');

            if (parsedTravelData.start_date) {
                const parsedStartDate = parseTaskDate(parsedTravelData.start_date);
                if (parsedStartDate) {
                    setStartDate(parsedStartDate);
                }
            }
            if (parsedTravelData.end_date) {
                const parsedEndDate = parseTaskDate(parsedTravelData.end_date);
                if (parsedEndDate) {
                    setEndDate(parsedEndDate);
                }
            }

            if (parsedTravelData.project_code) {
                setProject(parsedTravelData.project_code);
            }
        }
    }, []);

    const fetchModeList = async () => {
        setIsLoading(true);
        try {
            const response = await getTravelModeList();
            // Transform the data from [["AIR", "By Flight"], ...] to {label: "By Flight", value: "AIR"}
            const formattedData = response.data.map(([value, label]) => ({
                label,
                value
            }));
            setTravelModeData(formattedData);
        } catch (error) {
            console.error("Error fetching travel modes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProjectList = async () => {
        setIsLoading(true);
        try {
            const response = await getExpenseProjectList();
            const formattedData = response.data.map(project => ({
                label: `${project.title} (${project.project_code})`,
                value: project.project_code,
                originalData: project
            }));
            setProjectList(formattedData);
        } catch (error) {
            console.error("Error fetching project list:", error);
            Alert.alert('Error', 'Failed to load project list');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmpId = async () => {
        try {
            const id = await AsyncStorage.getItem('empId');
            setEmpId(id);
        } catch (error) {
            console.error("Error fetching employee ID:", error);
        }
    };

const handleBackPress = () => {
    router.setParams({ empId });
    router.back();
  };


    const handleError = (error, input) => {
        setErrors(prevState => ({ ...prevState, [input]: error }));
    };

    const validate = (mode) => {
        Keyboard.dismiss();
        let isValid = true;

        if (!travelMode) {
            handleError('Please select travel mode', 'travelMode');
            isValid = false;
        }

        if (!toCity) {
            handleError('Please enter destination city', 'toCity');
            isValid = false;
        }

        if (!travelPurpose) {
            handleError('Please enter travel purpose', 'travelPurpose');
            isValid = false;
        }

        if (!startDate) {
            handleError('Please select start date', 'startDate');
            isValid = false;
        }

        if (!endDate) {
            handleError('Please select end date', 'endDate');
            isValid = false;
        }

        if (startDate > endDate) {
            handleError('End date must be after start date', 'endDate');
            isValid = false;
        }

        if (advanceRequired && !advanceAmount) {
            handleError('Please enter advance amount', 'advanceAmount');
            isValid = false;
        }

        if (isValid) {
            handleSubmit(mode);
        }
    };

  const getButtonsConfig = (isEditMode, status) => {
    // const safeStatus = status || "";

    if (isEditMode) {
    //   if (safeStatus === "S") {
    //     return [
    //       { label: "Update", mode: "UPDATE_DRAFT" },
    //       // { label: "Submit", mode: "UPDATE_SUBMIT" }
    //     ];
    //   }
      return [
        { label: "Save as Draft", mode: "UPDATE_DRAFT" },
        { label: "Update and Submit", mode: "UPDATE_SUBMIT" }
      ];
    }
    return [
      { label: "Save as Draft", mode: "SAVE_DRAFT" },
      { label: "Submit request", mode: "SUBMIT" }
    ];
  };

  const getCallMode = (isEditMode, status, mode) => {
    const safeStatus = status || "";

    if (isEditMode) {
      return safeStatus === "S" ? "UPDATE_SUBMIT" : "UPDATE_DRAFT";
    }
    return mode;
  };

    const handleSubmit = async(mode) =>{
        // Alert.alert('Submit clicked')

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const travelPayload = {
        call_mode: getCallMode(isEditMode, parsedTravelData ? parsedTravelData.status : "", mode),
        emp_id: empId,
        travel_mode: travelMode,
        to_city: toCity,
        remarks: remarks,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        is_accommodation: isAccommodation,
        advance_required: advanceRequired,
        advance_amt: advanceRequired ? advanceAmount : '0',
        travel_purpose: travelPurpose,
        project_code: project || '',
    };

    if (isEditMode && parsedTravelData?.travel_id) {
        travelPayload.travel_id = parsedTravelData.travel_id;
    }

    console.log(travelPayload)

         setIsLoading(true);

    try {
        const res = await postTravel(travelPayload);
        if (res.status === 200) {
            setIsSuccessModalVisible(true);
        // } else {
        //     console.error('Unexpected response:', res);
        //     Alert.alert('Error', 'Failed to submit travel request');
        }
    } catch (error) {
        Alert.alert('Error', error.response.data?.message || 'Failed to submit travel request');
        console.error(error.response.data?.message)
    } finally {
        setIsLoading(false);
    }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <HeaderComponent
                headerTitle={
                    isViewMode ? "View Travel Request" :
                        isEditMode ? "Edit Travel Request" :
                            "Create Travel Request"
                }
                onBackPress={handleBackPress}
            />
            {isLoading ? (
                <Loader
                    visible={isLoading}
                    onTimeout={() => {
                        setIsLoading(false);
                        Alert.alert('Timeout', 'Not able to process the request.');
                    }}
                />
            ) : (
                <Container showsVerticalScrollIndicator={false}>
                    {isEditMode && (
                        <View style={{
                            padding: 15,
                            backgroundColor: '#e3f2fd',
                            borderRadius: 8,
                            marginBottom: 15,
                            borderLeftWidth: 4,
                            borderLeftColor: '#2196f3'
                        }}>
                            <Text style={{
                                fontWeight: 'bold',
                                color: '#333',
                                marginBottom: 5
                            }}>
                                Editing Travel Request
                            </Text>
                            <Text style={{ color: '#666' }}>
                                Travel ID: {parsedTravelData?.travel_id || 'N/A'}
                            </Text>
                        </View>
                    )}

                    {projectList.length > 0 && (
                        <DropdownPicker
                            label="Project"
                            data={projectList}
                            value={project}
                            setValue={setProject}
                            disabled={isViewMode}
                            searchable={true}
                        />
                    )}

                    <DropdownPicker
                        label="Travel Mode"
                        data={travelModeData}
                        value={travelMode}
                        setValue={setTravelMode}
                        error={errors.travelMode}
                        disabled={isViewMode}
                    />

                    {/* <Input
                        label="Destination City"
                        iconName="map-marker"
                        value={toCity}
                        onChangeText={setToCity}
                        error={errors.toCity}
                        editable={!isViewMode}
                        placeholder="Enter destination city"
                    /> */}

                              <RemarksTextArea
                              labelFiled="Destination City"
                              placeholder="Enter destination city"
                                remark={toCity}
                                setRemark={setToCity}
                                error={errors.toCity}
                                disabled={isViewMode}
                            />

                    {/* <Input
                        label="Travel Purpose"
                        iconName="text-subject"
                        value={travelPurpose}
                        onChangeText={setTravelPurpose}
                        error={errors.travelPurpose}
                        editable={!isViewMode}
                        placeholder="Enter purpose of travel"
                    /> */}

                    <RemarksTextArea
                              labelFiled="Travel Purpose"
                              placeholder="Enter purpose of travel"
                                remark={travelPurpose}
                                setRemark={setTravelPurpose}
                                error={errors.travelPurpose}
                                disabled={isViewMode}
                            />

                    <DatePicker
                        cDate={startDate}
                        label="Start Date"
                        setCDate={setStartDate}
                        error={errors.startDate}
                        disabled={isViewMode}
                    />

                    <DatePicker
                        cDate={endDate}
                        label="End Date"
                        setCDate={setEndDate}
                        error={errors.endDate}
                        disabled={isViewMode}
                    />

                    <SwitchContainer>
                        <Text>Requires Accommodation</Text>
                        <Switch
                            value={isAccommodation}
                            onValueChange={setIsAccommodation}
                            disabled={isViewMode}
                        />
                    </SwitchContainer>

                    <SwitchContainer>
                        <Text>Request Advance</Text>
                        <Switch
                            value={advanceRequired}
                            onValueChange={(value) => {
                                setAdvanceRequired(value);
                                if (!value) setAdvanceAmount('');
                            }}
                            disabled={isViewMode}
                        />
                    </SwitchContainer>

                    {advanceRequired && (
                        <AmountInput
                            claimAmount={advanceAmount}
                            label="Advance Amount"
                            setClaimAmount={setAdvanceAmount}
                            error={errors.advanceAmount}
                            disabled={isViewMode}
                        />
                    )}

                    <RemarksTextArea
                        remark={remarks}
                        setRemark={setRemarks}
                        error={errors.remarks}
                        disabled={isViewMode}
                        placeholder="Additional remarks (optional)"
                    />
                    <View style={{flexDirection: "row", gap: 10}}>
                     {getButtonsConfig(isEditMode, parsedTravelData ? parsedTravelData.status : "").map(({ label, mode }) => (
                        <SubmitButton
                            key={`${label}+${mode}`}
                            label={label}
                            onPress={() => validate(mode)}
                            bgColor={colors.primary}
                            textColor="white"
                        />
                    ))}
                    </View>
                </Container>
            )}

            <SuccessModal
                visible={isSuccessModalVisible}
                onClose={() => {
                    setIsSuccessModalVisible(false);
                    router.push({
                        pathname: 'TravelScreen',
                        params: { empId },
                    });
                }}
                message={
                    isEditMode ? "Travel request updated successfully!" : "Travel request submitted successfully!"
                }
            />
        </SafeAreaView>
    );
};

export default ProcessTravel;