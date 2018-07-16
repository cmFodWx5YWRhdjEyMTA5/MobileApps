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
import DeviceInfo from 'react-native-device-info';
import { NavigationActions } from 'react-navigation';
import * as firebase from 'firebase';
import Spinner from 'react-native-loading-spinner-overlay';
import HeaderStyle from './../Utils/HeaderStyle';
const ModelIphoneX = 'iPhone X';
const StatusBarHeightIos = DeviceInfo.getModel() === ModelIphoneX ? 30 : 20;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? StatusBarHeightIos : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
import * as FirebaseUtils from './../Utils/FirebaseUtils';

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;
var moment = require('moment');
var planStatus=0;
const MyStatusBar = ({backgroundColor, ...props}) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

class GetCoins extends Component{

  constructor(props) {
    super(props);
    this.state={
      loader:false,
      user_id:'',
      coin:0,
      stripe_cust_id:'',
      oldCoin:0,
      isAlreadyCard:false,
      cardId:0,
      isThreePlan:null,
      arrPlanData:[],
      storedPlanId:'',
      storeSubscriptionId:'',
    }
  }
  static navigationOptions = ({navigation, screenProps}) => {
      const params = navigation.state.params || {};
     return {
           title:"Buy Coins",
           headerStyle:{ backgroundColor: Colors.header_red,borderBottomWidth: 0,shadowColor: 'transparent',elevation:0,marginTop: (Platform.OS==='android')?20:0},
           headerTitleStyle:HeaderStyle.titleCenter_white,
       }
    }
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
  //Life Cycle Methods
  componentWillMount()
  {
      console.log("Three Value:",this.state.isThreePlan);
  }
  componentDidMount()
  {
      this.gatherPlanData()
      AsyncStorage.getItem("user_id").then((value) => { this.setState({user_id:value}) }).done();

      setTimeout(()=>{
            AsyncStorage.getItem("stripe_cust_id").then((value) => {
              console.log("stripe_cust_id: ",value);
              this._getCardListFromStripeUsingApi(value)
              this.setState({
                stripe_cust_id:value
              })

            }).done();
            firebase.database().ref('User').child(this.state.user_id).on('value',(data)=>{

              var userData = data.val();

              console.log("userData",userData.coinBalance);

              this.setState({
                oldCoin:userData.coinBalance
              });

            })

      },1000)

          setTimeout(()=>{
              console.log("State Coin Balance",this.state.oldCoin);
            },1500)

  }
_getCardListFromStripeUsingApi(stripe_cust_id)
{
  const {arrPlanData} = this.state;
  firebase.database().ref('User').child(this.state.user_id).on('value',(data)=>{
    // console.log("Data from login",data);
    var userData = data.val();
    var keys = Object.keys(userData);
      console.log("User Keys are",keys);
        //Check if check in key avaviable than only get activity data
        if(userData.hasOwnProperty('subscriptionPlan'))
        {
          firebase.database().ref('User').child(this.state.user_id).child('subscriptionPlan').on('value',(data)=>{

            var planData = data.val();
            var keys = Object.keys(planData);
              console.log("User subscriptionPlan id",planData.planId.length);
              if(planData.planId.length>0){
                  this.setState({
                    // storedPlanId:planData.planId,
                    storeSubscriptionId:planData.subscriptionId
                  })
                  setTimeout(()=>{
                      this.retriveSubcriptionStatus(planData.subscriptionId)
                  },700)
              }
           })
        }
    })

    NetInfo.isConnected.fetch().done((isConnected) => {
                    this.setState({ netStatus: isConnected });

                        if(isConnected)
                        {
                            this.setState({loader:true});
                              var url = Strings.base_URL + 'listAllCreditCards?customerId='+stripe_cust_id
                              console.log("listAllCreditCards url",url);
                              fetch(url, {
                                method: 'GET',
                              }).then((response) => response.json())
                                  .then((responseData) => {

                                   this.setState({
                                     loader:false
                                   })
                                   console.log("listAllCreditCards Response:",responseData.data);

                                   if(responseData.data.length>0)
                                   {
                                      console.log("First Card Id",responseData.data[0].id);
                                     this.setState({
                                       cardId:responseData.data[0].id,
                                       isAlreadyCard:true,
                                     });

                                   }
                                   else {
                                     this.setState({
                                       isAlreadyCard:false,
                                     });
                                   }

                                  }).catch((error) => {
                                      this.setState({loader:false});
                                      console.log("Error is:",error);

                                   }).done();

                    }
            else
            {
                Alert.alert(Strings.gymonkee,Strings.internet_offline);
            }
      });
}

retriveSubcriptionStatus(subId){
    NetInfo.isConnected.fetch().done((isConnected) => {
                    this.setState({ netStatus: isConnected });

                        if(isConnected)
                        {
                            // this.setState({loader:true});
                              var url = Strings.base_URL + 'retrieveSubscription?subscriptionId='+subId
                              console.log("retrieveSubscription url",url);
                              fetch(url, {
                                method: 'GET',
                              }).then((response) => response.json())
                                  .then((responseData) => {

                                   // this.setState({
                                   //   loader:false
                                   // })
                                   console.log("retrieveSubscription Response:",responseData);

                                   var checkData = responseData.hasOwnProperty("status");
                                   console.log("checkData:",checkData);
                                   if(checkData){
                                      if(responseData.status==="active"){
                                        this.setState({
                                          storedPlanId:responseData.plan.id,
                                        })
                                        this.renderPlanList()
                                      }else if(responseData.status==="canceled"){
                                          // canceled
                                          planStatus=2
                                          console.log("Inside canceled",planStatus);
                                          this.renderPlanList()
                                      }
                                   }else{
                                      console.log("Sorry you still don't have subscription.");
                                   }

                                  }).catch((error) => {
                                      this.setState({loader:false});
                                      console.log("Error is:",error);
                                   }).done();

                    }
            else
            {
                Alert.alert(Strings.gymonkee,Strings.internet_offline);
            }
      });
}

openConfirmDialog150(planType,coin,doller_price)
{
  // Alert.alert(Strings.gymonkee,"Are you sure want to purchase 150 coins?",
  //    [
  //      {text:'Yes',onPress:()=> this._subScribePlan(planType,coin,doller_price)},
  //      {text:'No',style:'cancel'}
  //    ],
  //    {cancalable:false}
  //  )
  Alert.alert(Strings.gymonkee,"By confirming purchase, you are agreeing to the terms and conditions of Gymonkee, LLC. Confirm Purchase ?",
     [
       {text:'Yes',onPress:()=> this._subScribePlan(planType,coin,doller_price)},
       {text:'No',style:'cancel'}
     ],
     {cancalable:false}
   )

}
  //Main View Rendering
_subScribePlan(planType,coin,doller_price)
{
  if(this.state.oldCoin < 300)
  {
      if(this.state.isAlreadyCard)
      {
        NetInfo.isConnected.fetch().done((isConnected) => {
                          this.setState({ netStatus: isConnected });

                              if(isConnected)
                              {
                                  this.setState({loader:true});
                                  //https://us-central1-gymonkee-3cad2.cloudfunctions.net/payWithStripe?cardId=card_1C8qXcFpzWlK6ATsuGRnjvOu&amount=50&description=Test&customerId=cus_CXuI6wC4ATUzqc
                                    var url = Strings.base_URL + 'payWithStripe?cardId='+this.state.cardId+'&amount='+doller_price+'&description='+planType+'&customerId='+this.state.stripe_cust_id
                                    console.log("payWithStripe url",url);
                                    fetch(url, {
                                      method: 'GET',
                                    }).then((response) => response.json())
                                        .then((responseData) => {
                                         //Alert.alert("KK",JSON.stringify(data))
                                          this.setState({loader:false});
                                          console.log("Response:",responseData);


                                              var dt = moment(new Date()).format('MM/DD/YYYY');

                                              //entry in coin Transaction
                                              firebase.database().ref('CoinTransaction').push({ coins:coin ,createdAt:firebase.database.ServerValue.TIMESTAMP,frinedId:"", planType:planType, trxType:'DEBIT',userId:this.state.user_id,createdAt:firebase.database.ServerValue.TIMESTAMP,createdBy:this.state.user_id,status:1,updatedAt:firebase.database.ServerValue.TIMESTAMP,updatedBy:this.state.user_id}).then(()=>{


                                                firebase.database().ref('User').child(this.state.user_id).on('value',(data)=>{

                                                  var userData = data.val();

                                                  console.log("userData",userData.coinBalance);

                                                  this.setState({
                                                    oldCoin:userData.coinBalance
                                                  });

                                                })



                                                })
                                                setTimeout(()=>{
                                                  firebase.database().ref('User').child(this.state.user_id).update({coinBalance:this.state.oldCoin+coin})

                                                  setTimeout(()=>{
                                                        Alert.alert(Strings.gymonkee,"You have purchased 150 coins...",
                                                          [
                                                            {text:"OK",onPress:()=> {this._gotoDashboard()}},
                                                          ],
                                                          {cancelable:false}
                                                      )
                                                  },700)
                                                },700)





                                        }).catch((error) => {
                                            this.setState({loader:false});
                                            console.log("Error is:",error);
                                              // setTimeout(()=>{
                                              //   Alert.alert(Strings.gymonkee,error.message);
                                              // },1000)
                                         }).done();

                          }
                  else
                  {
                    this.setState({
                      isScan:false
                    })
                      Alert.alert(Strings.gymonkee,Strings.internet_offline);
                  }
            });
  }
  else {
    this.props.navigation.navigate("PaymentDetails",{planType,coin,doller_price,isFromBuyCoins:true})
  }
}
else {
    Alert.alert(Strings.gymonkee,"You already have 300 coins.")
}

      //this.props.navigation.navigate("PaymentDetails",{planType,coin,doller_price})
}

_gotoDashboard()
 {
  const resetAction = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Dashboard' })],
      });
      this.props.navigation.dispatch(resetAction);
 }

 openConfirmDialog(planId,coin)
 {
   // Alert.alert(Strings.gymonkee,"Are you sure want to purchase "+coin+" coins?",
   //    [
   //      {text:'Yes',onPress:()=> this._subScribeMonthlyPlan(planId,coin)},
   //      {text:'No',style:'cancel'}
   //    ],
   //    {cancalable:false}
   //  )
   console.log("Plan clicked:",planId +"::"+coin);
    Alert.alert(Strings.gymonkee,"By confirming purchase, you are agreeing to the terms and conditions of Gymonkee, LLC. Confirm Purchase ?",
       [
         {text:'Yes',onPress:()=> this._subScribeMonthlyPlan(planId,coin)},
         {text:'No',style:'cancel'}
       ],
       {cancalable:false}
     )
 }

