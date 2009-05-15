
const WORK_DIR = "C:\\cygwin\\home\\zhou\\extensions\\myextension\\chrome\\content\\";
const STATE_FILE = WORK_DIR + "sdb.txt";
const TRAIL_FILE = WORK_DIR + "tdb.txt";
const LOG_FILE = WORK_DIR + "ldb.txt";
const STRUCT_FILE = WORK_DIR + "structdb.txt";
const TRAIL_MAX_TIME_GAP = 60000; //30 seconds
const DEBUG = true;

//Events related
const NULL_EVENT = 0;
const URL_INPUT_EVENT = 1;
const HIGHLIGHT_EVENT = 2;
const COPY_EVENT = 3;
const PASTE_EVENT = 4;
const URL_SUBMIT_EVENT = 5;
const INPUT_EVENT = 6;
const PASTE_INPUT_EVENT = 7;
const URL_COPY_EVENT = 8;

const REDUCED_NONE = 0;
const REDUCED_SCP = 1;

var inreset = false;

var cpstate, cpstart, cpend, startRangeParent;
var curState = null, curTrail = null;
var urlbarElem = null;
//var forwardButton, backButton;
var parentNode, inputTemplate, urlTemplate, passwordTemplate;
var currentURL = null, previousURL = null;
var currentTitle = null, previousTitle = null;
var updateURL = true;


function checkURLBar () {
  var urlbar = document.getElementById("urlbar");
	
  if (urlbar == null) showStatus ("[checkURLBar] URL is null");
  else {
		
    //showStatus ("[checkBRLBar] URL bar acquired! = " + urlbar);
    urlbar.addEventListener ("input", function (e) { procURLBarInput (e); }, false);
    urlbar.addEventListener ("copy", function (e) { procURLBarCopy (e); }, false);
    urlbar.addEventListener ("keypress", function (e) { procURLBarKeyup (e); }, false);
    //myurlbar.addEventListener ("searchcomplete", function (e) { procURLBarTextEntered (e); }, false);
  }
	
  return urlbar;
}	
	
function getBackForwardButtons () {
  //debugMessage ("[getBackForwardButtons] ");
  try {
    var forwardButton = document.getElementById("forward-button");
    //debugMessage ("[getBackForwardButtons] forward=" + forwardButton);
    forwardButton.addEventListener ("click", function (e) { procForwardButtonClick (e); }, true);
    var backButton = document.getElementById("back-button");
    //debugMessage ("[getBackForwardButtons] back =" + backButton);
    backButton.addEventListener ("click", function (e) { procBackButtonClick (e); }, true);
  } catch (ex) {
    debugMessage ("[main.getBackForwardButtons] " + ex.message);
  }
}	
	
function procCopy (copyEvent) {
  //checkURLBar ();
  try {
    //showStatus ("[procCopy] " + copyEvent.target);
		
    if (copyEvent.target == urlbarElem) {
      newEvent (URL_COPY_EVENT, curState.document);
      return;
    }
		
    if (curState == null || cpstate != 2) return;
		
    newEvent (COPY_EVENT, null);
  } catch (ex) {
    showStatus ("[main.procCopy] " + ex.message);
  }
}
	
function procURLBarCopy (copyEvent) {
  //checkURLBar ();
  try {
    //showStatus ("[procURLBarCopy] " + copyEvent.target);
    newEvent (URL_COPY_EVENT, curState.document);
  } catch (ex) {
    showStatus ("[main.procURLBarCopy] " + ex.message);
  }
}

function procURLBarKeyup (keyEvent) {
  //checkURLBar ();
  try {
    //showStatus ("[procURLBarKeyup] charCode=" + keyEvent.charCode + " keyCode=" + keyEvent.keyCode + " ctrl=" + keyEvent.ctrlKey);
    if (keyEvent.charCode == 99 && keyEvent.ctrlKey)
      newEvent (URL_COPY_EVENT, curState.document);
  } catch (ex) {
    showStatus ("[main.procURLBarKeyup] " + ex.message);
  }
}

function procPaste (copyEvent) {
  //checkURLBar ();
  //showStatus ("Paste Event");
  newEvent (PASTE_EVENT, null);
}
	
function procMouseDown (mdEvent) {
  //checkURLBar ();
  //showStatus ("[mouseDown]");
	
	/*
	if (prevEventType == HIGHLIGHT_EVENT) {
		cancelHighlightEvent ();
	}
	*/
	
  var browsers=document.getElementById('content').browsers;
  if (!isAncestor (browsers[0].contentDocument, mdEvent.target)) {
    cpstate = 0;
    return;
  }
	
  cpstart = mdEvent.rangeOffset;
  startRangeParent = mdEvent.rangeParent;
  //showStatus ("MouseDown Event[offset=" + cpstart + ", text=" + startRangeParent.nodeValue + "]");
  if (startRangeParent != null) cpstate = 1;
  else cpstate = 0;
}

