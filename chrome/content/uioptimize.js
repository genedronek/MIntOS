/*
 *  This file optimizes a predicted sequence of interactions
 *  
 *  Dong Zhou
 */

const TEXT_INPUT_OPT_ITEM = 1;
const PSWD_INPUT_OPT_ITEM = 2;
const URL_OPT_ITEM = 3;
const SCP_OPT_ITEM = 4;

//This variable contains optimization widgets the user can currently see on the status bar
var curOptimizedItems;
var curSuggestedTrail;

//Optimize a predicted Trail
function optimizePredicted (predlist) {
	try {
	  //saveTTTrails (predlist);
	  //showStatus ("[uioptimize.optimizePredicted] trails to be optimzed: " + predlist.length);
	  var res = new Array ();
	  for (var i = 0; i < predlist.length; i++) {
	  	res[i] = optimizeTrail (predlist[i], i);
	  }
	  curOptimizedItems = res[0];
	  curSuggestedTrail = predlist[0].trail;
	  
	  displayPredicted (res);
	   
	} catch (ex) {
		showStatus ("[uioptimize.optimizePredicted] " + ex.message);
	}
}
	
function optimizeTrail (predicted, index) {
  //curSuggestedTrail = trail;
  try {
    //showStatus ("[uioptimize.optimizePredicted] predicted=" + predicted);
    //if (predicted < 0) return;
    //var trail = trailTable[predicted];
    
    var trail = predicted.trail;
    var start = predicted.start;
    /*
    if (curState.id == trail.initState.id) start = 0;
    else {
      for (var i = 0; i < trail.states.length; i++) {
        if (trail.states[i].id == curState.id) {
          start = i + 1;
          break;
        }
      }
    }
    */
    
    if (isForSCP (trail, start)) {
      return optimizeSCPPredicted (trail, start, index);
    }
    
    //showStatus ("[uioptimize.optimizeTrail] 2");
    
    var oitems = new Array ();
    
    //We are going to optimize the trail starting from 'start'
    for (var i = start; i < trail.states.length; i++) {
      //showStatus ("[uioptimize.optimizePredicted] etype=" + trail.etypes[i]);
      var res = null;
      switch (trail.etypes[i]) {
        case INPUT_EVENT:
        case PASTE_INPUT_EVENT:
          res = optimizeInputEvent (trail, start, i, oitems, index);
          break;
        case URL_SUBMIT_EVENT:
          //showStatus ("[uioptimize.optimizePredicted] url=" + trail.evalues[i].value.loc);
          res = optimizeURLSubmitEvent (trail, start, i, oitems, index);
          break;
      }
      //if (res != null) curOptimizedItems.push (res);
    }
    
   	//displayPredicted (curOptimizedItems);
    //We now add the dynamic items to the status bar
    //addOptimizedItems ();
    
    return oitems;
  } catch (ex) {
    showStatus ("[uioptimize.optimizeTrail] " + ex.message);
  }
}

function isForSCP (trail, start) {
  try {
    var count = 0;
    for (var i = start; i < trail.states.length; i++) {
      if (trail.etypes[i] == PASTE_INPUT_EVENT && trail.evalues[i].source.HMSFlag) {
        count++;
      }
    }
    
    //showStatus ("[uioptimize.isForSCP] paste count=" + count);
    
    return count >= 2;
  } catch (ex) {
    showStatus ("[uioptimize.isForSCP] " + ex.message);
  }
  
  return false;
}
    
//This is parallel to the above function. Used only when Smart Copy/Paste is enabled
function optimizeSCPPredicted (trail, start, index) {
  try {
    //showStatus ("[uioptimize.optimizeSCPPredicted] predicted=" + predicted.id);
    //if (predicted.id < 0) return;
    //var trail = trailTable[predicted.id];
		var res = new Array ();
	
    var inputs = [];
    var newdoc = null;
    var submitset = false;
    //We are going to optimize the trail starting from 'start'
    for (var i = start; i < trail.states.length; i++) {
      if (trail.etypes[i] == INPUT_EVENT || trail.etypes[i] == PASTE_INPUT_EVENT) {
         inputs.push (trail.evalues[i]);
         if (newdoc == null) newdoc = trail.states[i].document.value.loc;
       } else if (trail.etypes[i] == URL_SUBMIT_EVENT) {
         if (trail.states[i].document.value.loc == newdoc && !submitset) {
           optimizeURLSubmitEvent (trail, start, i, res, index);
           submitset = true;
         }
       }
      //if (res != null) curOptimizedItems.push (res);
    }
    optimizeSCP (inputs, newdoc, res, index);
    
    return res;
    //displayPredicted (curOptimizedItems);
    //We now add the dynamic items to the status bar
    //addOptimizedItems ();
  } catch (ex) {
    showStatus ("[uioptimize.optimizeSCPPredicted] " + ex.message);
  }
}

