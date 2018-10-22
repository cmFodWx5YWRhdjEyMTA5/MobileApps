//Forgot password
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
import HeaderStyle from './../Utils/HeaderStyle';
import Fonts from './../Utils/Fonts';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';
import Spinner from 'react-native-loading-spinner-overlay';
import {deviceHeight,deviceWidth} from './../Utils/DeviceDimensions';
const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);



class Forgotpassword extends Component{

  constructor(props) {
    super(props);

    this.state={
      email:'',
      isEmail:false,
      loader:false,
    }
  }

  //Life Cycle Methods
  componentWillMount()
  {

  }
  componentDidMount()
  {

  }

  //User Define Functions
  //loader
  loader()
  {
   if(this.state.loader)
     {
         return(
             <View>
                  <Spinner visible={this.state.loader} textContent={""} textStyle={{color: Colors.header_red}} color={Colors.header_red}/>
             </View>
        )
     }
  }

  onFocusText(txtName)
  {
    if(txtName==="email")
    {
      this.setState({
        isEmail:true
      })
    }
  }
  onBlurText(txtName)
  {
    if(txtName==="email")
    {
      this.setState({
        isEmail:false
      })
    }
  }
  //email vadidation
    validateEmail = (email) =>
    {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

  onClickSend()
  {
    if(this.state.email==='')
    {
      Alert.alert(Strings.gymonkee,"Please enter email");

    }
    else if(!this.validateEmail(this.state.email))
    {
      Alert.alert(Strings.gymonkee,"Please enter valid email")
    }

    else{
                this.setState({loader:true})


                var userRef=firebase.database().ref('User');
                userRef.on('value', (snapshot) => {
                    console.log("UserSnapshot",snapshot.val());
                   // Alert.alert("UserSnapshot",snapshot.val())
                  })



                firebase.auth().sendPasswordResetEmail(this.state.email).then((user)=>{

                      this.setState({loader:false})
                      setTimeout(()=>{
                          Alert.alert(Strings.gymonkee,"Please check your email.")
                      },500)
                }).catch((error)=>{
                      this.setState({loader:false})
                      console.log("Forgot Pass Error",error);
                      setTimeout(()=>{
                          Alert.alert(Strings.gymonkee,error.message);
                      },500)
                })
    }
  }

  //Main View Rendering
  render(){
    return(
      <ImageBackground
        style={{ backgroundColor: '#ccc', flex: 1, width: null,height: null, justifyContent: 'center'}} 
        source={{ uri: 'splash_bg' }} >
        <View style={{marginTop:30}}>
          <TouchableOpacity onPress={()=> this.props.navigation.goBack()}><View style={{marginRight:10,borderWidth:0,padding:(deviceHeight >600)?10:5}}><Image source={{uri: "back_arrow_white"}} style={{height: (DeviceInfo.getModel() === ModelIphoneX)?30:23, width: (DeviceInfo.getModel() === ModelIphoneX)?30:23,marginLeft:10,}} /></View></TouchableOpacity>
        </View>
        <View style={{ flex: 2, borderWidth: 0, alignItems: 'center', padding:40 }}>
          <Image source={{ uri: 'splash_logo' }} resizeMode="contain" style={{ height: (deviceHeight > 600) ? 40 : 35, width: Dimensions.get('window').width - 100, borderWidth: 0 }} />
        </View> 
        <View style={{alignItems:'center'}}>
          {this.loader()}
        </View>
        <MyStatusBar backgroundColor={Colors.header_red} barStyle="light-content" hidden={false}/>
        <View style={{flex:6,borderWidth:0}}>
          <View style={{flex:4,borderWidth:0}}>
            <View style={{ borderWidth:0,justifyContent:'center',alignItems:'center'}}>
              <Text style={{fontFamily:Fonts.regular,color:Colors.white,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?22:(DeviceInfo.getModel() === 'iPhone SE')?16:19}}>Enter your email address and</Text>
              <Text style={{fontFamily:Fonts.regular,color:Colors.white,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?22:(DeviceInfo.getModel() === 'iPhone SE')?16:19}}>we will send you</Text>
              <Text style={{fontFamily:Fonts.regular,color:Colors.white,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?22:(DeviceInfo.getModel() === 'iPhone SE')?16:19}}>a link to reset your password</Text>
            </View>
            <View style={{flex:0.3}} />
            <View style={{flex:1,borderBottomWidth:1,borderBottomColor:(this.state.isEmail===true)?Colors.orange_text:Colors.white_underline,marginLeft:50,marginRight:50}}>
              <TextInput
                placeholder='E-mail'
                style={{fontSize:15,color:Colors.orange_text,borderWidth:0,marginLeft:5,marginTop:12,flex:1}}
                ref='email'
                placeholderTextColor="rgb(241, 248, 247)"
                underlineColorAndroid='transparent'
                onChangeText={(text) => this.setState({email: text})}
                value={this.state.email}
                keyboardType="email-address"
                onFocus={()=>this.onFocusText("email")}
                onBlur={()=>this.onBlurText("email")}
              />
            </View>
            <View style={{flex:0.3,marginLeft:50,marginRight:50,alignItems:'flex-end',marginTop:5}}>

            </View>
          </View>
          <View style={{flex:2,borderWidth:0,justifyContent:'center',alignItems:'center'}}>
            <TouchableOpacity onPress={()=>this.onClickSend()}>
              <ImageBackground source={ require('../../assets/SignIn/03.png') }  style={{height:(deviceHeight >600)?110:80,width:(deviceHeight >600)?320:250}} resizeMode="contain">
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{fontFamily:Fonts.regular,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:18,color:Colors.white}}>Send</Text>
                </View>
              </ImageBackground>
           </TouchableOpacity>
          </View>
          <View style={{flex:2,borderWidth:0}}/>
        </View>
       </ImageBackground>
    )
  }

}
const styles = StyleSheet.create({
  container: {
   flex: 10,
   backgroundColor:Colors.theme_background,
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
})
module.exports = Forgotpassword
