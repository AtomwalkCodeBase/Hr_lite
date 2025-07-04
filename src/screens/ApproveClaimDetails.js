import { useNavigation, useRouter } from 'expo-router';
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Linking, ScrollView, View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { getClaimApprover, postClaimAction } from '../services/productServices';
import HeaderComponent from '../components/HeaderComponent';
import RemarksInput from '../components/RemarkInput';
import SuccessModal from '../components/SuccessModal';
import Loader from '../components/old_components/Loader';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationModal from '../components/ConfirmationModal';
import AmountInput from '../components/AmountInput';
import DropdownPicker from '../components/DropdownPicker';

const ApproveClaimDetails = (props) => {
  const { profile } = useContext(AppContext);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  // Parse claim data
  const claimData = props?.claim_data;
  const [claim, setClaim] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemActions, setItemActions] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (claimData) {
      try {
        const parsedDetails = typeof claimData.claimDetails === 'string' 
          ? JSON.parse(claimData.claimDetails) 
          : claimData.claimDetails;
        
        setClaim(parsedDetails);
        
        if (parsedDetails.claim_items) {
          const sum = parsedDetails.claim_items.reduce(
            (total, item) => total + parseFloat(item.expense_amt || 0), 
            0
          );
          setTotalAmount(sum);
          
          const initialStates = {};
          const initialSelectedItems = [];
          
          parsedDetails.claim_items.forEach(item => {
            initialStates[item.id] = {
              action: null,
              approvedAmount: item.expense_amt.toString(),
              remarks: '',
              forwardManager: null
            };

            // Auto-select items that are not already approved/rejected
            if (item.expense_status !== 'A' && item.expense_status !== 'R') {
              initialSelectedItems.push(item.id);
            }
          });
          
          setItemActions(initialStates);
          setSelectedItems(initialSelectedItems);
        }
      } catch (error) {
        console.error("Error parsing claim data:", error);
      }
    }
  }, [claimData]);

  const callType = props?.claim_data?.callType;
  const isMasterApproval = props?.claim_data?.isMaster === "true";
  const navigation = useNavigation();
  const router = useRouter();

  const [claimRemarks, setClaimRemarks] = useState('');
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const approversRes = await getClaimApprover();
        setManagers(approversRes.data);
      } catch (error) {
        console.error('Error fetching approvers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleBackPress = () => {
    if (selectedImageUrl) {
      setSelectedImageUrl(null);
    } else {
      router.push('ApproveClaim');
    }
  };

  const handleViewFile = (fileUrl) => {
    if (!fileUrl) return;
    
    const fileExtension = fileUrl.split('.').pop().split('?')[0].toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      setSelectedImageUrl(fileUrl);
    } else if (fileExtension === 'pdf') {
      Alert.alert('File Downloading', 'The file is being downloaded.');
      Linking.openURL(fileUrl).catch((err) => console.error('Failed to open URL:', err));
    } else {
      console.warn('Unsupported file type:', fileExtension);
    }
  };

   const toggleItemExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const toggleItemSelection = (itemId) => {
    const item = claim.claim_items?.find(i => i.id === itemId);
    if (item?.expense_status === 'A' || item?.expense_status === 'R') return;
    
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    if (!claim.claim_items) return;
    
    const actionableItems = claim.claim_items
      .filter(item => item.expense_status !== 'A' && item.expense_status !== 'R')
      .map(item => item.id);
    
    if (selectedItems.length === actionableItems.length) {
      // Unselect all
      setSelectedItems([]);
    } else {
      // Select all actionable items
      setSelectedItems([...actionableItems]);
    }
  };

  const handleItemActionChange = (itemId, action) => {
    const item = claim.claim_items.find(i => i.id === itemId);
    if (item?.expense_status === 'A' || item?.expense_status === 'R') return;
    
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        action,
        approvedAmount: action === 'REJECT' 
          ? '0' 
          : (prev[itemId]?.approvedAmount || item.expense_amt.toString())
      }
    }));
  };

  const handleItemAmountChange = (itemId, amount) => {
  // Simply update the amount without any validation during editing
  setItemActions(prev => ({
    ...prev,
    [itemId]: {
      ...prev[itemId],
      approvedAmount: amount
    }
  }));
};

  const handleItemRemarksChange = (itemId, remarks) => {
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        remarks
      }
    }));
  };

  const handleItemForwardManagerChange = (itemId, managerId) => {
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        forwardManager: managerId
      }
    }));
  };

  const validateForm = () => {
  const newErrors = {};
  
  // Claim level remarks validation
  if (claimRemarks.trim() === '') {
    newErrors.claimRemarks = 'Claim level remarks are required';
  }
  
  // Selected items validation
  if (selectedItems.length === 0) {
    newErrors.selectedItems = 'Please select at least one item to take action';
    return newErrors;
  }

  // Item level validations
  selectedItems.forEach(itemId => {
    const item = itemActions[itemId];
    const originalItem = claim.claim_items.find(i => i.id === itemId);
    
    if (item.action === 'APPROVE' || item.action === 'FORWARD') {
      // Validate for empty amount only on submit
      if (!item.approvedAmount || item.approvedAmount.trim() === '') {
        newErrors[`itemAmount-${itemId}`] = 'Please enter an approved amount';
      }
      // Validate for invalid number format
      else if (isNaN(parseFloat(item.approvedAmount))) {
        newErrors[`itemAmount-${itemId}`] = 'Please enter a valid amount';
      }
      // Validate against original amount
      else if (parseFloat(item.approvedAmount) > parseFloat(originalItem.expense_amt)) {
        newErrors[`itemAmount-${itemId}`] = 'Approved amount cannot exceed claimed amount';
      }
    }
  });
  
  return newErrors;
};

  const handleSubmit = async () => {
    // Show confirmation modal first
    setShowConfirmationModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmationModal(false);
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const claim_list = selectedItems.map(itemId => {
        const item = itemActions[itemId];
        const originalItem = claim.claim_items.find(i => i.id === itemId);
        
        const itemPayload = {
          claim_id: originalItem.claim_id,
          approve_type: getApproveType(item.action),
          approved_amt: item.action === 'REJECT' ? '0' : item.approvedAmount,
          remarks: item.remarks || ''
        };

        if (item.action === 'FORWARD' && item.forwardManager) {
          itemPayload.forward_manager_id = item.forwardManager;
        }

        return itemPayload;
      });

      const payload = {
        m_claim_id: claimData?.master_claim_id || claim?.master_claim_id,
        remarks: claimRemarks,
        call_mode: 'APPROVE_CLAIM',
        claim_list: claim_list
      };

      console.log('Submitting payload:', JSON.stringify(payload, null, 2));
      
      await postClaimAction(payload);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Action Failed', 
        error.response?.data?.message || error.message || 'Failed to process claim'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getApproveType = (action) => {
    switch (action) {
      case 'APPROVE': return 'A';
      case 'REJECT': return 'R';
      case 'FORWARD': return 'F';
      case 'Back To Claimant': return 'B';
    }
  };

  const renderClaimItem = ({ item }) => {
    const isDisabled = item.expense_status === 'A' || item.expense_status === 'R';
    const isSelected = selectedItems.includes(item.id);
    
    return (
      <View style={[
        styles.itemContainer,
        isDisabled && styles.disabledItem
      ]}>
        <TouchableOpacity 
          onPress={() => !isDisabled && toggleItemExpand(item.id)}
          activeOpacity={0.8}
          style={styles.itemHeaderTouchable}
          disabled={isDisabled}
        >
          <View style={styles.itemHeader}>
            {!isDisabled ? (
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  toggleItemSelection(item.id);
                }}
                style={styles.checkboxContainer}
              >
                <View style={[
                  styles.checkbox, 
                  isSelected && styles.checkboxSelected
                ]}>
                  {isSelected && (
                    <MaterialIcons name="check" size={16} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.statusIconContainer}>
                <MaterialIcons 
                  name={item.expense_status === 'A' ? 'check-circle' : 'cancel'} 
                  size={22} 
                  color={item.expense_status === 'A' ? '#27ae60' : '#e74c3c'} 
                />
              </View>
            )}
            
            <View style={styles.itemTitleContainer}>
              <Text style={[
                styles.itemTitle,
                isDisabled && styles.disabledText
              ]} numberOfLines={1} ellipsizeMode="tail">
                {item.item_name}
              </Text>
              {item.project_name && (
                <Text style={[
                  styles.itemProject,
                  isDisabled && styles.disabledText
                ]} numberOfLines={1}>
                  {item.project_name}
                </Text>
              )}
            </View>
            
            <View style={styles.itemAmountContainer}>
              <Text style={[
                styles.itemAmount,
                isDisabled && styles.disabledText
              ]}>
                ₹{parseFloat(item.expense_amt).toFixed(2)}
              </Text>
              {!isDisabled && (
                <MaterialIcons 
                  name={expandedItems[item.id] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                  size={24} 
                  color="#666" 
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        {expandedItems[item.id] && (
        <View style={styles.itemDetails}>
          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expense Date:</Text>
              <Text style={styles.detailValue}>{item.expense_date}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantity:</Text>
              <Text style={styles.detailValue}>{item.quantity}</Text>
            </View>
            
            {item.project_name && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Project:</Text>
                <Text style={styles.detailValue}>{item.project_name}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Original Remarks:</Text>
              <Text style={styles.detailValue}>{item.remarks || 'None'}</Text>
            </View>
            
            {item.submitted_file_1 && (
              <TouchableOpacity 
                style={styles.viewFileButton}
                onPress={() => handleViewFile(item.submitted_file_1)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="attach-file" size={18} color="#1976d2" />
                <Text style={styles.viewFileText}>View Attachment</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedItems.includes(item.id) && (
            <View style={styles.actionSection}>
              <Text style={styles.sectionSubtitle}>Action Required</Text>
              
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    itemActions[item.id]?.action === 'APPROVE' && styles.actionButtonActive,
                    itemActions[item.id]?.action === 'APPROVE' && styles.approveButtonActive
                  ]}
                  onPress={() => handleItemActionChange(item.id, 'APPROVE')}
                >
                  <Text style={[
                    styles.actionButtonText,
                    itemActions[item.id]?.action === 'APPROVE' && styles.actionButtonTextActive
                  ]}>
                    Approve
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    itemActions[item.id]?.action === 'REJECT' && styles.actionButtonActive,
                    itemActions[item.id]?.action === 'REJECT' && styles.rejectButtonActive
                  ]}
                  onPress={() => handleItemActionChange(item.id, 'REJECT')}
                >
                  <Text style={[
                    styles.actionButtonText,
                    itemActions[item.id]?.action === 'REJECT' && styles.actionButtonTextActive
                  ]}>
                    Reject
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    itemActions[item.id]?.action === 'FORWARD' && styles.actionButtonActive,
                    itemActions[item.id]?.action === 'FORWARD' && styles.forwardButtonActive
                  ]}
                  onPress={() => handleItemActionChange(item.id, 'FORWARD')}
                >
                  <Text style={[
                    styles.actionButtonText,
                    itemActions[item.id]?.action === 'FORWARD' && styles.actionButtonTextActive
                  ]}>
                    Forward
                  </Text>
                </TouchableOpacity>
              </View>
              
              {(itemActions[item.id]?.action === 'APPROVE' || itemActions[item.id]?.action === 'FORWARD') && (
                <View style={styles.amountInputContainer}>
                  <Text style={styles.detailLabel}>Approved Amount:</Text>
                  <AmountInput
  label=""
  claimAmount={itemActions[item.id]?.approvedAmount || ''} // Fallback to empty string
  setClaimAmount={(amount) => handleItemAmountChange(item.id, amount)}
  error={errors[`itemAmount-${item.id}`]}
  style={styles.amountInput}
/>
                </View>
              )}
              
              {itemActions[item.id]?.action === 'FORWARD' && (
                <View style={styles.managerDropdownContainer}>
                  <Text style={styles.detailLabel}>Forward To:</Text>
                  <DropdownPicker
                    data={managers.map(m => ({
                      label: `${m.name} [${m.emp_id}]`,
                      value: m.id
                    }))}
                    value={itemActions[item.id]?.forwardManager}
                    setValue={(value) => handleItemForwardManagerChange(item.id, value)}
                    placeholder="Select manager"
                    style={styles.managerDropdown}
                    containerStyle={styles.dropdownContainer}
                  />
                  {errors[`itemManager-${item.id}`] && (
                    <Text style={styles.errorText}>{errors[`itemManager-${item.id}`]}</Text>
                  )}
                </View>
              )}
              
              <RemarksInput
                label="Your Remarks:"
                remark={itemActions[item.id]?.remarks || ''}
                setRemark={(text) => handleItemRemarksChange(item.id, text)}
                error={errors[`itemRemarks-${item.id}`]}
                placeholder="Enter remarks for this item..."
                style={styles.itemRemarksInput}
              />
            </View>
          )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return <Loader visible={isLoading} />;
  }

  if (selectedImageUrl) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <HeaderComponent headerTitle="View Image" onBackPress={handleBackPress} />
        <View style={{ flex: 1 }}>
          <ImageViewer
            imageUrls={[{ url: selectedImageUrl }]}
            enableSwipeDown={true}
            onSwipeDown={handleBackPress}
          />
        </View>
      </SafeAreaView>
    );
  }

  const formattedClaimId = claim?.master_claim_id?.length > 8 
    ? `...${claim.master_claim_id.slice(-8)}` 
    : claim?.master_claim_id;

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent 
        headerTitle={`${callType === 'Approve' ? 'Approve' : 'Return'} Claim ${formattedClaimId || ''}`} 
        onBackPress={handleBackPress} 
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Claim Summary Section */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Claim Summary</Text>
            <View style={[styles.statusBadge, getStatusStyle(claim?.expense_status)]}>
              <Text style={styles.statusBadgeText}>
                {claim?.status_display || getClaimStatus(claim?.expense_status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Claimant</Text>
              <Text style={styles.summaryValue}>{claim?.employee_name}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Claim Date</Text>
              <Text style={styles.summaryValue}>{claim?.claim_date}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={[styles.summaryValue, styles.amountText]}>
                ₹{totalAmount.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items Count</Text>
              <Text style={styles.summaryValue}>{claim?.claim_items?.length || 0}</Text>
            </View>
          </View>
        </View>

        {/* Claim Items List */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Claim Items</Text>
            <View style={styles.selectAllContainer}>
              <Text style={styles.selectedCount}>
                {selectedItems.length} of {claim?.claim_items?.filter(item => 
                  item.expense_status !== 'A' && item.expense_status !== 'R'
                ).length || 0} selected
              </Text>
              <TouchableOpacity onPress={toggleSelectAll}>
                <Text style={styles.selectAllText}>
                  {selectedItems.length === claim?.claim_items?.filter(item => 
                    item.expense_status !== 'A' && item.expense_status !== 'R'
                  ).length ? 'Unselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {errors.selectedItems && (
            <Text style={styles.sectionError}>{errors.selectedItems}</Text>
          )}
          
          <FlatList
            data={claim?.claim_items || []}
            renderItem={renderClaimItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>

        {/* Claim Level Remarks */}
        <View style={styles.remarksCard}>
          <RemarksInput
            label="Overall Claim Remarks"
            remark={claimRemarks}
            setRemark={setClaimRemarks}
            error={errors.claimRemarks}
            placeholder="Enter your overall remarks for this claim..."
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            selectedItems.length === 0 && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={selectedItems.length === 0}
        >
          <Text style={styles.submitButtonText}>
            {selectedItems.length > 0 
              ? `Submit Actions (${selectedItems.length} items)` 
              : 'Select items to take action'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          isVisible={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            router.push('ApproveClaim');
          }}
          message="Claim actions submitted successfully."
        />
      )}
      <ConfirmationModal
        visible={showConfirmationModal}
        message={`Are you sure you want to submit actions for ${selectedItems.length} item(s)?`}
        onConfirm={confirmSubmit}
        onCancel={() => setShowConfirmationModal(false)}
        confirmText="Submit"
        cancelText="Cancel"
      />
    </SafeAreaView>
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'A': return styles.statusApproved;
    case 'R': return styles.statusRejected;
    case 'F': return styles.statusForwarded;
    case 'B': return styles.statusReturned;
    default: return styles.statusPending;
  }
};

const getClaimStatus = (status) => {
  switch (status) {
    case 'S': return 'Submitted';
    case 'A': return 'Approved';
    case 'F': return 'Forwarded';
    case 'R': return 'Rejected';
    case 'B': return 'Returned';
    default: return 'Pending';
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  selectedCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  sectionError: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  statusApproved: {
    backgroundColor: '#27ae60',
  },
  statusRejected: {
    backgroundColor: '#e74c3c',
  },
  statusForwarded: {
    backgroundColor: '#3498db',
  },
  statusReturned: {
    backgroundColor: '#f39c12',
  },
  statusPending: {
    backgroundColor: '#7f8c8d',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryRow: {
    width: '48%',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
  },
  amountText: {
    color: '#27ae60',
    fontWeight: '600',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  itemHeaderTouchable: {
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  checkboxContainer: {
    padding: 4,
    marginRight: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  itemTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
  },
  itemProject: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  itemAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#27ae60',
    marginRight: 8,
  },
  itemDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    width: '40%',
  },
  detailValue: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
    width: '60%',
    textAlign: 'right',
  },
  viewFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewFileText: {
    color: '#3498db',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 16,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  approveButtonActive: {
    backgroundColor: '#27ae60',
  },
  rejectButtonActive: {
    backgroundColor: '#e74c3c',
  },
  forwardButtonActive: {
    backgroundColor: '#3498db',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  amountInputContainer: {
    marginBottom: 16,
  },
  amountInput: {
    marginTop: 8,
  },
  managerDropdownContainer: {
    marginBottom: 16,
  },
  managerDropdown: {
    marginTop: 8,
  },
  dropdownContainer: {
    width: '100%',
  },
  itemRemarksInput: {
    marginTop: 8,
  },
  remarksCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 4,
  },
  disabledItem: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  disabledText: {
    color: '#95a5a6',
  },
  statusIconContainer: {
    width: 22,
    height: 22,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 14,
    color: '#3498db',
    marginLeft: 10,
    fontWeight: '500',
  },
});

export default ApproveClaimDetails;