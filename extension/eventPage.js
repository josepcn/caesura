

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


	// pull server request
	(function(){
		var possiblePorts = []

		function connect(){
			for( var port = 54620; port < 54626; port++ ){
				possiblePorts.push(port)
			}
			connectWithFirstPort()
		}

		function connectWithFirstPort(){
			if( possiblePorts.length  > 0 ){
				var port = possiblePorts.shift().toString()

				console.log("trying with: " + port )
				var xhr = new XMLHttpRequest()
				xhr.timeout = 300 //ms
				xhr.open("GET", "http://127.0.0.1:" + port + "/query/", true)
				xhr.onreadystatechange = function() {
				  if (xhr.readyState === 4) {
				  	if (xhr.status === 200) {
				  		//alert("got response from menu bar app")
				  		var resp = JSON.parse(xhr.responseText)
				  		if( resp.switchAudio == "true" ){
				  			//alert("do not switch")
				  		}
				  	}
				  }
				}
				xhr.onerror= function(e) {
        			//alert("Error fetching ");
        			connectWithFirstPort()
    			};
				xhr.ontimeout = function(){
					connectWithFirstPort()
				}
				xhr.send()
			}
		}


		function setUpAlarm(){
			var period = 0.008
 			chrome.alarms.create("checkServer", {
       			delayInMinutes: 0.1, periodInMinutes: period});

 			chrome.alarms.onAlarm.addListener(function( alarm ) {
		 		console.log("Got an alarm!", alarm);
			});
 		}

		setUpAlarm()
		//connect()
		
	})();




})(window);

/*

var lastTabPausedStorageKeyName = 'lastPauseTabId'
var global_NumResponses = 0
var global_NumTabsPlaying = 0
var global_PortByTabID = {}


function responseReceived( tabID, numTabs, port, msg ){
	global_NumResponses = global_NumResponses + 1

	if( msg ){
		if( msg.isPlaying ){
			port.postMessage({action: pauseMusicMessageName})
			global_NumTabsPlaying = global_NumTabsPlaying + 1
			var obj = {}
			obj[lastTabPausedStorageKeyName] = tabID
			chrome.storage.local.set(obj)
		}
	}

	if( global_NumResponses === numTabs ){
		// last response
		if( global_NumTabsPlaying == 0 ){
			chrome.storage.local.get(lastTabPausedStorageKeyName, function(result){
				if( lastTabPausedStorageKeyName in result ){
					var lastPauseTabId = result[lastTabPausedStorageKeyName]
					global_PortByTabID[lastPauseTabId].postMessage({action: playMusicMessageName});
				}
			})	
		}
	}

}
function communicateWithTab( tabID, numTabs ){
	var port = chrome.tabs.connect(tabID)

	port.onMessage.addListener( function(msg) {
    	responseReceived( tabID, numTabs, port, msg )
	})
	port.onDisconnect.addListener(function() { // tabs that are not connected call disconnect
    	responseReceived( tabID, numTabs, port, null )
	})

	global_PortByTabID[tabID] = port
	port.postMessage({action: notifyIsPlayingMessageName});
}

function toogleAudioOnTabs(tabs){
	
	global_NumResponses = 0
	global_NumTabsPlaying = 0
	global_PortByTabID = {}

	for (var i = 0; i < tabs.length; i++) {
		communicateWithTab(tabs[i].id, tabs.length);
	}        
    

}


chrome.commands.onCommand.addListener(function(command) {
	if (command == "toggle-audio-playback") {
		chrome.tabs.query({}, toogleAudioOnTabs)
    }
})

*/



