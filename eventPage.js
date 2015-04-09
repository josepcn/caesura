
/*
function sendPauseMessageToTab( tabId ){
	chrome.tabs.sendMessage( tabId, 
							 {action: 'pauseMusic'},
							 function(r){
							 	switchAudioMessageResponseCallback(r, tabId)
							 })
}
*/

function sendPauseMessageToTab( tabId ){
	chrome.tabs.sendMessage( tabId, {action: 'pauseMusic'} )
}

function sendPlayMessageToTab( tabId ){
	chrome.tabs.sendMessage( tabId, {action: 'playMusic'} )
}

function sendIsPlayingMessageToTab( tabId ){
	var responseIsPlaying = false
	chrome.tabs.sendMessage( tabId, 
							 {action: 'notifyIsPlaying'},
							 function(r){
							 	if( response ){
									if( response.isPlaying == true ){
										responseIsPlaying = true
									}
								}
							 })
	return responseIsPlaying
}


function getTabsPlaying(){
	var tabsPlaying = []

	chrome.tabs.query({}, 
		function(tabs){
    		for (var i = 0; i < tabs.length; i++) {
				var isPlaying = sendIsPlayingMessageToTab(tabs[i].id)  
				if( isPlaying ){
					tabsPlaying.push(tabs[i].id)
				}              
    		}
		});
	return tabsPlaying
}


function getLastPausedTabFromStore(){
	var tabID = -1

	chrome.storage.local.get('lastPauseTabId', 
			function(items){
				tabID = items['lastPauseTabId']
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
			chrome.storage.local.set({'lastPauseTabId': tabsPlaying[0]})
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



