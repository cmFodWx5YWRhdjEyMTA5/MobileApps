import React, { Component } from 'react';
import { ScrollView,
 View,
 Text,
 StyleSheet,
 Image,
 TouchableOpacity,
 AsyncStorage,
 Alert,
 NetInfo,
 ActivityIndicator,
 Switch,
 I18nManager,
 Platform,
 StatusBar,
 SafeAreaView,
 ImageBackground,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import Colors from './../Utils/Colors';
import Fonts from './../Utils/Fonts';
import DeviceInfo from 'react-native-device-info';
import * as firebase from 'firebase';
import Strings from './../Utils/Strings';



const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);


class DrawerMenu extends Component {
  constructor(props) {
    super(props);
    this.state={
      loader:false,
      firstname:'',
      lastname:'',
      profileImage:'placeholder_img',
    }
  }

  _navigateToScreen(routename)
  {
    if(routename==='ProfileScreen1')
    {
      const resetAction = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: "ProfileScreen",params: { comeFrom: 'profile'}})],
          });
          this.props.navigation.dispatch(resetAction);
    }else if(routename==='ProfileScreen')
    {
      const resetAction = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: routename,params: { comeFrom: 'share' }})],
          });
          this.props.navigation.dispatch(resetAction);
    }else{
      const resetAction = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: routename})],
          });
          this.props.navigation.dispatch(resetAction);
    }
  }

_finalLogout()
  {

    firebase.auth().signOut().then(()=>{
    // Sign-out successful.
    AsyncStorage.removeItem("isLogin");
    AsyncStorage.removeItem("birthdate");
    AsyncStorage.removeItem("city");
    AsyncStorage.removeItem("email");
    AsyncStorage.removeItem("firstname");
    AsyncStorage.removeItem("gender");
    AsyncStorage.removeItem("lastname");
    AsyncStorage.removeItem("state");
    AsyncStorage.removeItem("profileImage");
    AsyncStorage.removeItem("user_id");
    AsyncStorage.removeItem("stripe_cust_id");
    AsyncStorage.removeItem("emergencyContactName");
    AsyncStorage.removeItem("emergencyContactNumber");
    AsyncStorage.removeItem("inviteCode");
    AsyncStorage.removeItem("phone_number");

    const resetAction = NavigationActions.reset({
    index: 0,
    key:null,
    actions: [NavigationActions.navigate({ routeName: 'Login' })],
    });
    this.props.navigation.dispatch(resetAction);
      })
      .catch((error)=> {
    // An error happened
          console.log("Logout Error",error);
      });

  }

  _onClickLogout()
  {
    Alert.alert(Strings.gymonkee,"Are you sure want to logout?",
    [
        {text:"Yes",onPress:()=>this._finalLogout()},
        {text:'No',style:'cancel'}
    ],
    {cancelable:false}
  )

  }
  _underImple()
  {
    Alert.alert("Payment Details","Under Implementation");
  }


  static navigationOptions = ({navigation, screenProps}) => {
      const params = navigation.state.params || {};

    }
