
var notPlayingClassName = "control control-play"
var playingClassName = "control control-pause"

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
function isMusicPlaying(){
	var playing = false
	var playingElements = document.getElementsByClassName(playingClassName);
	if( playingElements.length == 1 ){
		playing = true
	}
	return playing
}