function procMouseUp (muEvent) {
  //showStatus ("[mouseUp]");
  //checkURLBar ();
  try {
    var browsers=document.getElementById('content').browsers;
    if (!isAncestor (browsers[0].contentDocument, muEvent.target)) {
      cpstate = 0;
      return;
    }

    cpend = muEvent.rangeOffset;
    var rangeParent = muEvent.rangeParent;
    var highlight;
    //showStatus ("MouseUp Event[offset=" + cpend + ", text=" + rangeParent.nodeValue + "]");
    if (rangeParent != null && cpstate == 1 && cpstart != cpend)	{
      cpstate = 2;

      var tmp = refineHighlight (startRangeParent, cpstart, rangeParent, cpend);
      //tmp is of type SVHL

      showStatus ("[procMouseUp] hlContent=" + tmp.value.hlContent);
      tmp.value.hlStruct.root_id = curState.document.value.loc;
      //newEvent (HIGHLIGHT_EVENT, highlight);
      newEvent (HIGHLIGHT_EVENT, tmp);
    } else cpstate = 0;
  } catch (ex) {
    showStatus ("[main.procMouseUp] " + ex.message);
  }
} 

function procInput (inputEvent) {
  //inputEvent.target != urlbarElem &&
  //showStatus ("[procInput] event");
  try {
    if (inputEvent.target.name != undefined) {
      //showStatus ("[procInput] event target type[" + inputEvent.target.type + "]");
		
      var fi = new SVFI ();
      fi.dest.value = new Object ();
      fi.dest.value.field_name = inputEvent.target.name;
      fi.dest.value.field_type = inputEvent.target.type;
      fi.dest.value.field_id = -1;
      fi.source.value = new Object ();		
      fi.source.value.hlContent = inputEvent.target.value;
			
      newEvent (INPUT_EVENT, fi);
      //newEvent (INPUT_EVENT, new FormInput (false, inputEvent.target.name, inputEvent.target.value, inputEvent.target.type));
    }
  } catch (ex) {
    showStatus ("[main.procInput] " + ex.message);
  }
}

function procKeypress (keyEvent) {
  //debugMessage ("[procKeypress] " + keyEvent.keyCode);
  if (keyEvent.keyCode == 46) resetState (); 
}

function procURLBarInput (inputEvent) {
  //showStatus ("URL Input: " + urlbarElem.value);
  newEvent (URL_INPUT_EVENT, urlbarElem.value);
}

function procURLBarTextEnter (textEnterEvent) {
  showStatus ("URL TextEntered: " + urlbarElem.value);
}

/*
function procForwardButtonClick (clickEvent) {
	try {
		updateURL = false;
		var tmp = new Object ();
		tmp.loc = currentURL;
		tmp.title = currentTitle;
		newEvent (URL_SUBMIT_EVENT, tmp);
		updateURL = true;
	} catch (ex) {
		debugMessage ("[main.procForwardButtonClick] " + ex.message);
	}
}

function procBackButtonClick (clickEvent) {
	try {
		updateURL = false;
		var tmp = new Object ();
		tmp.loc = previousURL;
		tmp.title = previousTitle;
		newEvent (URL_SUBMIT_EVENT, tmp);
		updateURL = true;
	} catch (ex) {
		debugMessage ("[main.procBackButtonClick] " + ex.message);
	}
}
 */

/*
function showStatus (txt) {
	var tmp = document.getElementById("status");
	//while (tmp == null) tmp = document.getElementById("stockwatcher");
	try {
	
		if (stateTable != null && stateTable.length >= 1 && typeof (stateTable[1]) != "undefined") 
			txt += " name=" + stateTable[1].currentInput.name;
			
		tmp.label = txt;
		logline (txt);
	} catch (ex) {
		showStatus2 (ex.message);
	}
}
 */

function showStatus (txt) {
  var tmp = document.getElementById("status");
  //tmp.style.color = "blue";
  //tmp.style.
  //while (tmp == null) tmp = document.getElementById("stockwatcher");
  //txt = new Date().toLocaleTimeString () + " " + txt;
  var d = new Date();
  txt = d.toLocaleTimeString () + ":" + d.getMilliseconds() + " " + txt;
  //tmp.label = txt;
  logline (txt);
}

function debugMessage (txt) {
  if (DEBUG) showStatus (txt);
}

function procLoad () {
  var appcontent = document.getElementById("appcontent");
  if(appcontent) {
    appcontent.addEventListener("DOMContentLoaded", procPageLoad, true);
    //showStatus ("appcontent found");
  } else showStatus ("appcontent NOT found");  
}