componentDidMount()
{
            AsyncStorage.getItem("firstname").then((value) => {
              this.setState({firstname:value})
                }).done();

                AsyncStorage.getItem("lastname").then((value) => {
                  this.setState({lastname:value})
                    }).done();

                    AsyncStorage.getItem("user_id").then((value) => { this.setState({user_id:value}) }).done();

                        AsyncStorage.getItem("profileImage").then((value) => {
                                //console.log("Pfoile Image AsyncStorage Drawer",value);
                                if(value==null)
                                {
                                  this.setState({profileImage:'placeholder_img'})
                                }
                                else {
                                  this.setState({profileImage:value})

                                }



                        }).done();



              this.timer = setInterval(() => {
                //console.log('timer','I do not leak!');
                          AsyncStorage.getItem("firstname").then((value) => {
                            this.setState({firstname:value})
                              }).done();

                              AsyncStorage.getItem("lastname").then((value) => {
                                this.setState({lastname:value})
                                  }).done();

                                  AsyncStorage.getItem("user_id").then((value) => { this.setState({user_id:value}) }).done();

                                      AsyncStorage.getItem("profileImage").then((value) => {
                                              //console.log("Pfoile Image AsyncStorage Drawer",value);
                                              if(value==null)
                                              {
                                                this.setState({profileImage:'placeholder_img'})
                                              }
                                              else {
                                                this.setState({profileImage:value})

                                              }



                                      }).done();
            }, 5000);

}
componentWillUnmount() {

  clearInterval(this.timer);
}
componentWillMount()
{
  console.log("componentWillMount->Drawer","componentWillMount->Drawer");
}

  render() {
    return (
        <View style={styles.container}>
         <StatusBar translucent={true} backgroundColor={Colors.header_red} barStyle="dark-content" hidden={false}/>

         <View style={{flex:2}}>
           <View style={{flex: 2,borderWidth:0}}>
             <TouchableOpacity  style={{flexDirection: 'row',flex: 1}} onPress={() => this._navigateToScreen('ProfileScreen1')}>
                 <View style={{borderWidth:0,flex: 0.3,justifyContent :'center',marginRight: 10}}>
                 <View style={[styles.avatar, styles.avatarContainer]}>
                      <Image style={styles.avatar} source={{uri:this.state.profileImage}} />
                   </View>
                 </View>

                 <View style={{borderWidth:0,flex:0.75,flexDirection: 'column',justifyContent: 'center'}}>
                   <Text style={styles.drawerText}>  {this.state.firstname} {this.state.lastname}</Text>
                 </View>
                 <View style={{flex: 0.2,justifyContent :'center'}}>
                   <Image source={{uri:'gold_medal'}} resizeMode="contain" style={{height:0,width:0}} />
                 </View>
             </TouchableOpacity>

           </View>

         </View>

         	<View style={{flex: 8,padding: 10}}>
          <TouchableOpacity style={styles.drawerRow} onPress={() => this._navigateToScreen('Dashboard')}>
  	        	<View style={styles.drawerRow}>
  	           		<Text style={styles.drawerText} onPress={() => this._navigateToScreen('Dashboard')}>{Strings.home}</Text>
  				    </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerRow} onPress={() => this._navigateToScreen('ProfileScreen1')}>
        				<View style={styles.drawerRow}>
        	           		<Text style={styles.drawerText} onPress={() => this._navigateToScreen('ProfileScreen1')}>Profile</Text>
        				</View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerRow} onPress={() => this._navigateToScreen('GetCoins')}>
    				<View style={styles.drawerRow}>
    	           		<Text style={styles.drawerText} onPress={() => this._navigateToScreen('GetCoins')}>Buy Coins</Text>
    				</View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerRow} onPress={() => this._navigateToScreen('ActivityScreen')}>
    				<View style={styles.drawerRow}>
    	           		<Text style={styles.drawerText}  onPress={() => this._navigateToScreen('ActivityScreen')}>{Strings.activity}</Text>
    				</View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerRow} onPress={() => this._navigateToScreen('ProfileScreen')}>
      				<View style={styles.drawerRow}>
      	           		<Text style={styles.drawerText} onPress={() => this._navigateToScreen('ProfileScreen')}>Share Coins</Text>
      				</View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerRow} onPress={() => this._navigateToScreen('PaymentDetails')}>
              <View style={styles.drawerRow}>
                      <Text style={styles.drawerText} onPress={() => this._navigateToScreen('PaymentDetails')}>Payment Details</Text>
              </View>
          </TouchableOpacity>


          <TouchableOpacity style={styles.drawerRow} onPress={() => this._navigateToScreen('Help')}>
              <View style={styles.drawerRow}>
                      <Text style={styles.drawerText} onPress={() => this._navigateToScreen('Help')}>Help</Text>
              </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.drawerRow} onPress={() => this._navigateToScreen('TermsAndConditionsDrawer')}>
              <View style={styles.drawerRow}>
                      <Text style={styles.drawerText} onPress={() => this._navigateToScreen('TermsAndConditionsDrawer')}>Terms & Conditions</Text>
              </View>
          </TouchableOpacity>


				<View style={{flex: 0.5}}>
				</View>

          <TouchableOpacity style={styles.drawerRow} onPress={() => this._onClickLogout()}>
      				<View style={styles.drawerRow}>
      	           		<Text style={styles.drawerText} onPress={() => this._onClickLogout()}>{Strings.logout}</Text>
      				</View>
          </TouchableOpacity>


	         </View>


        </View>
    );
  }
}
const styles = StyleSheet.create({
  container:{
     flex:10,
      backgroundColor:Colors.theme_background,
     padding:10,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor:'#79B45D',
    height: APPBAR_HEIGHT,
  },
  drawerText:{
  	fontSize: 18,
  	fontFamily:Fonts.regular,
  	color:Colors.redcolor,

	},
	drawerRow:{
		flex: 1,
    borderColor:'grey',
    borderWidth:0,
	},
  avatar: {
    borderRadius: 28,
    width: 56,
    height: 56
}

});
module.exports=DrawerMenu;
