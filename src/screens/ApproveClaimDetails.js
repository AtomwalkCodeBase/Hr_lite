import React, { useContext, useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import { Alert, ActivityIndicator, ScrollView, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { getClaimApprover, postClaimAction, validateClaimItem } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import SuccessModal from '../components/SuccessModal';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationModal from '../components/ConfirmationModal';
import ClaimItemCard from '../components/ClaimItemCard';
import RemarksInput from '../components/RemarkInput';
import ErrorModal from '../components/ErrorModal';
// import AmountInput from '../components/AmountInput';
// import DropdownPicker from '../components/DropdownPicker';

const ApproveClaimDetails = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const { profile } = useContext(AppContext);

  // Memoize the parsed claimData to prevent recreation on every render
  const claimData = useMemo(() => {
    if (!params) return null;
    return {
      ...params,
      claimDetails: typeof params.claimDetails === 'string' ? 
        JSON.parse(params.claimDetails) : 
        params.claimDetails
    };
  }, [params?.claimDetails]);

  // State management
  const [claim, setClaim] = useState(null);
  const [claimRemarks, setClaimRemarks] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemActions, setItemActions] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [managers, setManagers] = useState([]);
  const [validationResults, setValidationResults] = useState({});
  const [validationError, setValidationError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // Toggle item expansion
  const toggleItemExpand = useCallback((itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  }, []);

  // Fetch data on mount
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount

    const fetchData = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      
      try {
        const approversRes = await getClaimApprover();
        if (isMounted) setManagers(approversRes.data);

        if (claimData && isMounted) {
          const parsedDetails = claimData.claimDetails;
          setClaim(parsedDetails);
          
          if (parsedDetails.claim_items) {
            const sum = parsedDetails.claim_items.reduce(
              (total, item) => total + parseFloat(item.expense_amt || 0), 
              0
            );
            setTotalAmount(sum);
            
            const initialStates = {};
            const initialSelectedItems = [];
            const initialExpandedItems = {};
            
            parsedDetails.claim_items.forEach(item => {
              initialStates[item.id] = {
                action: null,
                approvedAmount: item.expense_amt.toString(),
                remarks: '',
                forwardManager: null
              };

              initialExpandedItems[item.id] = false;

              if (item.expense_status !== 'A' && item.expense_status !== 'R') {
                initialSelectedItems.push(item.id);
              }
            });
            
            if (isMounted) {
              setItemActions(initialStates);
              setSelectedItems(initialSelectedItems);
              setExpandedItems(initialExpandedItems);
            }
          }

          const validationData = {
            emp_id: profile?.emp_id,
            m_claim_id: claimData?.master_claim_id || parsedDetails?.master_claim_id
          };
          const validationResponse = await validateClaimItem(validationData);


          if (isMounted) {
            if (validationResponse.data) {
              const results = {};
              validationResponse.data.forEach(item => {
                results[item.claim_id] = {
                  limitType: item.limit_type,
                  limitRemarks: item.limit_remarks,
                  forwardManager: item.approved_emp_id,
                  approvalType: item.approval_type
                };
              });
              // console.log("uycsadcgbhjdk",validationResponse.data)
              setValidationResults(results);
              setValidationError(null);
            } else if (validationResponse.message) {
              setValidationError(validationResponse.message);
            }
          }
        }
      } catch (error) {
        console.log("uycsadcgbhjdk",error)
        if (isMounted) {
          console.error('Error:', error);
          if (error?.response?.data?.message.includes('Invalid request - ')) {
          const msg = error?.response?.data?.message;
          const afterText = msg.split('Invalid request -')[1]?.trim() || '';
          setValidationError(afterText || 'Error Employee Grade structure is not configured properly. Please check for Employee manager/ HR manager setup at Grade level.');
        } else {
          setValidationError(error?.response?.data?.message || 'Failed to load claim data');
        }
      }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [claimData, profile?.emp_id]); // Only depend on claimData and emp_id


  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleBackPress = () => {
    if (selectedImageUrl) {
      setSelectedImageUrl(null);
    } else {
      navigation.goBack();
    }
  };

  // Toggle item selection
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  // Toggle select all items
  const toggleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(claim?.claim_items
        .filter(item => item.expense_status !== 'A' && item.expense_status !== 'R')
        .map(item => item.id) || []);
    }
    setSelectAll(!selectAll);
  }, [selectAll, claim]);

  // Update item action
  const updateItemAction = useCallback((itemId, field, value) => {
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  }, []);

  // Validate form
