

// Config loader
(function(w){

	w.caesura_sitesInfoByName = {}

	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4) {
		 	var arr = JSON.parse(xhr.responseText)
		 	for(var i=0; i<arr.length; i++){
		 		var websiteInfo = arr[i]
		 		w.caesura_sitesInfoByName[websiteInfo.name] = websiteInfo
		 	}
		}
	}
	xhr.open("GET", chrome.extension.getURL('/services.json'), true);
	xhr.send();


})(window);


(function(w){

	var lastTabPausedStorageKeyName = 'lastPauseTabId'
	var global_NumResponses = 0
	var global_NumTabsPlaying = 0
	var global_PortByTabID = {}

	function isEmptyDict( obj ){
		return Object.keys(obj).length == 0
	}


	function getSupportedServiceInfo( tab_url ){
		var res = {}

		//httpsRegex = "https://*" + service_url + "*/"
		for (var serviceName in w.caesura_sitesInfoByName ) {
			var serviceInfo = w.caesura_sitesInfoByName[serviceName]
			var service_url = serviceInfo["url"]

			//console.log("service: " + service_url)
			//console.log("tab: " + tab_url)

			httpRegex  = new RegExp("https?://.*" + service_url + ".*/")
			if( httpRegex.test(tab_url) ){
				//console.log("matches!!")
				res = serviceInfo
			}
		}
		return res
	}

	function requestPlayToStoredTab(){

		chrome.storage.local.get(lastTabPausedStorageKeyName, function(result){
			if( lastTabPausedStorageKeyName in result ){
				var lastPauseTabIdStr = result[lastTabPausedStorageKeyName]
				var lastPauseTabId = parseInt(lastPauseTabIdStr)

				chrome.tabs.get(lastPauseTabId, function( tab ){

					var info = getSupportedServiceInfo( tab.url )
					var messageObj = {action: playMusicMessageName, 
					  		  info: info }

					var storedPort = global_PortByTabID[lastPauseTabId]
					if( storedPort ){
						storedPort.postMessage(messageObj)
					}
					else{
						console.log("port for tab not found")
					}
				})
				
			}
		})	
	}

	function responseReceived( tabID, numTabs, info, port, msg ){
		global_NumResponses = global_NumResponses + 1

		if( msg ){
			if( msg.isPlaying ){
				var messageObj = {action: pauseMusicMessageName, 
						  		  info: info }
				port.postMessage( messageObj )

				global_NumTabsPlaying = global_NumTabsPlaying + 1
				var obj = {}
				obj[lastTabPausedStorageKeyName] = tabID
				chrome.storage.local.set(obj)
			}
		}

		if( global_NumResponses === numTabs ){
			// last response
			if( global_NumTabsPlaying == 0 ){
				// no tabs playing, request play to the tab stored
				requestPlayToStoredTab()
				
			}
		}

	}

	function communicateWithTab( tabID, info, numTabs ){
		var port = chrome.tabs.connect( parseInt(tabID) )
		global_PortByTabID[tabID] = port

		port.onMessage.addListener( function(msg) {
	    	responseReceived( tabID, numTabs, info, port, msg )
		})
		port.onDisconnect.addListener(function() { // tabs that are not connected call disconnect
	    	responseReceived( tabID, numTabs, info, port, null )
		})

		
		var messageObj = {action: notifyIsPlayingMessageName, 
						  info: info }
		port.postMessage( messageObj );
	}

	function communicateWithTabs( supportedTabInfoByTabId ){
		var numServices = Object.keys(supportedTabInfoByTabId).length

		for( var tabID in supportedTabInfoByTabId ){
			var info = supportedTabInfoByTabId[tabID]
			communicateWithTab( tabID, info,  numServices )
		}
	}

	function toogleAudioOnTabs(tabs){
		global_NumResponses = 0
		global_NumTabsPlaying = 0
		global_PortByTabID = {}

		supportedTabInfoByTabId = {}
		for (var i = 0; i < tabs.length; i++) {
			var supportedInfo = getSupportedServiceInfo( tabs[i].url )
			if( !isEmptyDict(supportedInfo) ){
				//console.log("this service is supported " + supported.name)
				supportedTabInfoByTabId[tabs[i].id] = supportedInfo
			}
			//alert("url " + url )
			//communicateWithTab(tabs[i].id, tabs.length);
		} 

		if( !isEmptyDict(supportedTabInfoByTabId) ){
			communicateWithTabs( supportedTabInfoByTabId )    
		}   
	    

	}


	// Install key command (from keys)
	chrome.commands.onCommand.addListener(function(command) {
		if (command == "toggle-audio-playback") {
			chrome.tabs.query({}, toogleAudioOnTabs)
	    }
	});


	// connect to native app
	(function(){

		var port = chrome.runtime.connectNative('com.caesura.menu_bar_controller');
		port.onMessage.addListener(function(msg) {
		  console.log("Received" + msg);
		});
		port.onDisconnect.addListener(function() {
			console.log("Inside onDisconnected(): " + chrome.runtime.lastError.message);
		  console.log("Disconnected");
		});
		port.postMessage({ text: "Hello, my_application" });
		
		
	})();




})(window);





