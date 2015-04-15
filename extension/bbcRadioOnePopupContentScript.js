
var playingElementID = "play"
var pauseElementID = "pause"

function playMusic(){
	var ok = false

	var playButton = document.getElementById(playingElementID)

	if( playButton ){
		playButton.click()
		ok = true
	}
	return ok
}

function pauseMusic(){
	var ok = false

	var pauseButton = document.getElementById(pauseElementID)

	if( pauseButton ){
		pauseButton.click()
		ok = true
	}
	return ok
}
function isMusicPlaying(){
	var playing = false

	var playButton = document.getElementById(playingElementID)
	if( playButton.style.display == "none" ){
		playing = true
	}

	return playing
}

