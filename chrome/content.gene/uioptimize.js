/*
 *  This file optimizes a predicted sequence of interactions
 *  
 *  Dong Zhou
 */

const INPUT_OPT_ITEM = 1;
const URL_OPT_ITEM = 2;
const SCP_OPT_ITEM = 3;

//This variable contains optimization widgets the user can currently see on the status bar
var curOptimizedItems = new Array ();

//Optimize a predicted Trail
function optimizePredicted (predicted) {
	try {
		showStatus ("[optimizePredicted] predicted=" + predicted);
		if (predicted < 0) return;
		var trail = trailTable[predicted];
		var start;
		if (curState.id == trail.initState) start = 0;
		else {
			for (var i = 0; i < trail.states.length; i++) {
				if (trail.states[i] == curState.id) {
					start = i + 1;
					break;
				}
			}
		}
		
		//We are going to optimize the trail starting from 'start'
		for (var i = start; i < trail.states.length; i++) {
			var res = null;
			switch (trail.etypes[i]) {
				case INPUT_EVENT:
				case PASTE_INPUT_EVENT:
					res = optimizeInputEvent (trail, start, i);
					break;
				case URL_SUBMIT_EVENT:
					showStatus ("[optimizePredicted] url=" + trail.evalues[i].loc);
					res = optimizeURLSubmitEvent (trail, start, i);
					break;
				}
				//if (res != null) curOptimizedItems.push (res);
		}
		
		//We now add the dynamic items to the status bar
		//addOptimizedItems ();
	} catch (ex) {
		showStatus ("[optimizePredicted] " + ex.message);
	}
}

//This is parallel to the above function. Used only when Smart Copy/Paste is enabled
function optimizeSCPPredicted (predicted) {
	try {
		showStatus ("[optimizeSCPPredicted] predicted=" + predicted.id);
		if (predicted.id < 0) return;
		var trail = trailTable[predicted.id];
		var start, lastsid;
		
		if (predicted.trail.states.length == 0) lastsid = predicted.trail.initState;
		else lastsid = predicted.trail.states[predicted.trail.states.length - 1];
		
		if (lastsid == trail.initState) start = 0;
		else {
			for (var i = 0; i < trail.states.length; i++) {
				if (trail.states[i] == lastsid) {
					start = i + 1;
					break;
				}
			}
		}
		
		var inputs = [];
		var newdoc = null;
		//We are going to optimize the trail starting from 'start'
		for (var i = start; i < trail.states.length; i++) {
	
			switch (trail.etypes[i]) {
				case INPUT_EVENT:
				case PASTE_INPUT_EVENT:
					inputs.push (trail.evalues[i]);
					break;
				case URL_SUBMIT_EVENT:
					showStatus ("[optimizeSCPPredicted] url=" + trail.evalues[i].loc);
					if (trail.evalues[i].loc != SCP_SRC_LOC && newdoc == null) {
						optimizeURLSubmitEvent (trail, start, i);
						newdoc = trail.evalues[i].loc;
					}
					break;
				}
				//if (res != null) curOptimizedItems.push (res);
		}
		optimizeSCP (predicted.trail.src_root, inputs, newdoc);
		//We now add the dynamic items to the status bar
		//addOptimizedItems ();
	} catch (ex) {
		showStatus ("[optimizeSCPPredicted] " + ex.message);
	}
}

function optimizeSCP (sub_root, inputs, newdoc) {
	try {
		showStatus ("[optimizeSCP] newdoc=" + newdoc);
		
		var tmp = urlTemplate.cloneNode (true);
		tmp.id = "curOptimizedItem_SCP";
		parentNode.appendChild (tmp);
		var res = document.getElementById("curOptimizedItem_SCP");

		res.inputs = [];
		for (var i = 0; i < inputs.length; i++) {
			var text;
			if (inputs[i].value.nodeID < 0) text = curState.document;
			else {
				var node = findNodeByStructureID (sub_root, inputs[i].value.nodeID);
				text = getSCPHighlightText (node, inputs[i].value);
			}
			res.inputs.push (new FormInput (false, inputs[i].name, text, inputs[i].type));
		}
		res.label = "Smart Copy/Paste";
		res.realURL = newdoc;
		res.style.color = "#ff8828";
				res.addEventListener("click", function (e) { procClickOptimizedSCP(e); }, false);
		res.optItemType = SCP_OPT_ITEM;
		curOptimizedItems.push (res);
		
	} catch (ex) {
		showStatus ("[optimizeSCP] " + ex.message);
	}
}

