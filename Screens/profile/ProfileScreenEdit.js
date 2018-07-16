
//profile screen edit
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
  AppState,
} from 'react-native';

import Colors from './../Utils/Colors';
import Fonts from './../Utils/Fonts';
import Strings from './../Utils/Strings';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Spinner from 'react-native-loading-spinner-overlay';
import HeaderStyle from './../Utils/HeaderStyle';
const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 50 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
import { Picker, DatePicker } from 'react-native-wheel-datepicker';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob'
var moment = require('moment');
var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;
import ModalDropdown from 'react-native-modal-dropdown';

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

var minDateValue = '1940';
var minFormatedDate = moment(minDateValue).toString() + '(IST)';

var maxDateValue = '2004';
var maxFormatedDate = moment(maxDateValue).toString() + '(IST)';


const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

class ProfileScreenEdit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      isActiveFriends: true,
      isFirstname: false,
      isLastname: false,
      isEmail: false,
      isPhone:false,
      fname: '',
      lname: '',
      email: '',
      phone_number:'',
      bday: (Platform.OS === 'ios') ? new Date() : null,
      bdayMain: null,
      user_id: '',
      avatarSource: null,
      imageFile: '',
      profileImage: 'placeholder_img',
      minDatePick: moment(minFormatedDate).toDate(),
      maxDatePick: moment(maxFormatedDate).toDate(),
      isConfirm: false,
      city: '',
      state: '',
      isState: false,
      isCity: false,
      isEmergencyContactName: false,
      isEmergencyContactNumber: false,
      emergencyContactName: '',
      emergencyContactNumber: '',
      firstTime: (Platform.OS === 'ios') ? false : true,
      stateList:
        ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
          'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
          'Hawaii', 'Idaho', 'Illinois', 'Indiana',
          'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
          'Maine', 'Maryland', 'Massachusetts',
          'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska'
          , 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
          'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
          'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
      hideEmergencyContact: false
    }
  }

  //handle Internetconnection
  handleConnectionChange = (isConnected) => {
    this.setState({ netStatus: isConnected });
    console.log(`is connected: ${this.state.netStatus}`);
  }

  //Life Cycle Methods
  componentWillMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });
  }


  componentDidMount() {
    if (Platform.OS === 'android') {
      this.setState({ loader: true })
      setTimeout(() => {
        this.setState({ loader: false })
      }, 5000)
    }
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });

    //get initial data from local
    AsyncStorage.getItem("firstname").then((value) => {
      this.setState({ fname: value })
    }).done();

    AsyncStorage.getItem("lastname").then((value) => {
      console.log("Last name Async:", value);
      if (value === null) {
        this.setState({ lname: '' })
      } else {
        this.setState({ lname: value })
      }

    }).done();

    AsyncStorage.getItem("email").then((value) => {
      this.setState({ email: value })
    }).done();

    AsyncStorage.getItem("phone_number").then((value) => {
      console.log("Phone number value:",value)
      if(value !== null){
        this.setState({ phone_number: value })
      }
    }).done();

    AsyncStorage.getItem("city").then((value) => {
      this.setState({ city: value })
    }).done();

    AsyncStorage.getItem("state").then((value) => {
      if (value === null) {
        this.setState({ state: 'state' })
      }
      else {
        this.setState({ state: value })
      }

    }).done();

    AsyncStorage.getItem("emergencyContactName").then((value) => {
      this.setState({ emergencyContactName: value })
    }).done();

    AsyncStorage.getItem("emergencyContactNumber").then((value) => {
      this.setState({ emergencyContactNumber: value })
    }).done();


    AsyncStorage.getItem("birthdate").then((value) => {

      if (value === null) {
        this.setState({
          bday: new Date(),
        })
      } else {

        // var timezone = "UTC+5.30";

        var localDate = moment.utc(value)
        var local = localDate.local()
        var date = moment(local).toString() + ' (+0530)'

        console.log("Date IST", date);
        //Fri Feb 17 1995 00:00:00 GMT+0530 (IST)
        //Tue Mar 06 2018 18:14:00 GMT+0530 (+0530)
        this.setState({
          bday: moment(date).toDate(),
          bdayMain: moment(date).toDate(),
        })
        setTimeout(() => {
          this.onChangeDateData(this.state.bday)
        }, 4000)
        console.log("Current Date From State", this.state.bday);
        console.log("AsyncStorage birthdate", date);
      }
    }).done();


    AsyncStorage.getItem("user_id").then((value) => {
      console.log("Edit Profile AsyncStorage user_id", value);
      this.setState({ user_id: value })
    }).done();

    AsyncStorage.getItem("profileImage").then((value) => {
      console.log("Edit Profile AsyncStorage profileImage", value);
      if (value == null) {
        this.setState({ profileImage: 'placeholder_img' })
      }
      else {
        this.setState({ profileImage: value })
      }

    }).done();
  }

  //loader
  loader() {
    if (this.state.loader) {
      return (
        <View>
          <Spinner visible={this.state.loader} textContent={""} textStyle={{ color: '#c32439' }} color="#c32439" />
        </View>
      )
    }
  }



  _goToProfileScreen() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'ProfileScreen', params: { comeFrom: 'profile' } })],
    });
    this.props.navigation.dispatch(resetAction);
  }

  //User Define Functions

  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: "Edit Profile",
      headerStyle: { backgroundColor: Colors.header_red, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      header: <View style={{ marginTop: (DeviceInfo.getModel() === 'iPhone 7') ? -24 : ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? -28 : -14, }}><ImageBackground source={{ uri: 'shape_red_top_without_shadow' }} resizeMode="contain" style={{ height: (DeviceInfo.getModel() === ModelIphoneX) ? 160 : 150, width: deviceWidth }}>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() =>

            navigation.dispatch(NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'ProfileScreen', params: { comeFrom: 'profile' } })],

            }))} style={{ flex: 0.1, alignItems: 'center', borderWidth: 0, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? 50 : 40, justifyContent: 'center', padding: 10 }}><Image source={{ uri: "back_arrow_white" }} style={styles.back_icon} /></TouchableOpacity>
          <View style={{ flex: 0.9, alignItems: 'flex-end', justifyContent: 'center', marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? 50 : 40 }}>

            <Text style={{ color: '#ffffff', alignSelf: 'center', textAlign: 'center', fontSize: 18, justifyContent: 'center', fontWeight: '400', fontFamily: Fonts.SFU_REGULAR, paddingRight: 30 }}>Edit Profile</Text>
          </View>
        </View>
      </ImageBackground></View>,
      headerStyle: { backgroundColor: Colors.header_red, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: HeaderStyle.titleCenter,
    }
  }


  onFocusText(txtName) {
    if (txtName === "fname") {
      this.setState({
        isFirstname: true
      })
    } else if (txtName === "lname") {
      this.setState({
        isLastname: true
      })
    } else if (txtName === "email") {
      this.setState({
        isEmail: true
      })
    }
    else if (txtName === "state") {
      this.setState({
        isState: true
      })
    }
    else if (txtName === "city") {
      this.setState({
        isCity: true
      })
    }
    else if (txtName === "emergencyContactName") {
      this.setState({
        isEmergencyContactName: true
      })
    }
    else if (txtName === "emergencyContactNumber") {
      this.setState({
        isEmergencyContactNumber: true
      })
    }
    else if (txtName === "phone") {
      this.setState({
        isPhone: true
      })
    }


  }
  onBlurText(txtName) {
    if (txtName === "fname") {
      this.setState({
        isFirstname: false
      })
    } else if (txtName === "lname") {
      this.setState({
        isLastname: false
      })
    } else if (txtName === "email") {
      this.setState({
        isEmail: false
      })
    }
    else if (txtName === "state") {
      this.setState({
        isState: false
      })
    }
    else if (txtName === "city") {
      this.setState({
        isCity: false
      })
    }
    else if (txtName === "emergencyContactName") {
      this.setState({
        isEmergencyContactName: false
      })
    }
    else if (txtName === "emergencyContactNumber") {
      this.setState({
        isEmergencyContactNumber: false
      })
    }
    else if (txtName === "phone") {
      this.setState({
        isPhone: false
      })
    }
  }

  onChangeDateData(date) {
    console.log("Date iS::", date);
    console.log("New Date iS::", new Date());
    var formate_change = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');

    var today = moment(new Date(), 'DD-MM-YYYY').format('YYYY-MM-DD');

    var dateChecking = moment(formate_change, 'DD-MM-YYYY').format('YYYY-MM-DD');

    var isAfter = moment(formate_change).isAfter(today);

    console.log("Final IsAfter:-", isAfter);
    if (isAfter === true) {

      var date = moment(this.state.bday).toString() + '(IST)'
      setTimeout(() => {
        this.setState({
          bday: moment(date).toDate()
        })
        Alert.alert(Strings.gymonkee, "Please select valid date");
      }, 500)
    } else {
      if (Platform.OS === 'android') {
        if (this.state.firstTime) {

          AsyncStorage.getItem("birthdate").then((value) => {
            if (value === null) {
              this.setState({
                bday: new Date(),
              })
            } else {
              var date = moment(value).toString() + '(IST)'
              console.log("All Date isss:", moment(date).toDate());
              this.setState({
                bday: moment(date).toDate(),
                bdayMain: moment(date).toDate(),
                firstTime: false
              })
              this.showDatePicker()
            }
          }).done();

        } else {
          this.setState({ bday: date, bdayMain: formate_change })
          this.showDatePicker()
        }
      } else {
        this.setState({ bday: date, bdayMain: formate_change })
        this.showDatePicker()
      }

      setTimeout(() => {
        console.log("dateee from State", this.state.bday);
      }, 800)
    }
  }

  //FirstName
  firstNameHandle(value) {
    if (this.state.fname === '') {
      this.setState({
        fname: value.replace(/\s/g, '')
      })
    }

    else {
      var re = /[0-9!@#\$%\^\&*\)\(+=._-]+$/g;
      this.setState({
        fname: value.replace(re, '')
      })
    }
    setTimeout(() => {
      console.log("FNAME VALUE :", this.state.fname);
    }, 700)
  }

  //LastName
  lastNameHandle(value) {
    if (this.state.lname === '') {
      this.setState({
        lname: value.replace(/\s/g, '')
      })
    } else {
      var re = /[0-9!@#\$%\^\&*\)\(+=._-]+$/g;
      this.setState({

        lname: value.replace(re, '')
      })
    }
    setTimeout(() => {
      console.log("LNAME VALUE :", this.state.lname);
    }, 700)
  }

  //City
  cityHandle(value) {
    if (this.state.city === '') {
      this.setState({
        city: value.replace(/\s/g, '')
      })
    } else {
      this.setState({
        city: value
      })
    }
    setTimeout(() => {
      console.log("FNAME VALUE :", this.state.city);
    }, 700)
  }

  //State
  stateHandle(value) {
    if (this.state.state === '') {
      this.setState({
        state: value.replace(/\s/g, '')
      })
    } else {
      this.setState({
        state: value
      })
    }
    setTimeout(() => {
      console.log("FNAME VALUE :", this.state.state);
    }, 700)
  }

  ////City
  contactNameHandle(value) {
    if (this.state.emergencyContactName === '') {
      this.setState({
        emergencyContactName: value.replace(/\s/g, '')
      })
    } else {
      this.setState({
        emergencyContactName: value
      })
    }
    setTimeout(() => {
      console.log("FNAME VALUE :", this.state.emergencyContactName);
    }, 700)
  }

  //City
  contactNumberHandle(value) {
    if (this.state.emergencyContactNumber === '') {
      this.setState({
        emergencyContactNumber: value.replace(/\s/g, '')
      })
    } else {
      this.setState({
        emergencyContactNumber: value
      })
    }
    setTimeout(() => {
      console.log("FNAME VALUE :", this.state.emergencyContactNumber);
    }, 700)
  }
  validateForAphabatic = (value) => {
    var re = /^[a-zA-Z\b]+$/;
    return re.test(value);
  };

  _onClickConfirm() {
    console.log("Onclick done get data",this.state.phone_number)
    this.setState({ isConfirm: true })
    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({ netStatus: isConnected });

      if (isConnected) {
        console.log("this.state.user_id", this.state.user_id);
        //with image url
        if (this.state.profileImage !== 'placeholder_img') {
          if (this.state.imageFile !== '') {
            console.log("this.state.imageFile", this.state.imageFile);
            const uri = this.state.imageFile;
            const mime = 'image/png';
            console.log("const uri=this.state.imageFile", this.state.imageFile);
            return new Promise((resolve, reject) => {
              const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
              let uploadBlob = null

              const imageRef = firebase.storage().ref('userProfile').child(this.state.user_id)

              fs.readFile(uploadUri, 'base64')
                .then((data) => {
                  return Blob.build(data, { type: `${mime};BASE64` })
                })
                .then((blob) => {
                  uploadBlob = blob
                  return imageRef.put(blob, { contentType: mime })
                })
                .then(() => {
                  uploadBlob.close()
                  return imageRef.getDownloadURL()
                })
                .then((url) => {
                  console.log("Url", url);
                  this.setState({
                    profileImage: url
                  })
                  const { fname, lname, bdayMain, state,phone_number } = this.state;

                  var CurrentuserId = firebase.database().ref('User').child(this.state.user_id);
                  if (fname === '') {
                    this.setState({ isConfirm: false })
                    Alert.alert(Strings.gymonkee, "Please enter first name")
                  }
                  else if (!this.validateForAphabatic(fname)) {
                    this.setState({ isConfirm: false })
                    Alert.alert(Strings.gymonkee, "Please enter valid first name")
                  }
                  else if (state === 'state') {
                    this.setState({ isConfirm: false })
                    Alert.alert(Strings.gymonkee, "Please select state")
                  }
                  // else if(lname==='')
                  // {
                  //   this.setState({isConfirm:false})
                  //   Alert.alert(Strings.gymonkee,"Please enter last name")
                  // }
                  // else if(bdayMain===null)
                  // {
                  //   this.setState({isConfirm:false})
                  //   Alert.alert(Strings.gymonkee,"Please select date")
                  // }
                  else {
                    console.log("this.state.emergencyContactName", this.state.emergencyContactName);

                    // if (this.state.emergencyContactName !== null || this.state.emergencyContactNumber !== null) {
                    //   CurrentuserId.update({ firstname: this.state.fname, lastname: this.state.lname, birthdate: this.state.bday, profileImage: this.state.profileImage, emergencyContactName: (this.state.emergencyContactName !== null) ? this.state.emergencyContactName : '', emergencyContactNumber: (this.state.emergencyContactNumber !== null) ? this.state.emergencyContactNumber : '', updatedAt: firebase.database.ServerValue.TIMESTAMP, updatedBy: this.state.user_id, city: this.state.city, state: this.state.state });
                    //   AsyncStorage.setItem("birthdate", this.state.bday);
                    //   AsyncStorage.setItem("firstname", this.state.fname);
                    //   AsyncStorage.setItem("lastname", this.state.lname);
                    //   AsyncStorage.setItem("profileImage", this.state.profileImage);
                    //   AsyncStorage.setItem("emergencyContactName", (this.state.emergencyContactName !== null) ? this.state.emergencyContactName : '');
                    //   AsyncStorage.setItem("emergencyContactNumber", (this.state.emergencyContactNumber !== null) ? this.state.emergencyContactNumber : '');
                    //   AsyncStorage.setItem("city", (this.state.city !== null) ? this.state.city : '');
                    //   AsyncStorage.setItem("state", (this.state.state !== null) ? this.state.state : '');
                    //   Alert.alert(Strings.gymonkee, "Profile Updated Successfully..", [{ text: 'OK', onPress: () => this._goToProfileScreen() }])
                    // } else {
                      CurrentuserId.update({ phone_number:this.state.phone_number,firstname: this.state.fname, lastname: this.state.lname, birthdate: this.state.bday, profileImage: this.state.profileImage, updatedAt: firebase.database.ServerValue.TIMESTAMP, updatedBy: this.state.user_id, city: this.state.city, state: this.state.state });
                      AsyncStorage.setItem("birthdate", this.state.bday);
                      AsyncStorage.setItem("firstname", this.state.fname);
                      AsyncStorage.setItem("lastname", this.state.lname);
                      AsyncStorage.setItem("profileImage", this.state.profileImage);
                      AsyncStorage.setItem("phone_number", (this.state.phone_number !== null) ? this.state.phone_number : '');
                      AsyncStorage.setItem("city", (this.state.city !== null) ? this.state.city : '');
                      AsyncStorage.setItem("state", (this.state.state !== null) ? this.state.state : '');
                      Alert.alert(Strings.gymonkee, "Profile Updated Successfully..", [{ text: 'OK', onPress: () => this._goToProfileScreen() }])
                    // }
                  }
                }).catch((error) => {
                  reject(error)
                })
            })
          }
          //with out selecting profile image
          else {
            const { fname, lname, bday, bdayMain, state, phone_number} = this.state;

            var CurrentuserId = firebase.database().ref('User').child(this.state.user_id);
            console.log("With out image url this.state.user_id", this.state.user_id);
            if (fname === '') {
              this.setState({ isConfirm: false })
              Alert.alert(Strings.gymonkee, "Please enter first name")
            }
            else if (!this.validateForAphabatic(fname)) {
              this.setState({ isConfirm: false })
              Alert.alert(Strings.gymonkee, "Please enter valid first name")
            }
            else if (state === 'state') {
              this.setState({ isConfirm: false })
              Alert.alert(Strings.gymonkee, "Please select state")
            }
            // else if(lname==='')
            // {
            //   this.setState({isConfirm:false})
            //   Alert.alert(Strings.gymonkee,"Please enter last name")
            // }
            // else if(bdayMain===null)
            // {
            //   this.setState({isConfirm:false})
            //   Alert.alert(Strings.gymonkee,"Please select date")
            // }
            else {
              // if (this.state.emergencyContactName !== null || this.state.emergencyContactNumber !== null) {
              //   CurrentuserId.update({ firstname: this.state.fname, lastname: this.state.lname, birthdate: this.state.bday, emergencyContactName: (this.state.emergencyContactName !== null) ? this.state.emergencyContactName : '', emergencyContactNumber: (this.state.emergencyContactNumber !== null) ? this.state.emergencyContactNumber : '', updatedAt: firebase.database.ServerValue.TIMESTAMP, updatedBy: this.state.user_id, city: this.state.city, state: this.state.state });
              //   AsyncStorage.setItem("birthdate", this.state.bday);
              //   AsyncStorage.setItem("firstname", this.state.fname);
              //   AsyncStorage.setItem("lastname", this.state.lname);
              //   AsyncStorage.setItem("emergencyContactName", (this.state.emergencyContactName !== null) ? this.state.emergencyContactName : '');
              //   AsyncStorage.setItem("emergencyContactNumber", (this.state.emergencyContactNumber !== null) ? this.state.emergencyContactNumber : '');
              //   AsyncStorage.setItem("city", (this.state.city !== null) ? this.state.city : '');
              //   AsyncStorage.setItem("state", (this.state.state !== null) ? this.state.state : '');
              //   Alert.alert(Strings.gymonkee, "Profile Updated Successfully..", [{ text: 'OK', onPress: () => this._goToProfileScreen() }])
              // } else {
                CurrentuserId.update({ phone_number:this.state.phone_number,firstname: this.state.fname, lastname: this.state.lname, birthdate: this.state.bday, updatedAt: firebase.database.ServerValue.TIMESTAMP, updatedBy: this.state.user_id, city: this.state.city, state: this.state.state });
                AsyncStorage.setItem("birthdate", this.state.bday);
                AsyncStorage.setItem("firstname", this.state.fname);
                AsyncStorage.setItem("lastname", this.state.lname);
                AsyncStorage.setItem("phone_number", (this.state.phone_number !== null) ? this.state.phone_number : '');
                AsyncStorage.setItem("city", (this.state.city !== null) ? this.state.city : '');
                AsyncStorage.setItem("state", (this.state.state !== null) ? this.state.state : '');
                Alert.alert(Strings.gymonkee, "Profile Updated Successfully..", [{ text: 'OK', onPress: () => this._goToProfileScreen() }])
              // }
            }
          }

        }
        //With out image url
        else {
          const { fname, lname, bdayMain, state, phone_number} = this.state;

          var CurrentuserId = firebase.database().ref('User').child(this.state.user_id);
          console.log("With out image url this.state.user_id", this.state.user_id);
          if (fname === '') {
            this.setState({ isConfirm: false })
            Alert.alert(Strings.gymonkee, "Please enter first name")
          }
          else if (!this.validateForAphabatic(fname)) {
            this.setState({ isConfirm: false })
            Alert.alert(Strings.gymonkee, "Please enter valid first name")
          }
          else if (state === 'state') {
            this.setState({ isConfirm: false })
            Alert.alert(Strings.gymonkee, "Please select state")
          }
          // else if(lname==='')
          // {
          //   this.setState({isConfirm:false})
          //   Alert.alert(Strings.gymonkee,"Please enter last name")
          // }
          // else if(bdayMain===null)
          // {
          //   this.setState({isConfirm:false})
          //   Alert.alert(Strings.gymonkee,"Please select date")
          // }
          else {
            // if (this.state.emergencyContactName !== null || this.state.emergencyContactNumber !== null) {
            //   CurrentuserId.update({ firstname: this.state.fname, lastname: this.state.lname, birthdate: this.state.bday, emergencyContactName: (this.state.emergencyContactName !== null) ? this.state.emergencyContactName : '', emergencyContactNumber: (this.state.emergencyContactNumber !== null) ? this.state.emergencyContactNumber : '', updatedAt: firebase.database.ServerValue.TIMESTAMP, updatedBy: this.state.user_id, city: this.state.city, state: this.state.state });
            //   AsyncStorage.setItem("birthdate", this.state.bday);
            //   AsyncStorage.setItem("firstname", this.state.fname);
            //   AsyncStorage.setItem("lastname", this.state.lname);
            //   AsyncStorage.setItem("emergencyContactName", (this.state.emergencyContactName !== null) ? this.state.emergencyContactName : '');
            //   AsyncStorage.setItem("emergencyContactNumber", (this.state.emergencyContactNumber !== null) ? this.state.emergencyContactNumber : '');
            //   AsyncStorage.setItem("city", (this.state.city !== null) ? this.state.city : '');
            //   AsyncStorage.setItem("state", (this.state.state !== null) ? this.state.state : '');
            //   Alert.alert(Strings.gymonkee, "Profile Updated Successfully..", [{ text: 'OK', onPress: () => this._goToProfileScreen() }])
            // } else {
              CurrentuserId.update({ phone_number:this.state.phone_number,firstname: this.state.fname, lastname: this.state.lname, birthdate: this.state.bday, updatedAt: firebase.database.ServerValue.TIMESTAMP, updatedBy: this.state.user_id, city: this.state.city, state: this.state.state });
              AsyncStorage.setItem("birthdate", this.state.bday);
              AsyncStorage.setItem("firstname", this.state.fname);
              AsyncStorage.setItem("lastname", this.state.lname);
              AsyncStorage.setItem("phone_number", (this.state.phone_number !== null) ? this.state.phone_number : '');
              // AsyncStorage.setItem("emergencyContactName", (this.state.emergencyContactName !== null) ? this.state.emergencyContactName : '');
              // AsyncStorage.setItem("emergencyContactNumber", (this.state.emergencyContactNumber !== null) ? this.state.emergencyContactNumber : '');
              AsyncStorage.setItem("city", (this.state.city !== null) ? this.state.city : '');
              AsyncStorage.setItem("state", (this.state.state !== null) ? this.state.state : '');
              Alert.alert(Strings.gymonkee, "Profile Updated Successfully..", [{ text: 'OK', onPress: () => this._goToProfileScreen() }])
            // }
          }
        }
      }
      else {
        this.setState({ isConfirm: false })
        Alert.alert(Strings.gymonkee, Strings.internet_offline);
      }
    });



  }

  //not in use but only for demo
  _uploadImageToStorage(uri, mime = 'image/png') {
    return new Promise((resolve, reject) => {
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      let uploadBlob = null

      const imageRef = firebase.storage().ref('userProfile').child(this.state.user_id)

      fs.readFile(uploadUri, 'base64')
        .then((data) => {
          return Blob.build(data, { type: `${mime};BASE64` })
        })
        .then((blob) => {
          uploadBlob = blob
          return imageRef.put(blob, { contentType: mime })
        })
        .then(() => {
          uploadBlob.close()
          return imageRef.getDownloadURL()
        })
        .then((url) => {
          console.log("Url", url);
          this.setState({
            profileImage: url
          })
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  //for open image picker
  _openImagePicker() {

    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      allowsEditing: true,
      storageOptions: {
        skipBackup: true
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);
      console.log("File name", response.fileName);


      if (response.didCancel) {
        console.log('User cancelled photo picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = { uri: response.uri };

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          avatarSource: source,
          imageFile: response.uri,
          profileImage: response.uri

        });


      }
    });

  }

  showDatePicker() {
    console.log("Show Bday Func:-", this.state.firstTime);
    if (this.state.firstTime) {

    } else {
      return (
        <DatePicker
          textColor="white"
          style={{ backgroundColor: 'rgb(66,91,99)', justifyContent: 'center' }}
          mode="date"
          date={this.state.bday}
          minimumDate={this.state.minDatePick}
          maximumDate={this.state.maxDatePick}
          onDateChange={date => this.onChangeDateData(date)}
        />
      )
    }

  }
  _dropdown_state_row(rowData, rowID, highlighted) {
    console.log("CC:", rowData + rowID + highlighted);
    return (
      <TouchableHighlight underlayColor='#a5a5a4'>
        <View style={[styles.dropdown_state_row, { backgroundColor: 'white' }]}>

          <Text style={[styles.dropdown_state_text, { color: '#a5a5a4' }]}>
            {`${rowData}`}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }

  _dropdownState_onSelect(idx, value, key) {
    console.log("Selected State", value);
    // var tempArr = [...this.state.arrAllLeaveData]
    // var id = tempArr[idx].leave_type_id
    this.setState({
      state: value,
    });
    // setTimeout(()=>{
    //   console.log("Category Data is",this.state.category);
    // },1000)
  }

  render() {

    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          {this.loader()}
        </View>
        <MyStatusBar backgroundColor={Colors.header_red} barStyle="dark-content" hidden={false} />

        <View style={{ flex: 7, borderWidth: 0, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? 100 : 120 }}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ borderWidth: 0, flex: 6 }}>
            {/*Profile Image & Medal*/}
            <View style={{ flex: 1.5, borderWidth: 0, alignItems: 'center' }}>
              <TouchableOpacity style={[styles.avatar, styles.avatarContainer, { marginBottom: 20 }]} onPress={() => this._openImagePicker()}>

                <View style={[styles.avatar, styles.avatarContainer]}>

                  <Image style={styles.avatar} source={{ uri: this.state.profileImage }} />

                </View>
              </TouchableOpacity>
            </View>


            <View style={{ flex: 1, borderWidth: 0, flexDirection: 'row', marginLeft: 20, marginRight: 20 }}>
              <View style={{ flex: 0.5, marginTop: 15, borderBottomWidth: 1, borderBottomColor: (this.state.isFirstname === true) ? Colors.header_red : Colors.white_underline }}>
                <TextInput
                  placeholder='first name'
                  style={{ fontFamily: Fonts.regular, fontSize: (Platform.OS === 'android') ? 16 : 15, color: Colors.header_red, borderWidth: 0, paddingTop: 15, paddingBottom: 5, marginLeft: 5, marginTop: (Platform.OS === 'android') ? 0 : (DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c') ? 0 : 8, flex: 1 }}
                  ref='fname'
                  placeholderTextColor="rgb(115,119,118)"
                  underlineColorAndroid='transparent'
                  onChangeText={(text) => this.firstNameHandle(text)}
                  value={this.state.fname}
                  onFocus={() => this.onFocusText("fname")}
                  onBlur={() => this.onBlurText("fname")}
                  returnKeyType="next"
                  onSubmitEditing={() => this.refs['lname'].focus()}
                />
              </View>

              <View style={{ flex: 0.1 }} />

              <View style={{ flex: 0.5, marginTop: 15, borderBottomWidth: 1, borderBottomColor: (this.state.isLastname === true) ? Colors.header_red : Colors.white_underline }}>
                <TextInput
                  placeholder='last name'
                  style={{ fontFamily: Fonts.regular, fontSize: (Platform.OS === 'android') ? 16 : 15, color: Colors.header_red, borderWidth: 0, paddingTop: 5, paddingBottom: 5, marginLeft: 5, marginTop: (Platform.OS === 'android') ? 0 : (DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c') ? 0 : 8, flex: 1 }}
                  ref='lname'
                  placeholderTextColor="rgb(115,119,118)"
                  underlineColorAndroid='transparent'
                  onChangeText={(text) => this.lastNameHandle(text)}
                  value={this.state.lname}
                  onFocus={() => this.onFocusText("lname")}
                  onBlur={() => this.onBlurText("lname")}
                  returnKeyType="next"
                  onSubmitEditing={() => this.refs['city'].focus()}
                />
              </View>
            </View>


            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: (this.state.isEmail === true) ? Colors.header_red : Colors.white_underline, marginLeft: 20, marginRight: 20 }}>
              <TextInput
                placeholder='email'
                style={{ fontFamily: Fonts.regular, fontSize: (Platform.OS === 'android') ? 16 : 15, color: Colors.header_red, borderWidth: 0, paddingTop: 25, paddingBottom: 5, marginLeft: 5, marginTop: (Platform.OS === 'android') ? 0 : (DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c') ? 0 : 8, flex: 1 }}
                ref='email'
                keyboardType="email-address"
                placeholderTextColor="rgb(115,119,118)"
                underlineColorAndroid='transparent'
                onChangeText={(text) => this.setState({ email: text })}
                value={this.state.email}
                onFocus={() => this.onFocusText("email")}
                onBlur={() => this.onBlurText("email")}
                returnKeyType="done"
                editable={false}

              />
            </View>
            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: (this.state.isPhone === true) ? Colors.header_red : Colors.white_underline, marginLeft: 20, marginRight: 20 }}>
              <TextInput
                placeholder='phone number'
                style={{ fontFamily: Fonts.regular, fontSize: (Platform.OS === 'android') ? 16 : 15, color: Colors.header_red, borderWidth: 0, paddingTop: 25, paddingBottom: 5, marginLeft: 5, marginTop: (Platform.OS === 'android') ? 0 : (DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c') ? 0 : 8, flex: 1 }}
                ref='phone'
                keyboardType="numeric"
                placeholderTextColor="rgb(115,119,118)"
                underlineColorAndroid='transparent'
                onChangeText={(text) => this.setState({ phone_number: text })}
                value={this.state.phone_number}
                onFocus={() => this.onFocusText("phone")}
                onBlur={() => this.onBlurText("phone")}
                returnKeyType="done"
                editable={true}

              />
            </View>
            <View style={{ flex: 1, borderWidth: 0, flexDirection: 'row', marginLeft: 20, marginRight: 20 }}>
              <View style={{ flex: 0.5, marginTop: 15, borderBottomWidth: 1, borderBottomColor: (this.state.isCity === true) ? Colors.header_red : Colors.white_underline }}>
                <TextInput
                  placeholder='city'
                  style={{ fontFamily: Fonts.regular, fontSize: (Platform.OS === 'android') ? 16 : 15, color: Colors.header_red, borderWidth: 0, paddingTop: 15, paddingBottom: 5, marginLeft: 5, marginTop: (Platform.OS === 'android') ? 0 : (DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c') ? 0 : 8, flex: 1 }}
                  ref='city'
                  placeholderTextColor="rgb(115,119,118)"
                  underlineColorAndroid='transparent'
                  onChangeText={(text) => this.cityHandle(text)}
                  value={this.state.city}
                  onFocus={() => this.onFocusText("city")}
                  onBlur={() => this.onBlurText("city")}
                  returnKeyType="next"
                  onSubmitEditing={() => this.refs['emergencyContactName'].focus()}
                />
              </View>

              <View style={{ flex: 0.1 }} />

              <View style={{ flex: 0.5, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? 38 : 32, borderBottomWidth: 1, borderBottomColor: (this.state.isState === true) ? Colors.header_red : Colors.white_underline }}>
                <ModalDropdown
                  ref={el => this._dropdown_state = el}
                  textStyle={styles.dropdown_state_text}
                  dropdownStyle={styles.dropdown_state_style}
                  dropdownTextStyle={styles.dropdown_state_text}
                  options={this.state.stateList}
                  defaultValue={this.state.state}
                  renderRow={this._dropdown_state_row.bind(this)}
                  onSelect={(idx, value) => this._dropdownState_onSelect(idx, value)}
                  value={this.state.state}
                //renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this._dropdown_2_renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
                />
              </View>
            </View>

            {(this.state.hideEmergencyContact)&&<View style={{ flex: 1, borderWidth: 0, flexDirection: 'row', marginLeft: 20, marginRight: 20 }}>
              <View style={{ flex: 0.5, marginTop: 15, borderBottomWidth: 1, borderBottomColor: Colors.white_underline, }}>
                <Text style={styles.labelText}>Emergency Contact:</Text>
              </View>

              <View style={{ flex: 0.5, marginTop: 15, borderBottomWidth: 1, borderBottomColor: (this.state.isEmergencyContactName === true) ? Colors.header_red : Colors.white_underline }}>
                <TextInput
                  placeholder=''
                  style={{ fontFamily: Fonts.regular, fontSize: (Platform.OS === 'android') ? 16 : 15, color: Colors.header_red, borderWidth: 0, paddingTop: 15, paddingBottom: 5, marginLeft: 5, marginTop: (Platform.OS === 'android') ? 0 : (DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c') ? 0 : 8, flex: 1 }}
                  ref='emergencyContactName'
                  placeholderTextColor="rgb(115,119,118)"
                  underlineColorAndroid='transparent'
                  onChangeText={(text) => this.contactNameHandle(text)}
                  value={this.state.emergencyContactName}
                  onFocus={() => this.onFocusText("emergencyContactName")}
                  onBlur={() => this.onBlurText("emergencyContactName")}
                  returnKeyType="next"
                  onSubmitEditing={() => this.refs['emergencyContactNumber'].focus()}
                />
              </View>
            </View>}

            {(this.state.hideEmergencyContact)&&<View style={{ flex: 1, borderWidth: 0, flexDirection: 'row', marginLeft: 20, marginRight: 20 }}>
              <View style={{ flex: 0.5, marginTop: 15, borderBottomWidth: 1, borderBottomColor: Colors.white_underline }}>
                <Text style={styles.labelText}>Emergency Contact #:</Text>
              </View>



              <View style={{ flex: 0.5, marginTop: 15, borderBottomWidth: 1, borderBottomColor: (this.state.isEmergencyContactNumber === true) ? Colors.header_red : Colors.white_underline }}>
                <TextInput
                  placeholder=''
                  style={{ fontFamily: Fonts.regular, fontSize: (Platform.OS === 'android') ? 16 : 15, color: Colors.header_red, borderWidth: 0, paddingTop: 15, paddingBottom: 5, marginLeft: 5, marginTop: (Platform.OS === 'android') ? 0 : (DeviceInfo.getModel() === 'iPhone SE' || DeviceInfo.getModel() === 'iPhone 5s' || DeviceInfo.getModel() === 'iPhone 5c') ? 0 : 8, flex: 1 }}
                  ref='emergencyContactNumber'
                  placeholderTextColor="rgb(115,119,118)"
                  underlineColorAndroid='transparent'

                  onChangeText={(text) => this.contactNumberHandle(text)}
                  value={this.state.emergencyContactNumber}
                  onFocus={() => this.onFocusText("emergencyContactNumber")}
                  onBlur={() => this.onBlurText("emergencyContactNumber")}
                  returnKeyType="done"
                  keyboardType='phone-pad'

                />
              </View>
            </View>}

            <View style={{ flex: 0.8, alignItems: 'center', marginTop: 20, marginBottom: -16 }}>
              <Text style={styles.dob_label}>Date of birth</Text>
            </View>
            <View style={{ flex: (Platform.OS === 'android') ? 3 : 3.5 }}>
              <View style={{ height: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? 20 : 30 }} />
              {this.showDatePicker()}
            </View>


            {/*Add more Button*/}

          </ScrollView>
          <View style={{ flex: 0.15 }}>
            <View style={{ flex: 1.5, borderWidth: 0, alignItems: 'center' }}>
              <TouchableOpacity disabled={this.state.isConfirm} style={{ flex: 1.5, marginTop: 0 }} onPress={() => this._onClickConfirm()}>
                <ImageBackground source={{ uri: 'btn_signup_big' }} style={{ height: (DeviceInfo.getModel() === ModelIphoneX) ? 80 : (DeviceInfo.getModel() === 'iPhone 6') ? 80 : (DeviceInfo.getModel() === 'iPhone 6 Plus') ? 80 : 70, width: (DeviceInfo.getModel() === ModelIphoneX || DeviceInfo.getModel() === 'iPhone 8 Plus') ? 300 : (DeviceInfo.getModel() === 'iPhone 6') ? 250 : (DeviceInfo.getModel() === 'iPhone 6 Plus') ? 250 : (Platform.OS === 'android') ? 280 : 250 }}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 20 : ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? 15 : 18, color: Colors.white }}>Confirm</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
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
    marginTop: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? -120 : -150,
    backgroundColor: Colors.theme_background,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor: '#79B45D',
    height: APPBAR_HEIGHT,
  },
  content: {
    flex: 1,
    backgroundColor: '#33373B',
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    borderRadius: 40,
    width: 80,
    height: 80
  },
  back_icon: {
    height: 20,
    width: 20,
    marginLeft: 10,
  },
  labelText: {
    fontFamily: Fonts.regular,
    fontSize: (Platform.OS === 'android') ? 16 : ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? 12 : 15,
    marginTop: 20,
    color: Colors.black,
    marginLeft: 5,
  },
  dob_label: {
    fontFamily: Fonts.regular,
    fontSize: (deviceHeight > 600) ? 28 : 24,
    color: Colors.header_red,
  },
  dropdown_state_text: {

    fontSize: (Platform.OS === 'android') ? 16 : 15,
    color: Colors.header_red,
    textAlignVertical: 'center',
    fontFamily: Fonts.regular,
    borderWidth: 0
  },
  dropdown_state_style: {
    width: 160,
    //flex:1,
    marginTop: -10,
    paddingHorizontal: 7,
    flexDirection: 'row',
    borderColor: '#a5a5a4',
    borderWidth: 1,
    marginLeft: -20,
  },

  dropdown_state_row: {

    width: 160,
    height: 30,
    justifyContent: 'center'
  },
})
module.exports = ProfileScreenEdit
