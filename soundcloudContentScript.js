
function swithcAudio(){
	// class of the button when its playing
	notPlayingClassName = "playControl playControls__icon sc-ir"
	playingClassName = "playControl playControls__icon sc-ir playing"
	

	var notPlayingElements = document.getElementsByClassName(notPlayingClassName);
	
	if( notPlayingElements.length == 1 ){
		notPlayingElements[0].click()
	}
	else{
		var playingElements = document.getElementsByClassName(playingClassName);
		if( playingElements.length == 1 ){
			playingElements[0].click()
		}

	}
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    	if (request.action == "switchAudio"){
    		swithcAudio()
    	}
	});