const validateForm = useCallback(() => {
  const newErrors = {};
  
  // Check if claimRemarks is empty only if there are selected items
  if (selectedItems.length > 0 && claimRemarks.trim() === '') {
    newErrors.claimRemarks = 'Claim level remarks are required';
  }
  
  if (selectedItems.length === 0) {
    newErrors.selectedItems = 'Please select at least one item to take action';
    return newErrors;
  }

  selectedItems.forEach(itemId => {
    const item = itemActions[itemId];
    const originalItem = claim.claim_items.find(i => i.id === itemId);
    const validationResult = validationResults[originalItem.claim_id];
    
    if (!validationResult || validationResult.limitType === 'N') {
      if (item.action === 'APPROVE' || item.action === 'FORWARD') {
        if (!item.approvedAmount || item.approvedAmount.trim() === '') {
          newErrors[`itemAmount-${itemId}`] = 'Please enter an approved amount';
        }
        else if (isNaN(parseFloat(item.approvedAmount))) {
          newErrors[`itemAmount-${itemId}`] = 'Please enter a valid amount';
        }
        else if (parseFloat(item.approvedAmount) > parseFloat(originalItem.expense_amt)) {
          newErrors[`itemAmount-${itemId}`] = 'Approved amount cannot exceed claimed amount';
        }
      }
    }
  });
  
  return newErrors;
}, [claimRemarks, selectedItems, itemActions, claim, validationResults]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setShowConfirmationModal(true);
  }, [validateForm]);

  // Confirm submission
  const confirmSubmit = useCallback(async () => {
    setShowConfirmationModal(false);
    setIsLoading(true);
    
    try {
      const claim_list = selectedItems.map(itemId => {
        const item = itemActions[itemId];
        const originalItem = claim.claim_items.find(i => i.id === itemId);
        const validationResult = validationResults[originalItem.claim_id];
        
        const itemPayload = {
          claim_id: originalItem.claim_id,
          approve_type: validationResult?.approvalType || getApproveType(item.action),
          approved_amt: item.action === 'REJECT' ? '0' : item.approvedAmount,
          remarks: item.remarks || ''
        };

        if ((item.action === 'FORWARD' || validationResult?.limitType !== 'N') && 
            (validationResult?.forwardManager || item.forwardManager)) {
          itemPayload.a_emp_id = validationResult?.forwardManager || item.forwardManager;
        }

        return itemPayload;
      });

      const payload = {
        m_claim_id: claimData?.master_claim_id || claim?.master_claim_id,
        remarks: claimRemarks,
        call_mode: 'APPROVE_CLAIM',
        claim_list: claim_list
      };

      await postClaimAction(payload);
      setShowSuccessModal(true);
    } catch (error) {
      // console.error('Submission error:', error);
      setErrorMessage( error.response?.data?.message || error.message || 'Failed to process claim');
      setShowErrorModal(true)
      // Alert.alert(
      //   'Action Failed', 
      //   error.response?.data?.message || error.message || 'Failed to process claim'
      // );
    } finally {
      setIsLoading(false);
    }
  }, [selectedItems, itemActions, claim, validationResults, claimData, claimRemarks]);

  const getApproveType = (action) => {
    switch (action) {
      case 'APPROVE': return 'A';
      case 'REJECT': return 'R';
      case 'FORWARD': return 'F';
      case 'Back To Claimant': return 'B';
      default: return 'A';
    }
  };

  const formatIndianCurrency = (num) => {
    if (!num && num !== 0) return null; // handles null, undefined, empty string
    
    // Convert to number to handle cases like "12.00"
    const numberValue = Number(num);
    if (isNaN(numberValue)) return null;

    // Check if it's an integer (has no decimal or decimal is .00)
    const isInteger = Number.isInteger(numberValue);
    
    // Format the number based on whether it's an integer
    const numStr = isInteger ? numberValue.toString() : numberValue.toString();
    const parts = numStr.split('.');
    let integerPart = parts[0];
    const decimalPart = !isInteger && parts.length > 1 ? `.${parts[1]}` : '';

    // Format the integer part with Indian comma separators
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    
    if (otherNumbers !== '') {
      integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    } else {
      integerPart = lastThree;
    }

    return `₹ ${integerPart}${decimalPart}`;
  };

  useEffect(() => {
  // Get all selectable item IDs (not approved/rejected)
  const selectableIds = claim?.claim_items
    .filter(item => item.expense_status !== 'A' && item.expense_status !== 'R')
    .map(item => item.id) || [];


  // If all selectable items are selected, set selectAll to true, else false
  if (selectableIds.length > 0) {
    setSelectAll(
      selectableIds.every(id => selectedItems.includes(id))
    );
  } else {
    setSelectAll(false);
  }
}, [selectedItems, claim ]);

