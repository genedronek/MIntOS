/*
  Trail Management Functions (trailman.js)

  Dong Zhou
*/

var trailTable = null;

/*
	class MIOTrail {
		int id; 	//Not saved
		int count; //The number of times this state has been used
		int initState; //The starting state of the trail
		int[] etypes; //Types of events
		Object[] evalues; //Values of events
		int[] states; //Resulting states of events
	}
*/

function MIOTrail () {
	try {
		var tmp = new Date ();
		this.time = tmp.getTime ();
		this.addEvent = addEvent;
		this.updateTime = updateTime;
		this.scpman = new scpman (this);
		this.reduced = REDUCED_NONE;
	} catch (ex) {
		showStatus ("[MIOTrail] " + ex.message);
	}
}

//this may change curTrail
function addEvent (type, value, state) {
	try {
		//showStatus ("[addEvent] ");
  	var time = new Date().getTime();
  	if (time - this.time > TRAIL_MAX_TIME_GAP) {
  		//We need to start a new trail
  		showStatus ("[addEvent] Trail time out.");
  		registerTrail (curTrail);
  		curTrail.scpman.saveHLSessions ();
  		
  		curTrail = newTrail (curState);
  	} else this.updateTime ();
  		
  	curTrail.etypes.push (type);
  	curState = registerState (state);
  	curTrail.states.push (curState.id); 
  	if (type == HIGHLIGHT_EVENT) {
  		curTrail.evalues.push (value.highlight);
  		curTrail.scpman.addHighlight (curState.document, curTrail.evalues.length - 1, value);
  	} else curTrail.evalues.push (value);

		//Now try to figure out a matching trail
		clearOptimizedItems (); //Clear status bar
		var predicted = selectTrail (curTrail);
		if (predicted < 0) {
			if (type == HIGHLIGHT_EVENT) {
				var res = curTrail.scpman.selectSCPTrail ();
				optimizeSCPPredicted (res);
			}
		} else optimizePredicted (predicted);
	} catch (ex) {
		showStatus ("catch[addEvent] " + ex.message);
	}
}

function updateTime () {
	this.time = new Date().getTime();
	
}

//Loads trails stored in disk file to an array and returns the hashtable
function loadTrails (fileName) {
	trailTable = new Array ();
	try {
		var trailFile = openFile (fileName);
		if (!trailFile.exists()) createFile (trailFile);
		var lis = getLineInputStream (trailFile);
		var line = {}, hasMore;

		do {
			hasMore = lis.readLine (line);
			if (!hasMore && line.value.length == 0) break;

			if (line.value.indexOf ("<trail") == 0) trailTable.push (readTrail (lis));
		} while (true);	
		showStatus ("[loadTrails] Number of trails loaded: " + trailTable.length);
		
	} catch (ex) {
		showStatus ("[loadTrails] " + ex.message);
	}
}

function readURLSubmitValue (s, index) {
	var tmp = s.substr (index);
	var index = tmp.indexOf (",");
	var res = new Object ();
	res.loc = tmp.substring (0, index);
	res.title = tmp.substr (index + 1);
	return res;
}

function readTrail (lis) {
	var res = new MIOTrail ();
	var line = {};
	
	try {
		lis.readLine (line);
		res.reduced = line.value - 0;
		lis.readLine (line);
		res.count = line.value - 0;
		lis.readLine (line);
		res.initState = line.value - 0;
		
		res.etypes = new Array ();
		res.evalues = new Array ();
		res.states = new Array ();
		
		lis.readLine (line);
		while (line.value.indexOf ("/trail") != 0) {
			var index1 = line.value.indexOf (" ");
			res.states.push (line.value.substring (0, index1) - 0);
			var index2 = line.value.indexOf (",");
			var etype = line.value.substring (index1 + 1, index2) - 0;
			res.etypes.push (etype);
			
			if (etype == INPUT_EVENT || etype == PASTE_INPUT_EVENT) 
				res.evalues.push (readFormInput (line.value, index2 + 1));
			else if (etype == URL_SUBMIT_EVENT) res.evalues.push (readURLSubmitValue (line.value, index2 + 1));
			else if (res.reduced == REDUCED_SCP && 
				(etype == HIGHLIGHT_EVENT || etype == COPY_EVENT || etype == PASTE_INPUT_EVENT || etype == URL_COPY_EVENT)) 
				res.evalues.push (readSCPHighlight (line.value.substr (index2 + 1)));
			else res.evalues.push (line.value.substr (index2 + 1));
			lis.readLine (line);
		}
	} catch (ex) {
		showStatus ("[readTrail] " + ex.message);
	}
	
	return res;
}

function newTrail (istate) {
	//showStatus ("[newTrail] istate.id=" + istate.id);
	
	var res = new MIOTrail ();
	res.initState = istate.id;
	res.count = 1;
	res.etypes = new Array ();
	res.evalues = new Array ();
	res.states = new Array ();
	
	return res;
}

