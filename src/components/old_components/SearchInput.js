import React, {useState} from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import { colors } from '../Styles/appStyle';
import Feather from 'react-native-vector-icons/Feather';
const SearchInput = ({
  label,
  serachFilter,
}) => {
  
  const [serachText, setSearchText] = useState('');
  const handleOnChange = (text) => {
    serachFilter(text);
    setSearchText(text)
  };    

  return (
    <View
          style={style.inputContainer}>
          <Feather
            name="search"
            size={25}
            color={colors.grey}
            style={{marginRight: 10}}
          />
          <TextInput style={{width:"100%"}} placeholder={label}
                     value={serachText}
                     onChangeText={(text) => handleOnChange(text)}
            />

    </View>

  );
};

const style = StyleSheet.create({
  inputContainer: {
    height: 50,
    flexDirection: 'row',
    borderColor:colors.navyblue,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    margin:10,
    padding:10,
    
  },
});

export default SearchInput