fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## iOS
### ios provision
```
fastlane ios provision
```
Creating a code signing certificate and provisioning profile
### ios screenshot
```
fastlane ios screenshot
```
Take screenshots
### ios build
```
fastlane ios build
```
Create ipa
### ios bypt_create_build
```
fastlane ios bypt_create_build
```
======> Creating new build file
### ios bypt_crashlytics
```
fastlane ios bypt_crashlytics
```
======> Upload to Beta by Crashlytics
### ios bypt_slack
```
fastlane ios bypt_slack
```
Notify your team in chat that a beta build has been uploaded
### ios beta
```
fastlane ios beta
```

### ios uploadfabric
```
fastlane ios uploadfabric
```

### ios registerByptDevices
```
fastlane ios registerByptDevices
```
Register new Devices
### ios add_device
```
fastlane ios add_device
```

### ios refresh_profiles
```
fastlane ios refresh_profiles
```

### ios upload
```
fastlane ios upload
```
Upload to App Store and submit for review
### ios do_everything
```
fastlane ios do_everything
```
Provision, take screenshots, build and upload to App Store

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
