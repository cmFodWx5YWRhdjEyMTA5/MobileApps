//FriendList
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
  PermissionsAndroid,
  Linking,
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
var Contacts = require('react-native-contacts');
import Communications from 'react-native-communications';

const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
import { Picker, DatePicker } from 'react-native-wheel-datepicker';

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

const inviteText = "Check out GYMONKEE, I use it to swing in gyms when I am traveling or when I just want to check out a new gym..."
class FriendListScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isChecked: false,
      loader: false,
      contactsArr: [],
      contactsArrMain: [],
      arrContactUploadArr: [],
      srchData: [],
      inviteURL: '',
      search_text: '',
      searchCancelVisible: false,
      showPlaceHolder: false,
      user_id: '',
    }
  }


  static navigationOptions = ({ navigation, screenProps }) => {
    const params = navigation.state.params || {};
    return {
      title: "Friends list",
      header: <View style={{ marginTop: (DeviceInfo.getModel() === 'iPhone 7') ? -24 : ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c')) ? -28 : -14, }}><ImageBackground source={{ uri: 'shape_red_top_without_shadow' }} resizeMode="contain" style={{ height: (DeviceInfo.getModel() === ModelIphoneX) ? 160 : 150, width: deviceWidth }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() =>
            navigation.dispatch(NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'ProfileScreen', params: { comeFrom: 'share' } })],
            }))} style={{ flex: 0.1, alignItems: 'center', borderWidth: 0, marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? 50 : 40, justifyContent: 'center', padding: 10 }}><Image source={{ uri: "back_arrow_white" }} style={styles.back_icon} /></TouchableOpacity>
          <View style={{ flex: 0.9, alignItems: 'flex-end', justifyContent: 'center', marginTop: (DeviceInfo.getModel() === ModelIphoneX) ? 50 : 40 }}>

            <Text style={{ color: '#ffffff', alignSelf: 'center', textAlign: 'center', fontSize: 18, justifyContent: 'center', fontWeight: '400', fontFamily: Fonts.SFU_REGULAR, paddingRight: 40 }}>Add Friends</Text>
          </View>
        </View>
      </ImageBackground></View>,
      headerStyle: { backgroundColor: Colors.header_red, borderBottomWidth: 0, shadowColor: 'transparent', elevation: 0, marginTop: (Platform.OS === 'android') ? 20 : 0 },
      headerTitleStyle: HeaderStyle.titleCenter,

    }
  }

  //Life Cycle Methods
  componentWillMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });
  }
  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    NetInfo.isConnected.fetch().done((isConnected) => { this.setState({ netStatus: isConnected }); });

    //getting current logged in user id and stored it in our state
    var currentUser = firebase.auth().currentUser;
    this.setState({ user_id: currentUser.uid },()=>{
      console.log("User _ id is::",this.state.user_id)
    })

    if (Platform.OS === 'ios') {
      this.fetchContacts()
    }

    else {
      //this.fetchContacts()
    }
    AsyncStorage.getItem("inviteURL").then((value) => {
      console.log("inviteURL", value);
      this.setState({ inviteURL: value })
    }).done();

  }

  //handle Internetconnection
  handleConnectionChange = (isConnected) => {
    this.setState({ netStatus: isConnected });
    console.log(`is connected: ${this.state.netStatus}`);
  }

  async requestPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the READ_CONTACTS")
        this.fetchContacts()
      } else {
        console.log("READ_CONTACTS permission denied")
      }
    } catch (err) {
      console.warn(err)
    }
  }


  async componentWillMount() {
    await this.requestPermission()
  }


  //Functions:=

  //loader
  loader() {
    if (this.state.loader) {
      return (
        <View>
          <Spinner visible={this.state.loader} textContent={""} textStyle={{ color: '#3e4095' }} color={Colors.header_red} />
        </View>
      )
    }
  }



  buttonClick(index) {
    const tempArr = [...this.state.contactsArrMain]
    var clickIndex = index
    this.state.contactsArrMain.map((data, index) => {
      if (index === clickIndex) {
        tempArr[index].isSend = true
        var cont = tempArr[index].phoneNumber
        setTimeout(() => {
          var inviteURL = this.state.inviteURL
          Communications.textWithoutEncoding(cont, inviteText +' '+inviteURL);
        }, 600)
      }
    })
    this.setState({
      contactsArrMain: tempArr
    })
  }

  fetchContacts() {
    this.setState({ loader: true, contactsArr: [] });
    Contacts.getAll((err, contacts) => {
      console.log("Contacts are:", contacts);
      if (err === 'denied') {
        this.setState({ loader: false, showPlaceHolder: true })
        setTimeout(() => {
          Alert.alert(Strings.gymonkee, "Error in Fetching Contacts");
        }, 700)
      }
      else {
        if (contacts.length > 0) {
          var tempContact = [];
          contacts.map((data, index) => {
            if (data.givenName !== '' || data.familyName !== '') {
              if (data.phoneNumbers.length > 0) {
                tempContact.push(data)
              }
            }
          })
          this.setState({ arrContactUploadArr: tempContact }, () => {
            this.getFriendList()
          })
        } else {
          this.setState({ loader: false, showPlaceHolder: true })
        }
      }
    })
  }

  getFriendList() {
    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({ netStatus: isConnected });

      if (isConnected) {        
        var url = Strings.base_URL + 'friendContactList'
        fetch(url, {
          method: 'POST',
          headers:
          {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: this.state.user_id, contactList: this.state.arrContactUploadArr })
        }).then((response) => response.json())
          .then((responseData) => {
            this.setState({ loader: false });
            console.log("Response Gyms:", responseData);
            let tempData = [];

            responseData.map((data, index) => {
              let checkIsUser = data.hasOwnProperty("userId")
              let checkIsFrnd = data.hasOwnProperty("isFriend")

              if (data.givenName !== '') {                
                tempData.push({ "name": data.givenName, "phoneNumber": data.phoneNumbers[0].number, "isSend": false, "userId": (checkIsUser) ? data.userId : '', "isFriend": (checkIsFrnd) ? data.isFriend : '' })
              } else if (data.familyName !== '') {
                tempData.push({ "name": data.familyName, "phoneNumber": data.phoneNumbers[0].number, "isSend": false, "userId": (checkIsUser) ? data.userId : '', "isFriend": (checkIsFrnd) ? data.isFriend : '' })
              }

            })
            this.setState({
              contactsArrMain: tempData,
              srchData:tempData
            })
          }).catch((error) => {
            this.setState({ loader: false });
            console.log("Error is:", error);
          }).done();
      }
      else {
        Alert.alert(Strings.avanza, Strings.internet_offline, [
          { text: "OK", onPress: () => this.setState({ loader: false }) }
        ]);
      }
    });
  }

  onClickFriend(index) {
    // this.props.navigation.navigate("FriendProfileScreen")
  }


  onClickBtnAddFrnd(index) {
    var getData = this.state.contactsArrMain[index]
    var friendId = getData.userId
    var currentUserId = this.state.user_id

    var getFrndTableData = firebase.database().ref('User').child(friendId)
    var frndDictionary = {}
    getFrndTableData.once('value', (snapshot) => {
      var frndData = snapshot.val()
      var keys = Object.keys(frndData)
      console.log("Samne wala frnd data:", frndData.profileImage)
      frndDictionary = {
        email: frndData.email,
        name: frndData.firstname,
        profileImage: (frndData.hasOwnProperty('profileImage')) ? frndData.profileImage : 'https://firebasestorage.googleapis.com/v0/b/gymonkee-3cad2.appspot.com/o/Resources%2Fplaceholder_img.png?alt=media'
      }
    })

    var getCurrentUSerData = firebase.database().ref('User').child(currentUserId)
    var currUserDict = {}
    getCurrentUSerData.once('value', (snapshot) => {
      var userData = snapshot.val()
      var keys = Object.keys(userData)
      currUserDict = {
        email: userData.email,
        name: userData.firstname,
        profileImage: (userData.hasOwnProperty('profileImage')) ? userData.profileImage : 'https://firebasestorage.googleapis.com/v0/b/gymonkee-3cad2.appspot.com/o/Resources%2Fplaceholder_img.png?alt=media'
      }
    })
    setTimeout(() => {
      var frndRef = firebase.database().ref('Friendship').child(friendId);
      var currentUserRef = firebase.database().ref('Friendship').child(currentUserId)

      //Setting up data in frind table friend user id 
      frndRef.child(currentUserId).set(currUserDict).then(() => {
        //Setting up data in frind table current user id 
        currentUserRef.child(friendId).set(frndDictionary).then(() => {

          // Below code for changing button state from add to remove
          const tempArr = [...this.state.contactsArrMain]
          var clickIndex = index
          this.state.contactsArrMain.map((data, index) => {
            if (index === clickIndex) {
              tempArr[index].isFriend = "1"
            }
          })
          this.setState({
            contactsArrMain: tempArr
          }, () => {
            Alert.alert(Strings.gymonkee, "Successfully added to the friend list")
          })
        })
      })

    }, 600)


  }

  onClickBtnRemoveFrnd(index) {
    var getData = this.state.contactsArrMain[index]
    var friendId = getData.userId
    var currentUserId = this.state.user_id
    var frndRef = firebase.database().ref('Friendship').child(friendId);
    var currentUserRef = firebase.database().ref('Friendship').child(currentUserId)

    setTimeout(() => {
      frndRef.child(currentUserId).remove().then(() => {
        currentUserRef.child(friendId).remove().then(() => {
          // Below code for changing button state from add to remove
          const tempArr = [...this.state.contactsArrMain]
          var clickIndex = index
          this.state.contactsArrMain.map((data, index) => {
            if (index === clickIndex) {
              tempArr[index].isFriend = ""
            }
          })
          this.setState({
            contactsArrMain: tempArr
          }, () => {
            Alert.alert(Strings.gymonkee, "Successfully remove from the friend")
          })          
        })
      })
    }, 600)

  }

  renderTouchableView(index, btnText) {
    if (btnText === 'Remove') {
      return (
        <TouchableOpacity onPress={() => this.onClickBtnRemoveFrnd(index)} style={{ borderWidth: 0, flex: 1, justifyContent: 'center' }}>
          <View style={{ flex: 1, marginLeft: 20, marginRight: 20, marginTop: 15, marginBottom: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 0, borderRadius: 20, backgroundColor: Colors.header_red }}>
            <Text style={{ color: Colors.white, fontWeight: '600' }}>{btnText}</Text>
          </View>
        </TouchableOpacity>
      )
    } else if (btnText === 'Add') {
      return (
        <TouchableOpacity onPress={() => this.onClickBtnAddFrnd(index)} style={{ borderWidth: 0, flex: 1, justifyContent: 'center' }}>
          <View style={{ flex: 1, marginLeft: 20, marginRight: 20, marginTop: 15, marginBottom: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 0, borderRadius: 20, backgroundColor: Colors.header_red }}>
            <Text style={{ color: Colors.white, fontWeight: '600' }}>{btnText}</Text>
          </View>
        </TouchableOpacity>
      )
    } else if (btnText === 'Invite') {
      return (
        <TouchableOpacity onPress={() => this.buttonClick(index)} style={{ borderWidth: 0, flex: 1, justifyContent: 'center' }}>
          <View style={{ flex: 1, marginLeft: 20, marginRight: 20, marginTop: 15, marginBottom: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 0, borderRadius: 20, backgroundColor: Colors.header_red }}>
            <Text style={{ color: Colors.white, fontWeight: '600' }}>{btnText}</Text>
          </View>
        </TouchableOpacity>
      )
    }
  }

  renderWithoutTouchView(isTrue) {
    if (isTrue) {
      return (
        <View style={{ borderWidth: 0, flex: 1, justifyContent: 'center' }}>
          <Image source={{ uri: 'check_mark' }} style={styles.logo1} resizeMode="contain"></Image>
        </View>
      )
    } else {
      return (<View />)
    }
  }

  displayContacts(item, index) {
    return <View style={{ height: 60, flexDirection: 'row', borderWidth: 0, marginTop: 30 }}>
      <View style={{ borderWidth: 0, flex: 1 }}>
        <Image source={{ uri: "placeholder_img" }} style={styles.logo} resizeMode="contain"></Image>
      </View>
      <View style={{ borderWidth: 0, flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontFamily: Fonts.regular, fontSize: 16 }}>{item.name}</Text>
      </View>

      {(item.userId !== '' && item.isFriend === '1') && this.renderTouchableView(index, "Remove")}

      {(item.userId !== '' && item.isFriend === '') && this.renderTouchableView(index, "Add")}

      {(item.userId === '' && item.isFriend === '' && !item.isSend) ? this.renderTouchableView(index, "Invite") : this.renderWithoutTouchView(item.isSend)}

    </View>
  }

  // displayContacts() {
  //   if (this.state.contactsArrMain.length > 0) {
  //     return this.state.contactsArrMain.map((data, index) => {
  //       return (
  //         <TouchableOpacity onPress={() => this.onClickFriend(index)} style={{ height: 60, flexDirection: 'row', borderWidth: 0, marginTop: 30 }}>
  //           <View style={{ borderWidth: 0, flex: 1 }}>
  //             <Image source={{ uri: "placeholder_img" }} style={styles.logo} resizeMode="contain"></Image>
  //           </View>
  //           <View style={{ borderWidth: 0, flex: 1, justifyContent: 'center' }}>
  //             <Text style={{ fontFamily: Fonts.regular, fontSize: 16 }}>{data.name}</Text>
  //           </View>
  //           {(data.isSend === false) ? <TouchableOpacity onPress={() => this.buttonClick(index)} style={{ borderWidth: 0, flex: 1, justifyContent: 'center' }}>
  //             <Image source={{ uri: (data.isSend === true) ? 'check_mark' : 'add_btn' }} style={styles.logo1} resizeMode="contain"></Image>
  //           </TouchableOpacity> :
  //             <View style={{ borderWidth: 0, flex: 1, justifyContent: 'center' }}>
  //               <Image source={{ uri: (data.isSend === true) ? 'check_mark' : 'add_btn' }} style={styles.logo1} resizeMode="contain"></Image>
  //             </View>}

  //         </TouchableOpacity>
  //       )
  //     })
  //   } else {
  //     return (
  //       <View style={{ justifyContent: 'center', alignItems: 'center', height: 200, borderWidth: 0 }}>
  //         {(this.state.showPlaceHolder) ? <Text style={{ fontFamily: Fonts.SFU_BOLD, fontSize: 20, color: Colors.header_red + '50' }}>No Result...!</Text> : <Text></Text>}
  //       </View>
  //     )
  //   }
  // }

  searchText(searchText) {
    this.setState({
      search_text: searchText
    })
    if (searchText === '') {
      this.setState({
        searchCancelVisible: false,
        contactsArrMain: this.state.srchData
      })
      // return []
    } else {
      this.setState({
        searchCancelVisible: true,
      })
    }
    // Alert.alert("TEXT",JSON.stringify(searchText))
    const { contactsArrMain } = this.state;
    var temp = this.state.srchData;
    var d = temp.filter(temp => temp.name.toUpperCase().search(searchText.toUpperCase().trim()) >= 0);

    if (d.length > 0) {
      this.setState({
        contactsArrMain: d
      })
      // this.displayContacts()
    } else {
      this.setState({
        contactsArrMain: []
      })
      // this.displayContacts()
    }

  }

  onClickCancelBtn() {
    Keyboard.dismiss()
    this.setState({
      searchCancelVisible: false,
      search_text: '',
      contactsArrMain: this.state.srchData
    })
  }

  //Design:=
  render() {
    return (
      <View style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          {this.loader()}
        </View>

        <MyStatusBar backgroundColor={Colors.header_red} barStyle="dark-content" hidden={false} />
        <View style={{ flex: 1.5 }}>

        </View>
        <View style={{ flex: 8.5, borderWidth: 0 }}>
          <View style={{ flex: 0.5 }} />

          <View style={{ flex: (Platform.OS === 'android') ? 0.7 : 0.6, flexDirection: 'row', borderWidth: 1, borderColor: Colors.header_red, borderRadius: (Platform.OS === 'android') ? 15 : 10, marginLeft: 30, marginRight: 30 }}>
            <View style={{ flex: 0.8 }}>
              <TextInput
                placeholder='Enter name to search'
                style={{ fontFamily: Fonts.regular, fontSize: (Platform.OS === 'android') ? 14 : 15, color: Colors.header_red, borderWidth: 0, paddingHorizontal: 10, flex: 1 }}
                ref='search_text'
                placeholderTextColor="rgb(115,119,118)"
                underlineColorAndroid='transparent'
                onChangeText={(text) => this.searchText(text)}
                value={this.state.search_text}
                returnKeyType="done"
              />
            </View>
            <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
              {(this.state.searchCancelVisible === true) ? <TouchableOpacity onPress={() => this.onClickCancelBtn()}><Image style={{ height: 20, width: 20 }} source={{ uri: 'cancel_icon' }} resizeMode="contain" /></TouchableOpacity> : <View />}
            </View>
          </View>
          <View style={{ flex: 8 }}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this.state.contactsArrMain}
              keyExtractor={(item, index) => index}
              renderItem={({ item, index }) => this.displayContacts(item, index)}
              extraData={this.state.contactsArrMain}
            />
          </View>
        </View>

      </View>
    );
  }
}
//Style:=
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
  logo:
  {
    width: null,
    height: null,
    flex: 1,
  },
  logo1:
  {
    width: null,
    height: null,
    flex: 0.8,
  },
  back_icon: {
    height: 20,
    width: 20,
    marginLeft: 10,
  },
});
module.exports = FriendListScreen;
