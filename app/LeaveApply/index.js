import {View } from 'react-native'
import ApplyLeave from '../../src/screens/ApplyLeave'
import { useRoute } from '@react-navigation/native';
const index = () => {
  const route = useRoute();
  const emp_data_id = route?.params?.id
  return (
    <View style={{ flex: 1,
        
        }}>
            <ApplyLeave id={emp_data_id}/>
    </View>
  )
}

export default index