_subScribeMonthlyPlan(planId,coin)
{
if(this.state.isAlreadyCard)
{
            firebase.database().ref('User').child(this.state.user_id).on('value',(data)=>{
              // console.log("Data from login",data);
              var userData = data.val();
              var keys = Object.keys(userData);
                console.log("User Keys are",keys);
                  //Check if check in key avaviable than only get activity data
                  if(userData.hasOwnProperty('subscriptionPlan'))
                  {
                    if(planStatus===2){

                    }else{
                      firebase.database().ref('User').child(this.state.user_id).child('subscriptionPlan').on('value',(data)=>{

                        var planData = data.val();
                        var keys = Object.keys(planData);
                          console.log("User subscriptionPlan id",planData.planId);
                          if(planData.planId===planId)
                            {
                              planStatus=1;
                            }
                            else {
                              // setTimeout(()=>{
                              //       this._sendRequestForSubscribePlan(planId)
                              //   },700
                              console.log("_sendRequestForSubscribePlan","_sendRequestForSubscribePlan");
                              planStatus=2;
                            }
                          })
                    }
                  }
                  else{
                        setTimeout(()=>{
                              this._sendRequestForSubscribePlan(planId,coin)
                          },700)
                  }
            })
            setTimeout(()=>{
                  if(planStatus==2)
                  {
                      this._sendRequestForSubscribePlan(planId,coin)
                  }
                  else if(planStatus==1){
                    Alert.alert(Strings.gymonkee,"You already subscribed for this plan....");
                  }
              },700)
        }
        else{
          this.props.navigation.navigate("PaymentDetails",{isFromBuyCoins:true})
        }
}

