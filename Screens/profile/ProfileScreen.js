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

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class ProfileScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      isActiveFriends: false,
      firstname: '',
      lastname: '',
      email: '',
      city: '',
      state: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      birthdate: '',
      arrTempFrndList: [],
      arrFriendList: [],
      profileImage: 'placeholder_img',
      isFrndDataNull: false,
      hideEmergencyContact: false
    }
    // this.userRef = firebase.database().ref().child('User');
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

  //Life Cycle Methods

  componentDidMount() {
    const { state } = this.props.navigation;
    console.log("Come From isss:", state.params.comeFrom);
    if (state.params.comeFrom === "share") {
      this.setState({
        isActiveFriends: true
      })
    }

    // AsyncStorage.getItem("firstname").then((value) => {
    //     this.setState({firstname:value})
    // }).done();

    // AsyncStorage.getItem("lastname").then((value) => {
    //   this.setState({lastname:value})
    //     }).done();

    //     AsyncStorage.getItem("profileImage").then((value) => {
    //             console.log("Edit Profile AsyncStorage profileImage",value);
    //             if(value==null)
    //             {
    //               this.setState({profileImage:'placeholder_img'})
    //             }
    //             else {
    //               this.setState({profileImage:value})

    //             }

    //     }).done();
    //     AsyncStorage.getItem("email").then((value) => {
    //       this.setState({email:value})
    //     }).done();

    //     AsyncStorage.getItem("city").then((value) => {
    //       if(value===null)
    //       {
    //         this.setState({
    //           city:'--',
    //         })
    //       }
    //       else {
    //       this.setState({city:value})
    //     }
    //     }).done();

    //     AsyncStorage.getItem("state").then((value) => {

    //       if(value===null)
    //       {
    //         this.setState({
    //           state:'--',
    //         })
    //       }
    //       else {
    //       this.setState({state:value})
    //     }
    //     }).done();

    //     AsyncStorage.getItem("emergencyContactName").then((value) => {
    //       if(value===null)
    //       {
    //         this.setState({
    //           emergencyContactName:'--',
    //         })
    //       }
    //       else {
    //       this.setState({emergencyContactName:value})
    //     }
    //     }).done();

    //     AsyncStorage.getItem("emergencyContactNumber").then((value) => {
    //       if(value===null)
    //       {
    //         this.setState({
    //           emergencyContactNumber:'--',
    //         })
    //       }
    //       else {
    //         this.setState({emergencyContactNumber:value})

    //       }
    //     }).done();
    //     AsyncStorage.getItem("birthdate").then((value) => {

    //           if(value===null)
    //           {
    //             this.setState({
    //               birthdate:'--',
    //             })
    //           }else{
    //             var date = moment(value).toString() + '(IST)'
    //             console.log("Date is:",date);
    //             this.setState({
    //               birthdate:value,
    //             })
    //             }
    //         }).done();

    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });

    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({ netStatus: isConnected });

      if (isConnected) {
        var currentUser = firebase.auth().currentUser;
        var currentUserRef = firebase.database().ref('User').child(currentUser.uid);

        // console.log("User Friends:",currentUserRef);
        currentUserRef.once('value', (data) => {
          // console.log("Data from login",data);
          var userData = data.val();
          var keys = Object.keys(userData);
          if (keys.length > 0) {
            //     this.setState({
            //       fname: currentUser.firstname,
            //       lname: userData.lastname,
            //       email: userData.email,
            //       phone_number: userData.phone_number,
            //       city: userData.city,
            //       state: userData.state,
            //       birthdate:userData.birthdate,
            //       user_id:userData.uid,
            //       profileImage:userData.profileImage,
            // })


            this.setState({
              firstname: userData.firstname
            });

            this.setState({ lastname: userData.lastname })

            if (userData.profileImage == null) {
              this.setState({ profileImage: 'placeholder_img' })
            }
            else {
              this.setState({ profileImage: userData.profileImage })
            }

            this.setState({ email: userData.email })

            if (userData.city === null || userData.city === "") {
              this.setState({ city: '--' })
            }
            else {
              this.setState({ city: userData.city })
            }

            if (userData.state === null || userData.state === "") {
              this.setState({ state: '--' })
            }
            else {
              this.setState({ state: userData.state })
            }


            if (userData.birthdate === null) {
              this.setState({
                birthdate: '--',
              })
            } else {
              var date = moment(userData.birthdate).toString() + '(IST)'
              console.log("Date is:", date);
              this.setState({
                birthdate: userData.birthdate,
              })
            }
          }
        })

        this.gettingFriendData()
      }
      else {
        this.setState({ isConfirm: false })
        Alert.alert(Strings.gymonkee, Strings.internet_offline);
      }
    });
  }


  gettingFriendData() {
    var currentUser = firebase.auth().currentUser;
    var currentUserRef = firebase.database().ref('Friendship').child(currentUser.uid);

    // console.log("User Friends:",currentUserRef);
    currentUserRef.on('value', (data) => {
      // console.log("Data from login",data);
      var userData = data.val();
      console.log("User Data is:-", userData);
      if (userData !== null) {
        var keys = Object.keys(userData);
        if (keys.length > 0) {
          for (var i = 0; i < keys.length; i++) {
            this.state.arrTempFrndList.push({ "uid": keys[i], "userData": userData[keys[i]] })
            if (i === keys.length - 1) {
              this.setState({
                arrFriendList: this.state.arrTempFrndList
              })
              console.log("Final Arr Data is:-", this.state.arrTempFrndList);
              this.displayFriendList()
            }
          }
        }
      } else {
        this.setState({
          isFrndDataNull: true
        })
      }
    })
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

  onClickFriend(index) {
    var frndData = this.state.arrFriendList[index]
    this.props.navigation.navigate("FriendProfileScreen", { userFrndId: frndData.uid, userFrndName: frndData.userData.name, userFrndEmail: frndData.userData.email, userFrndImg: frndData.userData.profileImage })
  }

  displayFriendList() {
    if (this.state.arrFriendList.length > 0) {
      return this.state.arrFriendList.map((data, index) => {
        return (
          <TouchableOpacity onPress={() => this.onClickFriend(index)} style={{ marginLeft: 10, height: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? 70 : 85, flexDirection: 'row', borderWidth: 0 }}>
            <View style={{ flex: 0.3, borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>

              <View style={[styles.avatarSmall]}>
                <Image style={styles.avatarSmall} source={{ uri: data.userData.profileImage }} />
              </View>

            </View>
            <View style={{ flex: 0.7, borderWidth: 0, justifyContent: 'center' }}>
              <Text style={{ fontFamily: Fonts.regular, color: Colors.header_red, fontSize: ((DeviceInfo.getModel() === 'iPhone 8 Plus') || (DeviceInfo.getModel() === 'iPhone 8') || (DeviceInfo.getModel() === 'iPhone 6 Plus') || (DeviceInfo.getModel() === ModelIphoneX)) ? 22 : 20 }}>{data.userData.name}</Text>
            </View>

          </TouchableOpacity>
        )
      })
    } else {
      return (
        <View style={{ height: (deviceHeight > 600) ? 200 : 150, justifyContent: 'center', alignItems: 'center', borderWidth: 0 }}>
          <Text style={{ fontSize: 25, color: Colors.header_red + '80', fontFamily: Fonts.regular }}>No Friends...!</Text>
        </View>
      )
    }

  }
  changeTabView() {
    if (this.state.isActiveFriends) {

      return (
        <View style={{ flex: 3.5 }}>
          <View style={{ flex: 3, borderWidth: 0 }}>
            <ScrollView>
              {this.displayFriendList()}
            </ScrollView>

          </View>



          <View style={{ flex: 1.5, borderWidth: 0, alignItems: 'center' }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => this.onClickAddMore()}>
              <ImageBackground source={ require('../../assets/Home-01/coins.png')} resizeMode="contain" style={{height:90,width:170}}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 20 : ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? 15 : 18, color: Colors.white }}>Add more friends</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>

          </View>
        </View>

      )

    } else {
      return (
        <View style={{ flex: 3.5 }}>
          <ScrollView style={{ flex: 3 }} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={styles.details_label_orange}>Birthday Date</Text>
              <Text style={styles.details_label_black}>{moment(this.state.birthdate).format('MMMM DD YYYY')}</Text>
              <Text style={styles.details_label_orange}>E-mail</Text>
              <Text style={{ borderWidth: 0, paddingLeft: 30, paddingRight: 30, textAlign: 'center', color: Colors.black, fontFamily: Fonts.regular, fontSize: 20, }}>{this.state.email}</Text>
              <Text style={styles.details_label_orange}>City/State</Text>
              <Text style={styles.details_label_black}>{this.state.city} {this.state.state}</Text>
              {(this.state.hideEmergencyContact) && <View><Text style={styles.details_label_orange}>Emergency Contact Name</Text>
                <Text style={styles.details_label_black}>{this.state.emergencyContactName}</Text>
                <Text style={styles.details_label_orange}>Emergency Contact Number</Text>
                <Text style={styles.details_label_black}>{this.state.emergencyContactNumber}</Text></View>}
            </View>
            <View style={{ flex: 0.5, borderWidth: 0, alignItems: 'center', marginTop: 20 }}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => this.onClickProfileImage()}>
                <ImageBackground source={ require('../../assets/Home-01/coins.png')} resizeMode="contain" style={{height:90,width:120}}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontFamily: Fonts.regular, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 20 : ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? 15 : 18, color: Colors.white }}>Edit</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>

            </View>
          </ScrollView>


        </View>
      )
    }
  }
  gotoDashboard() {
    //Go to dashboard if user is exist
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Home' })],
    });
    this.props.navigation.dispatch(resetAction);
  }
  //User Define Functions

  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: "Profile",
      headerStyle: { backgroundColor: Colors.header_red, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: HeaderStyle.titleCenter,

    }
  }
  // <View style={{flex:3,borderWidth:0}}>
  //     <ImageBackground source={{uri:'shape_red_top'}} style={{height:(DeviceInfo.getModel() === ModelIphoneX)?180:(DeviceInfo.getModel() === 'iPhone 8 Plus')?150:(DeviceInfo.getModel() === 'iPhone 6 Plus')?180:(DeviceInfo.getModel() === 'iPhone SE')?130:(Platform.OS==='android')?-20:140,width:Dimensions.get('window').width,flex:1.8,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?-55:(DeviceInfo.getModel() === 'iPhone 8 Plus')?-20:(DeviceInfo.getModel() === 'iPhone 6 Plus')?-20:(Platform.OS==='android')?-20:-10}}>
  //           <View style={{flex:3,justifyContent:'center',alignItems:'center',marginBottom:60}}>
  //
  //           </View>
  //     </ImageBackground>
  // </View>
  //Main View Rendering

  onClickDetails() {
    this.setState({
      isActiveFriends: false
    })
    //this.props.navigation.navigate("ProfileScreenEdit")
  }

  onClickFriends() {
    this.setState({
      isActiveFriends: true
    })
  }

  onClickAddMore() {
    this.props.navigation.navigate("FriendListScreen");
    //Alert.alert(Strings.gymonkee,"Under Implementation");
  }

  onClickProfileImage() {
    this.props.navigation.navigate("ProfileScreenEdit")
  }

  render() {
    return (
      <View style={styles.container} >
      <ImageBackground source={ require('../../assets/Home-01/06.png')}  style={{ height: '100%', width: '100%'}}>
        <View style={{ alignItems: 'center' }}>
          {this.loader()}
        </View>

        <View style={{ flex: 7, borderWidth: 0, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? 80 : 160 }}>
          {/*Profile Image & Medal*/}
          <View style={{ flex: 1.5, borderWidth: 0, flexDirection: 'row' }}>
            <View style={{ flex: 0.5 }} />
            <TouchableOpacity onPress={() => this.onClickProfileImage()} style={{ flex: 0.5, borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
              <View style={[styles.avatar, styles.avatarContainer]}>

                <Image style={styles.avatar} source={{ uri: this.state.profileImage }} />

              </View>
            </TouchableOpacity>

            <View style={{ flex: 0.5, borderWidth: 0, justifyContent: 'center' }}>
              <Image source={{ uri: '' }} resizeMode='contain' style={{ height: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c') ? 50 : 60), width: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c') ? 50 : 60) }} />
            </View>
          </View>

          {/*Name & Medal name*/}
          <View style={{ flex: 1, borderWidth: 0, alignItems: 'center', justifyContent: 'center', marginTop: -10 }}>
            <Text style={{ fontFamily: Fonts.regular, color: Colors.header_red, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 25 : (DeviceInfo.getModel() === 'iPhone 8 Plus') ? 25 : (DeviceInfo.getModel() === 'iPhone 6 Plus') ? 20 : (Platform.OS === 'android') ? 20 : 20 }}>{this.state.firstname} {this.state.lastname}</Text>
            <Text style={{ fontFamily: Fonts.SFU_REGULAR, color: '#c5691d60', fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 22 : (DeviceInfo.getModel() === 'iPhone 8 Plus') ? 25 : (DeviceInfo.getModel() === 'iPhone 6 Plus') ? 20 : (Platform.OS === 'android') ? 20 : 20 }}>{' '}</Text>
          </View>

          {/*Switch*/}
          <View style={{ flex: (DeviceInfo.getModel() === ModelIphoneX) ? 0.9 : 1, borderWidth: 0,backgroundColor:'#f5f5f0' }}>

            <View style={{ flex: 1, marginTop: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? 5 : 10, marginBottom: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? 5 : 10, borderWidth: 1, flexDirection: 'row', borderColor: Colors.header_red, borderRadius: 40, marginLeft: 30, marginRight: 30 }}>

              <TouchableOpacity onPress={() => this.onClickDetails()} style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center', backgroundColor: (this.state.isActiveFriends === false) ? Colors.header_red : 'transparent', borderRadius: 40 }}>
                <Text style={{ fontFamily: Fonts.regular, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 20 : (DeviceInfo.getModel() === 'iPhone 8 Plus') ? 20 : 22, marginTop: 5, color: (this.state.isActiveFriends === false) ? '#ff6600' : 'red' }}>Details</Text>
               
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.onClickFriends()} style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center', backgroundColor: (this.state.isActiveFriends === true) ? Colors.header_red : 'transparent', borderRadius: 40 }}>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 22, marginTop: 0, color: (this.state.isActiveFriends === true) ? '#ff6600' : 'red' }}>Friends</Text>
              </TouchableOpacity>
            </View>

          </View>


          {/*Friend List*/}
          <View style={{ flex: 3.5 }}>


            {this.changeTabView()}



          </View>
        </View>
      </ImageBackground>  
      </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
    flex: 10,
    marginTop: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? -120 : (DeviceInfo.getModel() === 'iPhone X') ? -170 : -150,

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
  avatarSmall: {
    borderRadius: 35,
    width: 70,
    height: 70
  },
  menu_icon: {
    height: 20,
    width: 20,

  },
  details_label_orange: {
    color: '#fff',
    fontFamily: Fonts.regular,
    fontSize: 20,
    marginTop: 5,
  },
  details_label_black: {
    color: Colors.black,
    fontFamily: Fonts.regular,
    fontSize: 20,
  },
})
module.exports = ProfileScreen
