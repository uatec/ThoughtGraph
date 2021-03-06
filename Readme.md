#Thought Graph#
## Build Instructions ##
    npm install 
    gulp
    npm install -g cordova 
    
Web Build

    cordova platform add ios
    npm run ios
    
Mac & iOS Build

    npm install -g ios-deploy
    cordova platform add ios
    cordova platform add osx
    npm run ios
    npm run osx
    
Windows Build    

    cordova platform add windows
    cordova platform add wp8
    npm run windows
    npm run wp8
    
Linux Build

    cordova platform add ubuntu
    npm run ubuntu

## Road Map ##
###Mile Stone 0 - Basic###
- ~~View a node~~
- ~~View the node's parents~~
- ~~View the node's children~~
- ~~Click to focus on another node~~
- ~~Edit the label of a node~~
- ~~Add another node~~
- ~~Delete a node~~
- ~~Persist Data (client side)~~

###Mile Stone 1 - Usability###
- ~~Keyboard Shortcuts~~
 - ~~Navigate Graph~~
- ~~Searching~~
- ~~Add arbitrary links to searched nodes~~
- ~~Remove arbitrary links~~
- ~~Host as stand alone application (electron)~~
- ~~Friend link type~~

###Mile Stone 2 - Integration###
- Export whole graph
 - As List
 - As Graph
- Export sub-set of graph
- Cloud data Sync

###Mile Stone 3 - Advanced Usability###
- Improved Node Navigation
- Improved Node Control
- Attachments
- Types
- Filter view by type
- Recover forgotten nodes
- Lists
- Events
- Chronological Index

###Mile Stone 4 - Experience###
- Styles
- Animations
- Expanding Visible Sector

###Mile Stone 5 - Integration###
- Secrets
- Share to ThoughGraph
 - From Chrome, Safari

###Mile Stone 6 - Mobile###
- iOS
- Android