function optimizeSCP (inputs, newdoc, oitems, index) {
  try {
    showStatus ("[uioptimize.optimizeSCP] newdoc=" + newdoc);
		
    var tmp = urlTemplate.cloneNode (true);
    tmp.id = "curOptimizedItem_SCP_" + index;
    //parentNode.appendChild (tmp);
    //var res = document.getElementById("curOptimizedItem_SCP");
    tmp.optType = SCP_OPT_ITEM;
    res = tmp;
    
    res.inputs = [];
    for (var i = 0; i < inputs.length; i++) {
      var obj = new Object ();
      obj.name = inputs[i].dest.value.field_name;
      obj.type = inputs[i].dest.value.field_type;
      obj.value = inputs[i].source.value.hlContent;
      res.inputs.push (obj);
    }
    res.label = "Smart Copy/Paste";
    res.realURL = newdoc;
    res.style.color = "#ff8828";
    res.addEventListener("click", function (e) { procClickOptimizedSCP(e); }, false);
    res.optItemType = SCP_OPT_ITEM;
    res.click = procClickOptimizedSCP;
    //trailOffset = i;
    oitems.push (res);
		
  } catch (ex) {
    showStatus ("[optimizeSCP] " + ex.message);
  }
}

function optimizeInputEvent (trail, start, i, oitems, index) {
  var res = null;
  try {
    //showStatus ("[uioptimize.optimizeInputEvent] ");
		
    if (trail.evalues[i].dest.value.field_type == "password") res = passwordTemplate.cloneNode (true);
    else res = inputTemplate.cloneNode (true);
    res.id = "curOptimizedItem_" + index +"_" + i;
    //parentNode.appendChild (res);
    //var tmp = document.getElementById("curOptimizedItem_" + i);
    var tmp = res;
    
    tmp.value = trail.evalues[i].source.value.hlContent;
    tmp.prevValue = tmp.value;
    tmp.inputEventName = trail.evalues[i].dest.value.field_name;
    tmp.posInOptItems = oitems.length;
    tmp.addEventListener("input", function (e) { procInputOptimizedInput(e); }, false);
    tmp.addEventListener("keyup", function (e) { procKeyupOptimizedInput(e); }, false);
    
    if (trail.evalues[i].dest.value.field_type == "password") 
    	tmp.optItemType = PSWD_INPUT_OPT_ITEM;
    else tmp.optItemType = TEXT_INPUT_OPT_ITEM;
		
    tmp.trailOffset = i;
		
    oitems.push (tmp);
		
    //tmp.value.fontcolor = "Blue"; //Have to use tree view to change color
  } catch (ex) {
    showStatus ("[uioptimize.optimizeInputEvent] " + ex.message);
  }
	
  return res;
}

function isLinkedInputSubmit (trail, ie, se) {
  //var s = trail.evalues[ie].dest.value.field_name + "=" + trail.evalues[ie].source.value.hlContent;
  var s = trail.evalues[ie].dest.value.field_name + "=";
  var index = trail.evalues[se].value.loc.indexOf (s);
  if (index > 0) {
    var c = trail.evalues[se].value.loc.charAt (index - 1);
    if (c == '&' || c == '?') return true;
  }
  return false;
}

function linkWithLastInput (ie, item) {
  try {
    var s = ie.dest.value.field_name + "=";
    var index = item.realURI.indexOf (s) + s.length;
    s = item.realURI.substr (index);
    item.realURI = item.realURI.substring (0, index) + ie.source.value.hlContent;
    index = s.indexOf ("&");
    if (index >= 0) 
      item.realURI += s.substr (index);

  } catch (ex) {
    showStatus ("[uioptimize.linkWithLastInput] " + ex.message);
  }
}

