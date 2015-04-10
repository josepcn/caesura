

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    	if (request.action == notifyIsPlayingMessageName){
    		playing = isMusicPlaying()
    		sendResponse({isPlaying: playing})
    	}
	});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    	if (request.action == playMusicMessageName){
    		ok = play()
    		sendResponse({couldPlay: ok})
    	}
	});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    	if (request.action == pauseMusicMessageName){
    		ok = pause()
    		sendResponse({couldPause: ok})
    	}
	});