function optimizeInputEvent (trail, start, i) {
	var res = null;
	try {
		if (trail.evalues[i].type == "password") res = passwordTemplate.cloneNode (true);
		else res = inputTemplate.cloneNode (true);
		res.id = "curOptimizedItem_" + i;
		parentNode.appendChild (res);
		var tmp = document.getElementById("curOptimizedItem_" + i);		
		tmp.value = trail.evalues[i].value;
		tmp.prevValue = tmp.value;
		tmp.inputEventName = trail.evalues[i].name;
		tmp.posInOptItems = curOptimizedItems.length;
		tmp.addEventListener("input", function (e) { procInputOptimizedInput(e); }, false);
		tmp.addEventListener("keyup", function (e) { procKeyupOptimizedInput(e); }, false);
		tmp.optItemType == INPUT_OPT_ITEM;
		
		curOptimizedItems.push (tmp);
		
		//tmp.value.fontcolor = "Blue"; //Have to use tree view to change color
	} catch (ex) {
		showStatus ("[optimizeInputEvent] " + ex.message);
	}
	
	return res;
}

function isLinkedInputSubmit (trail, ie, se) {
	var s = trail.evalues[ie].name + "=" + trail.evalues[ie].value;
	var index = trail.evalues[se].loc.indexOf (s);
	if (index > 0) {
		var c = trail.evalues[se].loc.charAt (index - 1);
		if (c == '&' || c == '?') return true;
	}
	
	return false;
}

function optimizeURLSubmitEvent (trail, start, i) {
	var res = null;
	try {
		res = urlTemplate.cloneNode (true);
		res.id = "curOptimizedItem_" + i;
		parentNode.appendChild (res);
		var tmp = document.getElementById("curOptimizedItem_" + i);
		
		tmp.realURI = trail.evalues[i].loc;
		//showStatus ("[optimizeURLSubmitEvent] real URL=" + trail.evalues[i].loc);
		if (i > start && (trail.etypes[i-1] == INPUT_EVENT || trail.etypes[i-1] == PASTE_INPUT_EVENT)
				&& isLinkedInputSubmit (trail, i-1, i)) {
			tmp.label = 'Go'; 
			tmp.style.color = "green";
			tmp.linkedWithLastInput = true;
		} else {
		  //TODO
			tmp.label = getShortPageTitle (trail.evalues[i].title, 4, 9);
			tmp.style.color = "blue";
			tmp.linkedWithLastInput = false;
		}
		tmp.addEventListener("click", function (e) { procClickOptimizedURLSubmit(e); }, false);
		tmp.optItemType = URL_OPT_ITEM;

		curOptimizedItems.push (tmp);
	} catch (ex) {
		showStatus ("[optimizeURLSubmitEvent] " + ex.message);
	}
	
	return res;
}

function clearOptimizedItems () {
	try {
		while (curOptimizedItems.length > 0) {
			var node = curOptimizedItems.pop ();
			parentNode.removeChild (node);
		}
	} catch (ex) {
		showStatus ("[clearOptimizedItems] " + ex.message);
	}
}

function procClickOptimizedURLSubmit (clickEvent) {
	try {
		var target = clickEvent.target;
		//window.location = target.label;
		//document.location.href = target.label;
		
		var browsers=document.getElementById('content').browsers;
		browsers[0].loadURI (target.realURI);
	} catch (ex) {
		showStatus ("[procClickOptimizedURLSubmit] " + ex.message);
	}
}

function procInputOptimizedInput (inputEvent) {
	//debugMessage ("[procInputOptimizedInput] " + inputEvent.target);
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
	
function procClickOptimizedSCP (event) {
	try {
		//debugMessage ("[procClickOptimizedSCP]");
		
		var target = event.target;
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
