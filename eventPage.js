
function sendRequestToAllTabs(){
	chrome.tabs.query({}, 
		function(tabs){
    		for (var i = 0; i < tabs.length; i++) {
    			chrome.tabs.sendMessage(tabs[i].id, 
    						{ action: "switchAudio" });                         
    		}
		});
};
	


chrome.commands.onCommand.addListener(function(command) {
	if (command == "toggle-audio-playback") {
		sendRequestToAllTabs();
    }
})