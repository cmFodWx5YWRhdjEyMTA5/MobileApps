/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image
} from 'react-native';

import { StackNavigator,DrawerNavigator,TabNavigator} from 'react-navigation';

var Splashscreen = require('./Screens/SplashScreen/Splashscreen');
var Login = require('./Screens/Login/Login');
var Dashboard = require('./Screens/Dashboard/Dashboard');
var GymFinderScreen= require('./Screens/Dashboard/GymFinderScreen');
var Signup = require('./Screens/Signup/Signup');
var Signup2 = require('./Screens/Signup/Signup2');
var Login_Main = require('./Screens/Login/Login_Main');
var Forgotpassword = require('./Screens/ForgotPassword/Forgotpassword');
var Walkthrough = require('./Screens/WalkThrough/Walkthrough');
var TermsAndConditions = require('./Screens/TermsAndConditions/TermsAndConditions');
var TermsAndConditionsDrawer= require('./Screens/TermsAndConditions/TermsAndConditionsDrawer');
var SendCoins_Main = require('./Screens/SendCoins/SendCoins_Main');
var Rating = require('./Screens/Rating/Rating');
var Scanner = require('./Screens/Scanner/Scanner');

var TrendingGymsScreen=require('./Screens/trending_gyms/TrendingGymsScreen');
var DrawerMenu=require('./Screens/drawer/DrawerMenu');
var ActivityScreen=require('./Screens/activity/ActivityScreen');
var GetCoins=require('./Screens/coins/GetCoins');
var SendCoins=require('./Screens/coins/SendCoins');
var FriendProfileScreen=require('./Screens/profile/FriendProfileScreen');

var ProfileScreen=require('./Screens/profile/ProfileScreen');
var ProfileScreenEdit=require('./Screens/profile/ProfileScreenEdit');
var EditProfileScreen = require("./Screens/Login/EditProfileScreen");
var FriendListScreen=require('./Screens/FriendList/FriendListScreen');
var ViewGym=require('./Screens/Dashboard/ViewGym');
var PaymentDetails = require('./Screens/Payment_Details/PaymentDetails');
var PaymentDetailsAddCard = require('./Screens/Payment_Details/PaymentDetailsAddCard');
var OpenCameraView= require('./Screens/Scanner/OpenCameraView');
var Help= require('./Screens/help/Help');

const ScreenList= StackNavigator({

  Dashboard: {
    screen: Dashboard,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.navigate('DrawerOpen')}><View style={styles.icon_padding}><Image source={{uri: "menu_icon_white"}} style={styles.menu_icon} /></View></TouchableOpacity>
        }),
  },
  PaymentDetails: {
    screen: PaymentDetails,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.navigate('DrawerOpen')}><View style={styles.icon_padding}><Image source={{uri: "menu_icon_white"}} style={styles.menu_icon} /></View></TouchableOpacity>
        }),
  },
  PaymentDetailsAddCard: {
    screen: PaymentDetailsAddCard,
    navigationOptions: ({ navigation }) => ({
                              headerLeft:<TouchableOpacity onPress={() =>navigation.goBack()}><View style={styles.icon_padding}><Image source={{uri: "back_arrow_white"}} style={styles.back_icon} /></View></TouchableOpacity>
        }),
  },

  TrendingGymsScreen: {
    screen: TrendingGymsScreen,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.navigate('DrawerOpen')}><View style={styles.icon_padding}><Image source={{uri: "menu_icon"}} style={styles.menu_icon} /></View></TouchableOpacity>
        }),
  },
  ActivityScreen: {
    screen: ActivityScreen,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.navigate('DrawerOpen')}><View style={styles.icon_padding}><Image source={{uri: "menu_icon_white"}} style={styles.menu_icon} /></View></TouchableOpacity>
        }),
  },
  GetCoins: {
    screen: GetCoins,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.navigate('DrawerOpen')}><View style={styles.icon_padding}><Image source={{uri: "menu_icon_white"}} style={styles.menu_icon} /></View></TouchableOpacity>
        }),
  },
  SendCoins: {
    screen: SendCoins,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.navigate('DrawerOpen')}><View style={styles.icon_padding}><Image source={{uri: "menu_icon"}} style={styles.menu_icon} /></View></TouchableOpacity>
        }),
  },
  FriendProfileScreen: {
    screen: FriendProfileScreen,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.goBack()}><View style={styles.icon_padding}><Image source={{uri: "back_arrow_white"}} style={styles.back_icon} /></View></TouchableOpacity>
        }),
  },
  ProfileScreen: {
    screen: ProfileScreen,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.navigate('DrawerOpen')}><View style={styles.icon_padding}><Image source={{uri: "menu_icon_white"}} style={styles.menu_icon} /></View></TouchableOpacity>
        }),
  },
  ProfileScreenEdit: {
    screen: ProfileScreenEdit,

  },
  FriendListScreen: {
    screen: FriendListScreen,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.goBack()}><View style={styles.icon_padding}><Image source={{uri: "back_arrow_white"}} style={styles.back_icon} /></View></TouchableOpacity>
        }),
  },
  ViewGym: {
    screen: ViewGym,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.goBack()}><View style={styles.icon_padding}><Image source={{uri: "back_arrow"}} style={styles.back_icon} /></View></TouchableOpacity>
        }),
  },
  TermsAndConditions: {
    screen: TermsAndConditions,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.goBack()}><View style={styles.icon_padding}><Image source={{uri: "back_arrow_red"}} style={styles.back_icon} /></View></TouchableOpacity>
        }),
  },
  Scanner: {
    screen: Scanner
  },
  TermsAndConditionsDrawer: {
    screen: TermsAndConditionsDrawer,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.navigate('DrawerOpen')}><View style={styles.icon_padding}><Image source={{uri: "menu_icon_white"}} style={styles.back_icon} /></View></TouchableOpacity>
        }),
  },
  Help: {
    screen: Help,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.navigate('DrawerOpen')}><View style={styles.icon_padding}><Image source={{uri: "menu_icon_white"}} style={styles.back_icon} /></View></TouchableOpacity>
        }),

  },
  OpenCameraView: {
    screen: OpenCameraView,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.goBack()}><View style={styles.icon_padding}><Image source={{uri: "back_arrow"}} style={styles.back_icon} /></View></TouchableOpacity>
        }),
  },
  Rating: {
    screen: Rating,
    navigationOptions: {
      header:false ,
    },
  },

  SendCoins_Main: {
    screen: SendCoins_Main,
    navigationOptions: ({ navigation }) => ({
                             headerLeft:<TouchableOpacity onPress={() =>navigation.goBack()}><View style={styles.icon_padding}><Image source={{uri: "back_arrow_red"}} style={styles.menu_icon} /></View></TouchableOpacity>
        }),
  },
  GymFinderScreen: {
    screen: GymFinderScreen,
    navigationOptions: ({ navigation }) => ({
                              headerLeft:<TouchableOpacity onPress={() =>navigation.goBack()}><View style={styles.icon_padding}><Image source={{uri: "back_arrow_white"}} style={styles.back_icon} /></View></TouchableOpacity>

        }),
  },


},
{
  transitionConfig: () => ({
        screenInterpolator: sceneProps => {
            const { layout, position, scene } = sceneProps;
            const { index } = scene;

            const translateX = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [layout.initWidth, 0, 0]
            });

            const opacity = position.interpolate({
                inputRange: [index - 1, index - 0.99, index, index + 0.99, index + 1],
                outputRange: [0, 1, 1, 0.3, 0]
            });

            const translateY = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [layout.initWidth, 0, 0]
            });


            return { opacity, transform: [{ translateX }] }
        }
    })

}
);