_sendRequestForSubscribePlan(planId,coin)
{
  NetInfo.isConnected.fetch().done((isConnected) => {
                    this.setState({ netStatus: isConnected });

                        if(isConnected)
                        {
                            this.setState({loader:true});
                            //https://us-central1-gymonkee-3cad2.cloudfunctions.net/createSubscription
                              var url = Strings.base_URL + 'createSubscription?customerId='+this.state.stripe_cust_id+'&planId='+planId
                              console.log("createSubscription url",url);
                              fetch(url, {
                                method: 'GET',
                              }).then((response) => response.json())
                                .then((responseData) => {

                                    this.setState({loader:false});
                                    console.log("createSubscription Response:",responseData);

                                    firebase.database().ref('User').child(this.state.user_id).child('subscriptionPlan').update({planId:planId,subscriptionId:responseData.id});

                                    var dt = moment(new Date()).format('MM/DD/YYYY');

                                    //entry in coin Transaction
                                   firebase.database().ref('CoinTransaction').push({ coins:coin ,createdAt:firebase.database.ServerValue.TIMESTAMP,frinedId:"", planType:planId, trxType:'DEBIT',userId:this.state.user_id,createdAt:firebase.database.ServerValue.TIMESTAMP,createdBy:this.state.user_id,status:1,updatedAt:firebase.database.ServerValue.TIMESTAMP,updatedBy:this.state.user_id}).then(()=>{
                                      firebase.database().ref('User').child(this.state.user_id).on('value',(data)=>{
                                        var userData = data.val();

                                        console.log("userData",userData.coinBalance);

                                        this.setState({
                                          oldCoin:userData.coinBalance
                                        });
                                      })
                                    })

                                     setTimeout(()=>{
                                        firebase.database().ref('User').child(this.state.user_id).update({coinBalance:this.state.oldCoin+coin});

                                            setTimeout(()=>{
                                                  Alert.alert(Strings.gymonkee,"Your plan subscribed successfully....",
                                                  [
                                                      {text:"OK",onPress:()=> {this._gotoDashboard()}},
                                                    ],
                                                    {cancelable:false}
                                                )
                                            },1000)
                                      },1000)

                                  }).catch((error) => {
                                      this.setState({loader:false});
                                      console.log("Error is:",error);
                                        // setTimeout(()=>{
                                        //   Alert.alert(Strings.gymonkee,error.message);
                                        // },1000)
                                   }).done();

                    }
            else
            {
              this.setState({
                isScan:false
              })
                Alert.alert(Strings.gymonkee,Strings.internet_offline);
            }
      });
}

