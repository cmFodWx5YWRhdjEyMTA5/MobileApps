import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image

} from 'react-native';
import Fonts from './Fonts';
//Add all common headerStyle here...
export default headerStyle = {
    title: {
        color: '#ffffff',
        alignSelf: 'center',
        fontSize:16,
        fontWeight:'400',
    },
    titleCenter: {
        color: '#ffffff',
        alignSelf: 'center',
        textAlign:'center',
        fontSize:18,
        marginRight: (Platform.OS==='ios')? 0:65,
        justifyContent:'center',
        fontWeight:'400',
        fontFamily:Fonts.SFU_REGULAR,
    },
    titleCenter_black: {
        color: 'black',
        alignSelf: 'center',
        fontSize:18,
        marginRight: (Platform.OS==='ios')? 0:65,
        justifyContent:'center',
        fontWeight:'400',
    },
    titleCenter_white: {
        color: '#ffffff',
        alignSelf: 'center',
        fontSize:18,
        marginRight: (Platform.OS==='ios')? 0:65,
        justifyContent:'center',
        fontWeight:'400',
    },
    headerLeft:{
        backgroundColor:'#000'
    }
}