function procUnLoad () {
  showStatus ("[main.procUnLoad] Registering trail...");
  registerTrail (curTrail);
  //curTrail.scpman.saveHLSessions ();
  showStatus ("[main.procUnLoad] Saving Trail DB...");
  saveTrails (TRAIL_FILE);
  showStatus ("[main.procUnLoad] Saving State DB...");
  saveStates (STATE_FILE);
  showStatus ("[main.procUnLoad] Saving Struct DB...");
  saveStructs (STRUCT_FILE);
  showStatus ("[main.procUnLoad] MIO System Exit Complete!\n===============================================================\n");
}

function procPageLoad () {
  //showStatus ("[procPageLoad] PageLoad event");
  if (inreset) {
  	inreset = false;
  	return;
  }
  if (curState == null) initState ();
  else {
    var browsers = document.getElementById('content').browsers;
    var loc = browsers[0].currentURI.spec;
    var title=browsers[0].contentTitle;
    //showStatus ("[procPageLoad] title=" + title);
    var tmp = new Object ();
    tmp.loc = loc;
    if (title == undefined) tmp.title = tmp.loc;
    else tmp.title = title;
    //showStatus ("[main.procPageLoad] PageLoad event: cur url=" + curState.document.value.loc + " new url=" + loc);
    if (loc != null && loc != "null" && loc != curState.document.value.loc) newEvent (URL_SUBMIT_EVENT, tmp);
  }
}

function initState () {
  if (curState != null) return;

  if (inputTemplate == null) {
    inputTemplate = document.getElementById("inputTemplate");
    urlTemplate = document.getElementById("urlTemplate");
    passwordTemplate = document.getElementById("passwordTemplate");
    parentNode = inputTemplate.parentNode;
    parentNode.removeChild (inputTemplate);
    parentNode.removeChild (urlTemplate);
    parentNode.removeChild (passwordTemplate);
  }
	
  try {
    loadStructs (STRUCT_FILE);
    initGenMan ();
		  	
    showStatus ("[main.initState] Loading state table...");

    loadStates (STATE_FILE);

    showStatus ("[main.initState] Loading state table...DONE");
		
    var tmp = new MIOState ();
    if (urlbarElem == null) {
      urlbarElem = checkURLBar ();
      getBackForwardButtons ();
    }
    tmp.urlbar = new SVUrl (urlbarElem.value);
  	
    cpstate = 0;

    var browsers = document.getElementById('content').browsers;
    currentURL = browsers[0].currentURI.spec;
    tmp.document = new SVDoc (browsers[0].contentTitle, currentURL, currentURL);
  	
    //showStatus ("Browser is " + browsers[0]);
  	
    prevEventType = URL_SUBMIT_EVENT; //This is to supress extra url submit events that happens at the start of the session
    prevEventValue = currentURL;

  	
    showStatus ("[main.initState] Registering current state...");
  	

    curState = registerState (tmp);
  	
    showStatus ("[main.initState] Loading trail database...");
  	
    loadTrails (TRAIL_FILE);
    showStatus ("[initState] curState.id=" + curState.id);
    curTrail = newTrail (curState);
    
    //optimizePredicted (trailTable);
  } catch (ex) {
    showStatus ("[main.initState] " + ex.message);
  }
}

function resetState () {
  try {
  	inreset = true;
  	registerTrail (curTrail);
    curState = stateTable[0];
    curTrail = newTrail (curState);
    clearOptimizedItems ();
    prevEventType = URL_SUBMIT_EVENT; //This is to supress extra url submit events that happens at the start of the session
    prevEventValue = curState.document.value.loc;
    var browsers=document.getElementById('content').browsers;
    browsers[0].loadURI (curState.document.value.loc);
  } catch (ex) {
    showStatus ("[resetState] " + ex.message);
  }
}


function myCompact (s) {
  var res = "";
  var prechar = null;
  for (var i = 0; i < s.length; i++) {
    if (s.charAt (i) == '\n' || s.charAt (i) == ' ' || s.charAt (i) == '\t') {
      if (prechar == null || prechar != ' ') {
        res += ' ';
        prechar = ' ';
      }
    } else {
      res += s.charAt (i);
      prechar = s.charAt (i);
    }
  }
  return res;
}

//clearLog ();

window.addEventListener("copy", function (e) { procCopy(e); }, false);
window.addEventListener("paste", function (e) { procPaste(e); }, false);
window.addEventListener("mousedown", function (e) { procMouseDown(e); }, false);
window.addEventListener("mouseup", function (e) { procMouseUp(e); }, false);
window.addEventListener("load", function() { procLoad(); }, false);
window.addEventListener("unload", function() { procUnLoad(); }, false);
window.addEventListener("input", function(e) { procInput(e); }, false);
window.addEventListener("keypress", function(e) { procKeypress(e); }, false);

//alert ("here 1");