/*
 * This file handles raw events acquired from functions in main.js
 * It decides whether and how such raw events change interaction state and Trail 
 * 
 * 
 * Dong Zhou
 */

var prevEventType = NULL_EVENT;
var preEventValue = null;
var inPaste = false;

//A new event changes curState, but may or may not change curTrail
function newEvent (type, value) {
	if (type == PASTE_EVENT) {
		inPaste = true;
		return;
	}
	if (inPaste && type == INPUT_EVENT) {
		type = PASTE_INPUT_EVENT;
	}
	inPaste = false;
	
//	curTrail.updateTime ();
	
	try {
  	if (duplicateEvent (type, value)) {		
  		return;
  	}
  	
  	switch (type) {
  		case HIGHLIGHT_EVENT:
  			highlightEvent (value);
  			break;
  		case COPY_EVENT:
  			copyEvent ();
  			break;
  		case PASTE_EVENT:
  			pasteEvent ();
  			break;
  		case URL_SUBMIT_EVENT:
  			urlSubmitEvent (value);
  			break;
  		case PASTE_INPUT_EVENT:
  			pasteInputEvent (value);
  			break;
  		case URL_COPY_EVENT:
  			urlCopyEvent (value);
  			break;
  	}
  	
  	prevEventType = type;
  	prevEventValue = value;
  } catch (ex) {
  	showStatus ("[newEvent] " + ex.message);
  }
}

//Check if an event is a duplicate of a previous event. Surpress it if it is            
function duplicateEvent (type, value) {
	if (type != prevEventType) {
		if (prevEventType == URL_INPUT_EVENT) urlInputEvent (prevEventValue);
		else if (prevEventType == INPUT_EVENT) inputEvent (prevEventValue);
		return false;
	}
	
	switch (type) {
		case COPY_EVENT:
			return true;
		case URL_SUBMIT_EVENT:
		case HIGHLIGHT_EVENT:
			return value == prevEventValue;
	}
	
	return false;
}

function highlightEvent (value) {
	showStatus ("[highlightEvent] start=" + value.startOffset + " end=" + value.endOffset);
	var tmp = curState.clone ();
	tmp.highlight = value.highlight;
	curTrail.addEvent (HIGHLIGHT_EVENT, value, tmp);
} 

function urlInputEvent (value) {
	showStatus ("[urlInputEvent] url=" + value);
	var tmp = curState.clone ();
	tmp.urlbar = value;
	//showStatus ("[urlInputEnd] tmp= " + tmp);
	//curState = registerState (tmp);
	curTrail.addEvent (URL_INPUT_EVENT, value, tmp);
}

function inputEvent (value) {
	showStatus ("[inputEvent] " + value.name + "=" + value.value);
	var tmp = curState.clone ();
	tmp.currentInput = value;
	//curState = registerState (tmp);
	curTrail.addEvent (INPUT_EVENT, value, tmp);
}

function copyEvent () {
	showStatus ("[copyEvent] string=" + curState.highlight);
	var tmp = curState.clone ();
	tmp.clipboard = tmp.highlight;
	//curState = registerState (tmp);
	curTrail.addEvent (COPY_EVENT, tmp.clipboard, tmp);
}

function pasteEvent () {
	showStatus ("[pasteEvent] string=" + curState.clipboard);
	var tmp = curState.clone ();
	//tmp.currentInput = curState.clipboard;
	//curState = registerState (tmp);
	curTrail.addEvent (PASTE_EVENT, tmp.currentInput, tmp);
}

function urlSubmitEvent (value) {
	showStatus ("[urlSubmitEvent] url=" + value.loc + " title=" + value.title);

	previousURL = currentURL;
	previousTitle = currentTitle;
	currentURL = value.loc;
	currentTitle = value.title;
    
	var tmp = curState.clone ();
	tmp.urlbar = tmp.document = value.loc;
	//curState = registerState (tmp);
	curTrail.addEvent (URL_SUBMIT_EVENT, value, tmp);
}

function pasteInputEvent (value) {
	showStatus ("[pasteInputEvent] " + value.name + "=" + value.value);
	var tmp = curState.clone ();
	tmp.currentInput = value;
	//curState = registerState (tmp);
	curTrail.addEvent (PASTE_INPUT_EVENT, value, tmp);
}

function urlCopyEvent (value) {
	showStatus ("[urlCopyEvent] " + value);
	var tmp = curState.clone ();
	tmp.clipboard = value;
	//curState = registerState (tmp);
	curTrail.addEvent (URL_COPY_EVENT, value, tmp);
}