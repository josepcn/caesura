
function swithcAudio(){
	paused = false

	playButton  = document.getElementById("play")
	pauseButton = document.getElementById("pause")
	
	if( playButton && pauseButton ){
		if( playButton.style.display != "none" ){
			playButton.click()
		}
		else if( pauseButton.style.display != "none" ){
			pauseButton.click()
			paused = true
		}
	}

	return paused
}


chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
    	if (request.action == "switchAudio"){
    		paused = swithcAudio()
    		sendResponse({paused: paused})
    	}
	});


// new stuff

var playingElementID = "play"
var pauseElementID = "pause"

function playMusic(){
	var ok = false

	var playButton = document.getElementById(playingElementID)

	if( playButton ){
		playButton.click()
	}
	return ok
}

function pauseMusic(){
	var ok = false

	var pauseButton = document.getElementById(pauseElementID)

	if( pauseButton ){
		pauseButton.click()
	}
	return ok
}
function isMusicPlaying(){
	var playing = false

	var playButton = document.getElementById(playingElementID)
	if( playButton.style.display != "none" ){
		playing = true
	}

	return playing
}

/*
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
*/
