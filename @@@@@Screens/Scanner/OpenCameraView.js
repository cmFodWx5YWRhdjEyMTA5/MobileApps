//OpenCameraView
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
import HeaderStyle from './../Utils/HeaderStyle';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';
import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { GoogleSignin } from 'react-native-google-signin';
import Spinner from 'react-native-loading-spinner-overlay';
import { RNCamera } from 'react-native-camera';

const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class OpenCameraView extends Component{

  constructor(props) {
    super(props);
    this.state={
      loader:false,
      gym_id:'',
      user_id:'',
      isScan:false,
    }
  }

  static navigationOptions = ({navigation, screenProps}) => {
       const params = navigation.state.params || {};
      return {
            title:'',
            gesturesEnabled:true,
            headerStyle:{ backgroundColor: Colors.theme_background,borderBottomWidth: 0,shadowColor: 'transparent',elevation:0,marginTop: (Platform.OS==='android')?20:0},
            headerTitleStyle:HeaderStyle.titleCenter_black,
            headerLeft: <TouchableOpacity onPress={()=> navigation.goBack()}><View style={{marginRight:10}}><Image source={{uri: "back_arrow_white"}} style={{height: (DeviceInfo.getModel() === ModelIphoneX)?30:23, width: (DeviceInfo.getModel() === ModelIphoneX)?30:23,marginLeft:10,}} /></View></TouchableOpacity>
          }
     }

  //Life Cycle Methods
  componentWillMount()
  {

  }
  componentDidMount()
  {
      const {state} = this.props.navigation;
      console.log("Gym Code",state.params.gymBarCode);
      AsyncStorage.getItem("gym_id").then((value) => {
        console.log("Gym_Id: ",value);
        this.setState({
          gym_id:value
        })
      }).done();

      AsyncStorage.getItem("user_id").then((value) => {
        console.log("user_id: ",value);
        this.setState({
          user_id:value
        })
      }).done();
  }

  //loader
  loader()
  {
   if(this.state.loader)
     {
         return(
             <View>
                  <Spinner visible={this.state.loader} textContent={""} textStyle={{color: '#3e4095'}} color={Colors.header_red}/>
             </View>
        )
     }
  }

  gotoNext()
  {

  }

  onBarCodeGet(data)
  {
    // Alert.alert(Strings.gymonkee,JSON.stringify(data))
    const {state} = this.props.navigation;
    console.log("Barcode Data:",data);
    if(this.state.isScan===false)
    {
      this.setState({
        isScan:true
      })
      if(data.data===state.params.gymBarCode)
      {
        NetInfo.isConnected.fetch().done((isConnected) => {
                          this.setState({ netStatus: isConnected });

                              if(isConnected)
                              {
                                  this.setState({loader:true});
                                    var url = Strings.base_URL + 'checkInGym?gymId='+this.state.gym_id+'&userId='+this.state.user_id
                                    console.log("checkInGym url",url);
                                    fetch(url, {
                                      method: 'GET',
                                    }).then((response) => response.json())
                                        .then((responseData) => {
                                         //Alert.alert("KK",JSON.stringify(data))
                                          this.setState({loader:false});
                                          console.log("Response:",responseData);
                                          if(responseData.status===1)
                                          {
                                              AsyncStorage.setItem("checkInId_User",responseData.data.checkInId_User);
                                              AsyncStorage.setItem("checkInId_Gym",responseData.data.checkInId_Gym);
                                              console.log("checkInId_User",responseData.data.checkInId_User);
                                              console.log("checkInId_Gym",responseData.data.checkInId_Gym);
                                              setTimeout(()=>{
                                                Alert.alert(Strings.gymonkee,"Successfully checked in to the gym",
                                                [
                                                    {text:'OK',onPress:()=> {this._navigateToOtherScreen('Rating')}}
                                                ],
                                                { cancelable: false }
                                              )
                                            },700)
                                              // this.props.navigation.navigate('TermsAndConditions');
                                          }
                                          else {
                                              Alert.alert(Strings.gymonkee,responseData.message);
                                          }


                                        }).catch((error) => {
                                            this.setState({loader:false});
                                            console.log("Error is:",error);
                                              // setTimeout(()=>{
                                              //   Alert.alert(Strings.gymonkee,error.message);
                                              // },1000)
                                         }).done();

                          }
                  else
                  {
                    this.setState({
                      isScan:false
                    })
                      Alert.alert(Strings.gymonkee,Strings.internet_offline);
                  }
            });
      }else{
        Alert.alert(Strings.gymonkee,"Invalid barcode.")
      }
    }


  }

_navigateToOtherScreen(screen)
{
  this.props.navigation.navigate(screen);
}
  render(){
      return(
        <View style={styles.container}>
        <View style={{alignItems:'center'}}>
            {this.loader()}
        </View>
        <MyStatusBar
            backgroundColor={Colors.theme_background}
            barStyle="light-content"
          />

          <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style = {styles.preview}
              type={RNCamera.Constants.Type.back}
              onBarCodeRead={(data)=>this.onBarCodeGet(data)}
              flashMode={RNCamera.Constants.FlashMode.on}
              barCodeTypes={[RNCamera.Constants.BarCodeType.qr,RNCamera.Constants.BarCodeType.code128]}
              permissionDialogTitle={'Permission to use camera'}
              permissionDialogMessage={'We need your permission to use your camera phone'}
          >
          <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Image style={{height:(deviceHeight>=600)?250:220,width:(deviceHeight>=600)?250:220}} source={{uri:'QR_code'}} resizeMode="contain" />
          </TouchableOpacity>

          </RNCamera>
        </View>
      )
    }
}

// const barCodeTypes = Platform.select({
//     ios:['org.iso.Aztec',
//         'org.iso.Code128',
//         // 'code138' should be here, but not sure of the namespace (found in code)
//         'org.iso.Code39',
//         'org.iso.Code39Mod43',
//         'com.intermec.Code93',
//         // 'datamatrix' should be here, but not sure of the namespace (found in code)
//         'org.gs1.EAN-13',
//         'org.gs1.EAN-8',
//         // 'interleaved2of5' should be here, but not sure of the namespace (found in code)
//         // 'itf14' should be here, but not sure of the namespace (found in code)
//         'org.iso.PDF417',
//         'org.iso.QRCode',
//         'org.gs1.UPC-E'],
//     android: ['aztec',
//       'codabar',  // Not in the docs, but found in code
//       'code128',
//       'code39',
//       // 'code39mod43',  // Found in the docs but not in the code
//       'code93',
//       'datamatrix',  // When available(?), according to the docs
//       'ean13',
//       'ean8',
//       'interleaved2of5',  // When available(?), according to the docs
//       // 'itf14',  // When available(?), according to the docs, but not found in code
//       'maxicode',  // Not in the docs, but found in code
//       'pdf417',
//       'qr',
//       'rss14',  // Not in the docs, but found in code
//       'rssexpanded',  // Not in the docs, but found in code
//       'upca',
//       'upce',
//       'upceanextension']
// })

const styles = StyleSheet.create({
  container: {
   flex:1,
   backgroundColor:Colors.theme_background,
 },
 preview: {
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center'
},
 statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor:'#79B45D',
    height: APPBAR_HEIGHT,
  },
})

module.exports = OpenCameraView
