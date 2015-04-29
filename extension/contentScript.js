
(function(){


  //-- ControllerBase --//
  function ControllerBase(){
    throw new Error("Abstract class")
  }
  ControllerBase.prototype.playMusic = function () {
    throw new Error ("Not implemented");
  }
  ControllerBase.prototype.pauseMusic = function () {
    throw new Error ("Not implemented");
  }
  ControllerBase.prototype.isMusicPlaying = function () {
    throw new Error ("Not implemented");
  }


  //-- ClassChangeBasedController --//
  function ClassChangeBasedController(_playingClassName, _pausedClassName) {
    this.playingClassName = _playingClassName
    this.pausedClassName  = _pausedClassName
  }
  ClassChangeBasedController.prototype = Object.create(ControllerBase.prototype);
  ClassChangeBasedController.prototype.playMusic = function() {
    var ok = false

    var notPlayingElements = document.getElementsByClassName(this.pausedClassName);
    if( notPlayingElements.length == 1 ){
        notPlayingElements[0].click()
        ok = true
    }
    return ok
  }
  ClassChangeBasedController.prototype.pauseMusic = function() {
    var ok = false

    var playingElements = document.getElementsByClassName(this.playingClassName);
    if( playingElements.length == 1 ){
      playingElements[0].click()
      ok = true
    }
    return ok
  }
  ClassChangeBasedController.prototype.isMusicPlaying = function() {
    var playing = false
    var playingElements = document.getElementsByClassName(this.playingClassName);
    if( playingElements.length == 1 ){
      playing = true
    }
    return playing
  }


  //-- ClassChangeSelectorBasedController --//
  function ClassChangeSelectorBasedController( _playPauseDataIDAtt, _playingClassName, _pausedClassName) {
    this.playPauseDataIDAtt = _playPauseDataIDAtt
    this.playingClassName = _playingClassName
    this.pausedClassName  = _pausedClassName
  }
  ClassChangeSelectorBasedController.prototype = Object.create(ControllerBase.prototype);
  ClassChangeSelectorBasedController.prototype.playMusic = function() {
    var ok = false
    var playPauseButton = document.querySelector(this.playPauseDataIDAtt);

    if( playPauseButton ){
      playPauseButton.click()
      ok = true
    }
    return ok
  }
  ClassChangeSelectorBasedController.prototype.pauseMusic = function() {
    var ok = false
    var playPauseButton = document.querySelector(this.playPauseDataIDAtt);

    if( playPauseButton ){
      playPauseButton.click()
    }
    return ok
  }
  ClassChangeSelectorBasedController.prototype.isMusicPlaying = function() {
    var playing = false
    var playPauseButton = document.querySelector(this.playPauseDataIDAtt);

    if( playPauseButton ){
      if( playPauseButton.className == this.playingClassName ){
        playing = true
      }
    }
    return playing
  }

  //-- TwoElementsStateStyleController --//
  function ElementsStateStyleController(_playingElementID, _pausedElementID) {
    this.playingElementID = _playingElementID
    this.pausedElementID  = _pausedElementID
  }
  ElementsStateStyleController.prototype = Object.create(ControllerBase.prototype);

  ElementsStateStyleController.prototype.playMusic = function() {
    var ok = false
    var playButton = document.getElementById(this.playingElementID)
    if( playButton ){
      playButton.click()
      ok = true
    }
    return ok
  }
  ElementsStateStyleController.prototype.pauseMusic = function() {
    var ok = false
    var pauseButton = document.getElementById(this.pausedElementID)
    if( pauseButton ){
      pauseButton.click()
      ok = true
    }
    return ok
  }
  ElementsStateStyleController.prototype.isMusicPlaying = function() {
    var playing = false
    var playButton = document.getElementById(this.playingElementID)
    if( playButton.style.display == "none" ){
      playing = true
    }
    return playing
  }



  //- factory -//
  function controllerFactory( info ){
    if( info.type == "class_change" ){
      return new ClassChangeBasedController( info.classNames.playing, 
                                             info.classNames.paused )
    }
    else if( info.type == "two_elements_state_style" ){
      return new ElementsStateStyleController( info.elementNames.play,
                                               info.elementNames.pause )
    }
    else if( info.type == "class_change_selector_att" ){
      return new ClassChangeSelectorBasedController( info.selectorAtt,
                                                     info.classNames.playing, 
                                                     info.classNames.paused )

    }
  }



  //- listener -//
  chrome.runtime.onConnect.addListener(function(port) {

    port.onMessage.addListener( function(msg) {
      if (msg.action == notifyIsPlayingMessageName){
        var controller = controllerFactory( msg.info )
      	playing = controller.isMusicPlaying()
      	port.postMessage({isPlaying: playing})
      }
      else if (msg.action == playMusicMessageName){
        var controller = controllerFactory( msg.info )
      	ok = controller.playMusic()
       	port.postMessage({couldPlay: ok})
    	}
      else if (msg.action == pauseMusicMessageName){
        var controller = controllerFactory( msg.info )
      	ok = controller.pauseMusic()
        port.postMessage({couldPause: ok})
      }
    })
  })
})();
