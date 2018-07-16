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
import Stars from 'react-native-stars';

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


class Rating extends Component{

  constructor(props) {
    super(props);
    this.state={
      rateVal:0,
      loader:false,
      gym_id:'',
      user_id:'',
      checkInId_User:'',
      checkInId_Gym:'',
      rateComment:'',
    }
  }

  static navigationOptions = ({navigation, screenProps}) => {
       const params = navigation.state.params || {};
      return {
            title:'',
            gesturesEnabled:false,
            headerStyle:{ backgroundColor: Colors.theme_background,borderBottomWidth: 0,shadowColor: 'transparent',elevation:0,marginTop: (Platform.OS==='android')?20:0},
            headerTitleStyle:HeaderStyle.titleCenter_black,
            headerLeft: <TouchableOpacity onPress={()=> params.gotoMain()}><View style={{marginRight:10}}><Image source={{uri: "back_arrow_red"}} style={{height: (DeviceInfo.getModel() === ModelIphoneX)?30:23, width: (DeviceInfo.getModel() === ModelIphoneX)?30:23,marginLeft:10,}} /></View></TouchableOpacity>
          }
     }

     //handle Internetconnection
     handleConnectionChange = (isConnected) => {
         this.setState({ netStatus: isConnected });
         console.log(`is connected: ${this.state.netStatus}`);
     }