function optimizeURLSubmitEvent (trail, start, i, oitems, index) {
  var res = null;
  try {
    //showStatus ("[uioptimize.optimizeURLSubmitEvent] ");
    res = urlTemplate.cloneNode (true);
    res.id = "curOptimizedItem_" + index + "_" + i;
    res.optType = URL_OPT_ITEM;
    //parentNode.appendChild (res);
    //var tmp = document.getElementById("curOptimizedItem_" + i);
    var tmp = res;
    
    //showStatus ("[uioptimize.optimizeURLSubmitEvent] 1");
    tmp.realURI = trail.evalues[i].value.loc;
    tmp.imagesrc = findImage (tmp.realURI);   
    tmp.trailOffset = i;
    //showStatus ("[uioptimize.optimizeURLSubmitEvent] 2");
    //showStatus ("[optimizeURLSubmitEvent] real URL=" + trail.evalues[i].loc);
    if (i > start && (trail.etypes[i-1] == INPUT_EVENT || trail.etypes[i-1] == PASTE_INPUT_EVENT)
      && isLinkedInputSubmit (trail, i-1, i)) {
      tmp.label = 'Go'; 
      tmp.style.color = "green";
      linkWithLastInput (trail.evalues[i - 1], tmp);
      tmp.linkedWithLastInput = true;
    } else {
      //TODO
      tmp.label = getShortPageTitle (trail.evalues[i].value.title, 4, 9);
      tmp.style.color = "blue";
      tmp.linkedWithLastInput = false;
    }
    //tmp.addEventListener("click", function (e) { procClickOptimizedURLSubmit(e); }, false);
		tmp.click = procClickOptimizedURLSubmit;
    tmp.optItemType = URL_OPT_ITEM;

    oitems.push (tmp);
  } catch (ex) {
    showStatus ("[uioptimize.optimizeURLSubmitEvent] " + ex.message);
  }
	
  return res;
}

function clearOptimizedItems () {
  try {
  	/*
    while (curOptimizedItems.length > 0) {
      var node = curOptimizedItems.pop ();
      parentNode.removeChild (node);
    }
    */
    removePredicted ();
  } catch (ex) {
    showStatus ("[clearOptimizedItems] " + ex.message);
  }
}

function procClickOptimizedURLSubmit (target) {
  try {
  	showStatus ("[procClickOptimizedURLSubmit] ");
    //var target = clickEvent.target;
    //window.location = target.label;
    //document.location.href = target.label;
    
    var browsers=document.getElementById('content').browsers;
    
    //setCurrentTrail (curSuggestedTrail, target.trailOffset);
    var ct = curSuggestedTrail.clone (target.trailOffset);
    setCurrentTrail (ct);
    debugMessage ("[procClickOptimizedSCP] loading " + target.realURI);
    browsers[0].loadURI (target.realURI);
  } catch (ex) {
    showStatus ("[procClickOptimizedURLSubmit] " + ex.message);
  }
}

function procInputOptimizedInput (inputEvent) {
  try {
    var target = inputEvent.target;
    var s = target.inputEventName + "=" + target.prevValue;
    var ns = target.inputEventName + "=" + target.value;
    //showStatus ("[procInputOptimizedInput] s=" + s + " pos=" + target.posInOptItems);
    for (var i = target.posInOptItems + 1; i < curOptimizedItems.length; i++) {
      var tmp = curOptimizedItems[i];
      if (tmp.optItemType == URL_OPT_ITEM) {
        var index = tmp.realURI.indexOf (s);
        if (index > 0) {
          var c = tmp.realURI.charAt (index - 1);
          if (c == '&' || c == '?') {
            var realItem = document.getElementById (tmp.id);						
            realItem.realURI = tmp.realURI.substring (0, index) + ns + tmp.realURI.substr (index + s.length);
            //if (!realItem.linkedWithLastInput) realItem.label = realItem.realURI;
            //showStatus ("[procInputOptimizedInput] realItem.label=" + realItem.label);
          }
        }
      }
    }
    target.prevValue = target.value;
  } catch (ex) {
    showStatus ("[procInputOptimizedInput] " + ex.message);
  }
}

function procKeyupOptimizedInput (keyEvent) {
  debugMessage ("[procKeyupOptimizedInput] " + keyEvent.keyCode);
  try {
    if (keyEvent.keyCode == 13) {
      var target = keyEvent.target;
      for (var i = target.posInOptItems + 1; i < curOptimizedItems.length; i++) {
        var tmp = curOptimizedItems[i];
        if (tmp.optItemType == URL_OPT_ITEM) {
          var browsers=document.getElementById('content').browsers;
          browsers[0].loadURI (tmp.label);
          break;
        }
      }
    }
  } catch (ex) {
    debugMessage ("[procKeyupOptimizedInput] " + ex.message);
  }
}

var scpOptimizedItem = null;

function procClickOptimizedSCP (target) {
  try {
    //debugMessage ("[procClickOptimizedSCP]");
    
    //var target = event.target;
    scpOptimizedItem = target;
    //debugMessage ("[procClickOptimizedSCP] target=" + target + " url= " + target.realURL);
    
    var appcontent = document.getElementById("appcontent");
    appcontent.addEventListener("DOMContentLoaded", scpProcPageLoad, true);
    
    var browsers=document.getElementById('content').browsers;
    browsers[0].loadURI (target.realURL);
  } catch (ex) {
    debugMessage ("[procClickOptimizedSCP] " + ex.message);
  }
}

