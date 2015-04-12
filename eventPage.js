

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

var ports = {}

function toogleAudioOnTabs(tabs){
	
	ports = {}

	var numResponses = 0
	var tabsPlaying = []

	for (var i = 0; i < tabs.length; i++) {
		var tabID = tabs[i].id 

		ports[tabID] = chrome.tabs.connect(tabID,{name: ""});
		
		ports[tabID].onDisconnect.addListener(function() {
        	console.log("port disconected")
    	})

    	ports[tabID].onMessage.addListener( function(msg) {
    		if( msg ){
	    		if( msg.isPlaying ){
	    			console.log("is playing " + msg.isPlaying)
	    			console.log("tab playing, sending pause")
	    			ports[tabID].postMessage({action: pauseMusicMessageName})
	    		}
	    	}
    	})

    	ports[tabID].postMessage({action: notifyIsPlayingMessageName});
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



