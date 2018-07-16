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
  PixelRatio,
  PermissionsAndroid,

} from 'react-native';

import Colors from './../Utils/Colors';
import Fonts from './../Utils/Fonts';
import Strings from './../Utils/Strings';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Spinner from 'react-native-loading-spinner-overlay';
import HeaderStyle from './../Utils/HeaderStyle';
var moment = require('moment');



const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 50 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class TermsAndConditionsDrawer extends Component{

  constructor(props) {
    super(props);
    this.state={

    }
    // this.userRef = firebase.database().ref().child('User');
  }


  componentWillMount() {
    console.log("=====> You are in : ", this.props.navigation.state.routeName);
  }

  //Life Cycle Methods

  componentDidMount()
  {

  }

    //loader
    loader()
    {
     if(this.state.loader)
       {
           return(
               <View>
                    <Spinner visible={this.state.loader} textContent={""} textStyle={{color: '#c32439'}} color="#c32439"/>
               </View>
          )
       }
    }


  //User Define Functions

  static navigationOptions = ({navigation, screenProps}) => {
      const params = navigation.state.params || {};
     return {
           title:"Profile",
           header:<View style={{marginTop:(DeviceInfo.getModel() === 'iPhone 7')?-24:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?-28:-14,}}><ImageBackground source={{uri:'shape_red_top_without_shadow'}} resizeMode="contain" style={{height:(DeviceInfo.getModel() === ModelIphoneX)?160:150,width:deviceWidth}}>

           <View style={{flexDirection:'row',alignItems:'center'}}>
           <TouchableOpacity onPress={()=> navigation.navigate('DrawerOpen')} style={{flex:0.1,alignItems:'center',borderWidth:0,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?50:40,justifyContent:'center',padding:10}}><Image source={{uri: "menu_icon_white"}} style={styles.menu_icon} /></TouchableOpacity>
           <View style={{flex:0.9,alignItems:'flex-end',justifyContent:'center',marginTop:(DeviceInfo.getModel() === ModelIphoneX)?50:40}}>

           <Text style={{color: '#ffffff',alignSelf: 'center',textAlign:'center',fontSize:18,justifyContent:'center',fontWeight:'400',fontFamily:Fonts.SFU_REGULAR,paddingRight:50}}>Terms & Conditions</Text>
           </View>
           </View>
           </ImageBackground></View>,
           headerStyle:{ backgroundColor: Colors.header_red,borderBottomWidth: 0,shadowColor: 'transparent',elevation:0,marginTop: (Platform.OS==='android')?20:0},
           headerTitleStyle:HeaderStyle.titleCenter,

       }
    }


  render(){
    return(
        <View style={styles.container}>
            <View style={{alignItems:'center'}}>
                {this.loader()}
            </View>
                <MyStatusBar backgroundColor={Colors.header_red} barStyle="dark-content" hidden={false}/>


                  <View style={{flex:7,borderWidth:0,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?80:90}}>

                      <View style={{flex:1,marginTop:10}}>
                              <WebView
                                automaticallyAdjustContentInsets={true}
                                javaScriptEnabled={true}
                                source={{uri: 'http://www.gymonkee.com/terms-of-use/'}}
                                style={{backgroundColor: 'rgba(211, 211, 211 , 0)'}}
                              />
                        </View>


                  </View>
        </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
   flex: 10,
   marginTop: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?-120:(DeviceInfo.getModel() === 'iPhone X')?-170:-150,
   backgroundColor:Colors.theme_background,
 },
 statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor:'#79B45D',
    height: APPBAR_HEIGHT,
  },
  
menu_icon:{
    height: 20,
    width: 20,

},

})
module.exports = TermsAndConditionsDrawer
