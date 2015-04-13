

var lastTabPausedStorageKeyName = 'lastPauseTabId'

function sendPauseMessageToTab( tabId ){
	chrome.tabs.sendMessage( tabId, {action: pauseMusicMessageName} )
}

function sendPlayMessageToTab( tabId ){
	chrome.tabs.sendMessage( tabId, {action: playMusicMessageName} )
}

/*

function getTabsPlaying(){
	var allTabs = []
	var tabsPlaying = []

	chrome.tabs.query({}, 
		function (tabs){
    		for (var i = 0; i < tabs.length; i++) {
    			var tabID = tabs[i].id 
    			chrome.tabs.sendMessage( tabID, 
							 {action: notifyIsPlayingMessageName},
							 function (response){
							 	if( response ){
									if( response.isPlaying == true ){
										tabsPlaying.push(tabID)
									}
								}
							 })           
    		}
		});

	return tabsPlaying
}
*/


function getLastPausedTabFromStore(){
	var tabID = -1

	chrome.storage.local.get(lastTabPausedStorageKeyName, 
			function(items){
				tabID = items[lastTabPausedStorageKeyName]
			})

	return tabID
}


function allTabsResponses( tabsPlaying ){
	//chrome.storage.local.set({lastTabPausedStorageKeyName: tabID})
						
	if( tabsPlaying.length == 0 ){
		// no tabs playing, try to resume 
		var lastTabPausedID = getLastPausedTabFromStore()
		if( lastTabPausedID != -1 ){
			sendPlayMessageToTab( lastTabPausedID )
		}
	}
}

var global_NumResponses = 0
var global_NumTabsPlaying = 0

function responseReceived( tabID, numTabs, port, msg ){
	global_NumResponses = global_NumResponses + 1

	if( msg ){
		if( msg.isPlaying ){
			console.log("tab playing, sending pause")
			port.postMessage({action: pauseMusicMessageName})
			global_NumTabsPlaying = global_NumTabsPlaying + 1
			chrome.storage.local.set({lastTabPausedStorageKeyName: tabID})
		}
	}

	if( global_NumResponses == numTabs ){
		// last response
		console.log( "there were " +  global_NumTabsPlaying + " tabs playing") 
		if( global_NumTabsPlaying == 0 ){
			console.log("non playing. should resume last paused")
			chrome.storage.local.get(lastTabPausedStorageKeyName, function(result){
				var lastPauseTabId = result[lastTabPausedStorageKeyName]
				console.log("retrieved tab id, sending play" + lastPauseTabId )
				port.postMessage({action: playMusicMessageName});
			})	
		}
	}

}
function communicateWithTab( tabID, numTabs ){

	var tabsPlaying = []
	var numTabsPlaying = 0

	var port = chrome.tabs.connect(tabID)

	port.onMessage.addListener( function(msg) {
    	responseReceived( tabID, numTabs, port, msg )
	})
	port.onDisconnect.addListener(function() { // tabs that are not connected call disconnect
    	responseReceived( tabID, numTabs, port, null )
	})

	port.postMessage({action: notifyIsPlayingMessageName});
}

function toogleAudioOnTabs(tabs){
	
	global_NumResponses = 0
	global_NumTabsPlaying = 0

	for (var i = 0; i < tabs.length; i++) {
		var tabID = tabs[i].id 

		communicateWithTab(tabID, tabs.length);
		

    	//ports[tabID].postMessage({action: notifyIsPlayingMessageName});
	}        
    

}
/*
function toogleAudioOnTabs(tabs){
	
	var numResponses = 0
	var tabsPlaying = []

	for (var i = 0; i < tabs.length; i++) {
		var tabID = tabs[i].id 
		chrome.tabs.sendMessage( tabID, 
					 {action: notifyIsPlayingMessageName},
					 function (response){
					 	if( response ){
							if( response.isPlaying == true ){
								sendPauseMessageToTab(tabID)
								tabsPlaying.push(tabID)
								//chrome.storage.local.set({lastTabPausedStorageKeyName: tabID})
							}
						}
						numResponses = numResponses + 1
						if( numResponses == tabs.length ){
							allTabsResponses( tabsPlaying )
						}
						
					 })           
    }

}
*/

chrome.commands.onCommand.addListener(function(command) {
	if (command == "toggle-audio-playback") {

		ports = {}
		chrome.tabs.query({}, toogleAudioOnTabs)

		/*
		var tabsPlaying = getTabsPlaying()
		alert("there are " + tabsPlaying.length )
		if( tabsPlaying.length > 0 ){
			// some tabs are playing music, let's pause them
			for (var i = 0; i < tabsPlaying.length; i++) {
				sendPauseMessageToTab( tabsPlaying[i] )
			}
			// store just one for now
			chrome.storage.local.set({lastTabPausedStorageKeyName: tabsPlaying[0]})
		}
		else{
			// no tabs playing, try to resume 
			var lastTabPausedID = getLastPausedTabFromStore()
			if( lastTabPausedID != -1 ){
				sendPlayMessageToTab( lastTabPausedID )
			}


		}
		*/
    }
})



