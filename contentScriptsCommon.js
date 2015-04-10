

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    	if (request.action == 'notifyIsPlaying'){
    		playing = isMusicPlaying()
    		sendResponse({isPlaying: playing})
    	}
	});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    	if (request.action == 'playMusic'){
    		ok = play()
    		sendResponse({couldPlay: ok})
    	}
	});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    	if (request.action == 'pauseMusic'){
    		ok = pause()
    		sendResponse({couldPause: ok})
    	}
	});