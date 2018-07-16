
//Friend Profile Screen

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

import Colors from './../Utils/Colors';
import Fonts from './../Utils/Fonts';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';
import HeaderStyle from './../Utils/HeaderStyle';
import Stars from 'react-native-stars';

const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
var moment = require('moment');


const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class FriendProfileScreen extends Component{

  constructor(props) {
    super(props);
    this.state={
      frndName:'',
      frndEmail:'',
      frndImage:'placeholder_img',
    }
  }


  //Life Cycle Methods
  componentWillMount()
  {

  }
  componentDidMount()
  {
    AsyncStorage.setItem(Strings.AsyncStorage_Key_isLogin, 'success');

    AsyncStorage.getItem("isLogin").then((value) => {
      console.log("componentDidMount -> Dashboard -> AsyncStorage.getItem() : ",value);
    }).done();


    const {state} = this.props.navigation
    // console.log("Email is:-,",state.params.userFrndEmail);
    this.setState({
      frndName:state.params.userFrndName,
      frndEmail:state.params.userFrndEmail,
      frndImage:state.params.userFrndImg
    })
    var user = firebase.auth().currentUser;

    if (user) {
      // User is signed in.
      console.log("currentUser : ",user.uid,user.email);
    } else {
      // No user is signed in.
    }
  }

  static navigationOptions = ({navigation, screenProps}) => {
      const params = navigation.state.params || {};
     return {
           title:Strings.profile,
           headerStyle:{ backgroundColor: Colors.header_red,borderBottomWidth: 0,shadowColor: 'transparent',elevation:0,marginTop: (Platform.OS==='android')?20:0},
           headerTitleStyle:HeaderStyle.titleCenter,

       }
    }


_onClickSendCoins()
{
      const {state} = this.props.navigation
      this.props.navigation.navigate("SendCoins_Main",{userFrndName:this.state.frndName,userFrndId:state.params.userFrndId})
}
  //Main View Rendering

  render(){
    return(
        <View style={styles.container}>

              <MyStatusBar backgroundColor={Colors.header_red} barStyle="dark-content" hidden={false}/>

              <View style={{flex:3,borderWidth:0}}>
                      <ImageBackground source={{uri:'shape_red_top'}} resizeMode="contain" style={{flex:3}}>

                      </ImageBackground>
              </View>
              <View style={{flex:7}}>

                    <View style={{flex:2}}>


                         <View style={{flex:0.5,flexDirection: 'row',alignItems:  'center',justifyContent:  'center'  }}>

                            <View style={[styles.avatarSmall]}>
                                    <Image style={styles.avatarSmall} source={{uri:this.state.frndImage}} />
                              </View>



                        </View>
                        <View style={{flex:0.7}}>
                        </View>
                        <View style={{flex:1}}>
                            <View style={{alignItems:  'center' }}>
                                  <Text style={styles.username_text}>{this.state.frndName}</Text>
                                   <Text style={styles.achivement_text}>{' '}</Text>

                            </View>
                        </View>

                      <View style={{flex:0.8}}>
                        </View>


                  </View>

                  <View style={{flex:5,backgroundColor:Colors.theme_background,}}>
                      <View style={{flex:0.5}}>
                      </View>
                       <View style={{flex:0.5}}>
                          <View style={{alignItems: 'center' }}>
                             <Text style={styles.email_lbl}>{Strings.email}</Text>
                          </View>
                          <View style={{alignItems: 'center' }}>
                             <Text style={styles.email}>{this.state.frndEmail}</Text>
                          </View>
                      </View>
                       <View style={{flex:1}}>
                      </View>
                       <View style={{flex:1.5}}>
                            <View style={{flex:1,borderWidth:0,alignItems:'center'}}>
                        <TouchableOpacity style={{marginTop:10}} onPress={()=>this._onClickSendCoins()}>
                          <ImageBackground source={{uri:'btn_signup_big'}}  style={{height:(DeviceInfo.getModel() === ModelIphoneX)?100:(DeviceInfo.getModel() === 'iPhone 6')?110:(DeviceInfo.getModel() === 'iPhone 6 Plus')?110:90,width:(DeviceInfo.getModel() === ModelIphoneX || DeviceInfo.getModel() === 'iPhone 8 Plus')?350:(DeviceInfo.getModel() === 'iPhone 6')?300:(DeviceInfo.getModel() === 'iPhone 6 Plus')?300:(Platform.OS==='android')?300:250}}>
                                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                  <Text style={{fontFamily:Fonts.regular,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:18,color:Colors.white}}>Send coins</Text>
                                </View>
                          </ImageBackground>
                       </TouchableOpacity>
                  </View>

                      </View>
                       <View style={{flex:2}}>
                      </View>

                  </View>


              </View>

         </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
   flex: 10,
   marginTop: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?-120:(DeviceInfo.getModel() === 'iPhone X')?-180:-150,
   backgroundColor:'rgb(66,91,99)'
 },
 statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor:'#79B45D',
    height: APPBAR_HEIGHT,
  },
  content: {
    flex: 1,
    backgroundColor: '#33373B',
  },
 profile_image:{
  height: 60,
  width:60,
 },
 achivement_logo:
 {
    height: 40,
    width:40,
 },
 achivement_text:{
  fontSize: 20,
  fontFamily:Fonts.SFU_LIGHT,
  color:Colors.greylightOpacity,

 },
 username_text:{
  fontSize: 22,
  fontFamily:Fonts.regular,
  color:Colors.white,

 },
 email_lbl:{
  fontSize: 20,
  fontFamily:Fonts.regular,
  color:Colors.header_red,
 },
 email:{
  fontSize: 20,
  fontFamily:Fonts.regular,
  color:Colors.orange_text,
 },
 avatarSmall:{
   borderRadius: 35,
   width: 70,
   height: 70
 },
})
module.exports = FriendProfileScreen
