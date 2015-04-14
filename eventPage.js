

var lastTabPausedStorageKeyName = 'lastPauseTabId'
var global_NumResponses = 0
var global_NumTabsPlaying = 0
var global_PortByTabID = {}


function responseReceived( tabID, numTabs, port, msg ){
	global_NumResponses = global_NumResponses + 1

	if( msg ){
		if( msg.isPlaying ){
			port.postMessage({action: pauseMusicMessageName})
			global_NumTabsPlaying = global_NumTabsPlaying + 1
			var obj = {}
			obj[lastTabPausedStorageKeyName] = tabID
			chrome.storage.local.set(obj)
		}
	}

	if( global_NumResponses === numTabs ){
		// last response
		if( global_NumTabsPlaying == 0 ){
			chrome.storage.local.get(lastTabPausedStorageKeyName, function(result){
				if( lastTabPausedStorageKeyName in result ){
					var lastPauseTabId = result[lastTabPausedStorageKeyName]
					global_PortByTabID[lastPauseTabId].postMessage({action: playMusicMessageName});
				}
			})	
		}
	}

}
function communicateWithTab( tabID, numTabs ){
	var port = chrome.tabs.connect(tabID)

	port.onMessage.addListener( function(msg) {
    	responseReceived( tabID, numTabs, port, msg )
	})
	port.onDisconnect.addListener(function() { // tabs that are not connected call disconnect
    	responseReceived( tabID, numTabs, port, null )
	})

	global_PortByTabID[tabID] = port
	port.postMessage({action: notifyIsPlayingMessageName});
}

function toogleAudioOnTabs(tabs){
	
	global_NumResponses = 0
	global_NumTabsPlaying = 0
	global_PortByTabID = {}

	for (var i = 0; i < tabs.length; i++) {
		communicateWithTab(tabs[i].id, tabs.length);
	}        
    

}


chrome.commands.onCommand.addListener(function(command) {
	if (command == "toggle-audio-playback") {
		chrome.tabs.query({}, toogleAudioOnTabs)
    }
})



