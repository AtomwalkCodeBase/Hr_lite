import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import styled from 'styled-components/native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../Styles/appStyle';
import HeaderComponent from '../components/HeaderComponent';
import { imagetotext, postAppointee } from '../services/productServices';
import CustomInput from '../components/old_components/CustomInput/CustomInput';
import NewButton from '../components/old_components/NewButton';
import { useRouter } from 'expo-router';
import DropdownPicker from '../components/DropdownPicker';
import Loader from '../components/old_components/Loader';
import SuccessModal from '../components/SuccessModal';

const Label = styled.Text`
  font-size: 16px;
  margin-bottom: 5px;
`;

const AddAppointee = ({ navigation }) => {
    const router = useRouter();
    const { control, handleSubmit, setValue, watch, formState: { errors }, setError } = useForm();
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [gender, setGender] = useState(null);
    const [showEmpId, setShowEmpId] = useState(false); // New state to control Employee ID visibility

    useEffect(() => {
        openCamera();
    }, []);

    const handleBackPress = () => {
        router.push({
            pathname: 'MoreScreen',
            // params: {
            //     isManager: true,
            // },
        });
    };
    
    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Camera access is needed to capture the image.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets?.length > 0) {
            processImage(result.assets[0]);
        } else {
            navigation.pop();
        }
    };

    const processImage = async (file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('image_file', {
            uri: file.uri,
            name: 'captured_image.jpg',
            type: 'image/jpeg',
        });

        try {
            const res = await imagetotext(formData);

            if (res?.data) {
                const scannedData = res.data.f_data_list;
                const filteredText = res.data.text?.filter(item => item.trim() !== '') || [];
                const extractedText = filteredText.join('\n');


                if (scannedData) {
                    setValue('name', filteredText[0]?.trim() || "");
                    setValue('mob', scannedData.mobile_number?.[0] || "");
                    setValue('email', scannedData.email_id?.[0] || "");
                    setValue('company', scannedData.company_name?.[0] || "");
                    setValue('refNum', res.data.ref_num || "");
                    setValue('address', filteredText.find(item => item.includes('Address')) || "");
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to process the image.');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (formData) => {
        let hasError = false;

        if (!formData.name) {
            setError("name", { type: "manual", message: "Name is required" });
            hasError = true;
        }

        if (!formData.gender) {
            setError("gender", { type: "manual", message: "Please select a gender" });
            hasError = true;
        }

        if (!formData.email) {
            setError("email", { type: "manual", message: "Email is required" });
            hasError = true;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError("email", { type: "manual", message: "Enter a valid email address" });
            hasError = true;
        }

        if (!formData.mob) {
            setError("mob", { type: "manual", message: "Mobile number is required" });
            hasError = true;
        } else if (!/^\d{10}$/.test(formData.mob)) {
            setError("mob", { type: "manual", message: "Enter a valid 10-digit mobile number" });
            hasError = true;
        }

        if (!formData.add1) {
            setError("add1", { type: "manual", message: "Address Line 1 is required" });
            hasError = true;
        }

        if (hasError) return;

        setLoading(true);

        try {
            const appointeePayload = {
                emp_id: formData.empId || "",
                name: formData.name,
                gender: formData.gender,
                email_id: formData.email,
                mobile_number: formData.mob,
                address_line_1: formData.add1,
                address_line_2: formData.add2 || "",
                call_mode: 'ADD_JOB',
            };

            const response = await postAppointee(appointeePayload);

            if (response) {
                setIsSuccessModalVisible(true);
            } else {
                Alert.alert('Failed to add appointee', 'Please verify the details and try again.');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message || "Failed to add appointee. Please try again later.";

            if (errorMessage.includes("Invalid request - call mode / Employee name is not passed")) {
                setError("empId", { type: "manual", message: "Employee ID is required for this request" });
                setShowEmpId(true); // Show Employee ID input field only if required
            } else {
                Alert.alert('Error', errorMessage);
            }

            console.error('Error:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ backgroundColor: colors.white, flex: 1 }}>
            <HeaderComponent headerTitle="Add Appointee" onBackPress={handleBackPress} />

            <Loader visible={loading} onTimeout={() => setLoading(false)} />

            <ScrollView contentContainerStyle={{ paddingTop: 5, paddingHorizontal: 10 }}>
                {showEmpId && (
                    <CustomInput 
                        control={control} 
                        name="empId" 
                        placeholder="Employee ID" 
                        rules={{ required: "Employee ID is required" }} 
                    />
                )}
                <CustomInput control={control} name="name" placeholder="Name" rules={{ required: "Name is required" }} />

                <DropdownPicker 
                    label="Gender"
                    data={[
                        { label: "Male", value: "M" },
                        { label: "Female", value: "F" },
                        // { label: "Other", value: "Other" }
                    ]}
                    value={gender}
                    setValue={(value) => {
                        setGender(value);
                        setValue("gender", value);
                    }}
                    error={errors.gender?.message}
                />

                <CustomInput control={control} name="email" placeholder="Email" />
                <CustomInput control={control} name="mob" placeholder="Mobile" />
                <CustomInput control={control} name="add1" placeholder="Address Line 1" />
                <CustomInput control={control} name="add2" placeholder="Address Line 2 (Optional)" />

                <NewButton title="Submit" onPress={handleSubmit(onSubmit)} />
            </ScrollView>

            <SuccessModal 
                visible={isSuccessModalVisible} 
                onClose={() => {
                    setIsSuccessModalVisible(false);
                    handleBackPress();
                }} 
            />
        </SafeAreaView>
    );
};

export default AddAppointee;
