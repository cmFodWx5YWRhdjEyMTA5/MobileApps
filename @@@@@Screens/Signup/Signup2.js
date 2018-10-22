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
import {deviceHeight,deviceWidth} from './../Utils/DeviceDimensions';

import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import { Picker, DatePicker } from 'react-native-wheel-datepicker';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';
import Spinner from 'react-native-loading-spinner-overlay';

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


var minDateValue='1940';
var minFormatedDate = moment(minDateValue).toString() + '(IST)';

var maxDateValue='2004';
var maxFormatedDate = moment(maxDateValue).toString() + '(IST)';

class Signup extends Component{

  constructor(props) {
    super(props);
    this.userRef = firebase.database().ref().child('User');

    this.state={
      loader:false,
      gender:'male',
      isMaleSelected:true,
      bday:new Date(),
      bdayMain:null,
      fname:'',
      lname:'',
      email:'',
      password:'',
      confpass:'',
      phone_number:'',
      city:'',
      state:'',
      maxDatePick:moment(maxFormatedDate).toDate(),
      minDatePick:moment(minFormatedDate).toDate(),
      emergencyContactName:'',
      emergencyContactNumber:'',
      hideEmergencyContact:false,
    }
  }



static navigationOptions = ({navigation, screenProps}) => {
     const params = navigation.state.params || {};
    return {
          title:'',
          gesturesEnabled:true,
          headerStyle:{ backgroundColor: Colors.header_red,borderBottomWidth: 0,shadowColor: 'transparent',elevation:0,marginTop: (Platform.OS==='android')?20:0},
          headerTitleStyle:HeaderStyle.titleCenter,
          headerLeft: <TouchableOpacity onPress={()=> navigation.goBack()}><View style={{marginRight:10}}><Image source={{uri: "back_arrow_white"}} style={{height: (DeviceInfo.getModel() === ModelIphoneX)?30:23, width: (DeviceInfo.getModel() === ModelIphoneX)?30:23,marginLeft:10,}} /></View></TouchableOpacity>
        }
   }

