/* This is the file that captures events from the browser
 * 
 * Dong Zhou
 */


//  porting moved to trailboss.xul
const STATE_FILE = path + "sdb.txt";
const TRAIL_FILE = path + "tdb.txt";
const LOG_FILE   = path + "ldb.txt";
const TRAIL_MAX_TIME_GAP = 30000; //30 seconds
const DEBUG = true;

//Events related
const NULL_EVENT = 0;
const URL_INPUT_EVENT = 1;
const HIGHLIGHT_EVENT = 2;
const COPY_EVENT = 3;
const PASTE_EVENT = 4;
const URL_SUBMIT_EVENT = 5;
const INPUT_EVENT = 6;
const PASTE_INPUT_EVENT = 7; //A PASTE_INPUT_EVENT is the combination of INPUT_EVENT and PASTE_EVENT
const URL_COPY_EVENT = 8;

const REDUCED_NONE = 0;
const REDUCED_SCP = 1;

var cpstate, cpstart, cpend, startRangeParent; //For copy/paste state management
var curState = null, curTrail = null; //Current interaction state and current trail
var urlbarElem = null;
//var forwardButton, backButton;
var parentNode, inputTemplate, urlTemplate, passwordTemplate; //reference to XUL elements
var currentURL = null, previousURL = null; //These and 2 variables below are for keeping track of navigation history
var currentTitle = null, previousTitle = null; //Somehow "history" didn't work for me

//This is function is not really used. It's for testing new mechanisms of monitoring
var httpRequestObserver =
{
  observe: function(subject, topic, data) 
  {
    try {
      if (topic == "http-on-modify-request") {

        var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
        //debugMessage ("[httpRequestObserver.observe] URI=" + httpChannel.URI.spec);
        //debugMessage ("[httpRequestObserver.observe] originalURI=" + httpChannel.originalURI.spec);
        //debugMessage ("[httpRequestObserver.observe] referrer=" + httpChannel.referrer.spec);
      }
    } catch (ex) {
      debugMessage ("[httpRequestObserver.observe] " + ex.message);
    }
  }
};

//Checking if we can get hold of the URL bar element
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
		showStatus ("[procCopy] " + ex.message);
	}
}
	
function procURLBarCopy (copyEvent) {
	//checkURLBar ();
	try {
		//showStatus ("[procURLBarCopy] " + copyEvent.target);
		newEvent (URL_COPY_EVENT, curState.document);
	} catch (ex) {
		showStatus ("[procURLBarCopy] " + ex.message);
	}
}

function procURLBarKeyup (keyEvent) {
	//checkURLBar ();
	try {
		//showStatus ("[procURLBarKeyup] charCode=" + keyEvent.charCode + " keyCode=" + keyEvent.keyCode + " ctrl=" + keyEvent.ctrlKey);
		if (keyEvent.charCode == 99 && keyEvent.ctrlKey)
			newEvent (URL_COPY_EVENT, curState.document);
	} catch (ex) {
		showStatus ("[procURLBarKeyup] " + ex.message);
	}
}

function procPaste (copyEvent) {
	//checkURLBar ();
	//showStatus ("Paste Event");
	newEvent (PASTE_EVENT, null);
}
	
