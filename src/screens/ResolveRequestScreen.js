import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard, Alert, Linking } from 'react-native';
import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderComponent from '../components/HeaderComponent';
import RemarksTextArea from '../components/RemarkInput';
import { useRouter } from 'expo-router';
import FilePicker from '../components/FilePicker';
import SubmitButton from '../components/SubmitButton';
import { colors } from '../Styles/appStyle';
import ImageViewer from 'react-native-image-zoom-viewer';
import { postEmpRequest } from '../services/productServices';
import SuccessModal from '../components/SuccessModal';
import ConfirmationModal from '../components/ConfirmationModal';
import Loader from '../components/old_components/Loader';
import ApplyButton from '../components/ApplyButton';
import ErrorModal from '../components/ErrorModal';

const ResolveRequestScreen = (props) => {
	const router = useRouter();
	const itemData = JSON.parse(props?.data?.item || "{}");
	const [remark, setRemark] = useState("");
	const [fileName, setFileName] = useState("");
	const [fileUri, setFileUri] = useState("");
	const [fileMimeType, setFileMimeType] = useState("");
	const [selectedImageUrl, setSelectedImageUrl] = useState(null);
	const [errors, setErrors] = useState({});
	const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [submitConfirmModalVisible, setSubmitConfirmModalVisible] = useState(false);
	const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleResolveRequest = async () => {
		setIsLoading(true);

		const formData = new FormData();

		formData.append('request_type', itemData.request_type);
		formData.append('emp_id', itemData.resolved_by);
		formData.append('request_id', itemData.id);
		formData.append('call_mode', "RESOLVED");
		formData.append('remarks', remark);

		// Only append file if a new one was selected
		if (fileUri && fileUri !== itemData.submitted_file_1) { 
			formData.append('uploaded_file', {
				uri: fileUri,
				name: fileName || 'supporting_document.jpg',
				type: fileMimeType || 'image/jpeg',
			});
		}

		try {
			const res = await postEmpRequest(formData); 

			if (res.status === 200) {
				setIsSuccessModalVisible(true);
			} else {
				setErrorMessage("Failed to submit request.")
			}
		} catch (error) {
			setErrorMessage(error.response?.data?.message)
		} finally {
			setIsLoading(false);
			setSubmitConfirmModalVisible(false);
		}
	};

	const handleBackPress = () => {
		setSelectedImageUrl(null); // Reset image viewer on back
		router.back();
	};

	const handleError = (error, input) => {
		setErrors((prevState) => ({ ...prevState, [input]: error }));
	};

	const validate = () => {
		Keyboard.dismiss();
		let isValid = true;

		if (!remark) {
			handleError("Please add a remark", "requestText");
			isValid = false;
		}

		if (!fileName) {
			handleError("Please attach a reference file", "requestFile");
			isValid = false;
		}

		if (isValid) {
			setSubmitConfirmModalVisible(true);
		}
	};

	const handleViewFile = (fileUrl) => {
		const fileExtension = fileUrl.split('.').pop().split('?')[0].toLowerCase();
		if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
			setSelectedImageUrl(fileUrl);
		} else if (fileExtension === 'pdf') {
			Alert.alert('File Downloading', 'The file is being downloaded.');
			Linking.openURL(fileUrl).catch((err) => console.error('Failed to open URL:', err));
		} else {
			console.warn('Unsupported file type:', fileExtension);
			Alert.alert('Error', 'Unsupported file type.');
		}
	};

	if (selectedImageUrl) {
		return (
			<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
				<HeaderComponent headerTitle="View Image" onBackPress={handleBackPress} />
				<View style={styles.imageViewerContainer}>
					<ImageViewer
						imageUrls={[{ url: selectedImageUrl }]}
						enableSwipeDown={true}
						onSwipeDown={handleBackPress}
						renderIndicator={() => null}
						backgroundColor="transparent"
					/>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
			<HeaderComponent
				headerTitle="Resolve Request"
				onBackPress={handleBackPress}
			/>
			<ScrollView
				style={styles.mainBox}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.infoBox}>
					<View style={styles.header}>
						<Text style={styles.requestId}>{itemData.request_id}</Text>
						<Text style={styles.date}>{itemData.created_date}</Text>
					</View>
					<Text style={styles.requestType}>{itemData.request_sub_type}</Text>
					<Text style={styles.empId}>Employee: {itemData.emp_id}</Text>
					<View style={styles.requestContainer}>
						<Text style={styles.requestText}>{itemData.request_text}</Text>
					</View>
					{itemData.submitted_file_1 && (
					<TouchableOpacity
						style={styles.viewFileButton}
						onPress={() => handleViewFile(itemData.submitted_file_1)}
					>
						<MaterialIcons name="insert-drive-file" size={18} color="#1976D2" />
						<Text style={styles.viewFileText}>View Attachment</Text>
					</TouchableOpacity>
					 )} 
				</View>
				<RemarksTextArea
					remark={remark}
					setRemark={setRemark}
					placeholder="Add remark"
					error={errors.requestText}
				/>
				<FilePicker
					label="Attach Supporting Document"
					fileName={fileName}
					setFileName={setFileName}
					fileUri={fileUri}
					setFileUri={setFileUri}
					setFileMimeType={setFileMimeType}
					error={errors.requestFile}
				/>
			</ScrollView>
			<View style={styles.actionButtonContainer}>
				<ApplyButton
					onPress={validate}
					buttonText="Complete Request"
				/>
			</View>
			<ConfirmationModal
				visible={submitConfirmModalVisible}
				message="Are you sure you want to mark this request as resolved ?"
				onConfirm={handleResolveRequest}
				onCancel={() => setSubmitConfirmModalVisible(false)}
				confirmText="Confirm"
				cancelText="Cancel"
			/>
			<SuccessModal
				visible={isSuccessModalVisible}
				onClose={() => {
					setIsSuccessModalVisible(false);
					handleBackPress();
				}}
				message="Resolved successfully!"
			/>
			      <ErrorModal
						visible={isErrorModalVisible}
						message={errorMessage}
						onClose={() => setIsErrorModalVisible(false)}
					/>
			<Loader visible={isLoading} />
		</SafeAreaView>
	);
};

export default ResolveRequestScreen;

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	mainBox: {
		flex: 1,
		paddingHorizontal: '4%',
	},
	scrollContent: {
		paddingBottom: '5%',
	},
	infoBox: {
		backgroundColor: '#ffffff',
		padding: '5%',
		borderRadius: 12,
		marginBottom: '5%',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '3%',
	},
	requestId: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#a970ff',
	},
	date: {
		fontSize: 14,
		color: '#666',
	},
	requestType: {
		fontSize: 16,
		fontWeight: '500',
		color: '#333',
		marginBottom: '2%',
	},
	empId: {
		fontSize: 14,
		color: '#666',
		marginBottom: '4%',
	},
	requestContainer: {
		backgroundColor: '#f8f9fa',
		padding: '3%',
		borderRadius: 8,
		borderLeftWidth: 3,
		borderLeftColor: '#a970ff',
	},
	requestText: {
		fontSize: 15,
		color: '#333',
		lineHeight: 20,
	},
	viewFileButton: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: '3%',
	},
	viewFileText: {
		color: '#1976D2',
		fontSize: 14,
		fontWeight: '500',
		marginLeft: 6,
	},
	imageViewerContainer: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	actionButtonContainer: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		backgroundColor: "#fff",
	},
});