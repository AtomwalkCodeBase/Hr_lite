import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import RemarksInput from './RemarkInput';
import AmountInput from './AmountInput';
import DropdownPicker from './DropdownPicker';

const ClaimItemActions = React.memo(({
  item,
  itemActions,
  isLimited,
  validationResult,
  managers,
  errors,
  onActionChange,
  onAmountChange,
  onRemarksChange,
  onForwardManagerChange
}) => {
  const handleActionChange = useCallback((action) => {
    onActionChange(item.id, action);
  }, [item.id, onActionChange]);

  const handleAmountChange = useCallback((amount) => {
    onAmountChange(item.id, amount);
  }, [item.id, onAmountChange]);

  const handleRemarksChange = useCallback((text) => {
    onRemarksChange(item.id, text);
  }, [item.id, onRemarksChange]);

  const handleForwardManagerChange = useCallback((managerId) => {
    onForwardManagerChange(item.id, managerId);
  }, [item.id, onForwardManagerChange]);

  return (
    <View style={styles.actionSection}>
      <Text style={styles.sectionSubtitle}>Action Required</Text>
      
      {isLimited ? (
        <View style={styles.limitedActionContainer}>
          <Text style={styles.limitedActionText}>
            This item requires forwarding due to: {validationResult.limitRemarks}
          </Text>
          
          <View style={styles.managerDropdownContainer}>
            <Text style={styles.detailLabel}>Forward To:</Text>
            <View style={styles.managerDisplay}>
              <Text style={styles.managerDisplayText}>
                {managers.find(m => m.emp_id === validationResult.forwardManager)?.name || 
                 validationResult.forwardManager}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                itemActions?.action === 'APPROVE' && styles.actionButtonActive,
                itemActions?.action === 'APPROVE' && styles.approveButtonActive
              ]}
              onPress={() => handleActionChange('APPROVE')}
            >
              <Text style={[
                styles.actionButtonText,
                itemActions?.action === 'APPROVE' && styles.actionButtonTextActive
              ]}>
                Approve
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                itemActions?.action === 'REJECT' && styles.actionButtonActive,
                itemActions?.action === 'REJECT' && styles.rejectButtonActive
              ]}
              onPress={() => handleActionChange('REJECT')}
            >
              <Text style={[
                styles.actionButtonText,
                itemActions?.action === 'REJECT' && styles.actionButtonTextActive
              ]}>
                Reject
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                itemActions?.action === 'FORWARD' && styles.actionButtonActive,
                itemActions?.action === 'FORWARD' && styles.forwardButtonActive
              ]}
              onPress={() => handleActionChange('FORWARD')}
            >
              <Text style={[
                styles.actionButtonText,
                itemActions?.action === 'FORWARD' && styles.actionButtonTextActive
              ]}>
                Forward
              </Text>
            </TouchableOpacity>
          </View>
          
          {(itemActions?.action === 'APPROVE' || itemActions?.action === 'FORWARD') && (
            <View style={styles.amountInputContainer}>
              <Text style={styles.detailLabel}>Approved Amount:</Text>
              <AmountInput
                label=""
                claimAmount={itemActions?.approvedAmount || ''}
                setClaimAmount={handleAmountChange}
                error={errors[`itemAmount-${item.id}`]}
                style={styles.amountInput}
              />
            </View>
          )}
          
          {itemActions?.action === 'FORWARD' && (
            <View style={styles.managerDropdownContainer}>
              <Text style={styles.detailLabel}>Forward To:</Text>
              <DropdownPicker
                data={managers.map(m => ({
                  label: `${m.name} [${m.emp_id}]`,
                  value: m.emp_id
                }))}
                value={itemActions?.forwardManager}
                setValue={handleForwardManagerChange}
                placeholder="Select manager"
                style={styles.managerDropdown}
                containerStyle={styles.dropdownContainer}
              />
            </View>
          )}
        </>
      )}
      
      <RemarksInput
        remark={itemActions?.remarks || ''}
        setRemark={handleRemarksChange}
        error={errors[`itemRemarks-${item.id}`]}
        placeholder="Enter remarks for this item..."
      />
    </View>
  );
});

const styles = StyleSheet.create({
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
  limitedActionContainer: {
    marginBottom: 16,
  },
  limitedActionText: {
    color: '#e67e22',
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
  managerDisplay: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    backgroundColor: '#f9f9f9',
  },
  managerDisplayText: {
    color: '#333',
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
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
});

export default ClaimItemActions;