import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableHighlight,
  WebView,
  KeyboardAvoidingView,
  Alert,
  Keyboard,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  Easing,
  AsyncStorage,
  NetInfo,
  Platform,
  StatusBar,
  SafeAreaView,
  ImageBackground,
} from 'react-native';

const ModelIphoneX = 'iPhone X';

import { NavigationActions } from 'react-navigation';
import Colors from './../Utils/Colors';
import Fonts from './../Utils/Fonts';
import DeviceInfo from 'react-native-device-info';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';

class SendCoins extends Component{

  constructor(props) {
    super(props);

  }

  //Life Cycle Methods
  componentWillMount()
  {

  }
  componentDidMount()
  {

  }

  //User Define Functions


  //Main View Rendering

  render(){
    return(
      <View style={styles.container}>

          <View style={{flex:2.5,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity onPress={()=>this.props.navigation.navigate("SendCoins_Main")}>
              <Text style={{fontFamily:Fonts.regular,fontSize:18,color:Colors.orange_text}}>Send Coins</Text>
            </TouchableOpacity>
          </View>

          <View style={{flex:2.5,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity onPress={()=>this.props.navigation.navigate("TermsAndConditions")}>
              <Text style={{fontFamily:Fonts.regular,fontSize:18,color:Colors.orange_text}}>Terms & Condition</Text>
            </TouchableOpacity>
          </View>

          <View style={{flex:2.5,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity onPress={()=>this.props.navigation.navigate("Rating")}>
              <Text style={{fontFamily:Fonts.regular,fontSize:18,color:Colors.orange_text}}>Rating</Text>
            </TouchableOpacity>
          </View>

          <View style={{flex:2.5,alignItems:'center',justifyContent:'center'}}>
            <TouchableOpacity onPress={()=>this.props.navigation.navigate("Scanner")}>
              <Text style={{fontFamily:Fonts.regular,fontSize:18,color:Colors.orange_text}}>Scanner</Text>
            </TouchableOpacity>
          </View>
      </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
   flex: 10,
   backgroundColor:Colors.theme_background,
 },
 topview:{
   flex:3,
 },
 middleview:{
   flex:4,
   alignItems:'center',
 },
 bottomview:{
   flex:3,
 },
 logo:{
   flex: 1,
   width: (Dimensions.get('window').width - 90),
   height:120,
 },

})
module.exports = SendCoins
