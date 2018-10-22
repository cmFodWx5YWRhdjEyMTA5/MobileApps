//Login_Main
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
import Strings from './../Utils/Strings';

import firebaseConfig from './../Utils/firebaseConfig';
import Spinner from 'react-native-loading-spinner-overlay';
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import { deviceHeight, deviceWidth } from './../Utils/DeviceDimensions';

const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

var loginStatus = 0;
class Login_Main extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      isUsername: false,
      isPassword: false,
      loader: false,
      user_id: '',
    }
  }



  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: '',
      gesturesEnabled: true,
      headerStyle: { backgroundColor: Colors.header_red, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: HeaderStyle.titleCenter,
      headerLeft: <TouchableOpacity onPress={() => navigation.goBack()}><View style={{ marginRight: 10 }}><Image source={{ uri: "back_arrow" }} style={{ height: (DeviceInfo.getModel() === ModelIphoneX) ? 30 : 23, width: (DeviceInfo.getModel() === ModelIphoneX) ? 30 : 23, marginLeft: 10, }} /></View></TouchableOpacity>
    }
  }

  //Life Cycle Methods
  componentWillMount() {
    console.log("=====> You are in : ", this.props.navigation.state.routeName);
  }
  componentDidMount() {

  }

  //User Define Functions

  //loader
  loader() {
    if (this.state.loader) {
      return (
        <View>
          <Spinner visible={this.state.loader} textContent={""} textStyle={{ color: Colors.header_red }} color={Colors.header_red} />
        </View>
      )
    }
  }


  onFocusText(txtName) {
    if (txtName === "username") {
      this.setState({
        isUsername: true
      })
    } else if (txtName === "password") {
      this.setState({
        isPassword: true
      })
    }

  }
  onBlurText(txtName) {
    if (txtName === "username") {
      this.setState({
        isUsername: false
      })
    } else if (txtName === "password") {
      this.setState({
        isPassword: false
      })
    }
  }

  //email vadidation
  validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  _logoutFromFirebase() {
    firebase.auth().signOut().then(() => {
      // Sign-out successful.
      const resetAction = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Login' })],
      });
      this.props.navigation.dispatch(resetAction);
    })
      .catch((error) => {
        // An error happened
        console.log("Logout Error", error);
      });
  }

  onClickLogin() {
    const { username, password } = this.state;

    if (username === '' && password === '') {
      Alert.alert(Strings.gymonkee, "Please enter required fields")
    }
    else if (username === '') {
      Alert.alert(Strings.gymonkee, "Please enter email")
    } else if (password === '') {
      Alert.alert(Strings.gymonkee, "Please enter password")
    }
    else if (!this.validateEmail(username)) {
      Alert.alert(Strings.gymonkee, "Please enter valid email")
    } else {
      this.setState({ loader: true })
      firebase.auth().signInWithEmailAndPassword(username, password)
        .then((user) => {
          this.setState({ loader: false })

          setTimeout(() => {
            var currentUser = firebase.auth().currentUser;
            console.log("Current User:", currentUser);
            var currentUserRef = firebase.database().ref('User').child(currentUser.uid);
            console.log("Current User Ref:", currentUserRef);

            currentUserRef.on('value', (data) => {
              console.log("Data from login", data);
              var userData = data.val();
              var keys = Object.keys(userData);
              AsyncStorage.setItem("user_id", currentUser.uid);
              console.log("Login Fid", currentUser.uid);

              if (userData.type == 'gymManager' || userData.type == 'superAdmin') {
                //Alert.alert(Strings.gymonkee,"Super admin or gym manager can't able to log in to the app");

                Alert.alert(Strings.gymonkee, "Super admin or gym manager can't able to log in to the app",
                  [
                    { text: "OK", onPress: () => { this._logoutFromFirebase() } },
                  ],
                  { cancelable: false }
                )



              }
              else if (userData.status === 0) {
                //Alert.alert(Strings.gymonkee,"Your account is deleted by admin.");



                Alert.alert(Strings.gymonkee, "Your account is deleted by admin.",
                  [
                    { text: "OK", onPress: () => { this._logoutFromFirebase() } },
                  ],
                  { cancelable: false }
                )


              }
              else {
                // Alert.alert("Success")
                //Go to dashboard if user is exist
                this.setState({
                  user_id: currentUser.uid
                });
                loginStatus = 1;



                console.log("Success", "Success");
                console.log("Login User id", this.state.user_id);

                if (userData.hasOwnProperty('birthdate')) {
                  AsyncStorage.setItem("birthdate", userData.birthdate);
                }
                if (userData.hasOwnProperty('city')) {
                  AsyncStorage.setItem("city", userData.city);
                }
                if (userData.hasOwnProperty('email')) {
                  AsyncStorage.setItem("email", userData.email);
                }
                if (userData.hasOwnProperty('firstname')) {
                  AsyncStorage.setItem("firstname", userData.firstname);
                }
                if (userData.hasOwnProperty('gender')) {
                  AsyncStorage.setItem("gender", userData.gender);
                }
                if (userData.hasOwnProperty('lastname')) {
                  AsyncStorage.setItem("lastname", userData.lastname);
                }
                if (userData.hasOwnProperty('state')) {
                  AsyncStorage.setItem("state", userData.state);
                }
                if (userData.hasOwnProperty('profileImage')) {
                  AsyncStorage.setItem("profileImage", userData.profileImage);
                }
                if (userData.hasOwnProperty('stripe_cust_id')) {
                  AsyncStorage.setItem("stripe_cust_id", userData.stripe_cust_id);
                }

                if (userData.hasOwnProperty('emergencyContactName')) {
                  AsyncStorage.setItem("emergencyContactName", userData.emergencyContactName);
                }
                if (userData.hasOwnProperty('emergencyContactNumber')) {
                  AsyncStorage.setItem("emergencyContactNumber", userData.emergencyContactNumber);
                }
                if (userData.hasOwnProperty('inviteURL')) {
                  AsyncStorage.setItem("inviteURL", userData.inviteURL);
                }
                if (userData.hasOwnProperty('inviteCode')) {
                  AsyncStorage.setItem("inviteCode", userData.inviteCode);
                }

                if (userData.hasOwnProperty('phone_number')) {
                  AsyncStorage.setItem("phone_number", userData.phone_number);
                }


                console.log("AsyncStorage", "Set Data");



              }
            })

            setTimeout(() => {
              console.log("loginStatus", loginStatus);
              if (loginStatus == 1) {
                console.log("Login Main Firebase TIMESTAMP", firebase.database.ServerValue.TIMESTAMP);
                firebase.database().ref('User').child(currentUser.uid).update({ lastLoginAt: firebase.database.ServerValue.TIMESTAMP });
                const resetAction = NavigationActions.reset({
                  index: 0,
                  actions: [NavigationActions.navigate({ routeName: 'Home' })],
                });
                this.props.navigation.dispatch(resetAction);
              }
            }, 700)


          }, 1000)
        })
        .catch((error) => {
          const { code, message } = error;
          console.log("Response Login Error", error);
          this.setState({ loader: false })
          setTimeout(() => {
            Alert.alert(Strings.gymonkee, error.message);
          }, 500)
          // For details of error codes, see the docs
          // The message contains the default Firebase string
          // representation of the error
        });
    }

  }

  //Main View Rendering
  render() {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          {this.loader()}
        </View>
        <MyStatusBar backgroundColor={Colors.header_red} barStyle="dark-content" hidden={false} />
        <View style={{ flex: 3, borderWidth: 0 }}>
          <ImageBackground source={{ uri: 'shape_red_top' }} resizeMode="contain" style={{ height: null, width: null, flex: 3, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? -95 : (deviceHeight > 600 && Platform.OS === 'ios') ? -120 : (Platform.OS === 'android') ? -90 : -80 }}>
            <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center', marginBottom: (Platform.OS === 'android') ? 30 : 60 }}>
              <Image source={{ uri: 'logo_white' }} resizeMode="contain" style={{ height: (deviceHeight > 600) ? 40 : 35, width: Dimensions.get('window').width - 100, borderWidth: 0 }} />
            </View>
          </ImageBackground>
        </View>

        <View style={{ flex: 7, borderWidth: 0 }}>


          <View style={{ flex: 3, borderWidth: 0 }}>
            <View style={{ flex: 0.3 }} />

            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: (this.state.isUsername === true) ? Colors.orange_text : Colors.white_underline, marginLeft: 50, marginRight: 50 }}>
              <TextInput
                placeholder='Username'
                style={{ fontFamily: Fonts.regular, fontSize: 15, color: Colors.orange_text, borderWidth: 0, marginLeft: 5, marginTop: 12, flex: 1 }}
                ref='username'
                placeholderTextColor="rgb(115,119,118)"
                underlineColorAndroid='transparent'
                onChangeText={(text) => this.setState({ username: text })}
                value={this.state.username}
                keyboardType="email-address"
                onFocus={() => this.onFocusText("username")}
                onBlur={() => this.onBlurText("username")}
                returnKeyType="next"
                onSubmitEditing={() => this.refs['password'].focus()}
              />
            </View>

            <View style={{ flex: 0.3 }} />

            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: (this.state.isPassword === true) ? Colors.orange_text : Colors.white_underline, marginLeft: 50, marginRight: 50 }}>
              <TextInput
                placeholder='Password'
                style={{ fontFamily: Fonts.regular, fontSize: 15, color: Colors.orange_text, borderWidth: 0, marginLeft: 5, marginTop: 12, flex: 1 }}
                ref='password'
                placeholderTextColor="rgb(115,119,118)"
                secureTextEntry={true}
                underlineColorAndroid='transparent'
                onChangeText={(text) => this.setState({ password: text })}
                value={this.state.password}
                onFocus={() => this.onFocusText("password")}
                onBlur={() => this.onBlurText("password")}
              />
            </View>
            <View style={{ flex: 0.3, marginLeft: 50, marginRight: 50, alignItems: 'flex-end', marginTop: 5 }}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Forgotpassword")}>
                <Text style={{ fontFamily: Fonts.regular, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 13 : (DeviceInfo.getModel() === 'iPhone SE') ? 10 : 12, color: Colors.orange_text }}>Forgot your password?</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 2, borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => this.onClickLogin()}>
              <ImageBackground source={{ uri: 'btn_signup_big' }} style={{ height: (deviceHeight > 600) ? 110 : 80, width: (deviceHeight > 600) ? 320 : 250 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: (DeviceInfo.getModel() === ModelIphoneX) ? 20 : 18, color: Colors.white }}>Sign in</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 2, borderWidth: 0 }} />
        </View>

      </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
    flex: 10,
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
})
module.exports = Login_Main
