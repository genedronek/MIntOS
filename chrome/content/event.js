var prevEventType = NULL_EVENT;
var preEventValue = null;
var inPaste = false;

//A new event changes curState, but may or may not change curTrail
function newEvent (type, value) {
  //showStatus ("[event.newEvent] " + type);
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
  	
    //URL_INPUT_EVENT and INPUT_EVENT are handled in duplicateEvent function
    switch (type) {
      case HIGHLIGHT_EVENT:
        highlightEvent (value);
        break;
      case COPY_EVENT:
        copyEvent ();
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
    showStatus ("[event.newEvent] " + ex.message);
  }
}

function replayLastEvent () {
	try {
		
		var length = curTrail.states.length - 1;
		var lastt = curTrail.etypes[length];
		var lastv = curTrail.evalues[length];
		
		curTrail.states.length = length;
		curTrail.evalues.length = length;
		curTrail.etypes.length = length;
		
		prevEventType = curTrail.etypes[length - 1];
    prevEventValue = curTrail.evalues[length - 1];
    
    newEvent (lastt, lastv);
	} catch (ex) {
    showStatus ("[event.replayLastEvent] " + ex.message);
  }
}

function cancelHighlightEvent () {
	try {
		var length = curTrail.states.length - 1;
		curTrail.states.length = length;
		curTrail.evalues.length = length;
		curTrail.etypes.length = length;
		
		prevEventType = curTrail.etypes[length - 1];
    prevEventValue = curTrail.evalues[length - 1];
    
    replayLastEvent ();
	} catch (ex) {
    showStatus ("[event.cancelHighlightEvent] " + ex.message);
  }
}

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
  try {
    showStatus ("[event.highlightEvent] start=" + value.value.hlStruct.start + " end=" + value.value.hlStruct.end);
    var tmp = curState.clone ();
    tmp.highlight = value;
    curTrail.addEvent (HIGHLIGHT_EVENT, tmp.highlight, tmp);
  } catch (ex) {
    showStatus ("[event.highlightEvent] " + ex.message);
  }
} 

function urlInputEvent (value) {
  showStatus ("[event.urlInputEvent] url=" + value);
  var tmp = curState.clone ();
  tmp.urlbar = new SVUrl (value);
  //showStatus ("[urlInputEnd] tmp= " + tmp);
  //curState = registerState (tmp);
  curTrail.addEvent (URL_INPUT_EVENT, tmp.urlbar, tmp);
}

function inputEvent (value) {
  showStatus ("[main.inputEvent] " + value.dest.value.field_name + "=" + value.source.value.hlContent);
  var tmp = curState.clone ();
  tmp.currentInput = value;
  //curState = registerState (tmp);
  curTrail.addEvent (INPUT_EVENT, tmp.currentInput, tmp);
}

function copyEvent () {
  showStatus ("[event.copyEvent] string=" + curState.highlight);
  var tmp = curState.clone ();
  tmp.clipboard = tmp.highlight;
  //curState = registerState (tmp);
  curTrail.addEvent (COPY_EVENT, tmp.clipboard, tmp);
}

function pasteEvent () {
  showStatus ("[event.pasteEvent] string=" + curState.clipboard);
  var tmp = curState.clone ();
  //tmp.currentInput = curState.clipboard;
  //curState = registerState (tmp);
  curTrail.addEvent (PASTE_EVENT, tmp.currentInput, tmp);
}

function urlSubmitEvent (value) {
  try {
    showStatus ("[event.urlSubmitEvent] url=" + value.loc + " title=" + value.title);
    if (updateURL) {
      previousURL = currentURL;
      previousTitle = currentTitle;
      currentURL = value.loc;
      currentTitle = value.title;
    }
    var tmp = curState.clone ();
    tmp.urlbar = new SVUrl (value.loc);
    tmp.document = new SVDoc (value.title, value.loc, value.loc);
    //curState = registerState (tmp);
    curTrail.addEvent (URL_SUBMIT_EVENT, tmp.document, tmp);
  } catch (ex) {
    showStatus ("[event.urlSubmitEvent] " + ex.message);
  }
}

function pasteInputEvent (value) {
  try {
    var tmp = curState.clone ();
    tmp.currentInput = value;
    tmp.currentInput.source = tmp.clipboard;
    //curState = registerState (tmp);
    curTrail.addEvent (PASTE_INPUT_EVENT, tmp.currentInput, tmp);
  } catch (ex) {
    showStatus ("[event.pasteInputEvent] " + ex.message);
  }
}

function urlCopyEvent (value) {
  showStatus ("[event.urlCopyEvent] " + value);
  var v = new SVCB ();
  v.value = new Object ();
  v.value.hlStruct = new PhraseStruct ();
  v.value.hlContent = HLCONTENT_URL;
  var tmp = curState.clone ();
  tmp.clipboard = v;
  
  //curState = registerState (tmp);
  curTrail.addEvent (URL_COPY_EVENT, v, tmp);
}