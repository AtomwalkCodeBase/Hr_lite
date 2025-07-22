import React, { useState, useEffect } from 'react';
import DropdownPicker from './DropdownPicker';

const actionOptions = [
  { label: 'Approve', value: 'APPROVE' },
  { label: 'Reject', value: 'REJECT' },
  { label: 'Back To Claimant', value: 'Back To Claimant' },
  { label: 'Forward', value: 'FORWARD' },
];

const ActionDropdown = ({ item, itemActions, onActionChange }) => {
  const [selectedAction, setSelectedAction] = useState(itemActions?.action || '');

  useEffect(() => {
    if (selectedAction) {
      handleActionChange(selectedAction);
    }
  }, [selectedAction]);

  const handleActionChange = (action) => {
    onActionChange(item.id, action);
  };

  return (
    <DropdownPicker
      label="Action"
      data={actionOptions}
      value={selectedAction}
      setValue={setSelectedAction}
      error={null}
	  enableDynamicActionStyle={true}
    />
  );
};

export default ActionDropdown;