function registerTrail (trail) {
	var id = -1;
	try {
		for (var i = 0; i < trailTable.length; i++)
			if (isSameTrail (trail, trailTable[i])) {
				trailTable[i].count++;
				id = i;
				break;
			}
		
		if (id == -1) {
			trailTable.push (trail);
			id = trailTable.length - 1;
			stateTable[trail.initState].trails.push (id);
			stateTable[trail.initState].posis.push (0);
			
			for (var j = 0; j < trail.states.length; j++) {
				stateTable[trail.states[j]].trails.push (id);
				stateTable[trail.states[j]].posis.push (j + 1);
			}
		}		
	} catch (ex) {
		showStatus ("[registerTrail] " + ex.message);
	}	
	
	showStatus ("[registerTrail] Trail ID = " + id);
	return id;
}

function saveTrails (fileName) {
	try {
		var trailFile = openFile (fileName);
		if (!trailFile.exists()) createFile (trailFile);
		fos = getOutputStream (trailFile, 'w');
		//showStatus ("# of trail is " + trailTable.length);
		for (var i = 0; i < trailTable.length; i++) {
			//showStatus ("Trail is " + trailTable[i]);
			writeTrail (i, fos, trailTable[i]);
		}
		fos.close ();
	} catch (ex) {
		showStatus ("[saveTrails] " + ex.message);
	}
}

function writeURLSubmitValue (value) {
	return value.loc + "," + value.title;
}

function writeTrail (index, fos, trail) {
	try {
		var tmp = "<trail_" + index + "\n";
		fos.write (tmp, tmp.length);
		tmp = "" + trail.reduced + "\n";
		fos.write (tmp, tmp.length);
		tmp = "" + trail.count + "\n";
		fos.write (tmp, tmp.length);
		tmp = "" + trail.initState + "\n";
		fos.write (tmp, tmp.length);
		for (var i = 0; i < trail.states.length; i++) {
			tmp = "" + trail.states[i] + " " + trail.etypes[i] + ",";
			if (trail.etypes[i] == INPUT_EVENT || trail.etypes[i] == PASTE_INPUT_EVENT) 
				tmp += writeFormInput (trail.evalues[i]) + "\n";
			else if (trail.etypes[i] == URL_SUBMIT_EVENT) tmp += writeURLSubmitValue (trail.evalues[i]) + "\n";
			else if (trail.reduced == REDUCED_SCP && 
				(trail.etypes[i] == HIGHLIGHT_EVENT || trail.etypes[i] == COPY_EVENT || trail.etypes[i] == PASTE_INPUT_EVENT
					|| trail.etypes[i] == URL_COPY_EVENT)) 
				tmp += writeSCPHighlight (trail.evalues[i]) + "\n";
			else tmp += trail.evalues[i] + "\n";
			fos.write (tmp, tmp.length);
		}
		tmp = "/trail_" + index + ">\n";
		fos.write (tmp, tmp.length);
	} catch (ex) {
		showStatus ("[writeTrail] " + ex.message);
	}
}


function isSameTrail (t1, t2) {
	if (t1.reduced != t2.reduced) return false;
	if (t1.initState != t2.initState) return false;
	if (t1.states.length != t2.states.length) return false;
	for (var i = 0; i < t1.states.length; i++)
		if (t1.states[i] != t2.states[i]) return false;
	
	return true;
}
	
//Returns all trails that match the requested trail, starting from the offset state
function getMatchingTrails (trail, offset) {
	try {
		var res = new Array ();
		var ss;
		
		//showStatus ("[getMatchingTrails] here1");
		
		if (offset == 0) ss = trail.initState;
		else ss = trail.states[offset - 1];
		
		//showStatus ("[getMatchingTrails] start_state=" + ss + " current_trail_states=" + trail.states.length);
		
		for (var i = 0; i < stateTable[ss].trails.length; i++) {
			var found = true;
			//showStatus ("[getMatchingTrails] trails=" + stateTable[ss].trails);
			var tmp = trailTable[stateTable[ss].trails[i]];
			//showStatus ("[getMatchingTrails] trail_id=" + stateTable[ss].trails[i] + " state_len" + tmp.states.length);
			for (var j = 0; j < trail.states.length - offset; j++) {
				var index = stateTable[ss].posis[i] + j;
				//showStatus ("[getMatchingTrails] t1_state=" + trail.states[offset + j] + " index=" + index + " state=" + tmp.states[index]);
				if (trail.states[offset + j] != tmp.states[index]) {
					found = false;
					break;
				}
			}
			if (found) res.push (stateTable[ss].trails[i]);
		}
		
		showStatus ("[getMatchingTrails] trails found =" + res.length);
		return res;
	} catch (ex) {
		showStatus ("[getMatchingTrails] " + ex.message);
	}
}

function trailToString (trail) {
	if (trail == null) return "";
	
	var res = "" + trail.initState + " " + trail.states;

	return res;
}