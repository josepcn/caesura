
function sendSwitchRequestToAllTabs(){
	chrome.tabs.query({}, 
		function(tabs){
    		for (var i = 0; i < tabs.length; i++) {
				sendSwitchRequestToTab(tabs[i].id)                 
    		}
		});
};

function registerLastTabThatPausedMusic( tabId ){
	alert("storing tab" + tabID)
	chrome.storage.local.set({'lastPauseTabId': tabId})
}

function switchAudioMessageResponseCallback( response, tabId ){
	if( response ){
		if( response.paused ){
			registerLastTabThatPausedMusic( tabId )
		}
	}
}

function sendSwitchRequestToTab( tabId ){
	chrome.tabs.sendMessage( tabId, 
							 {action: "switchAudio"},
							 function(r){
							 	switchAudioMessageResponseCallback(r, tabId)
							 })
}


chrome.commands.onCommand.addListener(function(command) {
	if (command == "toggle-audio-playback") {
		// found if there is a tab stored that paused the music
		chrome.storage.local.get('lastPauseTabId', 
			function(items){
				tabID = items['lastPauseTabId']
				//alert("tab id found " + tabID)

			})

		sendSwitchRequestToAllTabs()
    }
})



