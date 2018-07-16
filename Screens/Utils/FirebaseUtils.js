import * as firebase from 'firebase';

export function getCurrenCoinUsingUid(uid) {
      var userCoin=0;
      firebase.database().ref('User').child(uid).on('value',(data)=>{
        var userData = data.val();
        console.log("Coin balance in utils",userData.coinBalance);
        userCoin=userData.coinBalance;
      })
      return userCoin;
}
// export function deductUserCoin(uid,coins) {
//       var status=0;
//       var current_coins=0;
//       firebase.database().ref('User').child(uid).on('value',(data)=>{
//         var userData = data.val();
//           if(coins < userData.coinBalance)
//           {
//             current_coins=userData.coinBalance;
//             status=1;
//           }
//           else {
//             status=2;
//           }
//       })
//         if(status===1)
//         {
//             var finalCoins = parseInt(current_coins) - parseInt(coins);
//             firebase.database().ref('User').child(uid).update({coinBalance:finalCoins});
//         }
//       return status;
//
// }
