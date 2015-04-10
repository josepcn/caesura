

var lastTabPausedStorageKeyName = 'lastPauseTabId'

function sendPauseMessageToTab( tabId ){
	chrome.tabs.sendMessage( tabId, {action: pauseMusicMessageName} )
}

function sendPlayMessageToTab( tabId ){
	chrome.tabs.sendMessage( tabId, {action: playMusicMessageName} )
}


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


function getLastPausedTabFromStore(){
	var tabID = -1

	chrome.storage.local.get(lastTabPausedStorageKeyName, 
			function(items){
				tabID = items[lastTabPausedStorageKeyName]
			})

	return tabID
}

chrome.commands.onCommand.addListener(function(command) {
	if (command == "toggle-audio-playback") {
		var tabsPlaying = getTabsPlaying()

		if( tabsPlaying.length > 0 ){
			// some tabs are playing music, let's pause them
			for( var tabID in tabsPlaying ){
				sendPauseMessageToTab(tabID)
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
    }
})



