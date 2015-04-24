
chrome.runtime.onConnect.addListener(function(port) {

  port.onMessage.addListener( function(msg) {
    if (msg.action == notifyIsPlayingMessageName){
    	playing = isMusicPlaying()
    	port.postMessage({isPlaying: playing})
    }
    else if (msg.action == playMusicMessageName){
    	ok = playMusic()
     	port.postMessage({couldPlay: ok})
  	}
    else if (msg.action == pauseMusicMessageName){
    	ok = pauseMusic()
      	port.postMessage({couldPause: ok})
	}
  })
})

