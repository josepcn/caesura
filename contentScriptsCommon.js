
chrome.runtime.onConnect.addListener(function(port) {
  //console.assert(port.name == "knockknock");
  console.log("content: port connected: " + port.name )
  port.onMessage.addListener( function(msg) {
    if (msg.action == notifyIsPlayingMessageName){
    	console.log("content: received isPlaying")
    	playing = isMusicPlaying()
    	port.postMessage({isPlaying: playing})
    }
    else if (msg.action == playMusicMessageName){
    	console.log("content: received play")
    	ok = playMusic()
     	port.postMessage({couldPlay: ok})
  	}
    else if (msg.action == pauseMusicMessageName){
    	console.log("content: received pause")
    	ok = pauseMusic()
      	port.postMessage({couldPause: ok})
	}
  })
})