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
import Strings from './../Utils/Strings';
import * as DateUtils from './../Utils/DateUtils';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Spinner from 'react-native-loading-spinner-overlay';
import HeaderStyle from './../Utils/HeaderStyle';
const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;
var moment = require('moment');

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

class ActivityScreen extends Component{

  constructor(props) {
    super(props);
    this.state={
      loader:false,
      arrTempActivity:[],
      arrMainActivity:[],
      user_id:'',
      nullDataFlag:true,
      isShowActivity:false,
    }
  }

  static navigationOptions = ({navigation, screenProps}) => {
      const params = navigation.state.params || {};
     return {
           title:"Activity",
           header:<View><ImageBackground source={{uri:'shape_red_top'}} resizeMode="cover" style={{height:155,width:deviceWidth}}>

           <View style={{flexDirection:'row',alignItems:'center'}}>
           <TouchableOpacity onPress={()=> navigation.navigate('DrawerOpen')} style={{flex:0.1,alignItems:'center',borderWidth:0,marginTop:40,justifyContent:'center',padding:10}}><Image source={{uri: "menu_icon"}} style={{height: 20,width: 20}}/></TouchableOpacity>
           <View style={{flex:0.9,alignItems:'flex-end',justifyContent:'center',marginTop:40}}>
            <Text style={{color: '#ffffff',alignSelf: 'center',textAlign:'center',fontSize:18,justifyContent:'center',fontWeight:'400',fontFamily:Fonts.SFU_REGULAR,paddingRight:45}}>Activity</Text>
           </View>
           </View>
           </ImageBackground></View>,
           headerStyle:{ backgroundColor: Colors.header_red,borderBottomWidth: 0,shadowColor: 'transparent',elevation:0,marginTop: (Platform.OS==='android')?20:0},
           headerTitleStyle:HeaderStyle.titleCenter,
       }
    }

  //Life Cycle Methods
  componentWillMount()
  {

  }
  componentDidMount()
  {
      console.log("Height for this device:",deviceHeight);
      AsyncStorage.getItem("user_id").then((value) => {

         this.setState({user_id:value})
       }).done();

       // Alert.alert("Height",JSON.stringify(DeviceInfo.getModel()))
       setTimeout(()=>{
         this.getActivityData()
         },700)
  }

  getActivityData()
  {

    var currentUser = firebase.auth().currentUser;
    console.log("Current User Id",this.state.user_id);

    firebase.database().ref('User').child(this.state.user_id).once('value',(data)=>{
      // console.log("Data from login",data);
      var userData = data.val();
      var keys = Object.keys(userData);
        console.log("User Keys are",keys);
          //Check if check in key avaviable than only get activity data
          if(userData.hasOwnProperty('CheckIn'))
          {
              var currentUserRef = firebase.database().ref('User').child(this.state.user_id).child('CheckIn');
              // console.log("Coin Balance are",currentUserRef);
                currentUserRef.once('value',(data)=>{
                  // console.log("Data from login",data);
                  if(data.exists())
                  {
                    var userData = data.val();
                    var keys = Object.keys(userData);

                    console.log("Keys are",keys);
                    if(keys.length>0)
                    {
                      for(var i=0;i<keys.length;i++)
                      {
                          this.state.arrTempActivity.push({"key":keys[i],"data":userData[keys[i]]})
                          if(i===keys.length-1)
                          {


                            this.setState({
                                  arrMainActivity:this.state.arrTempActivity
                            })

                            setTimeout(()=>{
                                console.log("Final Main Data is:",this.state.arrMainActivity);
                            },700)
                          }
                      }
                      console.log("Keys are",keys);
                      console.log("Coin Balance are",userData.coinBalance);
                    }
                  }else{

                  }
                })
          }else{
              this.setState({isShowActivity:true })
          }



  })



  }

  //User Define Functions
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

  _goToGymDetails(gymId)
  {
    console.log("DateUtils Date",DateUtils.getDDMMMYYYYFromTimestamp(1522297469543/1000));
    //Alert.alert("Gym Data",gymId);
    firebase.database().ref('Gyms').child(gymId).once('value',(data)=>{
      // console.log("Data from login",data);
      var gymData = data.val();
      var keys = Object.keys(gymData);

      console.log("Gym Data",gymData);
      console.log("Gym Status",gymData.status);
      if(gymData.status===0)
      {
        Alert.alert(Strings.gymonkee,"Gym is not available.");
      }
      else {
        AsyncStorage.setItem('gymDetail',JSON.stringify(gymData))
        AsyncStorage.setItem('gym_id',gymId)
        // AsyncStorage.setItem('gymBarCode',arrData.gymBarCode)
        this.props.navigation.navigate('ViewGym');
      }

  })
}

