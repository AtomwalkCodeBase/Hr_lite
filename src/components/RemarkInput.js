import React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';
import {colors} from '../Styles/appStyle';

const TextArea = styled.TextInput`
  border: 1px solid #ccc;
  padding: 10px;
  text-align-vertical: top;
  border-radius: 8px;
  font-size: 16px;
  width: 100%;
`;

const Label = styled.Text`
  font-size: 16px;
  margin-top: 15px;
  margin-bottom: 5px;
`;

const RemarksInput = ({ error, remark, setRemark, placeholder = "Remark" }) => {
  return (
    <>
      <Label>Remarks :</Label>
      <TextArea
        placeholder={placeholder}
        value={remark}
        onChangeText={setRemark}
        multiline
        numberOfLines={4}
      />
      {error && (
        <Text style={{ marginTop: 7, color: colors.red, fontSize: 12 }}>
          {error}
        </Text>
      )}
    </>
  );
};

export default RemarksInput;
