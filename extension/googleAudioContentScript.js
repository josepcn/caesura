
var notPlayingClassName = "flat-button"
var playingClassName = "flat-button playing"
var playPauseDataIDAtt = "[data-id='play-pause']"



function playMusic(){
	var ok = false
	var playPauseButton = document.querySelector(playPauseDataIDAtt);

	if( playPauseButton ){
		playPauseButton.click()
		ok = true
	}
	return ok
}

function pauseMusic(){
	var ok = false
	var playPauseButton = document.querySelector(playPauseDataIDAtt);

	if( playPauseButton ){
		playPauseButton.click()
	}
	return ok
}
function isMusicPlaying(){
	var playing = false
	var playPauseButton = document.querySelector(playPauseDataIDAtt);

	if( playPauseButton ){
		if( playPauseButton.className == playingClassName ){
			playing = true
		}
	}
	
	return playing
}