useEffect(() => {
  if (validationError) {
    setSelectAll(false);
    setSelectedItems([]);
  }
}, [validationError]);

  // Render item row
  const renderItem = useCallback(({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    const isDisabled = item.expense_status === 'A' || item.expense_status === 'R';
    const validationResult = validationResults[item.claim_id] || {};
    const isLimited = validationResult.limitType !== 'N';
    const isExpanded = expandedItems[item.id];

    return (
      <ClaimItemCard
        item={item}
        isSelected={isSelected}
        isDisabled={isDisabled}
        isLimited={isLimited}
        expanded={isExpanded}
        validationResult={validationResult}
        onToggleExpand={() => toggleItemExpand(item.id)}
        onToggleSelect={() => toggleItemSelection(item.id)}
        managers={managers}
        onActionChange={(itemId, action) => updateItemAction(itemId, 'action', action)}
        onAmountChange={(itemId, amount) => updateItemAction(itemId, 'approvedAmount', amount)}
        onForwardManagerChange={(itemId, managerId) => updateItemAction(itemId, 'forwardManager', managerId)}
        onRemarkChange={(itemId, remark) => updateItemAction(itemId, 'remarks', remark)}
        itemActions={itemActions[item.id]}
        errors={errors}
        formatIndianCurrency={formatIndianCurrency}
      >
      </ClaimItemCard>
    );
  }, [selectedItems, itemActions, validationResults, errors, managers, expandedItems, toggleItemExpand, toggleItemSelection, updateItemAction]);

  if (selectedImageUrl) {
    return (
      <ImageViewer 
        imageUrls={[{ url: selectedImageUrl }]}
        enableSwipeDown
        onSwipeDown={() => setSelectedImageUrl(null)}
        renderHeader={() => (
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedImageUrl(null)}
          >
            <MaterialIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>
        )}
      />
    );
  }

  if (!claim) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderComponent
          headerTitle="Claim Approval"
          onBackPress={handleBackPress}
          showBackButton
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        headerTitle="Claim Approval"
        onBackPress={handleBackPress}
        showBackButton
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{claim.employee_name}</Text>
          <Text style={styles.claimDate}>Claim Date: {claim.claim_date}</Text>
          <Text style={styles.totalAmount}>Total Amount: {formatIndianCurrency(totalAmount.toFixed(2))}</Text>
          {validationError && (
           <Text style={styles.validationErrorText}>{validationError}</Text>
          )}
        </View>
        
        <View style={styles.selectAllContainer}>
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={toggleSelectAll}
            disabled={claim.claim_items.every(item => item.expense_status === 'A' || item.expense_status === 'R')}
          >
            <View style={[styles.checkbox, selectAll && styles.checkboxSelected]}>
              {selectAll && <MaterialIcons name="check" size={18} color="#fff" />}
            </View>
            <Text style={styles.selectAllText}>Select All Items</Text>
          </TouchableOpacity>
            <Text>{selectedItems.length > 0 && (`Total Item selected (${(selectedItems.length)})`)}</Text>
        </View>
        
        {errors.selectedItems && (
          <Text style={styles.errorText}>{errors.selectedItems}</Text>
        )}
        
        {/* {validationError && (
          <Text style={styles.validationErrorText}>{validationError}</Text>
        )} */}
        
        <FlatList
          data={claim.claim_items}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.itemsList}
        />
      <RemarksInput
        label="Claim Level Remarks"
        remark={claimRemarks}
        setRemark={(text) => {
          setClaimRemarks(text);
          // Clear the error when user starts typing
          if (text.trim() !== '' && errors.claimRemarks) {
            setErrors(prev => ({...prev, claimRemarks: undefined}));
          }
        }}
        placeholder="Enter your remarks here"
        error={errors.claimRemarks}
        style={styles.claimRemarksInput}
      />
      </ScrollView>
      
      <TouchableOpacity
        style={[styles.submitButton, (isLoading || selectedItems.length === 0) && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isLoading || selectedItems.length === 0}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Action</Text>
        )}
      </TouchableOpacity>
      
      <ConfirmationModal
        visible={showConfirmationModal}
        title="Confirm Action"
        message={`You are about to take action on ${selectedItems.length} item(s). Continue?`}
        onCancel={() => setShowConfirmationModal(false)}
        onConfirm={confirmSubmit}
        isLoading={isLoading}
      />
      
      <SuccessModal
        visible={showSuccessModal}
        title="Success!"
        message="The claim has been processed successfully."
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />
      {/* <ErrorModal
        visible={!!validationError}
        message={validationError}
        onClose={() => {
          setValidationError(null)
          handleBackPress()}
        }
      /> */}
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onClose={handleBackPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  employeeInfo: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2c3e50',
  },
  claimDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  selectAllContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between"
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  selectAllText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  itemsList: {
    paddingBottom: 16,
  },
  actionContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  claimRemarksInput: {
    marginTop: 16,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  validationErrorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 10
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
});

export default ApproveClaimDetails;