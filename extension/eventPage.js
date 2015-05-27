

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-63306469-1']);
_gaq.push(['_trackPageview']);


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

	function toogleCommandReceived(){
		chrome.tabs.query({}, toogleAudioOnTabs)
	}

	// Install key command (from keys)
	chrome.commands.onCommand.addListener(function(command) {
		if (command == "toggle-audio-playback") {
			_gaq.push(['_trackEvent', 'Commands', 'Toogle', 'HotKey'])
			toogleCommandReceived()
	    }
	});


	// connect to native app
	(function(){
		
		function parseMsgFromNativeHost(msg){
			if( msg.action != "" ){
				//console.log("Action from native host: " + msg.action)
				if( msg.action == "ok"){
					console.log("ok action received")
				}
				else if( msg.action == "pause"){
				}
				else if( msg.action == "play"){
				}
				else if( msg.action == "toogle"){
					_gaq.push(['_trackEvent', 'Commands', 'Toogle', 'NativeApp'])
					toogleCommandReceived()
				}
				else if( msg.action == "debug"){
					console.log("debug action received")
					//port.postMessage({ cmd: "debug" })
				}
				else if( msg.action == "uknown"){
					console.log("Native host says uknown command")	
				}
				else{
					console.log("Error: received uknown action")	
				}
			}
			else{
				console.log("Error: message has no action")	
			}

		}

		var port = chrome.runtime.connectNative('com.caesura.menu_bar_controller')
		port.onMessage.addListener(function(msg) {
			//console.log("Received" + msg)
			parseMsgFromNativeHost(msg)
		})
		port.onDisconnect.addListener(function() {
			console.log("Inside onDisconnected(): " + chrome.runtime.lastError.message)
		  	console.log("Disconnected")
		});
		port.postMessage({ cmd: "init" })
		

		chrome.commands.onCommand.addListener(function(command) {
			if (command == "debug") {
				console.log("debug")
				port.postMessage({ cmd: "debug" })
		    }
		})
		
	})();

	// analytics
	(function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = 'https://ssl.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();




})(window);