  onClickSingleCheckin(index)
  {
    var arrIndexData = this.state.arrMainActivity[index]
    console.log("Single data is::",arrIndexData);

    var checkKey = arrIndexData.data.hasOwnProperty('checkInId_Gym')
    if(checkKey)
    {
      this.props.navigation.navigate('Rating',{comingFrom:'normal',comeFrom:'activity',gym_id:this.state.arrMainActivity[index].data.gymId,checkinKey:this.state.arrMainActivity[index].key,checkinGymKey:this.state.arrMainActivity[index].data.checkInId_Gym});
    }
  }

  displayActivityData()
  {
      console.log("ActivityScreen","displayActivityData");
      if(this.state.arrMainActivity.length>0)
      {
        //sort data using dateTime
        return this.state.arrMainActivity.sort((a,b) => b.data.dateTime - a.data.dateTime).map((data,index)=>{
          var isRate = data.data.hasOwnProperty('rate')

            if(isRate===true)
            {
              if(data.data.rate!==0)
              {

                  return(
                    <View>
                      <View style={{height:(deviceHeight >= 600)?120:90,borderWidth:0,marginLeft:20,marginRight:30}}>
                            <View style={{flex:1,flexDirection:'row'}}>
                                  <View style={{flex:0.2,borderWidth:0}}>
                                      <Image source={{uri:'activity_img'}} resizeMode="contain" style={{height:null,width:null,flex:1}}/>
                                  </View>

                                  <View style={{flex:0.8,borderWidth:0}}>
                                        <Text style={{fontFamily:Fonts.regular,color:'#c3243940',fontSize:(DeviceInfo.getModel() === 'iPhone 6s Plus')?20:16}}>{moment(data.data.rateAt).format("DD MMM. YYYY")}</Text>
                                        <Text style={{fontFamily:Fonts.regular,color:Colors.custom_black,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:(DeviceInfo.getModel() === 'iPhone 6s Plus')?22:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?16:18}}>
                                           You rated <Text onPress={() => this._goToGymDetails(data.data.gymId)} style={{fontFamily:Fonts.regular,color:'#c32439',fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:(DeviceInfo.getModel() === 'iPhone 6s Plus')?22:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?16:18}}>{data.data.gymName} </Text>
                                           with {data.data.rate} stars
                                        </Text>
                                  </View>
                            </View>
                            <View style={{flex:1,flexDirection:'row'}}>
                                  <View style={{flex:0.2,flexDirection:'row',borderWidth:0}}>
                                        <View style={{flex:0.5,borderRightWidth:(DeviceInfo.getModel() === ModelIphoneX || DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?0.5:1}}></View>
                                        <View style={{flex:0.5,borderRightWidth:0}}></View>
                                  </View>
                                  <View style={{flex:0.8,borderWidth:0}}></View>
                            </View>
                      </View>

                      <View style={{height:(deviceHeight >= 600)?120:90,borderWidth:0,marginLeft:20,marginRight:30}}>
                            <View style={{flex:1,flexDirection:'row'}}>
                                  <View style={{flex:0.2,borderWidth:0}}>
                                      <Image source={{uri:'activity_img'}} resizeMode="contain" style={{height:null,width:null,flex:1}}/>
                                  </View>

                                  <View style={{flex:0.8,borderWidth:0}}>
                                        <Text style={{fontFamily:Fonts.regular,color:'#c3243940',fontSize:(DeviceInfo.getModel() === 'iPhone 6s Plus')?20:16}}>{moment(data.data.dateTime).format("DD MMM. YYYY")}</Text>
                                        <Text style={{fontFamily:Fonts.regular,color:Colors.custom_black,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:(DeviceInfo.getModel() === 'iPhone 6s Plus')?22:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?16:18}}>
                                          You checked in at <Text onPress={() => this._goToGymDetails(data.data.gymId)} style={{fontFamily:Fonts.regular,color:'#c32439',fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:(DeviceInfo.getModel() === 'iPhone 6s Plus')?22:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?16:18}}>{data.data.gymName}</Text>
                                        </Text>
                                  </View>
                            </View>
                            <View style={{flex:1,flexDirection:'row'}}>
                                  <View style={{flex:0.2,flexDirection:'row',borderWidth:0}}>
                                        <View style={{flex:0.5,borderRightWidth:((DeviceInfo.getModel() === ModelIphoneX || DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c') && index!==this.state.arrMainActivity.length-1)?0.5:(index!==this.state.arrMainActivity.length-1)?1:0}}></View>
                                        <View style={{flex:0.5,borderRightWidth:0}}></View>
                                  </View>
                                  <View style={{flex:0.8,borderWidth:0}}></View>
                            </View>
                      </View>
                  </View>
                  )
              }else{
                  return(
                      <View style={{height:(deviceHeight >= 600)?120:90,borderWidth:0,marginLeft:20,marginRight:30}}>
                            <View style={{flex:1,flexDirection:'row'}}>
                                  <View style={{flex:0.2,borderWidth:0}}>
                                      <Image source={{uri:'activity_img'}} resizeMode="contain" style={{height:null,width:null,flex:1}}/>
                                  </View>

                                  <View style={{flex:0.8,borderWidth:0}}>
                                        <Text style={{fontFamily:Fonts.regular,color:'#c3243940',fontSize:(DeviceInfo.getModel() === 'iPhone 6s Plus')?20:16}}>{moment(data.data.dateTime).format("DD MMM. YYYY")}</Text>
                                        <Text style={{fontFamily:Fonts.regular,color:Colors.custom_black,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:(DeviceInfo.getModel() === 'iPhone 6s Plus')?22:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?16:18}}>
                                          You checked in at <Text onPress={() => this._goToGymDetails(data.data.gymId)} style={{fontFamily:Fonts.regular,color:'#c32439',fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:(DeviceInfo.getModel() === 'iPhone 6s Plus')?22:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?16:18}}>{data.data.gymName}</Text>
                                        </Text>
                                  </View>
                            </View>
                            <View style={{flex:1,flexDirection:'row'}}>
                                  <View style={{flex:0.2,flexDirection:'row',borderWidth:0}}>
                                        <View style={{flex:0.5,borderRightWidth:(DeviceInfo.getModel() === ModelIphoneX || DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c' && index!==this.state.arrMainActivity.length-1)?0.5:(index!==this.state.arrMainActivity.length-1)?1:0}}></View>
                                        <View style={{flex:0.5,borderRightWidth:0}}></View>
                                  </View>
                                  <View style={{flex:0.8,borderWidth:0}}></View>
                            </View>
                      </View>
                  )
              }
            }else{
                return(
                    <View style={{height:(deviceHeight >= 600)?120:90,borderWidth:0,marginLeft:20,marginRight:30}}>
                          <View style={{flex:1,flexDirection:'row'}}>
                                <View style={{flex:0.2,borderWidth:0}}>
                                    <Image source={{uri:'activity_img'}} resizeMode="contain" style={{height:null,width:null,flex:1}}/>
                                </View>

                                <View style={{flex:0.8,borderWidth:0}}>
                                      <Text style={{fontFamily:Fonts.regular,color:'#c3243940',fontSize:(DeviceInfo.getModel() === 'iPhone 6s Plus')?20:16}}>{moment(data.data.dateTime).format("DD MMM. YYYY")}</Text>
                                      <Text style={{fontFamily:Fonts.regular,color:Colors.custom_black,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:(DeviceInfo.getModel() === 'iPhone 6s Plus')?22:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?16:18}}>
                                        You checked in at <Text onPress={() => this.onClickSingleCheckin(index)} style={{fontFamily:Fonts.regular,color:'#c32439',fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:(DeviceInfo.getModel() === 'iPhone 6s Plus')?22:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?16:18}}>{data.data.gymName}</Text>
                                      </Text>
                                </View>
                          </View>
                          <View style={{flex:1,flexDirection:'row'}}>
                                <View style={{flex:0.2,flexDirection:'row',borderWidth:0}}>
                                      <View style={{flex:0.5,borderRightWidth:(index!==this.state.arrMainActivity.length-1)?1:0}}></View>
                                      <View style={{flex:0.5,borderRightWidth:0}}></View>
                                </View>
                                <View style={{flex:0.8,borderWidth:0}}></View>
                          </View>
                    </View>
                )
            }
        })
      }else{
        return(
            <View style={{flex:1,marginTop:200,alignItems:'center',borderWidth:0}}>
                {(this.state.isShowActivity===true)?<Text style={{textAlign:'center',fontSize:20,fontFamily:Fonts.medium,color:Colors.header_red+'70'}}>{Strings.activity_placeholdar}</Text>:<Text></Text>}
            </View>
          )
      }
  }

  //Main View Rendering
  render(){
    return(
      <View style={styles.container}>
      <View style={{alignItems:'center'}}>
          {this.loader()}
      </View>
          <MyStatusBar backgroundColor={Colors.header_red} barStyle="dark-content" hidden={false}/>
          <View style={{flex:2}}/>
            <View style={{flex:7,borderWidth:0}}>
                    <ScrollView>
                      {this.displayActivityData()}
                    </ScrollView>
            </View>
      </View>
    )
  }

}
const styles = StyleSheet.create({
 container:{
    flex: 10,
    marginTop: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?-120:(DeviceInfo.getModel() === 'iPhone 7' || DeviceInfo.getModel() === 'iPhone 7 Plus')?-120:-150,
    backgroundColor:Colors.theme_background,
 },

})
module.exports = ActivityScreen