const HomeDrawer = DrawerNavigator({
    Dashboard: {
    screen: ScreenList
    },



},

{
  drawerWidth:(Dimensions.get('window').width)-80,
  backBehavior: 'none',
  navigationOptions: {
        drawerLockMode: 'locked-closed'
      },

  contentComponent: (props) =>  (<DrawerMenu navigation={props.navigation} drawerProps={{...props}}  />),

},


);




export default App= StackNavigator(
{
  Splashscreen: {
    screen: Splashscreen,
    navigationOptions: {
      header:false ,
    },
   },

   Home: {
    screen: HomeDrawer,
    navigationOptions: {
          header:false,
    },
  },
  Login:{
    screen: Login,
    navigationOptions: {
      header:false ,
    },
   },
   Walkthrough:{
     screen: Walkthrough,
     navigationOptions: {
       header:false ,
     },
    },
   Login_Main:{
     screen: Login_Main,
     navigationOptions: {
      header:false ,
    },
     
    },
    Forgotpassword:{
      screen: Forgotpassword,
      navigationOptions: {
        header:false ,
      },
     },
  Signup: {
    screen: Signup,
    navigationOptions: {
      header:false ,
    },
   },
  Signup2: {
    screen: Signup2,
    navigationOptions: {
      header:false ,
    },
   },
   TermsAndConditions: {
     screen: TermsAndConditions,

    },
    SendCoins_Main: {
      screen: SendCoins_Main,
     },
     Rating: {
       screen: Rating,
       navigationOptions: {
         header:false ,
       },
      },
      Scanner : {
        screen: Scanner,
        navigationOptions: {
          header:false ,
        },
      },
      EditProfileScreen: {
        screen: EditProfileScreen,
        navigationOptions: {
          header:false ,
        },
      }
   // TermsAndConditions: {
   //   screen: TermsAndConditions,
   //  },
},
{
initialRouteName: 'Splashscreen',
statusBarHidden: false,
headerMode: 'screen',

  transitionConfig: () => ({
        screenInterpolator: sceneProps => {
            const { layout, position, scene } = sceneProps;
            const { index } = scene;

            const translateX = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [layout.initWidth, 0, 0]
            });

            const opacity = position.interpolate({
                inputRange: [index - 1, index - 0.99, index, index + 0.99, index + 1],
                outputRange: [0, 1, 1, 0.3, 0]
            });

            const translateY = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [layout.initWidth, 0, 0]
            });
            return { opacity, transform: [{ translateX }] }
        }
    })

});
const styles = StyleSheet.create({
  back_icon:{
      height: 20,
      width: 20,
      marginLeft:10,
  },
  menu_icon:{
      height: 20,
      width: 20,
      marginLeft:10,
  },
  icon_padding:{
      padding:10,
  },
});

if(Platform === 'android')
{
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