gatherPlanData(){
    //PaymentPlan
    firebase.database().ref('PaymentPlan').once('value',(data)=>{
        if(data.exists()){
            var dataOfPlan = data.val()
            var planKeys = Object.keys(dataOfPlan);
            console.log("Plan Keys are::",planKeys);
            for(let i=0;i<planKeys.length;i++){
               console.log("Plan Data is:",dataOfPlan[planKeys[i]]);
               this.setState(prevState => ({
                arrPlanData: [...prevState.arrPlanData, dataOfPlan[planKeys[i]]]
              }))
              if(i===planKeys.length-1){
                this.renderPlanList()
              }
            }
        }
    })
}

authenticateUnsubscribe(){
  Alert.alert(Strings.gymonkee,"Are you sure wants to unsubscribe the plan?",
    [
      {text:'Yes',onPress: () => this.onClickUnsubscribe()},
      {text:'No',style:'cancel'},
    ],
    { cancelable: false }
  )
}

onClickUnsubscribe(){
  console.log("Unsubscribe Clicked");
    NetInfo.isConnected.fetch().done((isConnected) => {
                    this.setState({ netStatus: isConnected });

                        if(isConnected)
                        {
                            this.setState({loader:true});
                              var url = Strings.base_URL + 'cancelSubscription?subscriptionId='+this.state.storeSubscriptionId+'&user_id='+this.state.user_id
                              console.log("cancelSubscription url",url);
                              fetch(url, {
                                method: 'GET',
                              }).then((response) => response.json())
                                  .then((responseData) => {
                                   this.setState({
                                     loader:false
                                   })
                                   console.log("cancelSubscription Response:",responseData);
                                   var checkData = responseData.hasOwnProperty("status");
                                   console.log("checkData:",checkData);
                                   if(checkData){
                                      if(responseData.status==="canceled"){
                                        this.setState({
                                          storedPlanId:'',
                                        })
                                        this.retriveSubcriptionStatus()
                                      }else{

                                      }
                                   }else{
                                      console.log("Sorry you still don't have subscription.");
                                   }

                                  }).catch((error) => {
                                      this.setState({loader:false});
                                      console.log("Error is:",error);

                                   }).done();
                          }
            else
            {
                Alert.alert(Strings.gymonkee,Strings.internet_offline);
            }
      });
}

