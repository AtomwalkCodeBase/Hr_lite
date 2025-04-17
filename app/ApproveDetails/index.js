import {View } from 'react-native'
import { useRoute } from '@react-navigation/native';
import ApproveClaimDetails from '../../src/screens/ApproveClaimDetails';
const index = () => {
  const route = useRoute();
  const claim_data = route?.params
//   console.log(route)
    // console.log(claim_data)
  return (
    <View style={{ flex: 1,
        
        }}>
            <ApproveClaimDetails claim_data={claim_data} />
            {/* <ApplyLeave id={emp_data_id}/> */}
    </View>
  )
}

export default index