function scpProcPageLoad () {
  try {
    //debugMessage ("[scpProcPageLoad]");
    
    if (scpOptimizedItem == null) 
      debugMessage ("[scpProcPageLoad] scpOptimizedItem is null!");
    
    var appcontent = document.getElementById("appcontent");	
    appcontent.removeEventListener("DOMContentLoaded", scpProcPageLoad, true);
    
    for (var i = 0; i < scpOptimizedItem.inputs.length; i++) {
      //debugMessage ("[scpProcPageLoad] " + i + " name=" + scpOptimizedItem.inputs[i].name);
      assignInputValue (appcontent, scpOptimizedItem.inputs[i]);
    }
    
    scpOptimizedItem = null;		
  } catch (ex) {
    debugMessage ("[scpProcPageLoad] " + ex.message);
  }
}

function assignInputValue (sub_root, fi) {
  try {
    //var node = sub_root.getElementByName (fi.name);
    
    var appcontent = document.getElementById("appcontent");	
    var browsers=document.getElementById('content').browsers;
    
    //var node = getFirstElementByName (browsers[0].contentDocument, fi.name); //TODO hack
    var node = browsers[0].contentDocument.getElementsByName (fi.name)[0];
    node.value = fi.value;
  } catch (ex) {
    debugMessage ("[assignInputValue] " + ex.message);
  }
}

function getShortPageTitle (s, l1, l2) {
  var res = "";
  try {
    if (s == null) res = "";
    else {
      if (s.length <= l1 + l2 + 3) res = s;
      else res = s.substring (0, l1) + "..." + s.substr (s.length - l2);
    }		
  } catch (ex) {
    debugMessage ("[getShortPageTitle] " + ex.message);
  }
  
  return res;
}

var imageURIs, imageFiles;

function initImageFiles () {
	imageURIs = new Array ();
	imageFiles = new Array ();
	
	imageURIs[0] = "http://dcl-zhou-acer/demo/mobibank/page1.html";
	imageFiles[0] = imgsPath + "s1.png";
	imageURIs[1] = "http://dcl-zhou-acer/demo/mobibank/page2.html";
	imageFiles[1] = imgsPath + "s2.png";
	imageURIs[2] = "http://dcl-zhou-acer/demo/mobibank/page3.html?nextAction=screen&customer_Type=MODEL&reason=&portal=&history=&cache=&dltoken=&pmbutton=false&savedOnlineID=dong";
	imageFiles[2] = imgsPath + "s3.png";
	imageURIs[3] = "http://dcl-zhou-acer/demo/mobibank/page4.html?nextAction=signon&passcode=123";
	imageFiles[3] = imgsPath + "s4.png";
	imageURIs[4] = "http://dcl-zhou-acer/demo/mobibank/page5.html";
	imageFiles[4] = imgsPath + "s5.png";
	imageURIs[5] = "http://dcl-zhou-acer/demo/mobibank/page6.html";
	imageFiles[5] = imgsPath + "s6.png";
	imageURIs[6] = "http://dcl-zhou-acer/demo/mobibank/page7.html";
	imageFiles[6] = imgsPath + "s7.png";
	imageURIs[7] = "http://dcl-zhou-acer/demo/mobibank/page8.html";
	imageFiles[7] = imgsPath + "s8.png";
	imageURIs[8] = "http://www.gadgetell.com/tech/comment/zeevee-zvbox-lets-you-stream-your-pc-to-your-hdtv/";
	imageFiles[8] = imgsPath + "s9.png";
	imageURIs[9] = "http://www.amazon.com/";
	imageFiles[9] = imgsPath + "s10.png";
	imageURIs[10] = "http://www.amazon.com/s/ref=nb_ss_gw?url=search-alias%3Daps&field-keywords=ZVBox&x=17&y=23";
	imageFiles[10] = imgsPath + "s11.png";
	imageURIs[11] = "http://dcl-zhou-acer/demo/scp/addpaper.html";
	imageFiles[11] = imgsPath + "s12.png";
}

function findImage (uri) {
	try {
		if (imageURIs == null) initImageFiles ();
			
		for (var i = 0; i < imageURIs.length; i++) {
			if (uri == imageURIs[i]) return imageFiles[i];
		}
		
		return null;
	} catch (ex) {
		debugMessage ("[uioptimize.findImage] " + ex.message);
	}
}