renderPlanList()
{
  const {arrPlanData} = this.state;
    if(arrPlanData.length>0){
        return arrPlanData.map((data,index)=>{
            if(index===0){
              return(
                    <View>
                      <View style={{flex:0.7,marginTop:10,marginBottom:10,borderWidth:0,justifyContent:'center',alignItems:'center'}}>
                          <Text style={{fontFamily:Fonts.regular,color:Colors.header_red,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?17:20}}>PAY AS YOU GO</Text>
                      </View>


                      <TouchableOpacity onPress={()=>this.openConfirmDialog150(data.planId_live,data.coins,data.price)}>
                            <View style={{borderWidth:0,backgroundColor:Colors.custom_black,marginLeft:20,marginRight:20,borderRadius:6}}>
                              <View style={{flex:1.5,flexDirection:'row'}}>

                                  <View style={{flex:0.7,borderWidth:0,borderColor:'white',justifyContent:'center'}}>
                                        <View style={{flex:0.5,borderWidth:0,borderColor:'white'}}>
                                                <Text style={{marginLeft:20,marginTop:(DeviceInfo.getModel() === 'iPhone X')?10:(Platform.OS==='android')?0:8,fontFamily:Fonts.SFU_BOLD,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?30:(Platform.OS==='android' && deviceHeight <= 640)?35:40,color:'white'}}>{data.coins} <Text style={{fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?18:(Platform.OS==='android' && deviceHeight <= 640)?18:22,color:'white'}}>Coins</Text></Text>
                                        </View>

                                        <View style={{flex:0.5,marginLeft:20,borderWidth:0,borderColor:'white',justifyContent:'center'}}>
                                               <Text style={{fontFamily:Fonts.SFU_REGULAR,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?11:(DeviceInfo.getModel() === 'iPhone X')?14:(Platform.OS==='android' && deviceHeight <= 640)?14:15,color:'white'}}>{data.description} </Text>
                                               <Text style={{fontFamily:Fonts.SFU_REGULAR,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?11:(DeviceInfo.getModel() === 'iPhone X')?14:(Platform.OS==='android' && deviceHeight <= 640)?14:15,color:'white'}}>{data.workout_days}</Text>
                                        </View>
                                  </View>

                                  <View style={{flex:0.3,borderWidth:0,borderColor:'white',justifyContent:'center',alignItems:'center'}}>
                                      <Text style={{fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?22:(DeviceInfo.getModel() === 'iPhone X')?30:30,color:'white'}}>${data.price}</Text>
                                  </View>
                                </View>

                                {(Platform.OS==='android')?<View style={{height:10}}/>:<View style={{height:15}}/>}
                            </View>

                          </TouchableOpacity>
                    </View>
              )
            }else if(index===arrPlanData.length-1){
              return(
                <View>
                  <TouchableOpacity onPress={()=>this.openConfirmDialog(data.planId_live,data.coins)}>
                    <View style={{flex:(Platform.OS==='android')?1.7:1.5,borderWidth:0,backgroundColor:Colors.buy_coins_orange_bg,marginLeft:20,marginRight:20,borderRadius:6,marginTop:8}}>
                        <View style={{flex:1.5,flexDirection:'row'}}>
                          <View style={{flex:0.7,borderWidth:0,borderColor:'white',justifyContent:'center'}}>
                                <View style={{flex:0.5,borderWidth:0,borderColor:'white',flexDirection:'row'}}>
                                        <Text style={{marginLeft:20,marginTop:(DeviceInfo.getModel() === 'iPhone X')?10:(Platform.OS==='android')?0:8,fontFamily:Fonts.SFU_BOLD,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?30:(Platform.OS==='android' && deviceHeight <= 640)?35:40,color:'white'}}>{data.coins} <Text style={{fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?18:(Platform.OS==='android' && deviceHeight <= 640)?18:22,color:'white'}}>Coins</Text></Text>
                                        <View style={{borderWidth:0,marginLeft:6,marginTop:8}}>
                                          <Image source={{uri:' '}} style={{height:35,width:35,borderWidth:0}} resizeMode="contain"/>
                                        </View>
                                        <View style={{borderWidth:0,marginTop:4}}>
                                          <Text style={{fontFamily:Fonts.regular,color:'white',fontSize:10}}> </Text>

                                        </View>
                                </View>

                                <View style={{flex:0.5,marginLeft:20,borderWidth:0,borderColor:'white',justifyContent:'center'}}>
                                       <Text style={{fontFamily:Fonts.SFU_REGULAR,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?11:(DeviceInfo.getModel() === 'iPhone X')?14:(Platform.OS==='android' && deviceHeight <= 640)?14:14,color:'white'}}>{data.description}</Text>
                                       <Text style={{fontFamily:Fonts.SFU_REGULAR,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?11:(DeviceInfo.getModel() === 'iPhone X')?14:(Platform.OS==='android' && deviceHeight <= 640)?14:14,color:'white',}}>{data.workout_days}</Text>
                                </View>
                          </View>

                          <View style={{flex:0.3,borderWidth:0,borderColor:'white',justifyContent:'center',alignItems:'center'}}>
                              <Text style={{fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?22:(DeviceInfo.getModel() === 'iPhone X')?30:30,color:'white'}}>${data.price}</Text>
                              <Text style={{marginTop:-5,marginLeft:15,fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?10:(DeviceInfo.getModel() === 'iPhone X')?14:14,color:'white'}}>per month</Text>
                              {(this.state.storedPlanId===data.planId_live)?<Image source={{uri:'accept_icon'}} style={{height:20,width:20,borderWidth:0}} resizeMode="contain"/>:<View/>}
                          </View>
                       </View>

                      {(Platform.OS==='android')?<View style={{height:10}}/>:<View style={{height:20}}/>}
                    </View>

                    <View style={{height:10}}/>
                    </TouchableOpacity>

                    <View style={{flex:1.6,borderWidth:0,alignItems:'center'}}>
                      <Text style={{marginTop:20,fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?16:(DeviceInfo.getModel() === 'iPhone X')?18:18,color:Colors.header_red}}>Coins will reload after 30 days</Text>
                      <Text style={{fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?16:(DeviceInfo.getModel() === 'iPhone X')?18:18,color:Colors.header_red}}>of purchase</Text>
                      {(this.state.storedPlanId!=='')?<TouchableOpacity onPress={()=>this.authenticateUnsubscribe()} style={{borderBottomWidth:1,borderColor:Colors.header_red}}>
                        <Text style={{marginTop:20,fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?16:(DeviceInfo.getModel() === 'iPhone X')?18:18,color:Colors.header_red}}>Unsubscribe plan</Text>
                      </TouchableOpacity>:<View/>}
                   </View>

                </View>
              )
            }else{
              return(
                  <View>
                    <View style={{height:50,borderWidth:0}}>
                        <View style={{flex:0.7}}/>

                        <View style={{flex:0.7,alignItems:'center',justifyContent:'center'}}>
                              <Text style={{fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?16:(DeviceInfo.getModel() === 'iPhone X')?22:22,color:Colors.header_red}}>MONTHLY SUBSCRIPTIONS</Text>
                        </View>
                    </View>


                    <TouchableOpacity onPress={()=>this.openConfirmDialog(data.planId_live,data.coins)}>
                      <View style={{flex:(Platform.OS==='android')?1.7:1.5,borderWidth:0,backgroundColor:Colors.buy_coins_orange_bg,marginLeft:20,marginRight:20,borderRadius:6,marginTop:8}}>
                          <View style={{flex:1.5,flexDirection:'row'}}>
                            <View style={{flex:0.7,borderWidth:0,borderColor:'white',justifyContent:'center'}}>
                                  <View style={{flex:0.5,borderWidth:0,borderColor:'white',flexDirection:'row'}}>
                                          <Text style={{marginLeft:20,marginTop:(DeviceInfo.getModel() === 'iPhone X')?10:(Platform.OS==='android')?0:8,fontFamily:Fonts.SFU_BOLD,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?30:(Platform.OS==='android' && deviceHeight <= 640)?35:40,color:'white'}}>{data.coins} <Text style={{fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?18:(Platform.OS==='android' && deviceHeight <= 640)?18:22,color:'white'}}>Coins</Text></Text>
                                          <View style={{borderWidth:0,marginLeft:6,marginTop:8}}>
                                            <Image source={{uri:' '}} style={{height:35,width:35,borderWidth:0}} resizeMode="contain"/>
                                          </View>
                                          <View style={{borderWidth:0,marginTop:4}}>
                                            <Text style={{fontFamily:Fonts.regular,color:'white',fontSize:10}}> </Text>

                                          </View>
                                  </View>

                                  <View style={{flex:0.5,marginLeft:20,borderWidth:0,borderColor:'white',justifyContent:'center'}}>
                                         <Text style={{fontFamily:Fonts.SFU_REGULAR,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?11:(DeviceInfo.getModel() === 'iPhone X')?14:(Platform.OS==='android' && deviceHeight <= 640)?14:14,color:'white'}}>{data.description}</Text>
                                         <Text style={{fontFamily:Fonts.SFU_REGULAR,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?11:(DeviceInfo.getModel() === 'iPhone X')?14:(Platform.OS==='android' && deviceHeight <= 640)?14:14,color:'white',}}>{data.workout_days}</Text>
                                  </View>
                            </View>

                            <View style={{flex:0.3,borderWidth:0,borderColor:'white',justifyContent:'center',alignItems:'center'}}>
                                <Text style={{fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?22:(DeviceInfo.getModel() === 'iPhone X')?30:30,color:'white'}}>${data.price}</Text>
                                <Text style={{marginTop:-5,marginLeft:15,fontFamily:Fonts.regular,fontSize:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?10:(DeviceInfo.getModel() === 'iPhone X')?14:14,color:'white'}}>per month</Text>
                                {(this.state.storedPlanId===data.planId_live)?<Image source={{uri:'accept_icon'}} style={{height:20,width:20,borderWidth:0}} resizeMode="contain"/>:<View/>}
                            </View>
                         </View>

                        {(Platform.OS==='android')?<View style={{height:10}}/>:<View style={{height:20}}/>}
                      </View>

                        <View style={{height:10}}/>
                      </TouchableOpacity>
                </View>
              )
            }
        })
    }
}


  render(){
    return(
      <View style={styles.container}>
          <View style={{alignItems:'center'}}>
              {this.loader()}
          </View>
              <MyStatusBar backgroundColor={Colors.header_red} barStyle="dark-content" hidden={false}/>
                <View style={{flex:3,borderWidth:0}}>
                    <ImageBackground source={{uri:'shape_red_top'}} resizeMode="contain" style={{height:null,width:null,flex:1,marginTop:(DeviceInfo.getModel() === ModelIphoneX)?-55:(DeviceInfo.getModel() === 'iPhone 8 Plus')?-20:(DeviceInfo.getModel() === 'iPhone 6 Plus')?-20:(Platform.OS==='android')?-20:-10}}>

                    </ImageBackground>
                </View>

                <View style={{flex:7,borderWidth:0,marginBottom:10,marginTop:(Platform.OS==='android')?-100:(DeviceInfo.getModel() === ModelIphoneX)?-120:-80}}>
                {/*Logo View*/}
                <View style={{height:100,borderWidth:0,justifyContent:'center',alignItems:'center',marginTop:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?-20:-(Platform.OS==='android')?0:-20}}>
                    <Image source={{uri:'logo_vector'}} resizeMode="contain" style={{height:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?50:60,width:((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?50:60}} />
                </View>
                    <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{marginBottom:0}}>
                          {this.renderPlanList()}
                    </ScrollView>
                </View>
      </View>
    )
  }

}
const styles = StyleSheet.create({
  container: {
   flex: 10,
   marginTop: ((DeviceInfo.getModel() === 'iPhone SE') || (DeviceInfo.getModel() === 'iPhone 5s') || (DeviceInfo.getModel() === 'iPhone 5c'))?-120:-150,
   backgroundColor:Colors.theme_background,
 },
 statusBar: {
    height: STATUSBAR_HEIGHT
  },
  appBar: {
    backgroundColor:'#79B45D',
    height: APPBAR_HEIGHT,
  },

})
module.exports = GetCoins
