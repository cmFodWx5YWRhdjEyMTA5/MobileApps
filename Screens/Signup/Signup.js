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
import {deviceHeight,deviceWidth} from './../Utils/DeviceDimensions';
import ModalDropdown from 'react-native-modal-dropdown';
const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);



class Signup extends Component{

  constructor(props) {
    super(props);
    // Create a reference with .ref() instead of new Firebase(url)
    this.userRef = firebase.database().ref().child('User');
    this.state={
      fname:'',
      lname:'',
      email:'',
      password:'',
      confpass:'',
      city:'',
      state:'',
      phone_number:'',
      isFirstname:false,
      isLastname:false,
      isPassword:false,
      isConfPassword:false,
      isPhone:false,
      stateList:
            ['Alabama','Alaska','Arizona','Arkansas','California',
            'Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia',
            'Hawaii','Idaho','Illinois','Indiana',
            'Iowa','Kansas','Kentucky','Louisiana',
            'Maine','Maryland','Massachusetts',
            'Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska'
            ,'Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina',
            'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
            'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],
      isCity:false,
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
  onFocusText(txtName)
  {
    if(txtName==="fname")
    {
      this.setState({
        isFirstname:true
      })
    }else if(txtName==="lname"){
      this.setState({
        isLastname:true
      })
    }else if(txtName==="email"){
      this.setState({
        isEmail:true
      })
    }else if(txtName==="password"){
      this.setState({
        isPassword:true
      })
    }else if(txtName==="confpass"){
      this.setState({
        isConfPassword:true
      })
    }
    else if(txtName==="city"){
      this.setState({
        isCity:true
      })
    }
    else if(txtName==="phone"){
      this.setState({
        isPhone:true
      })
    }

  }
  onBlurText(txtName)
  {
    if(txtName==="fname")
    {
      this.setState({
        isFirstname:false
      })
    }else if(txtName==="lname"){
      this.setState({
        isLastname:false
      })
    }else if(txtName==="email"){
      this.setState({
        isEmail:false
      })
    }else if(txtName==="password"){
      this.setState({
        isPassword:false
      })
    }else if(txtName==="confpass"){
      this.setState({
        isConfPassword:false
      })
    }
    else if(txtName==="city"){
      this.setState({
        isCity:false
      })
    }
    else if(txtName==="phone"){
      this.setState({
        isPhone:false
      })
    }
  }


  //email vadidation
    validateEmail = (email) =>
    {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    //FirstName
    firstNameHandle(value)
    {
      if(this.state.fname==='')
      {
        this.setState({
            fname: value.replace(/\s/g, '')
        })
      }

      else{
          var re = /[0-9!@#\$%\^\&*\)\(+=._-]+$/g;
        this.setState({
            fname: value.replace(re, '')
        })
      }
       setTimeout(()=>{
         console.log("FNAME VALUE :",this.state.fname);
       },700)
    }

    //LastName
    lastNameHandle(value)
    {
      if(this.state.lname==='')
      {
        this.setState({
            lname: value.replace(/\s/g, '')
        })
      }else{
        var re = /[0-9!@#\$%\^\&*\)\(+=._-]+$/g;
        this.setState({

            lname: value.replace(re, '')
        })
      }
       setTimeout(()=>{
         console.log("LNAME VALUE :",this.state.lname);
       },700)
    }

  onClickSignup()
  {
    // fname:'',
    // lname:'',
    // email:'',
    // password:'',
    // confpass:'',
    // city:'',
    // state:'',
    const { email, password,fname,lname,city,state,confpass,phone_number} = this.state;
    if(fname==='')
    {
      Alert.alert(Strings.gymonkee,"Please enter first name")
    }else if(lname==='')
    {
      Alert.alert(Strings.gymonkee,"Please enter last name")
    }
    else if(email==='')
    {
      Alert.alert(Strings.gymonkee,"Please enter email")
    }
    else if(!this.validateEmail(email))
    {
      Alert.alert(Strings.gymonkee,"Please enter valid email")
    }
    else if(phone_number===''){
      Alert.alert(Strings.gymonkee,"Please enter phone number")
    }
    else if(city==='')
    {
      Alert.alert(Strings.gymonkee,"Please enter city")
    }
    else if(state==='')
    {
      Alert.alert(Strings.gymonkee,"Please enter state")
    }
    else if(password==='' || confpass==='')
    {
      Alert.alert(Strings.gymonkee,"Please enter password & confirm password")
    }
    else if(password!=='' && confpass!=='')
    {
      if(password.length < 6 || confpass.length < 6)
      {
        Alert.alert(Strings.gymonkee,"Minimum password length should be 6 characters.")
      }
      else if(password===confpass)
      {
          this.props.navigation.navigate("Signup2",{fstname:fname,lstname:lname,emailadd:email,city:city,state:state,pass:password,phone_number:phone_number})
      }
      else{
        Alert.alert(Strings.gymonkee,"Password and confirm password do not match.")
      }
    }

  //  this.props.navigation.navigate("Signup2",{fstname:fname,lstname:lname,emailadd:email,city:city,state:state,pass:password})
  }
  _dropdown_state_row(rowData, rowID, highlighted) {
            console.log("CC:",rowData + rowID + highlighted);
          return (
            <TouchableHighlight underlayColor='#a5a5a4'>
              <View style={[styles.dropdown_state_row, {backgroundColor: 'white'}]}>

                <Text style={[styles.dropdown_state_text, {color: '#a5a5a4'}]}>
                  {`${rowData}`}
                </Text>
              </View>
            </TouchableHighlight>
          );
        }

        _dropdownState_onSelect(idx, value,key) {
          console.log("Selected State",value);
          // var tempArr = [...this.state.arrAllLeaveData]
          // var id = tempArr[idx].leave_type_id
          this.setState({
            state: value,
          });
          // setTimeout(()=>{
          //   console.log("Category Data is",this.state.category);
          // },1000)
        }
  //Main View Rendering
  render(){
    return(
      <ImageBackground style={{  flex: 1, width: null,height: null, justifyContent: 'center'}} source={{ uri: 'splash_bg' }}>
       <View style={{marginTop:30}}>
          <TouchableOpacity onPress={()=> this.props.navigation.goBack()}><View style={{marginRight:10,borderWidth:0,padding:(deviceHeight >600)?10:5}}><Image source={{uri: "back_arrow_white"}} style={{height: (DeviceInfo.getModel() === ModelIphoneX)?30:23, width: (DeviceInfo.getModel() === ModelIphoneX)?30:23,marginLeft:10,}} /></View></TouchableOpacity>
        </View>
        <View style={{ flex: 2, borderWidth: 0, alignItems: 'center', padding:40 }}>
          <Image source={{ uri: 'splash_logo' }} resizeMode="contain" style={{ height: (deviceHeight > 600) ? 40 : 35, width: Dimensions.get('window').width - 100, borderWidth: 0 }} />
        </View> 
        <View style={{flex:7,borderWidth:0,marginTop:-40}}>
          <View style={{flex:4,borderWidth:0}}>
            <View style={{borderWidth:0,flex:1,flexDirection:'row',marginLeft:40,marginRight:40}}>
              <View style={{flex:0.5,borderBottomWidth:1,borderBottomColor:(this.state.isFirstname===true)?Colors.white_underline:Colors.darkgrey}}>
                  <TextInput
                      placeholder='First Name'
                      style={{fontFamily:Fonts.regular,fontSize:(Platform.OS==='android')?16:15,color:Colors.white,borderWidth:0,paddingTop:5,paddingBottom:5,marginLeft:5,marginTop:(Platform.OS==='android')?0:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?0:8,flex:1}}
                      ref='fname'
                      placeholderTextColor="rgb(241, 248, 247)"
                      underlineColorAndroid='transparent'
                      onChangeText={(text) => this.firstNameHandle(text)}
                      value={this.state.fname}
                      onFocus={()=>this.onFocusText("fname")}
                      onBlur={()=>this.onBlurText("fname")}
                      returnKeyType="next"
                      onSubmitEditing={() => this.refs['lname'].focus()}
                  />
              </View>
              <View style={{flex:0.1}} />
              <View style={{flex:0.5,borderBottomWidth:1,borderBottomColor:(this.state.isLastname===true)?Colors.white_underline:Colors.darkgrey}}>
                  <TextInput
                      placeholder='Last Name'
                      style={{fontFamily:Fonts.regular,fontSize:(Platform.OS==='android')?16:15,color:Colors.white,borderWidth:0,paddingTop:5,paddingBottom:5,marginLeft:5,marginTop:(Platform.OS==='android')?0:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?0:8,flex:1}}
                      ref='lname'
                      placeholderTextColor="rgb(241, 248, 247)"
                      underlineColorAndroid='transparent'
                      onChangeText={(text) => this.lastNameHandle(text)}
                      value={this.state.lname}
                      onFocus={()=>this.onFocusText("lname")}
                      onBlur={()=>this.onBlurText("lname")}
                      returnKeyType="next"
                      onSubmitEditing={() => this.refs['email'].focus()}
                  />
              </View>
            </View>
            <View style={{flex:0.5}} />
            <View style={{flex:1,borderBottomWidth:1,borderBottomColor:(this.state.isEmail===true)?Colors.white_underline:Colors.darkgrey,marginLeft:40,marginRight:40}}>
              <TextInput
                placeholder='Email'
                style={{fontFamily:Fonts.regular,fontSize:(Platform.OS==='android')?16:15,color:Colors.white,borderWidth:0,paddingTop:5,paddingBottom:5,marginLeft:5,marginTop:(Platform.OS==='android')?0:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?0:8,flex:1}}
                ref='email'
                keyboardType="email-address"
                placeholderTextColor="rgb(241, 248, 247)"
                underlineColorAndroid='transparent'
                onChangeText={(text) => this.setState({email: text})}
                value={this.state.email}
                onFocus={()=>this.onFocusText("email")}
                onBlur={()=>this.onBlurText("email")}
                returnKeyType="next"
                onSubmitEditing={() => this.refs['phone'].focus()}
              />
            </View>
            <View style={{flex:0.5}}/>
            <View style={{flex:1,borderBottomWidth:1,borderBottomColor:(this.state.isPhone===true)?Colors.white_underline:Colors.darkgrey,marginLeft:40,marginRight:40}}>
                <TextInput
                    placeholder='Phone Number'
                    style={{fontFamily:Fonts.regular,fontSize:(Platform.OS==='android')?16:15,color:Colors.white,borderWidth:0,paddingTop:5,paddingBottom:5,marginLeft:5,marginTop:(Platform.OS==='android')?0:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?0:8,flex:1}}
                    ref='phone'
                    keyboardType="numeric"
                    placeholderTextColor="rgb(241, 248, 247)"
                    underlineColorAndroid='transparent'
                    onChangeText={(text) => this.setState({phone_number: text})}
                    value={this.state.phone_number}
                    onFocus={()=>this.onFocusText("phone")}
                    onBlur={()=>this.onBlurText("phone")}
                    returnKeyType="next"
                    onSubmitEditing={() => this.refs['city'].focus()}
                />
            </View>
            <View style={{flex:0.5}}/>
            <View style={{borderWidth:0,flex:1,flexDirection:'row',marginLeft:40,marginRight:40}}>
                <View style={{flex:0.5,borderBottomWidth:1,borderBottomColor:(this.state.isCity===true)?Colors.white_underline:Colors.darkgrey}}>
                    <TextInput
                        placeholder='City'
                        style={{fontFamily:Fonts.regular,fontSize:(Platform.OS==='android')?16:15,color:Colors.white,borderWidth:0,paddingTop:5,paddingBottom:5,marginLeft:5,marginTop:(Platform.OS==='android')?0:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?0:8,flex:1}}
                        ref='city'
                        placeholderTextColor="rgb(241, 248, 247)"
                        underlineColorAndroid='transparent'
                        onChangeText={(text) => this.setState({city: text})}
                        value={this.state.city}
                        onFocus={()=>this.onFocusText("city")}
                        onBlur={()=>this.onBlurText("city")}
                        returnKeyType="next"
                        onSubmitEditing={() => this.refs['password'].focus()}
                    />
                </View>
                <View style={{flex:0.1}} />
                <View style={{flex:0.5,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?22:12,borderBottomWidth:1,borderBottomColor:(this.state.isState===true)?Colors.header_red:Colors.darkgrey}}>
                    <ModalDropdown
                        ref={el => this._dropdown_state = el}
                        textStyle={styles.dropdown_state_text}
                        dropdownStyle={styles.dropdown_state_style}
                        dropdownTextStyle={styles.dropdown_state_text}
                        options={this.state.stateList}
                        defaultValue='State'
                        renderRow={this._dropdown_state_row.bind(this)}
                        onSelect={(idx, value) => this._dropdownState_onSelect(idx, value)}
                        value={this.state.state}
                        //renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this._dropdown_2_renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
                        />
                </View>
            </View>
            <View style={{flex:0.5}}/>
            <View style={{flex:1,borderBottomWidth:1,borderBottomColor:(this.state.isPassword===true)?Colors.white_underline:Colors.darkgrey,marginLeft:40,marginRight:40}}>
                <TextInput
                    placeholder='Password'
                    style={{fontFamily:Fonts.regular,fontSize:(Platform.OS==='android')?16:15,color:Colors.white,borderWidth:0,paddingTop:5,paddingBottom:5,marginLeft:5,marginTop:(Platform.OS==='android')?0:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?0:8,flex:1}}
                    ref='password'
                    placeholderTextColor="rgb(241, 248, 247)"
                    underlineColorAndroid='transparent'
                    onChangeText={(text) => this.setState({password: text})}
                    value={this.state.password}
                    onFocus={()=>this.onFocusText("password")}
                    onBlur={()=>this.onBlurText("password")}
                    secureTextEntry={true}
                    returnKeyType="next"
                    onSubmitEditing={() => this.refs['confpass'].focus()}
                />
            </View>
            <View style={{flex:0.5}}/>
            <View style={{flex:1,borderBottomWidth:1,borderBottomColor:(this.state.isConfPassword===true)?Colors.white_underline:Colors.darkgrey,marginLeft:40,marginRight:40}}>
                <TextInput
                    placeholder='Confirm Password'
                    style={{fontFamily:Fonts.regular,fontSize:(Platform.OS==='android')?16:15,color:Colors.white,borderWidth:0,paddingTop:5,paddingBottom:5,marginLeft:5,marginTop:(Platform.OS==='android')?0:(DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c')?0:8,flex:1}}
                    ref='confpass'
                    placeholderTextColor="rgb(241, 248, 247)"
                    underlineColorAndroid='transparent'
                    onChangeText={(text) => this.setState({confpass: text})}
                    value={this.state.confpass}
                    onFocus={()=>this.onFocusText("confpass")}
                    onBlur={()=>this.onBlurText("confpass")}
                    secureTextEntry={true}
                />
            </View>
          </View>
          <View style={{flex:0.5,borderWidth:0}}/>
          <View style={{flex:1,borderWidth:0,alignItems:'center'}}>
            <TouchableOpacity onPress={()=>this.onClickSignup()}>
              <Image source={ require('../../assets/SignUp/02.png') }  style={{height:(deviceHeight >600)?100:80,width:(deviceHeight >600)?300:250}} resizeMode="contain"/>
            </TouchableOpacity>
          </View>
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
  dropdown_state_text: {

  fontSize:(Platform.OS==='android')?16:15,
  color: Colors.white,
  textAlignVertical: 'center',
  fontFamily:Fonts.regular,
  borderWidth:0
},
dropdown_default_text: {

fontSize:(Platform.OS==='android')?16:15,
color: 'rgb(241, 248, 247)',
textAlignVertical: 'center',
fontFamily:Fonts.regular,
borderWidth:0
},
dropdown_state_style: {
  width: 160,
  //flex:1,
  marginTop:-10,
  paddingHorizontal: 7,
  flexDirection:'row',
  borderColor: '#a5a5a4',
  borderWidth: 1,
  marginLeft:-20,
},

dropdown_state_row:{

    width:160,
    height:30,
    justifyContent:'center'
},
colorBlack:{
  color:Colors.black,
}
})
module.exports = Signup
