//login
import React, { Component } from "react";
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
  ImageBackground
} from "react-native";

import Colors from "./../Utils/Colors";
import Fonts from "./../Utils/Fonts";
import DeviceInfo from "react-native-device-info";
import { NavigationActions } from "react-navigation";
import * as firebase from "firebase";
import Strings from "./../Utils/Strings";
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager } from "react-native-fbsdk";
import { GoogleSignin } from "react-native-google-signin";
import Spinner from "react-native-loading-spinner-overlay";
import LinkedInModal from "react-native-linkedin";
import { deviceHeight, deviceWidth } from "./../Utils/DeviceDimensions";

const ModelIphoneX = "iPhone X";
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT =
  Platform.OS === "ios" ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === "ios" ? 44 : 56;
const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

var loginStatus = 0;
var fbLoginStatus = 0;
var googleLoginStatus = 0;
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      birthdate: new Date(),
      facebook_profile_pic_url: ''
    };
    this.userRef = firebase
      .database()
      .ref()
      .child("User");
  }
  
  //handle Internet Connection
  handleConnectionChange = isConnected => {
    this.setState({ netStatus: isConnected });
    console.log(`is connected: ${this.state.netStatus}`);
  };

  //Life Cycle Methods
  componentWillMount() {
    console.log("=====> You are in : ", this.props.navigation.state.routeName);
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.handleConnectionChange
    );
    NetInfo.isConnected.fetch().done(isConnected => {
      this.setState({ netStatus: isConnected });
    });
  }
  componentDidMount() {
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.handleConnectionChange
    );
    NetInfo.isConnected.fetch().done(isConnected => {
      this.setState({ netStatus: isConnected });
    });

    if (Platform.OS === "android") {
      this.configureGoogleAndroid();
    }
  }
  //loader
  loader() {
    if (this.state.loader) {
      return (
        <View>
          <Spinner
            visible={this.state.loader}
            textContent={""}
            textStyle={{ color: "#c32439" }}
            color="#c32439"
          />
        </View>
      );
    }
  }

  fbLogin() {
    NetInfo.isConnected.fetch().done(isConnected => {
      this.setState({ netStatus: isConnected });

      if (isConnected) {
        this.setState({ loader: true });
        LoginManager.logOut();
        LoginManager.logInWithReadPermissions(["public_profile", "email"])
          .then(result => {
            if (result.isCancelled) {
              this.setState({ loader: false });
              return Promise.reject(
                new Error("The user cancelled the request")
              );
            }

            // Retrieve the access token
            return AccessToken.getCurrentAccessToken();
          })
          .then(data => {
            // Create a new Firebase credential with the token
            console.log("FBLogin Data is::", data.accessToken)
            const currentAccessToken = data.accessToken

            const graphRequest = new GraphRequest('/me', {
              accessToken: currentAccessToken.accessToken,
              parameters: {
                fields: {
                  string: 'picture.type(large)',
                },
              },
            }, (error, result) => {
              if (error) {
                console.error(error)
              } else {
                this.setState({
                  facebook_profile_pic_url: result.picture.data.url
                })
                console.log("Profile Picture is:", result.picture.data.url)
              }
            })

            new GraphRequestManager().addRequest(graphRequest).start()

            const credential = firebase.auth.FacebookAuthProvider.credential(
              data.accessToken
            );

            return firebase.auth().signInWithCredential(credential);
          })
          .then(user => {
            // If you need to do anything with the user, do it here
            // The user will be logged in automatically by the
            // `onAuthStateChanged` listener we set up in App.js earlier
            this.setState({ loader: false });
            setTimeout(() => {
              console.log("Facebook User: ", user);
              console.log("Facebook User uid", user.uid);
              console.log("Facebook User Email", user.email);
              console.log("Facebook User name", user.displayName);
              var temp = this.userRef.child(user.uid);
              console.log("Facebook Fname", user.displayName.split(" ")[0]);
              console.log("Facebook Lname", user.displayName.split(" ")[1]);
              //temp.set({ email: user.email, firstname:user.displayName});
              //this.gotoDashboard()
            }, 500);

            var userTableRef = firebase.database().ref("User");
            userTableRef.once("value", data => {
              var userData = data.val();
              var keys = Object.keys(userData);
              console.log("User Auth", keys);
              if (userData.hasOwnProperty(user.uid)) {
                console.log("Fb login", "exist");
                fbLoginStatus = 1;
              } else {
                console.log("Fb login", "not exist");
                fbLoginStatus = 2;
              }
            });
            setTimeout(() => {
              console.log("fbLoginStatus", fbLoginStatus);
              if (fbLoginStatus === 2) {
                //new user(Sign up)
                this.setState({ loader: true });
                //https://us-central1-gymonkee-3cad2.cloudfunctions.net/createStripeCustomer?email=jaydeep.patel@bypt.n
                var url =
                  Strings.base_URL + "createStripeCustomer?email=" + user.email;
                console.log("createStripeCustomer url", url);
                fetch(url, {
                  method: "GET"
                })
                  .then(response => response.json())
                  .then(responseData => {
                    console.log("Response:", responseData);
                    this.setState({ loader: false });
                    setTimeout(() => {
                      console.log("Response User is", user.uid);
                      console.log("Response UserEmail is", user.email);

                      var temp = this.userRef.child(user.uid);
                      if (this.state.facebook_profile_pic_url !== '') {
                        temp.update({
                          email: user.email,
                          firstname: user.displayName.split(" ")[0],
                          lastname: user.displayName.split(" ")[1],
                          stripe_cust_id: responseData.id,
                          coinBalance: 0,
                          createdAt: firebase.database.ServerValue.TIMESTAMP,
                          createdBy: user.uid,
                          status: 1,
                          updatedAt: firebase.database.ServerValue.TIMESTAMP,
                          updatedBy: user.uid,
                          signInMethod: "Facebook",
                          birthdate: new Date(),
                          profileImage: this.state.facebook_profile_pic_url
                        });
                      } else {
                        temp.update({
                          email: user.email,
                          firstname: user.displayName.split(" ")[0],
                          lastname: user.displayName.split(" ")[1],
                          stripe_cust_id: responseData.id,
                          coinBalance: 0,
                          createdAt: firebase.database.ServerValue.TIMESTAMP,
                          createdBy: user.uid,
                          status: 1,
                          updatedAt: firebase.database.ServerValue.TIMESTAMP,
                          updatedBy: user.uid,
                          signInMethod: "Facebook",
                          birthdate: new Date(),
                        });
                      }


                      AsyncStorage.setItem("email", user.email);
                      AsyncStorage.setItem("profileImage", this.state.facebook_profile_pic_url);
                      AsyncStorage.setItem(
                        "firstname",
                        user.displayName.split(" ")[0]
                      );

                      AsyncStorage.setItem(
                        "lastname",
                        user.displayName.split(" ")[1]
                      );

                      AsyncStorage.setItem("stripe_cust_id", responseData.id);

                      AsyncStorage.setItem("user_id", user.uid);

                      AsyncStorage.setItem("birthdate", new Date());

                      this.gotoDashboard(true);
                    }, 500);
                  })
                  .catch(error => {
                    this.setState({ loader: false });
                    console.log("Error is:", error);
                  })
                  .done();
              } else if (fbLoginStatus === 1) {
                // login already user exist
                var currentUserRef = firebase
                  .database()
                  .ref("User")
                  .child(user.uid);
                currentUserRef.once("value", data => {
                  console.log("Data from login", data);
                  var userData = data.val();
                  var keys = Object.keys(userData);
                  AsyncStorage.setItem("user_id", user.uid);

                  if (
                    userData.type == "gymManager" ||
                    userData.type == "superAdmin"
                  ) {
                    Alert.alert(
                      Strings.gymonkee,
                      "Super admin or gym manager can't able to log in to the app",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            this._logoutFromFirebase();
                          }
                        }
                      ],
                      { cancelable: false }
                    );
                  } else if (userData.status === 0) {
                    Alert.alert(
                      Strings.gymonkee,
                      "Your account is deleted by admin.",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            this._logoutFromFirebase();
                          }
                        }
                      ],
                      { cancelable: false }
                    );
                  } else {
                    console.log("Success", "Success");
                    console.log("Login User id", this.state.user_id);

                    if (userData.hasOwnProperty("birthdate")) {
                      AsyncStorage.setItem("birthdate", userData.birthdate);
                    }
                    if (userData.hasOwnProperty("city")) {
                      AsyncStorage.setItem("city", userData.city);
                    }
                    if (userData.hasOwnProperty("email")) {
                      AsyncStorage.setItem("email", userData.email);
                    }
                    if (userData.hasOwnProperty("firstname")) {
                      AsyncStorage.setItem("firstname", userData.firstname);
                    }
                    if (userData.hasOwnProperty("gender")) {
                      AsyncStorage.setItem("gender", userData.gender);
                    }
                    if (userData.hasOwnProperty("lastname")) {
                      AsyncStorage.setItem("lastname", userData.lastname);
                    }
                    if (userData.hasOwnProperty("state")) {
                      AsyncStorage.setItem("state", userData.state);
                    }
                    if (userData.hasOwnProperty("profileImage")) {
                      if (this.state.facebook_profile_pic_url !== '') {
                        console.log("Inside not null profile url", this.state.facebook_profile_pic_url)
                        AsyncStorage.setItem("profileImage", this.state.facebook_profile_pic_url);
                      } else {
                        console.log("Inside  null profile url", this.state.facebook_profile_pic_url)
                        AsyncStorage.setItem("profileImage", userData.profileImage);
                      }
                    }
                    if (userData.hasOwnProperty("stripe_cust_id")) {
                      AsyncStorage.setItem(
                        "stripe_cust_id",
                        userData.stripe_cust_id
                      );
                    }

                    if (userData.hasOwnProperty("emergencyContactName")) {
                      AsyncStorage.setItem(
                        "emergencyContactName",
                        userData.emergencyContactName
                      );
                    }
                    if (userData.hasOwnProperty("emergencyContactNumber")) {
                      AsyncStorage.setItem(
                        "emergencyContactNumber",
                        userData.emergencyContactNumber
                      );
                    }
                    if (userData.hasOwnProperty("inviteURL")) {
                      AsyncStorage.setItem("inviteURL", userData.inviteURL);
                    }
                    if (userData.hasOwnProperty("inviteCode")) {
                      AsyncStorage.setItem("inviteCode", userData.inviteCode);
                    }

                    console.log("AsyncStorage", "Set Data");
                    //firebase.database().ref('User').child(user.uid).update({lastLoginAt:firebase.database.ServerValue.TIMESTAMP});

                    this.gotoDashboard(false);
                  }
                });
              }
            }, 1200);
          })
          .catch(error => {
            this.setState({ loader: false });
            const { code, message } = error;
            console.log("Facebook Error", error);
            setTimeout(() => {
              Alert.alert(Strings.gymonkee, error.message);
            }, 500);
          });
      } else {
        Alert.alert(Strings.gymonkee, Strings.internet_offline);
      }
    });
  }

  _logoutFromFirebase() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Login" })]
        });
        this.props.navigation.dispatch(resetAction);
      })
      .catch(error => {
        // An error happened
        console.log("Logout Error", error);
      });
  }
  gotoDashboard(isFromRegisteration) {
    //Go to dashboard if user is exist
    if (isFromRegisteration) {
      console.log("Login", "EditProfileScreen");

      const resetAction = NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({ routeName: "EditProfileScreen" })
        ]
      });
      this.props.navigation.dispatch(resetAction);
    } else {
      console.log("Login", "gotoDashboard");

      const resetAction = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: "Home" })]
      });
      this.props.navigation.dispatch(resetAction);
    }
  }

  //User Define Functions
  configureGoogleAndroid() {
    //Signin:- 1023271343111-u3nq2jsg8ffhv5uhriu556oe4gmtjlq5.apps.googleusercontent.com
    //service:- 1023271343111-lq8kgbcq86fv70v0n6upl15cvkpatu37.apps.googleusercontent.com
    GoogleSignin.hasPlayServices({ autoResolve: true });
    GoogleSignin.configure({
      webClientId: Strings.google_webClientId,
      offlineAccess: false
    });
    const user = GoogleSignin.currentUserAsync();
    console.log(user);
  }

  onClickGoogleLogin() {
    if (Platform.OS === "ios") {
      //api for create customer on stripe and set in firebase
      NetInfo.isConnected.fetch().done(isConnected => {
        this.setState({ netStatus: isConnected });

        if (isConnected) {
          this.setState({ loader: true });
          GoogleSignin.signOut()
            .then(() => {
              console.log("out");
              GoogleSignin.configure({
                iosClientId: Strings.google_iosClientId // only for iOS
              }).then(() => {
                // you can now call currentUserAsync()
                GoogleSignin.signIn()
                  .then(data => {
                    // Create a new Firebase credential with the token
                    const credential = firebase.auth.GoogleAuthProvider.credential(
                      data.idToken,
                      data.accessToken
                    );

                    // Login with the credential
                    return firebase.auth().signInWithCredential(credential);
                  })
                  .then(user => {
                    // If you need to do anything with the user, do it here
                    // The user will be logged in automatically by the
                    // `onAuthStateChanged` listener we set up in App.js earlier
                    this.setState({ loader: false });

                    var userTableRef = firebase.database().ref("User");
                    userTableRef.once("value", data => {
                      var userData = data.val();
                      var keys = Object.keys(userData);
                      console.log("User Auth", keys);
                      if (userData.hasOwnProperty(user.uid)) {
                        console.log("Google login", "exist");
                        googleLoginStatus = 1;
                      } else {
                        console.log("Google login", "not exist");
                        googleLoginStatus = 2;
                      }
                    });

                    // setTimeout(()=>{
                    //   console.log("Google User Object",user.email);
                    //   console.log("Google User Object",user);
                    //   var temp = this.userRef.child(user.uid)
                    //   temp.set({ email: user.email, firstname:user.displayName});
                    //
                    //
                    //                             this.setState({loader:true});
                    //                             //https://us-central1-gymonkee-3cad2.cloudfunctions.net/createStripeCustomer?email=jaydeep.patel@bypt.n
                    //                               var url = Strings.base_URL + 'createStripeCustomer?email='+user.email
                    //                               console.log("checkInGym url",url);
                    //                               fetch(url, {
                    //                                 method: 'GET',
                    //                               }).then((response) => response.json())
                    //                                   .then((responseData) => {
                    //
                    //
                    //                                     console.log("Response:",responseData);
                    //                                             this.setState({loader:false})
                    //                                             setTimeout(()=>{
                    //                                               console.log("Response User is",user.uid);
                    //                                               console.log("Response UserEmail is",user.email);
                    //                                                 var temp = this.userRef.child(user.uid)
                    //                                                 temp.set({ email: user.email, firstname:user.displayName,stripe_cust_id:responseData.id,coinBalance:0,createdAt:firebase.database.ServerValue.TIMESTAMP,createdBy:user.uid,status:1,updatedAt:firebase.database.ServerValue.TIMESTAMP,updatedBy:user.uid,lastLoginAt:firebase.database.ServerValue.TIMESTAMP});
                    //
                    //
                    //
                    //                                                   AsyncStorage.setItem("email",user.email);
                    //
                    //
                    //
                    //                                                   AsyncStorage.setItem("firstname",user.displayName);
                    //
                    //
                    //                                                   AsyncStorage.setItem("lastname",'');
                    //
                    //                                                   AsyncStorage.setItem("stripe_cust_id",responseData.id);
                    //
                    //
                    //                                                   AsyncStorage.setItem("user_id",user.uid);
                    //
                    //                                               this.gotoDashboard()
                    //                                             },500)
                    //
                    //                                   }).catch((error) => {
                    //                                       this.setState({loader:false});
                    //                                       console.log("Error is:",error);
                    //
                    //                                    }).done();
                    //
                    //
                    // },500)
                    setTimeout(() => {
                      console.log("googleLoginStatus", googleLoginStatus);
                      if (googleLoginStatus === 2) {
                        //new user(Sign up)
                        console.log("Google User Object", user.email);
                        console.log("Google User Object", user);
                        var temp = this.userRef.child(user.uid);
                        //temp.update({ email: user.email, firstname:user.displayName});

                        this.setState({ loader: true });
                        //https://us-central1-gymonkee-3cad2.cloudfunctions.net/createStripeCustomer?email=jaydeep.patel@bypt.n
                        var url =
                          Strings.base_URL +
                          "createStripeCustomer?email=" +
                          user.email;
                        console.log("checkInGym url", url);
                        fetch(url, {
                          method: "GET"
                        })
                          .then(response => response.json())
                          .then(responseData => {
                            console.log("Response:", responseData);
                            this.setState({ loader: false });
                            setTimeout(() => {
                              console.log("Response User is", user.uid);
                              console.log("Response UserEmail is", user.email);
                              var temp = this.userRef.child(user.uid);
                              temp.update({
                                email: user.email,
                                firstname: user.displayName,
                                stripe_cust_id: responseData.id,
                                coinBalance: 0,
                                createdAt:
                                  firebase.database.ServerValue.TIMESTAMP,
                                createdBy: user.uid,
                                status: 1,
                                updatedAt:
                                  firebase.database.ServerValue.TIMESTAMP,
                                updatedBy: user.uid,
                                lastLoginAt:
                                  firebase.database.ServerValue.TIMESTAMP,
                                signInMethod: "Google",
                                birthdate: new Date()
                              });

                              AsyncStorage.setItem("email", user.email);

                              AsyncStorage.setItem(
                                "firstname",
                                user.displayName
                              );

                              AsyncStorage.setItem("lastname", "");

                              AsyncStorage.setItem(
                                "stripe_cust_id",
                                responseData.id
                              );

                              AsyncStorage.setItem("birthdate", new Date());
                              AsyncStorage.setItem("user_id", user.uid);

                              this.gotoDashboard(true);
                            }, 500);
                          })
                          .catch(error => {
                            this.setState({ loader: false });
                            console.log("Error is:", error);
                          })
                          .done();
                      } else if (googleLoginStatus === 1) {
                        // login already user exist
                        var currentUserRef = firebase
                          .database()
                          .ref("User")
                          .child(user.uid);
                        currentUserRef.once("value", data => {
                          console.log("Data from login", data);
                          var userData = data.val();
                          var keys = Object.keys(userData);
                          AsyncStorage.setItem("user_id", user.uid);

                          if (
                            userData.type == "gymManager" ||
                            userData.type == "superAdmin"
                          ) {
                            Alert.alert(
                              Strings.gymonkee,
                              "Super admin or gym manager can't able to log in to the app",
                              [
                                {
                                  text: "OK",
                                  onPress: () => {
                                    this._logoutFromFirebase();
                                  }
                                }
                              ],
                              { cancelable: false }
                            );
                          } else if (userData.status === 0) {
                            Alert.alert(
                              Strings.gymonkee,
                              "Your account is deleted by admin.",
                              [
                                {
                                  text: "OK",
                                  onPress: () => {
                                    this._logoutFromFirebase();
                                  }
                                }
                              ],
                              { cancelable: false }
                            );
                          } else {
                            // Alert.alert("Success")
                            //Go to dashboard if user is exist

                            console.log("Success", "Success");
                            //console.log("Login User id",this.state.user_id);

                            if (userData.hasOwnProperty("birthdate")) {
                              AsyncStorage.setItem(
                                "birthdate",
                                userData.birthdate
                              );
                            }
                            if (userData.hasOwnProperty("city")) {
                              AsyncStorage.setItem("city", userData.city);
                            }
                            if (userData.hasOwnProperty("email")) {
                              AsyncStorage.setItem("email", userData.email);
                            }
                            if (userData.hasOwnProperty("firstname")) {
                              AsyncStorage.setItem(
                                "firstname",
                                userData.firstname
                              );
                            }
                            if (userData.hasOwnProperty("gender")) {
                              AsyncStorage.setItem("gender", userData.gender);
                            }
                            if (userData.hasOwnProperty("lastname")) {
                              AsyncStorage.setItem(
                                "lastname",
                                userData.lastname
                              );
                            }
                            if (userData.hasOwnProperty("state")) {
                              AsyncStorage.setItem("state", userData.state);
                            }
                            if (userData.hasOwnProperty("profileImage")) {
                              AsyncStorage.setItem(
                                "profileImage",
                                userData.profileImage
                              );
                            }
                            if (userData.hasOwnProperty("stripe_cust_id")) {
                              AsyncStorage.setItem(
                                "stripe_cust_id",
                                userData.stripe_cust_id
                              );
                            }

                            if (
                              userData.hasOwnProperty("emergencyContactName")
                            ) {
                              AsyncStorage.setItem(
                                "emergencyContactName",
                                userData.emergencyContactName
                              );
                            }
                            if (
                              userData.hasOwnProperty("emergencyContactNumber")
                            ) {
                              AsyncStorage.setItem(
                                "emergencyContactNumber",
                                userData.emergencyContactNumber
                              );
                            }
                            if (userData.hasOwnProperty("inviteURL")) {
                              AsyncStorage.setItem(
                                "inviteURL",
                                userData.inviteURL
                              );
                            }
                            if (userData.hasOwnProperty("inviteCode")) {
                              AsyncStorage.setItem(
                                "inviteCode",
                                userData.inviteCode
                              );
                            }

                            console.log("AsyncStorage", "Set Data");
                            //firebase.database().ref('User').child(user.uid).update({lastLoginAt:firebase.database.ServerValue.TIMESTAMP});

                            this.gotoDashboard(false);
                          }
                        });
                      }
                    }, 2000);
                  })
                  .catch(error => {
                    console.log("Error : ", error);
                    console.log("Error message : ", error.UserInfo);
                    const { code, message } = error;
                    this.setState({ loader: false });
                    // setTimeout(() => {
                    //   Alert.alert(Strings.gymonkee, error.message);
                    // }, 500);
                  });
              });
            })
            .catch(error => {
              this.setState({ loader: false });
              console.log("Google Sign In Error",error);
              setTimeout(() => {
                Alert.alert(Strings.gymonkee, error.message);
              }, 500);
            });
        } else {
          Alert.alert(Strings.gymonkee, Strings.internet_offline);
        }
      });
    } else {
      //api for create customer on stripe and set in firebase
      NetInfo.isConnected.fetch().done(isConnected => {
        this.setState({ netStatus: isConnected });

        if (isConnected) {
          GoogleSignin.hasPlayServices({ autoResolve: true })
            .then(() => {
              // play services are available. can now configure library
              this.setState({ loader: true });
              console.log("Inside true clock");
              GoogleSignin.signOut()
                .then(() => {
                  console.log("out");
                  GoogleSignin.signIn()
                    .then(data => {
                      // Create a new Firebase credential with the token
                      const credential = firebase.auth.GoogleAuthProvider.credential(
                        data.idToken,
                        data.accessToken
                      );

                      // Login with the credential
                      return firebase.auth().signInWithCredential(credential);
                    })
                    .then(user => {
                      //       // If you need to do anything with the user, do it here
                      //       // The user will be logged in automatically by the
                      //       // `onAuthStateChanged` listener we set up in App.js earlier
                      //       this.setState({ loader:false })
                      //       // setTimeout(()=>{
                      //       //   console.log("Google User Object",user.email);
                      //       //   console.log("Google User Object",user);
                      //       //   var temp = this.userRef.child(user.uid)
                      //       //   temp.set({ email: user.email, firstname:user.displayName});
                      //       //   this.gotoDashboard()
                      //       // },500)
                      //
                      //
                      // this.setState({loader:true});
                      //                                 //https://us-central1-gymonkee-3cad2.cloudfunctions.net/createStripeCustomer?email=jaydeep.patel@bypt.n
                      //                                   var url = Strings.base_URL + 'createStripeCustomer?email='+user.email
                      //                                   console.log("checkInGym url",url);
                      //                                   fetch(url, {
                      //                                     method: 'GET',
                      //                                   }).then((response) => response.json())
                      //                                       .then((responseData) => {
                      //                                        //Alert.alert("KK",JSON.stringify(data))
                      //
                      //                                         console.log("Response:",responseData);
                      //                                                 this.setState({loader:false})
                      //                                                 setTimeout(()=>{
                      //                                                   console.log("Response User is",user.uid);
                      //                                                   console.log("Response UserEmail is",user.email);
                      //                                                   var temp = this.userRef.child(user.uid)
                      //                                                   temp.set({ email: user.email, firstname:user.displayName,stripe_cust_id:responseData.id,coinBalance:0,createdAt:firebase.database.ServerValue.TIMESTAMP,createdBy:user.uid,status:1,updatedAt:firebase.database.ServerValue.TIMESTAMP,updatedBy:user.uid,lastLoginAt:firebase.database.ServerValue.TIMESTAMP});
                      //
                      //                                                   AsyncStorage.setItem("email",user.email);
                      //
                      //                                                   AsyncStorage.setItem("firstname",user.displayName);
                      //
                      //                                                   AsyncStorage.setItem("lastname",'');
                      //
                      //                                                   AsyncStorage.setItem("stripe_cust_id",responseData.id);
                      //
                      //                                                   AsyncStorage.setItem("user_id",user.uid);
                      //
                      //                                                   this.gotoDashboard()
                      //                                                 },500)
                      //
                      //                                       }).catch((error) => {
                      //                                           this.setState({loader:false});
                      //                                           console.log("Error is:",error);
                      //                                             // setTimeout(()=>{
                      //                                             //   Alert.alert(Strings.gymonkee,error.message);
                      //                                             // },1000)
                      //                                        }).done();
                      this.setState({ loader: false });

                      var userTableRef = firebase.database().ref("User");
                      userTableRef.once("value", data => {
                        var userData = data.val();
                        var keys = Object.keys(userData);
                        console.log("User Auth", keys);
                        if (userData.hasOwnProperty(user.uid)) {
                          console.log("Google login", "exist");
                          googleLoginStatus = 1;
                        } else {
                          console.log("Google login", "not exist");
                          googleLoginStatus = 2;
                        }
                      });

                      setTimeout(() => {
                        console.log("googleLoginStatus", googleLoginStatus);
                        if (googleLoginStatus === 2) {
                          //new user(Sign up)
                          console.log("Google User Object", user.email);
                          console.log("Google User Object", user);
                          var temp = this.userRef.child(user.uid);
                          //temp.update({ email: user.email, firstname:user.displayName});

                          this.setState({ loader: true });
                          //https://us-central1-gymonkee-3cad2.cloudfunctions.net/createStripeCustomer?email=jaydeep.patel@bypt.n
                          var url =
                            Strings.base_URL +
                            "createStripeCustomer?email=" +
                            user.email;
                          console.log("checkInGym url", url);
                          fetch(url, {
                            method: "GET"
                          })
                            .then(response => response.json())
                            .then(responseData => {
                              console.log("Response:", responseData);
                              this.setState({ loader: false });
                              setTimeout(() => {
                                console.log("Response User is", user.uid);
                                console.log(
                                  "Response UserEmail is",
                                  user.email
                                );
                                var temp = this.userRef.child(user.uid);
                                temp.update({
                                  email: user.email,
                                  firstname: user.displayName,
                                  stripe_cust_id: responseData.id,
                                  coinBalance: 0,
                                  createdAt:
                                    firebase.database.ServerValue.TIMESTAMP,
                                  createdBy: user.uid,
                                  status: 1,
                                  updatedAt:
                                    firebase.database.ServerValue.TIMESTAMP,
                                  updatedBy: user.uid,
                                  lastLoginAt:
                                    firebase.database.ServerValue.TIMESTAMP,
                                  signInMethod: "Google",
                                  birthdate: new Date()
                                });

                                AsyncStorage.setItem("email", user.email);

                                AsyncStorage.setItem(
                                  "firstname",
                                  user.displayName
                                );

                                AsyncStorage.setItem("lastname", "");

                                AsyncStorage.setItem(
                                  "stripe_cust_id",
                                  responseData.id
                                );

                                AsyncStorage.setItem("birthdate", new Date());
                                AsyncStorage.setItem("user_id", user.uid);

                                this.gotoDashboard(true);
                              }, 500);
                            })
                            .catch(error => {
                              this.setState({ loader: false });
                              console.log("Error is:", error);
                            })
                            .done();
                        } else if (googleLoginStatus === 1) {
                          // login already user exist
                          var currentUserRef = firebase
                            .database()
                            .ref("User")
                            .child(user.uid);
                          currentUserRef.once("value", data => {
                            console.log("Data from login", data);
                            var userData = data.val();
                            var keys = Object.keys(userData);
                            AsyncStorage.setItem("user_id", user.uid);

                            if (
                              userData.type == "gymManager" ||
                              userData.type == "superAdmin"
                            ) {
                              Alert.alert(
                                Strings.gymonkee,
                                "Super admin or gym manager can't able to log in to the app",
                                [
                                  {
                                    text: "OK",
                                    onPress: () => {
                                      this._logoutFromFirebase();
                                    }
                                  }
                                ],
                                { cancelable: false }
                              );
                            } else if (userData.status === 0) {
                              Alert.alert(
                                Strings.gymonkee,
                                "Your account is deleted by admin.",
                                [
                                  {
                                    text: "OK",
                                    onPress: () => {
                                      this._logoutFromFirebase();
                                    }
                                  }
                                ],
                                { cancelable: false }
                              );
                            } else {
                              // Alert.alert("Success")
                              //Go to dashboard if user is exist

                              console.log("Success", "Success");
                              //console.log("Login User id",this.state.user_id);

                              if (userData.hasOwnProperty("birthdate")) {
                                AsyncStorage.setItem(
                                  "birthdate",
                                  userData.birthdate
                                );
                              }
                              if (userData.hasOwnProperty("city")) {
                                AsyncStorage.setItem("city", userData.city);
                              }
                              if (userData.hasOwnProperty("email")) {
                                AsyncStorage.setItem("email", userData.email);
                              }
                              if (userData.hasOwnProperty("firstname")) {
                                AsyncStorage.setItem(
                                  "firstname",
                                  userData.firstname
                                );
                              }
                              if (userData.hasOwnProperty("gender")) {
                                AsyncStorage.setItem("gender", userData.gender);
                              }
                              if (userData.hasOwnProperty("lastname")) {
                                AsyncStorage.setItem(
                                  "lastname",
                                  userData.lastname
                                );
                              }
                              if (userData.hasOwnProperty("state")) {
                                AsyncStorage.setItem("state", userData.state);
                              }
                              if (userData.hasOwnProperty("profileImage")) {
                                AsyncStorage.setItem(
                                  "profileImage",
                                  userData.profileImage
                                );
                              }
                              if (userData.hasOwnProperty("stripe_cust_id")) {
                                AsyncStorage.setItem(
                                  "stripe_cust_id",
                                  userData.stripe_cust_id
                                );
                              }

                              if (
                                userData.hasOwnProperty("emergencyContactName")
                              ) {
                                AsyncStorage.setItem(
                                  "emergencyContactName",
                                  userData.emergencyContactName
                                );
                              }
                              if (
                                userData.hasOwnProperty(
                                  "emergencyContactNumber"
                                )
                              ) {
                                AsyncStorage.setItem(
                                  "emergencyContactNumber",
                                  userData.emergencyContactNumber
                                );
                              }
                              if (userData.hasOwnProperty("inviteURL")) {
                                AsyncStorage.setItem(
                                  "inviteURL",
                                  userData.inviteURL
                                );
                              }
                              if (userData.hasOwnProperty("inviteCode")) {
                                AsyncStorage.setItem(
                                  "inviteCode",
                                  userData.inviteCode
                                );
                              }
                              console.log("AsyncStorage", "Set Data");
                              //firebase.database().ref('User').child(user.uid).update({lastLoginAt:firebase.database.ServerValue.TIMESTAMP});
                              this.gotoDashboard(false);
                            }
                          });
                        }
                      }, 2000);
                    })
                    .catch(error => {
                      const { code, message } = error;
                      console.log("Google error", error.message);
                      this.setState({ loader: false });
                      // setTimeout(() => {
                      //   Alert.alert(Strings.gymonkee, error.message);
                      // }, 500);
                    });
                })
                .catch(err => {
                  this.setState({ loader: false });
                  setTimeout(() => {
                    Alert.alert(Strings.gymonkee, err.message);
                  }, 500);
                });
            })
            .catch(err => {
              console.log("Play services error", err.code, err.message);
              this.setState({ loader: false });
              setTimeout(() => {
                Alert.alert(Strings.gymonkee, err.message);
              }, 500);
            });
        } else {
          Alert.alert(Strings.gymonkee, Strings.internet_offline);
        }
      });
    }
  }

  async getUser({ access_token }) {
    this.setState({ refreshing: true });
    const baseApi = "https://api.linkedin.com/v1/people/";
    const qs = { format: "json" };
    const params = [
      "first-name",
      "last-name",
      "picture-urls::(original)",
      "headline",
      "email-address",
      "id"
    ];

    const response = await fetch(
      `${baseApi}~:(${params.join(",")})?format=json`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token
        }
      }
    );
    const payload = await response.json();
    console.log("Payload LinkedInModal", payload);
    /*
    'Payload LinkedInModal', { emailAddress: 'bypt.trainee@gmail.com',
                                                               firstName: 'bypt',
                                                               headline: 'Software Engineer at byPeople Technologies',
                                                               id: '0xygVJD6BG',
                                                               lastName: 'trainee' }
    */

    this.setState({ loader: true });
    firebase
      .auth()
      .signInWithEmailAndPassword(payload.emailAddress, payload.id)
      .then(user => {
        console.log("User", user);
        this.setState({ loader: false });
        setTimeout(() => {
          var currentUser = firebase.auth().currentUser;
          console.log("Current User:", currentUser);
          var currentUserRef = firebase
            .database()
            .ref("User")
            .child(currentUser.uid);
          console.log("Current User Ref UID:", currentUserRef.uid);

          currentUserRef.on("value", data => {
            console.log("Data from login", data);
            var userData = data.val();

            console.log("UserData",userData);

            var keys = Object.keys(userData);
            AsyncStorage.setItem("user_id", currentUser.uid);
            console.log("Login Fid", currentUser.uid);

            if (
              userData.type == "gymManager" ||
              userData.type == "superAdmin"
            ) {
              Alert.alert(
                Strings.gymonkee,
                "Super admin or gym manager can't able to log in to the app",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      this._logoutFromFirebase();
                    }
                  }
                ],
                { cancelable: false }
              );
            } else if (userData.status === 0) {
              Alert.alert(
                Strings.gymonkee,
                "Your account is deleted by admin.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      this._logoutFromFirebase();
                    }
                  }
                ],
                { cancelable: false }
              );
            } else {
              // Alert.alert("Success")
              //Go to dashboard if user is exist
              console.log("Success login", "LinkedInModal");
              loginStatus = 1;

              if (userData.hasOwnProperty("birthdate")) {
                AsyncStorage.setItem("birthdate", userData.birthdate);
              }
              if (userData.hasOwnProperty("city")) {
                AsyncStorage.setItem("city", userData.city);
              }
              if (userData.hasOwnProperty("email")) {
                AsyncStorage.setItem("email", userData.email);
              }
              if (userData.hasOwnProperty("firstname")) {
                AsyncStorage.setItem("firstname", userData.firstname);
              }
              if (userData.hasOwnProperty("gender")) {
                AsyncStorage.setItem("gender", userData.gender);
              }
              if (userData.hasOwnProperty("lastname")) {
                AsyncStorage.setItem("lastname", userData.lastname);
              }
              if (userData.hasOwnProperty("state")) {
                AsyncStorage.setItem("state", userData.state);
              }
              if (userData.hasOwnProperty("profileImage")) {
                AsyncStorage.setItem("profileImage", userData.profileImage);
              }
              if (userData.hasOwnProperty("stripe_cust_id")) {
                AsyncStorage.setItem("stripe_cust_id", userData.stripe_cust_id);
              }
              if (userData.hasOwnProperty("emergencyContactName")) {
                AsyncStorage.setItem(
                  "emergencyContactName",
                  userData.emergencyContactName
                );
              }
              if (userData.hasOwnProperty("emergencyContactNumber")) {
                AsyncStorage.setItem(
                  "emergencyContactNumber",
                  userData.emergencyContactNumber
                );
              }
            }
          });
          setTimeout(() => {
            console.log("loginStatus linkedin", loginStatus);
            if (loginStatus == 1) {
              firebase
                .database()
                .ref("User")
                .child(currentUser.uid)
                .update({
                  lastLoginAt: firebase.database.ServerValue.TIMESTAMP
                });
              this.gotoDashboard(false);
            }
          }, 1000);
        }, 3000);
      })
      .catch(error => {
        const { code, message } = error;
        console.log("Response Login Error", error);
        this.setState({ loader: false });
        // setTimeout(()=>{
        //   Alert.alert(Strings.gymonkee,error.message);
        // },500)
        this.setState({ loader: true });
        firebase
          .auth()
          .createUserWithEmailAndPassword(payload.emailAddress, payload.id)
          .then(user => {
            this.setState({ loader: false });
            // setTimeout(()=>{
            //   console.log("Response User is",user.uid);
            //   console.log("Response UserEmail is",user.email);
            //   var temp = this.userRef.child(user.uid)
            //   console.log("Temp isss:",temp);
            //   temp.set({ email: payload.emailAddress, firstname:payload.firstName, lastname:payload.lastName});
            //   this.gotoDashboard()
            //
            // },500)

            //api for create customer on stripe and set in firebase
            NetInfo.isConnected.fetch().done(isConnected => {
              this.setState({ netStatus: isConnected });

              if (isConnected) {
                this.setState({ loader: true });
                //https://us-central1-gymonkee-3cad2.cloudfunctions.net/createStripeCustomer?email=jaydeep.patel@bypt.n
                var url =
                  Strings.base_URL +
                  "createStripeCustomer?email=" +
                  payload.emailAddress;
                console.log("createStripeCustomer url using linkedin", url);
                fetch(url, {
                  method: "GET"
                })
                  .then(response => response.json())
                  .then(responseData => {
                    //Alert.alert("KK",JSON.stringify(data))

                    console.log("Response:", responseData);
                    this.setState({ loader: false });
                    setTimeout(() => {
                      console.log("Response User is", user.uid);
                      console.log("Response UserEmail is", user.email);
                      var temp = this.userRef.child(user.uid);
                      console.log("Temp isss:", temp);
                      temp.update({
                        email: payload.emailAddress,
                        firstname: payload.firstName,
                        lastname: payload.lastName,
                        stripe_cust_id: responseData.id,
                        coinBalance: 0,
                        createdAt: firebase.database.ServerValue.TIMESTAMP,
                        createdBy: user.uid,
                        status: 1,
                        updatedAt: firebase.database.ServerValue.TIMESTAMP,
                        updatedBy: user.uid,
                        lastLoginAt: firebase.database.ServerValue.TIMESTAMP,
                        signInMethod: "LinkedIn",
                        birthdate: new Date()
                      });

                      AsyncStorage.setItem("email", payload.emailAddress);

                      AsyncStorage.setItem("firstname", payload.firstName);

                      AsyncStorage.setItem("lastname", payload.lastName);

                      AsyncStorage.setItem("stripe_cust_id", responseData.id);

                      AsyncStorage.setItem("birthdate", new Date());
                      AsyncStorage.setItem("user_id", user.uid);
                      this.gotoDashboard(true);
                    }, 500);
                  })
                  .catch(error => {
                    this.setState({ loader: false });
                    console.log("Error is:", error);
                    // setTimeout(()=>{
                    //   Alert.alert(Strings.gymonkee,error.message);
                    // },1000)
                  })
                  .done();
              } else {
                Alert.alert(Strings.gymonkee, Strings.internet_offline);
              }
            });
          })
          .catch(error => {
            const { code, message } = error;
            this.setState({ loader: false });
            setTimeout(() => {
              Alert.alert(Strings.gymonkee, error.message);
            }, 500);
          });
      });

    // firebase.auth().currentUser.linkWithCredential(access_token).then(function(user) {
    //   console.log("Anonymous account successfully upgraded", user);
    // }, function(error) {
    //   console.log("Error upgrading anonymous account", error);
    // });

    //   firebase.auth.signInWithCustomToken(access_token)
    // .then((user) => {
    //   console.log('User successfully logged in', user)
    // })
    // .catch((err) => {
    //   console.error('User signin error', err);
    // })
  }

  ////account linkedin
  //Email :- bypt.trainee@gmail.com
  //password:- trainee@2017
  //clientID="815of0a20v1m02"
  //clientSecret="qpCxoAgkzaozZj6u"
  //Main View Rendering

  // <LinkedInModal
  //      ref={ref => {
  //        this.modal = ref
  //      }}
  //      clientID="815of0a20v1m02"
  //      clientSecret="qpCxoAgkzaozZj6u"
  //      redirectUri="https://www.bypeopletechnologies.com/"
  //      onSuccess={data => this.getUser(data)}
  //    />
  render() {
    return (
          <ImageBackground source={{ uri: 'splash_bg' }} style={{ height: null, width: null, flex: 10 }}>
           <View style={{ alignItems: "center" }}>{this.loader()}</View>
            <LinkedInModal
              ref={ref => {
                this.modal = ref;
              }}
              clientID={Strings.linkedin_clientID}
              clientSecret={Strings.linkedin_clientSecret}
              redirectUri={Strings.linkedin_redirectUri}
              onSuccess={data => this.getUser(data)}
              linkText=""
            />
            <MyStatusBar backgroundColor={Colors.header_red}  barStyle="light-content" hidden={false} />
            <View style={styles.topview}>
              <Image source={{ uri: "splash_logo" }} style={styles.logo} resizeMode="contain"/>
            </View>
            <View style={styles.middleview}></View>
            <View style={styles.bottomtopview}>
              <Text style={{ fontFamily: Fonts.regular,color:'#fff', fontSize:DeviceInfo.getModel() === ModelIphoneX? 22
                    : deviceHeight > 600 ? 22 : 19 }}>
                Already a member?
              </Text>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Login_Main")}>
                <Image source={ require('../../assets/continuewith/login.png') }   style={styles.buttonc1} resizeMode="contain"/>
              </TouchableOpacity>
            </View>
            <View style={styles.bottomtopviewsignup}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Signup")}>
                  <Image source={ require('../../assets/continuewith/signup.png') } style={styles.buttonc} resizeMode="contain"/>
                </TouchableOpacity>  
            </View>
            <View style={styles.bottomview}>
              <Text style={{ fontFamily: Fonts.regular,color:'#fff',fontSize:DeviceInfo.getModel() === ModelIphoneX? 22
                    : deviceHeight > 600 ? 22 : 19 }}>
                CONTINUE WITH
              </Text>
              <View style={styles.sociallogin}>
                <TouchableOpacity onPress={() => this.fbLogin()} style={{ flex: 0.35, borderWidth: 0, alignItems: "flex-end" }}>
                  <Image source={ require('../../assets/continuewith/04.png') } style={{ height: DeviceInfo.getModel() === ModelIphoneX ? 65 : 60,
                    width: 100,borderWidth: 0}} resizeMode="contain" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.modal.open()} style={{ flex: 0.35, borderWidth: 0, alignItems: "center" }}>
                  <Image source={ require('../../assets/continuewith/05.png') } style={{ height: DeviceInfo.getModel() === ModelIphoneX ? 65 : 60, width: 100,borderWidth: 0 }} resizeMode="contain" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onClickGoogleLogin()} style={{ flex: 0.35, borderWidth: 0, alignItems: "flex-start" }} >
                  <Image source={ require('../../assets/continuewith/06.png') } style={{ height: DeviceInfo.getModel() === ModelIphoneX ? 65 : 60,width: 100,borderWidth: 0}} resizeMode="contain"/>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  container: {

    backgroundColor: Colors.theme_old_background
  },
  statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor: "#79B45D",
    height: APPBAR_HEIGHT
  },
  topview: {
    flex: 2,
    alignItems: 'center',
  },
  middleview: {
    flex: 1,
    alignItems: 'center',
  },
  bottomtopview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  bottomtopviewsignup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop:5,
  },
  bottomview: {
    flex: 2,
    alignItems: 'center',
  },
  logo: {
    flex: 1,
    width: (Dimensions.get('window').width - 90),
    height: 120,
  },
  buttonc: {
    width: (Dimensions.get('window').width - 90),
    height: 120,
    borderRadius:10,
  },
  buttonc1: {
    width: (Dimensions.get('window').width - 90),
    borderRadius:10,
    height: 120
  },
  sociallogin: {
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    margin: 50,
  },
});
module.exports = Login;