  //Life Cycle Methods
  componentWillMount()
  {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => {this.setState({netStatus: isConnected});});
  }

  gotoDashboard()
   {
     console.log("Call Dashboard");
     const {state} = this.props.navigation;
     console.log("Rating comingFrom",state.params.comingFrom);
     if(state.params.comingFrom==='splash')
     {
       const resetAction = NavigationActions.reset({
             index: 0,
             key: null,
             actions: [NavigationActions.navigate({ routeName: 'Home' })],
           });
           this.props.navigation.dispatch(resetAction);
     }else{
       const resetAction = NavigationActions.reset({
             index:0,
             key: null,
             actions: [NavigationActions.navigate({ routeName: 'Home' })],
           });
           this.props.navigation.dispatch(resetAction);

     }
   }

  componentDidMount()
  {
    const {state} = this.props.navigation;
    this.props.navigation.setParams({
      gotoMain:this.gotoDashboard.bind(this)
    })
    this.setState({
      checkInId_User:state.params.checkinKey,
      checkInId_Gym:state.params.checkinGymKey
    });
    console.log("Rating checkInId_Gym:",state.params.checkinGymKey);
    console.log("Rating checkInId_User:",state.params.checkinKey);


    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => {this.setState({netStatus: isConnected});});

    if(state.params.comeFrom==='activity')
    {
      this.setState({
        gym_id:state.params.gym_id
      })
    }else{
      AsyncStorage.getItem("gym_id").then((value) => {
        console.log("Gym_Id: ",value);
        this.setState({
          gym_id:value
        })
      }).done();
    }


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



  onSubmit()
  {
    // const resetAction = NavigationActions.reset({
    //       index: 0,
    //       actions: [NavigationActions.navigate({ routeName: 'Dashboard' })],
    //     });
    //     this.props.navigation.dispatch(resetAction);
    if(this.state.rateVal!==0)
    {
      console.log("Gym id: state:",this.state.gym_id+"::"+this.state.rateVal);
      NetInfo.isConnected.fetch().done((isConnected) => {
                        this.setState({ netStatus: isConnected });

                            if(isConnected)
                            {
                                this.setState({loader:true});//
                                  var url = Strings.base_URL +
                                   'rateGym?gymId='+this.state.gym_id+
                                  '&userId='+this.state.user_id+
                                  '&rate='+this.state.rateVal+
                                  '&checkInId_User='+this.state.checkInId_User+
                                  '&checkInId_Gym='+this.state.checkInId_Gym+
                                  '&rateComment='+this.state.rateComment

                                  console.log("rateGym url",url);
                                  fetch(url, {
                                    method: 'GET',
                                  }).then((response) => response.json())
                                      .then((responseData) => {
                                       //Alert.alert("KK",JSON.stringify(data))
                                        this.setState({loader:false});
                                        console.log("rateGym Response:",responseData);
                                        AsyncStorage.setItem("checkInId_User",'');
                                        AsyncStorage.setItem("checkInId_Gym",'');
                                        // if(responseData.status===1)
                                        // {
                                        //   setTimeout(()=>{
                                        //         Alert.alert(Strings.gymonkee,responseData.message,
                                        //           [
                                        //             {text:"OK",onPress:()=> {this.gotoDashboard()}},
                                        //           ],
                                        //           {cancelable:false}
                                        //       )
                                        //   },700)
                                        //
                                        // }
                                        // else {
                                        //     Alert.alert(Strings.gymonkee,responseData.message);
                                        // }
                                          setTimeout(()=>{
                                                Alert.alert(Strings.gymonkee,responseData.message,
                                                  [
                                                    {text:"OK",onPress:()=> {this.gotoDashboard()}},
                                                  ],
                                                  {cancelable:false}
                                              )
                                          },700)

                                      }).catch((error) => {
                                          this.setState({loader:false});
                                          console.log("Error is:",error);
                                            setTimeout(()=>{
                                              Alert.alert(Strings.gymonkee,error.message);
                                            },1000)
                                       }).done();
                        }
                      else
                      {
                          Alert.alert(Strings.avanza,Strings.internet_offline);
                      }
          });
    }else{
        Alert.alert(Strings.gymonkee,"Please give the rate")
    }

  }
  render(){
      return(
        <View style={styles.container}>
        <MyStatusBar backgroundColor='transparent' barStyle="light-content" hidden={false}/>
        <View style={{alignItems:'center'}}>
            {this.loader()}
        </View>
        <ImageBackground style={{flex:10,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?-140:0}} source={{uri:'gym_rating'}} resizeMode="contain">

        <View style={{flex:0.5,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?180:40,marginLeft:4,borderWidth:0,justifyContent:'center'}}>
              <TouchableOpacity onPress={() =>this.gotoDashboard()}><View><Image source={{uri: "back_arrow_red"}} style={styles.back_icon} /></View></TouchableOpacity>
        </View>

          <View style={{flex:0.4,borderWidth:0}}/>

            <View style={{flex:3.5,borderWidth:0}}>
              <View style={{flex:1,borderWidth:0,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontSize:(deviceHeight >= 600)?30:25,fontFamily:Fonts.regular,color:Colors.header_red}}>Rate the Gym</Text>
              </View>

              <View style={{flex:1,borderWidth:0,alignItems:'center'}}>
                  <Text style={{fontSize:(deviceHeight >= 600)?22:18,fontFamily:Fonts.regular,color:Colors.header_red}}>You have completed your workout!!</Text>
              </View>



              <View style={{flex:1.9,borderWidth:0,justifyContent:'center'}}>
                  <View style={{flex:0.5,borderWidth:0,alignItems:'center'}}>
                      <Text style={{marginTop:10,fontSize:(deviceHeight >= 600)?25:20,fontFamily:Fonts.regular,color:Colors.header_red}}>Please rate the gym</Text>
                  </View>
                    <View style={{flex:0.4}}/>
                  <View style={{flex:0.8}}>
                      <Stars
                         half={false}
                         rating={0}
                         update={(val)=>{this.setState({rateVal: val})}}
                         spacing={4}
                         starSize={(deviceHeight >= 600)?60:45 }
                         count={5}
                         fullStar={require('./rating_fill.png')}
                         emptyStar={require('./rating_outer.png')}
                        />
                    </View>
              </View>
            </View>

            <View style={{flex:0.1}}>
            </View>
            <View style={{flex:1.3,borderWidth:1,backgroundColor: Colors.white,borderColor:Colors.header_red,marginLeft:40,marginRight:40}}>
                  <TextInput
                      style={{fontSize:15,color:Colors.header_red,borderWidth:0,flex:1,paddingHorizontal:10,textAlignVertical: "top"}}
                      placeholderTextColor="rgb(115,119,118)"
                      underlineColorAndroid='transparent'
                      onChangeText={(text) => this.setState({rateComment: text})}
                      value={this.state.rateComment}
                      keyboardType="default"
                      numberOfLines={3}
                      multiline={true}

                  />
            </View>
            <View style={{flex:0.4,borderWidth:0,alignItems:'center',marginTop:4}}>
              <Text style={styles.how_visit_text}>How was your visit?</Text>
            </View>

            <View style={{flex:1.8,borderWidth:0,marginTop:(Platform.OS==='android')?-20:-30}}>
              <TouchableOpacity style={{flex:(DeviceInfo.getModel() === ModelIphoneX)?2.5:2.2,height:null,width:null}} onPress={() => {this.onSubmit()}}>
                  <ImageBackground style={{flex:(DeviceInfo.getModel() === ModelIphoneX)?2.5:2.2,height:null,width:null}} source={{uri:'shape_red_bottom'}} resizeMode="stretch">
                        <View style={{flex:1,justifyContent:'center',alignItems:'center',borderWidth:0,marginTop:(Platform.OS==='android')?50:60}}>
                          <Text style={{color:Colors.white,fontFamily:Fonts.regular,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?26:(DeviceInfo.getModel() === 'iPhone 6')?24:20}}>Submit</Text>
                        </View>
                  </ImageBackground>
              </TouchableOpacity>
            </View>
        </ImageBackground>
        </View>
      )
    }
}

const styles = StyleSheet.create({
  container: {
   flex: 10,
   marginTop: (Platform.OS==='android')?-20:(DeviceInfo.getModel() === ModelIphoneX)?0:-20,
   backgroundColor:Colors.theme_background,
 },
 statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor:'#79B45D',
    height: APPBAR_HEIGHT,
  },
  back_icon:{
      height: (deviceHeight <= 600)?20:25,
      width: (deviceHeight <= 600)?20:25,
      marginLeft:10,
  },
  how_visit_text:{
    color:Colors.header_red,
    fontFamily:Fonts.regular,
    fontSize:(deviceHeight >= 600)?25:20,
    textAlign:'center'
  },
})

module.exports = Rating