function procMouseDown (mdEvent) {
	
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

//Following functions are used to implement our customized way of generating right HIGHLIGHT_EVENT
//They, as well as a function called myCompact below, should be moved to a different file
function allTrailingWhiteSpace (node, offset) {
  if (node == null || node.nodeValue == null) return true;
  for (var i = offset; i < node.nodeValue.length; i++) {
    var c = node.nodeValue.charAt (i);
    if (c != ' ' && c != '\n' && c != '\t') return false;
  }
  
  return true;
}

function allLeadingWhiteSpace (node, offset) {
  if (node == null || node.nodeValue == null) return true;
  for (var i = 0; i < offset; i++) {
    var c = node.nodeValue.charAt (i);
    if (c != ' ' && c != '\n' && c != '\t') return false;
  }
  
  return true;
}

function findChildTextNode (root, ignoreWhiteNode) {
  var res = null;
  try {
    debugMessage ("[findChildTextNode] root=" + root);
    debugMessage ("[findChildTextNode] rootType=" + root.localName);
    if (root.childNodes == null || root.childNodes.length == 0) return null;
    for (var i = 0; i < root.childNodes.length; i++) {
      var c = root.childNodes[i];
      if (c.nodeValue != null) {
        if (!ignoreWhiteNode) { res = c; break;}
        if (!allLeadingWhiteSpace (c, c.nodeValue.length)) { res = c; break;}
      } else {
        var tmp = findChildTextNode (c, ignoreWhiteNode);
        if (tmp != null) { res = tmp; break; }
      }
    }
  } catch (ex) {
    debugMessage ("[findChildTextNode] " + ex.message);
  }
  
  debugMessage ("[findChildTextNode] res=" + res.nodeValue);
  return res;
}

function findNextSiblingTextNode (node, ignoreWhiteNode) {
  try {
    while (node.nextSibling != null) {
      node = node.nextSibling;

      debugMessage ("[findNextSiblingTextNode] node=" + node); 
      debugMessage ("[findNextSiblingTextNode] nodeType=" + node.localName);
      if (node.nodeValue != null) {
        debugMessage ("[findNextSiblingTextNode] sibText=" + node.nodeValue);
        if (!ignoreWhiteNode) return node;
        if (!allLeadingWhiteSpace (node, node.nodeValue.length)) return node;
      } else {
        var child = findChildTextNode (node, ignoreWhiteNode);
        if (child != null) return child;
      }
    }
  } catch (ex) {
    debugMessage ("[findNextSiblingTextNode] " + ex.message);
  }
  
  return null;
}

function findPrevSiblingTextNode (node, ignoreWhiteNode) {
  debugMessage ("[findPrevSiblingTextNode] node=" + node); 
  debugMessage ("[findPrevSiblingTextNode] nodeType=" + node.localName);
  
  while (node.previousSibling != null) {
    node = node.previousSibling;
    if (node.nodeValue != null) {
      if (!ignoreWhiteNode) return node;
      if (!allLeadingWhiteSpace (node, node.nodeValue.length)) return node;
    } else {
      var child = findChildTextNode (node, ignoreWhiteNode);
      if (child != null) return child;
    }
  }
  
  return null;
}

function adjustHighlight (sn, soff, en, eoff) {
  var highlight, tmp;
  
  debugMessage ("[adjustHighlight] sn=" + sn + " en=" + en);
  debugMessage ("[adjustHighlight] sn=" + sn.className + " en=" + en.className);
  debugMessage ("[adjustHighlight] soff=" + soff + " eoff=" + eoff + " stext=" + sn.nodeValue);
  try {
    if (sn == null) {
      debugMessage ("[adjustHighlight] start node is null");
      sn = en;
      soff = 0;
    }
    
    if (en == null) {
      debugMessage ("[adjustHighlight] end node is null");
      en = sn;
      eoff = sn.nodeValue.length;
    }
   
    if (sn.nodeValue == null) {
      debugMessage ("[adjustHighlight] sn.nodeValue is null");
      sn = sn.childNodes[soff];
      debugMessage ("[adjustHighlight] new sn.nodeValue=" + sn.nodeValue);
      soff = -1;
    }
    
    if (en.nodeValue == null) {
      debugMessage ("[adjustHighlight] en.nodeValue is null");
      en = en.childNodes[eoff];
      debugMessage ("[adjustHighlight] new en.nodeValue=" + en.nodeValue);
      eoff = -1;
    }
    
    //if (sn == en) 
    var browsers=document.getElementById('content').browsers;
    var comp = nodeComp (browsers[0].contentDocument, sn, en);
    
    if (comp > 0) {
      debugMessage ("[adjustHighlight] start node is behind end node");
      tmp = en;
      en = sn;
      sn = tmp;
      tmp = eoff;
      eoff = soff;
      soff = tmp;
    }
    
    if (comp == 0) {
      debugMessage ("[adjustHighlight] start node and end node are the same!");

      if (soff > eoff) {
        tmp = soff;
        soff = eoff;
        eoff = tmp;
      } else if (soff == eoff) return null;
    } else {
      if (soff == -1 && eoff != -1) {
        if (allLeadingWhiteSpace (en, eoff)) {
          tmp = findNextSiblingTextNode (sn, true);
          if (tmp != null && nodeComp (browsers[0].contentDocument, tmp, en) < 0) {
            en = tmp;
            eoff = en.nodeValue.length;
          }
        }
        sn = en;
        soff = 0;
      } else if (soff != -1 && eoff == -1) {
        if (allTrailingWhiteSpace (sn, soff)) {
          tmp = findPrevSiblingTextNode (en, true);
          
          comp = nodeComp (browsers[0].contentDocument, tmp, sn);
          debugMessage ("[adjustHighlight] tmp=" + tmp + " comp=" + comp);
          debugMessage ("[adjustHighlight] sn.text=" + sn.nodeValue + " tmp.text=" + tmp.nodeValue);
          if (tmp != null &&  comp > 0) {
            debugMessage ("[adjustHighlight] here!");
            sn = tmp;
            soff = 0;
          }
        }
        en = sn;
        eoff = sn.nodeValue.length;
      } else {
        if (allLeadingWhiteSpace (en, eoff)) {
          if (!allTrailingWhiteSpace (sn, soff)) {
            en = sn;
            eoff = sn.nodeValue.length;
          } else {
            var sib = findNextSiblingTextNode (sn, true);
            if (sib == null || nodeComp (browsers[0].contentDocument, sib, en) > 0) {
              sn = en;
              soff = 0;
            } else {
              sn = en = sib;
              soff = 0;
              eoff = sn.nodeValue.length;
            }       
          }
        } else {
          sn = en;
          soff = 0;
        }
      }
    }
    
    debugMessage ("[adjustHighlight] soff=" + soff + " eoff=" + eoff);
    
    highlight = en.nodeValue.substring (soff, eoff);
    highlight = myCompact (highlight);
  } catch (ex) {
    debugMessage ("[adjustHighlight] " + ex.message);
  }
  
  var res = new Object ();
  res.startParent = sn;
  res.startOffset = soff;
  res.endParent = en;
  res.endOffset = eoff;
  res.highlight = highlight;
  
  return res;
}

function procMouseUp (muEvent) {
	//showStatus ("[mouseUp]");

	try {
    
    //var appcontent = document.getElementById("appcontent");	
		var browsers=document.getElementById('content').browsers;
  	if (!isAncestor (browsers[0].contentDocument, muEvent.target)) {
			cpstate = 0;
			return;
		}
    
	 	cpend = muEvent.rangeOffset;
		var rangeParent = muEvent.rangeParent;
		var highlight;
		//showStatus ("MouseUp Event[offset=" + cpend + ", text=" + rangeParent.nodeValue + "]");
    var s = content.getSelection ();

		if (rangeParent != null && cpstate == 1 && s.rangeCount > 0 && !s.getRangeAt(0).collapsed)	{
			cpstate = 2;
      var r = s.getRangeAt (0);

			showStatus ("[procMouseUp] [collapsed=" + r.collapsed + " soffset=" + r.startOffset + ", text=" + r.startContainer.nodeValue + " eoffset=" +
				r.endOffset + ", text=" + r.endContainer.nodeValue + "]");

      var tmp = adjustHighlight (r.startContainer, r.startOffset, r.endContainer, r.endOffset);

      if (tmp != null) {
    		showStatus ("[procMouseUp] highlight=" + tmp.highlight);
      	//newEvent (HIGHLIGHT_EVENT, highlight);
      	newEvent (HIGHLIGHT_EVENT, tmp);
      }
		} else cpstate = 0;
	} catch (ex) {
		showStatus ("[procMouseUp] " + ex.message);
	}
} 

function procClick (clickEvent) {
  try {
    var t = clickEvent.target;
    debugMessage ("[procClick] target=" + t + " nodeNmae=" + t.nodeName + " localName=" + t.localName
      + " tagName=" + t.tagName + " baseURI=" + t.baseURI);
  } catch (ex) {
    debugMessage ("[procClick]" + ex.message);
  }
}

function procInput (inputEvent) {
	//inputEvent.target != urlbarElem && 
	if (inputEvent.target.name != undefined) {
		//showStatus ("[procInput] event target type[" + inputEvent.target.type + "]");
		newEvent (INPUT_EVENT, new FormInput (false, inputEvent.target.name, inputEvent.target.value, inputEvent.target.type));
	}
}

function procKeypress (keyEvent) {
	//debugMessage ("[procKeypress] " + keyEvent.keyCode);
	if (keyEvent.keyCode == 27) resetState (); 
}

function procURLBarInput (inputEvent) {
	//showStatus ("URL Input: " + urlbarElem.value);
	newEvent (URL_INPUT_EVENT, urlbarElem.value);
}

function procURLBarTextEnter (textEnterEvent) {
	showStatus ("URL TextEntered: " + urlbarElem.value);
}

//This function prints some message to somewhere (used to be the status bar, now I
//print it to a log file
function showStatus (txt) {
	//(txt);

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

//THis is called when the browser is loaded
function procLoad () {
  try {
    var appcontent = document.getElementById("appcontent");
    if(appcontent) {
      appcontent.addEventListener("DOMContentLoaded", procPageLoad, true);
      //appcontent.addEventListener("mouseup", procDocMouseUp, true);

      //showStatus ("appcontent found");
    } else showStatus ("appcontent NOT found");  

    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                                  .getService(Components.interfaces.nsIObserverService);
    observerService.addObserver(httpRequestObserver, "http-on-modify-request", false);
  } catch (ex) {
    debugMessage ("[procLoad catch]" + ex.message);
  }
debugMessage ("[procLoad] return" );
}

function procUnLoad () {
	showStatus ("[procUnLoad] Registering trail...");
	registerTrail (curTrail);
	curTrail.scpman.saveHLSessions ();
	showStatus ("[procUnLoad] Saving Trail DB...");
	saveTrails (TRAIL_FILE);
	showStatus ("[procUnLoad] Saving State DB...");
	saveStates (STATE_FILE);
}

//This is called when a page is loaded
function procPageLoad () {
	showStatus ("[procPageLoad] PageLoad event");
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
		if (loc != null && loc != "null" && loc != curState.document) newEvent (URL_SUBMIT_EVENT, tmp);
	}
}

function initState () {
	if (curState != null) return;
        //Get the references to the XUL element templates we use on the status bar
	if (inputTemplate == null) {
		inputTemplate = document.getElementById("inputTemplate");
		urlTemplate = document.getElementById("urlTemplate");
		passwordTemplate = document.getElementById("passwordTemplate");
		parentNode = inputTemplate.parentNode;
		parentNode.removeChild (inputTemplate); //Hide them
		parentNode.removeChild (urlTemplate);
		parentNode.removeChild (passwordTemplate);
	}
	
	try {
		showStatus ("[initState] Loading state table...");

		loadStates (STATE_FILE);

		showStatus ("[initState] Loading state table...DONE");
		
  	var tmp = new MIOState (REDUCED_NONE);
  	if (urlbarElem == null) {
  		urlbarElem = checkURLBar ();
  		//getBackForwardButtons ();
  	}
  	tmp.urlbar = urlbarElem.value;
  	
  	cpstate = 0;

  	var browsers=document.getElementById('content').browsers;
  	tmp.document = currentURL = browsers[0].currentURI.spec;
  	
  	//showStatus ("Browser is " + browsers[0]);
  	
  	prevEventType = URL_SUBMIT_EVENT; //This is to supress extra url submit events that happens at the start of the session
  	prevEventValue = tmp.document;
  	
  	showStatus ("[initState] Registering current state...");
  	
  	curState = registerState (tmp);
  	
  	showStatus ("[initState] Loading trail database...");
  	
  	loadTrails (TRAIL_FILE);
  	//showStatus ("[initState] curState.id=" + curState.id);
  	curTrail = newTrail (curState);
  } catch (ex) {
  	showStatus ("[initState] " + ex.message);
  }
}

function resetState () {
	try {
		procUnLoad ();
		curState = null;
		initState ();		
	} catch (ex) {
		showStatus ("[resetState] " + ex.message);
	}
}

//This function is used to remove white spaces from highlighted text
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

//Note that there are event listeners registered elsewhere (because, for example, we can only
//register after the first page is loaded...)
//In particular, check urlsubmit.js for URL_SUBMIT_EVENT
window.addEventListener("copy", function (e) { procCopy(e); }, false);
window.addEventListener("paste", function (e) { procPaste(e); }, false);
window.addEventListener("mousedown", function (e) { procMouseDown(e); }, false);
window.addEventListener("mouseup", function (e) { procMouseUp(e); }, true);
window.addEventListener("load", function() { procLoad(); }, false);
window.addEventListener("unload", function() { procUnLoad(); }, false);
window.addEventListener("input", function(e) { procInput(e); }, false);
window.addEventListener("keypress", function(e) { procKeypress(e); }, false);
//window.addEventListener("click", function(e) { procClick(e); }, false);

