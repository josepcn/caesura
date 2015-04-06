
function swithcAudio(){
	playButton  = document.getElementById("play")
	pauseButton = document.getElementById("pause")
	
	if( playButton && pauseButton ){
		if( playButton.style.display != "none" ){
			playButton.click()
		}
		else if( pauseButton.style.display != "none" ){
			pauseButton.click()
		}
	}
}


chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    	if (request.action == "switchAudio"){
    		swithcAudio();
    	}
	});