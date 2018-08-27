/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <RNGoogleSignin/RNGoogleSignin.h>
#import <React/RCTLinkingManager.h>

@import Firebase;
@import GoogleMaps;

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  [Fabric with:@[[Crashlytics class]]];
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];
  
  //Developement
  NSURL *jsCodeLocation;
  [GMSServices provideAPIKey:@"AIzaSyC0Ofkxg64Ldw3tz_LTgYNGCgdD-CfF7jM"];
  [FIRApp configure];
  
  /*
   https://medium.com/react-native-development/deploying-a-react-native-app-for-ios-pt-1-a79dfd15acb8
   react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios
   */
  
  //Production
    
   jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  
//jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];

  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"Gymonkee"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

///URL Will be handled here and send it to the react-native code
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  BOOL handled =  [self application:application
            openURL:url
  sourceApplication:options[UIApplicationOpenURLOptionsSourceApplicationKey]
         annotation:options[UIApplicationOpenURLOptionsAnnotationKey]];
  return [RCTLinkingManager application:application openURL:url options:options] || handled ;
}


- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
  
  return [[FBSDKApplicationDelegate sharedInstance] application:application
                                                        openURL:url
                                              sourceApplication:sourceApplication
                                                     annotation:annotation
          ]
  || [RNGoogleSignin application:application
                         openURL:url
               sourceApplication:sourceApplication
                      annotation:annotation
      ]
  ||  [RCTLinkingManager application:application openURL:url
                   sourceApplication:sourceApplication annotation:annotation];
}


//Firebase method for getting the link
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
   return [[FIRDynamicLinks dynamicLinks] handleUniversalLink:userActivity.webpageURL
                                                          completion:^(FIRDynamicLink * _Nullable dynamicLink,
                                                                       NSError * _Nullable error) {
                                                            if (error == nil) {
                                                              userActivity.webpageURL = dynamicLink.url;
                                                            }
                                                            [RCTLinkingManager application:application
                                                                      continueUserActivity:userActivity
                                                                        restorationHandler:restorationHandler];
                                                          }];
}
- (void)applicationDidBecomeActive:(UIApplication *)application
{
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber:0]; //Allways reset number of notifications shown at the icon
  for (UILocalNotification * notification in [[UIApplication sharedApplication] scheduledLocalNotifications]) { //Also remove all shown notifications
    if ([notification.fireDate compare:[NSDate date]] == NSOrderedAscending) {
      [[UIApplication sharedApplication] cancelLocalNotification:notification];
    }
  }
}

@end