   //loader
   loader()
   {
    if(this.state.loader)
      {
          return(
              <View>
                   <Spinner visible={this.state.loader} textContent={""} textStyle={{color: Colors.header_red}} color={Colors.header_red} />
              </View>
         )
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
  componentDidMount()
  {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => {this.setState({netStatus: isConnected});});

    const { state } = this.props.navigation;
    // this.props.navigation.navigate("Signup2",{fstname:fname,lstname:lname,emailadd:email,city:city,state:state,pass:password})

    this.setState({
      fname:state.params.fstname,
      lname:state.params.lstname,
      email:state.params.emailadd,
      password:state.params.pass,
      city:state.params.city,
      state:state.params.state,
      phone_number:state.params.phone_number
    })

    console.log("Param Values are:-",state.params.fstname +"::"+state.params.lstname +"::"+state.params.emailadd +"::"+state.params.pass +"::"+state.params.city +"::"+state.params.state +"::"+state.params.phone_number);
  }

  //User Define Functions
  onClickGender(gender)
  {

    if(gender==="male")
    {
        this.setState({
          isMaleSelected:true,
          gender:'male',
        })
    }else if(gender==='female')
    {
      this.setState({
        isMaleSelected:false,
        gender:'female',
      })
    }
  }

  onChangeDateData(date)
  {

    var formate_change = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');

    var today = moment(new Date(), 'DD-MM-YYYY').format('YYYY-MM-DD');

    var dateChecking = moment(formate_change,'DD-MM-YYYY').format('YYYY-MM-DD');

    console.log("Final After Change:-",formate_change);
    var isAfter = moment(formate_change).isAfter(today);

    console.log("Final IsAfter:-",isAfter);
    if(isAfter===true)
    {
      setTimeout(()=>{
          this.setState({bday: date})
          Alert.alert(Strings.gymonkee,"Please select valid date");
      },500)
    }else{
      this.setState({bday: date,bdayMain:formate_change })
    }

    // console.log("date is:",date);
    // var formattedDate = moment(date).format('DD/MM/YYYY');
    // var today = moment(new Date()).format('DD/MM/YYYY')
    // var dateChecking = moment(formattedDate).isAfter(today);
    //
    // console.log("After Format date is:",dateChecking);
    // if(dateChecking===false)
    // {
    //   this.setState({bday: date,bdayMain:formattedDate })
    // }
  }

  gotoDashboard()
  {
    //Go to dashboard if user is exist
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Home' })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  onClickDone()
  {
    const { email,password,fname,lname,city,state,gender,bdayMain,emergencyContactName,emergencyContactNumber,phone_number } = this.state;

    if(gender==='')
    {
        Alert.alert(Strings.gymonkee,"Please select gender")
    }else if(bdayMain === null){
        Alert.alert(Strings.gymonkee,"Please select date of birth")
    }    
    else{

        //api for create customer on stripe and set in firebase
        NetInfo.isConnected.fetch().done((isConnected) => {
                          this.setState({ netStatus: isConnected });
                              if(isConnected)
                              {
                                this.setState({loader:true})
                                firebase.auth().createUserWithEmailAndPassword(email, password)
                                .then((user) => {

                                  this.setState({loader:true});
                                  //https://us-central1-gymonkee-3cad2.cloudfunctions.net/createStripeCustomer?email=jaydeep.patel@bypt.n
                                    var url = Strings.base_URL + 'createStripeCustomer?email='+email
                                    console.log("checkInGym url",url);
                                    fetch(url, {
                                      method: 'GET',
                                    }).then((response) => response.json())
                                        .then((responseData) => {
                                         //Alert.alert("KK",JSON.stringify(data))

                                          console.log("Response:",responseData);
                                                  this.setState({loader:false})
                                                  setTimeout(()=>{
                                                    console.log("Response User is",user.uid);
                                                    console.log("Response UserEmail is",user.email);
                                                    var temp = this.userRef.child(user.uid)
                                                    console.log("Temp isss:",temp);
                                                    temp.set({
                                                      email: email,
                                                      phone_number:phone_number,
                                                      firstname:fname,
                                                      lastname:lname,
                                                      state:state,
                                                      city:city,
                                                      gender:gender,
                                                      birthdate:bdayMain,
                                                      stripe_cust_id:responseData.id,
                                                      coinBalance:0,
                                                      createdAt:firebase.database.ServerValue.TIMESTAMP,
                                                      createdBy:user.uid,
                                                      status:1,
                                                      updatedAt:firebase.database.ServerValue.TIMESTAMP,
                                                      updatedBy:user.uid,
                                                      lastLoginAt:firebase.database.ServerValue.TIMESTAMP,
                                                      signInMethod:'Email',
                                                      emergencyContactName:emergencyContactName,
                                                      emergencyContactNumber:emergencyContactNumber
                                                    });




                                                      AsyncStorage.setItem("birthdate",bdayMain);


                                                      AsyncStorage.setItem("city",city);


                                                      AsyncStorage.setItem("email",email);


                                                      AsyncStorage.setItem("firstname",fname);


                                                      AsyncStorage.setItem("gender",gender);

                                                      
                                                      AsyncStorage.setItem("phone_number",phone_number);
                                                      
                                                      
                                                      AsyncStorage.setItem("lastname",lname);


                                                      AsyncStorage.setItem("state",state);


                                                      AsyncStorage.setItem("profileImage",'placeholder_img');


                                                      AsyncStorage.setItem("stripe_cust_id",responseData.id);


                                                      AsyncStorage.setItem("emergencyContactName",emergencyContactName);


                                                      AsyncStorage.setItem("emergencyContactNumber",emergencyContactNumber);



                                                    this.gotoDashboard()
                                                  },500)

                                        }).catch((error) => {
                                            this.setState({loader:false});
                                            console.log("Error is:",error);
                                              // setTimeout(()=>{
                                              //   Alert.alert(Strings.gymonkee,error.message);
                                              // },1000)
                                         }).done();
                                       }).catch((error) => {
                                                 const { code, message } = error;
                                                 this.setState({loader:false})
                                                 setTimeout(()=>{
                                                    Alert.alert(Strings.gymonkee,error.message);
                                                 },500)
                                       });
                            }
                          else
                          {
                            this.setState({loader:false})
                            setTimeout(()=>{
                                Alert.alert(Strings.gymonkee,Strings.internet_offline);
                            },700)
                          }
            });


  }
}
  //Main View Rendering
  render(){
    return(
        <View style={styles.container}>
            <View style={{alignItems:'center'}}>
                {this.loader()}
            </View>
            <View style={{flex:3,borderWidth:0}}>
                <ImageBackground source={{uri:'shape_red_top'}} resizeMode="contain" style={{height:null,width:null,flex:3,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?-110:(DeviceInfo.getModel() === 'iPhone SE')?-60:-90}}>
                      <View style={{flex:3,justifyContent:'center',alignItems:'center',marginBottom:(Platform.OS==='android')?35:60}}>
                            <Image source={{uri:'logo_white'}} resizeMode="contain" style={{height:35,width:Dimensions.get('window').width-100,borderWidth:0}} />
                      </View>
                </ImageBackground>
            </View>

            <View style={{flex:7,borderWidth:0,marginTop:-50}}>
                <ScrollView>
                  <View style={{flex:2,borderWidth:0}}>
                        <View style={{flex:0.5,justifyContent:'center',alignItems:'center'}}>
                            <Text style={{fontFamily:Fonts.regular,color:Colors.header_red,fontSize:(deviceHeight >600)?25:20}}>Gender</Text>
                        </View>
                        <View style={{flex:1.5,flexDirection:'row'}}>

                            <View style={{flex:0.75,borderWidth:0}}>
                                  <TouchableOpacity onPress={()=>this.onClickGender("male")} style={{flex:1,paddingTop:10,paddingBottom:10,backgroundColor:(this.state.isMaleSelected===true)?Colors.header_red:"transparent",borderWidth:0,justifyContent:'center',alignItems:'center',margin:(deviceHeight >600)?25:20,borderRadius:40}}>
                                        <Text style={{fontFamily:Fonts.regular,marginTop:(Platform.OS==='android')?0:7,color:(this.state.isMaleSelected===true)?Colors.white:Colors.header_red,fontSize:(deviceHeight >600)?22:18}}>Male</Text>
                                  </TouchableOpacity>
                            </View>

                            <View style={{flex:0.75,borderWidth:0}}>
                                  <TouchableOpacity onPress={()=>this.onClickGender("female")} style={{flex:1,backgroundColor:(this.state.isMaleSelected===false)?Colors.header_red:"transparent",borderWidth:0,justifyContent:'center',alignItems:'center',margin:(deviceHeight >600)?25:20,borderRadius:40}}>
                                        <Text style={{fontFamily:Fonts.regular,marginTop:(Platform.OS==='android')?0:7,color:(this.state.isMaleSelected===false)?Colors.white:Colors.header_red,fontSize:(deviceHeight >600)?22:18}}>Female</Text>
                                  </TouchableOpacity>
                            </View>

                        </View>
                  </View>
                  <View style={{flex:3,borderWidth:0}}>
                        <View style={{flex:0.4,alignItems:'center'}}>
                          <Text style={{fontFamily:Fonts.regular,color:Colors.header_red,fontSize:(deviceHeight >600)?24:20}}>Date of birth</Text>
                        </View>

                        <View style={{flex:0.1}}/>
                        <View style={{flex:2.5}}>
                            <DatePicker
                              textColor="white"
                              style={{backgroundColor:'rgb(66,91,99)',justifyContent:'center'}}
                              mode="date"
                              date={this.state.bday}
                              minimumDate={this.state.minDatePick}
                              maximumDate={this.state.maxDatePick}
                              onDateChange={date => this.onChangeDateData(date)}
                            />
                        </View>

                  </View>
                  <View style={{flex:0.3}}/>
                  {(this.state.hideEmergencyContact)&&<View style={{flex:1,borderBottomWidth:0,marginLeft:40,marginRight:40,marginTop:10}}>
                      <TextInput
                          placeholder='Emergency Contact'
                          style={{fontFamily:Fonts.regular,fontSize:(Platform.OS==='android')?16:15,color:Colors.header_red,borderWidth:0,paddingTop:5,paddingBottom:5,marginTop:(Platform.OS==='android')?0:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?0:8,flex:1}}
                          ref='emergencyContactName'
                          placeholderTextColor={Colors.header_red}
                          underlineColorAndroid='transparent'
                          onChangeText={(text) => this.setState({emergencyContactName: text})}
                          value={this.state.emergencyContactName}
                          onSubmitEditing={() => this.refs['emergencyContactNumber'].focus()}
                          returnKeyType="next"

                      />
                  </View>}
                  {(this.state.hideEmergencyContact)&&<View style={{flex:1,borderBottomWidth:0,marginLeft:40,marginRight:40,marginTop:-6}}>
                      <TextInput
                          placeholder='Emergency Contact Number'
                          style={{fontFamily:Fonts.regular,fontSize:(Platform.OS==='android')?16:15,color:Colors.header_red,borderWidth:0,paddingTop:5,paddingBottom:5,marginTop:(Platform.OS==='android')?0:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?0:8,flex:1}}
                          ref='emergencyContactNumber'
                          placeholderTextColor={Colors.header_red}
                          underlineColorAndroid='transparent'
                          onChangeText={(text) => this.setState({emergencyContactNumber: text})}
                          value={this.state.emergencyContactNumber}
                          returnKeyType="done"
                          keyboardType='phone-pad'

                      />
                  </View>}
                  <View style={{flex:1.8,borderWidth:0,marginTop:0,alignItems:'center'}}>
                        <TouchableOpacity style={{marginTop:10}} onPress={()=>this.onClickDone()}>
                          <ImageBackground source={{uri:'btn_signup_big'}}  style={{height:(deviceHeight >600)?100:80,width:(deviceHeight >600)?300:250}}>
                                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                  <Text style={{fontFamily:Fonts.regular,fontSize:(DeviceInfo.getModel() === ModelIphoneX)?20:18,color:Colors.white}}>Done</Text>
                                </View>
                          </ImageBackground>
                       </TouchableOpacity>
                  </View>
                </ScrollView>
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
  labelText:{
      fontFamily:Fonts.regular,
      fontSize:(Platform.OS==='android')?16:((DeviceInfo.getModel() ==='iPhone SE') || (DeviceInfo.getModel() ==='iPhone 5s') || (DeviceInfo.getModel() ==='iPhone 5c'))?12:15,
      marginTop:20,
      color:Colors.redcolor,
      marginLeft:5,
      },
})
module.exports = Signup
