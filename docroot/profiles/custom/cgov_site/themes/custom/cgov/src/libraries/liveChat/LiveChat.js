// Which chat server should be used? Test or production.
var _hostServer = null; // Will be set in initialize().
var _hostServerSpanish = null; // Will be set in initialize().
var HOST_SERVER_LIVE = "livehelp.cancer.gov";
var HOST_SERVER_LIVE_SPANISH = "livehelp-es.cancer.gov";
var HOST_SERVER_TEST = "nci--tst.custhelp.com";

// Initialization for this enhancement.
function _initialize() {
	_setHostServer();
}

function _openChatWindow() {
	window.open("https://" + _hostServer + "/app/chat/chat_landing?_icf_22=92", "ProactiveLiveHelpForCTS", "height=600,width=633");
}

function _openSpanishChatWindow() {
	window.open("https://" + _hostServerSpanish + "/app/chat/chat_landing?_icf_22=92", "ProactiveLiveHelpForCTS", "height=600,width=633");
}

// Sets the _hostServer variable to the correct chat server depending on
// the current environment.  PROD uses the production server, everywhere
// else uses the test server.
function _setHostServer() {
	var currentHost = location.hostname.toLowerCase();

	if (currentHost === "www.cancer.gov") {
		_hostServer = HOST_SERVER_LIVE;
		_hostServerSpanish = HOST_SERVER_LIVE_SPANISH;
	} else {
		_hostServer = HOST_SERVER_TEST;
		_hostServerSpanish = HOST_SERVER_TEST;
	}
}



/* Flag for telling whether this enhancement has been initialized. */
var initialized = false;

/* Exposes functions from this module which are available from the outside. */
export default {
	init: function() {
		if(initialized)
			return;

		_initialize();

		initialized = true;
	},
	
	openChatWindow: function(){
		this.init(); // guarantee init.
		_openChatWindow();
	},

	openSpanishChatWindow: function(){
		this.init(); // guarantee init.
		_openSpanishChatWindow();
	}
};
