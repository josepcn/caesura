
function swithcAudio(){
	var paused = false

	var notPlayingClassName = "playControl playControls__icon sc-ir"
	var playingClassName = "playControl playControls__icon sc-ir playing"
	

	var notPlayingElements = document.getElementsByClassName(notPlayingClassName);
	
	if( notPlayingElements.length == 1 ){
		notPlayingElements[0].click()
	}
	else{
		var playingElements = document.getElementsByClassName(playingClassName);
		if( playingElements.length == 1 ){
			playingElements[0].click()
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


// New stuff


var notPlayingClassName = "playControl playControls__icon sc-ir"
var playingClassName = "playControl playControls__icon sc-ir playing"

function playMusic(){
	var ok = false

	var notPlayingElements = document.getElementsByClassName(notPlayingClassName);
	if( notPlayingElements.length == 1 ){
		notPlayingElements[0].click()
		ok = true
	}
	return ok
}

function pauseMusic(){
	var ok = false

	var playingElements = document.getElementsByClassName(playingClassName);
	if( playingElements.length == 1 ){
		playingElements[0].click()
		ok = true
	}
	return ok
}
function notifyIsPlaying(){
	var playing = false
	var playingElements = document.getElementsByClassName(playingClassName);
	if( playingElements.length == 1 ){
		playing = true
	}
	return playing
}

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
