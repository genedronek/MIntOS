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
    this.clone = cloneTrail;
    //this.scpman = new scpman (this);
    //this.reduced = REDUCED_NONE;
  } catch (ex) {
    showStatus ("[MIOTrail] " + ex.message);
  }
}

//this may change curTrail
function addEvent (type, value, state) {
  try {
    //showStatus ("[trailman.addEvent]");
		
    var time = new Date().getTime();
    if (time - this.time > TRAIL_MAX_TIME_GAP) {
      //We need to start a new trail
      showStatus ("[addEvent] Trail time out.");
      registerTrail (curTrail);
      //curTrail.scpman.saveHLSessions ();
  		
      curTrail = newTrail (curState);
    } else this.updateTime ();
  		
    curTrail.etypes.push (type);
    curState = registerState (state);
    //showStatus ("[trailman.addEvent] curState.document = " + curState.document);
    curTrail.states.push (curState); 
    /*if (type == HIGHLIGHT_EVENT) {
  		curTrail.evalues.push (value.hlContent);
  		curTrail.scpman.addHighlight (curState.document, curTrail.evalues.length - 1, value);
  	} else
     */
    curTrail.evalues.push (value);

    //Now try to figure out a matching trail
    clearOptimizedItems (); //Clear status bar
    var predicted = selectTrail (curTrail);
    /*
			if (predicted.length == 0) {
				if (type == HIGHLIGHT_EVENT) {
					var res = curTrail.scpman.selectSCPTrail ();
					optimizeSCPPredicted (res);
				
			
			} else optimizePredicted (predicted);
     */
		
    //showStatus ("[trailman.addEvent] predicted length = " + predicted.length);
    if (predicted != null && predicted.length != 0) {
      //showStatus ("[trailman.addEvent] predicted length = " + predicted.length);
      optimizePredicted (predicted);
    }
  } catch (ex) {
    showStatus ("[trailman.addEvent] " + ex.message);
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
      trailTable[trailTable.length - 1].id = trailTable.length - 1;
    } while (true);	
    showStatus ("[trailmann.loadTrails] Number of trails loaded: " + trailTable.length);
		
  } catch (ex) {
    showStatus ("[trailman.loadTrails] " + ex.message);
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
    //lis.readLine (line);
    //res.reduced = line.value - 0;
    lis.readLine (line);
    res.count = line.value - 0;
    lis.readLine (line);
    var initID = line.value - 0;
    res.initState = stateTable[initID];
		
    res.etypes = new Array ();
    res.evalues = new Array ();
    res.states = new Array ();
		
    lis.readLine (line);
    while (line.value.indexOf ("/trail") != 0) {
      //showStatus ("[trailman.readTrail] 1 " + line.value);
      var index1 = line.value.indexOf (" ");
      res.states.push (stateTable[line.value.substring (0, index1) - 0]);
      var index2 = line.value.indexOf (",");
      var etype = line.value.substring (index1 + 1, index2) - 0;
      res.etypes.push (etype);
      var s = line.value.substr (index2 + 1);
      //showStatus ("[trailman.readTrail] 2 " + line.value);
      switch (etype) {
        case INPUT_EVENT:
        case PASTE_INPUT_EVENT:
          res.evalues.push (unmarshalSVFI (s));
          break;
        case URL_SUBMIT_EVENT:
          res.evalues.push (unmarshalSVDoc (s));
          break;
        case HIGHLIGHT_EVENT:
        case COPY_EVENT:
        case URL_COPY_EVENT:
          res.evalues.push (unmarshalSVHL (s));
          break;
        case URL_INPUT_EVENT:
          res.evalues.push (unmarshalSVUrl (s));
          break;
      }
      //showStatus ("[trailman.readTrail] 3 " + line.value);
      lis.readLine (line);
    }
  } catch (ex) {
    showStatus ("[trailman.readTrail] " + ex.message);
  }
	
  return res;
}

function newTrail (istate) {
  //showStatus ("[newTrail] istate.id=" + istate.id);
	
  var res = new MIOTrail ();
  res.initState = istate;
  res.count = 1;
  res.etypes = new Array ();
  res.evalues = new Array ();
  res.states = new Array ();
	
  return res;
}

function cloneTrail (endIndex) {
  var res = new MIOTrail ();
  res.initState = this.initState;
  res.etypes = new Array ();
  for (var i = 0; i < endIndex; i++)
    res.etypes[i] = this.etypes[i];
  res.evalues = new Array ();
  for (var i = 0; i < endIndex; i++)
    res.evalues[i] = this.evalues[i];
  res.states = new Array ();
  for (var i = 0; i < endIndex; i++)
    res.states[i] = this.states[i];
  res.count = 0;
	
  return res;
}

function setCurrentTrail (trail) {
  trail.initState = registerState (trail.initState);
  for (var i = 0; i < trail.states.length; i++) 
    trail.states[i] = registerState (trail.states[i]);
  curTrail = trail;
}

function registerTrail (trail) {
  try {
  	if (trail.states.length == 0) return;
  	
    var oldLen = trailTable.length;
    var id = realRegisterTrail (trail);
    if (id != oldLen) return id; //This is an existing trail
		
    for (var i = 0; i <= trail.etypes.length; i++) {
      showStatus ("[trailman.registerTrail] gen event length=" + i);
      var gtrails = createGenTrails (trail, i, false);
      showStatus ("[trailman.registerTrail] gtrails size = " + gtrails.length);
      if (gtrails == null) continue;
      for (var j = 0; j < gtrails.length; j++) {
        //var t = gtrails[j];				
        //Redundant code (alrady registered)
        //t.initState = registerState (t.initState);
        //for (var k = 0; k < t.states.length; k++)
        //	t.states[k] = registerState (t.states[k]);
        realRegisterTrail (gtrails[j]);
      }
    }
		
  } catch (ex) {
    showStatus ("[trailman.registerTrail] " + ex.message);
  }
}

function realRegisterTrail (trail) {
  var id = -1;
  try {
    for (var i = 0; i < trailTable.length; i++)
      if (isSameTrail (trail, trailTable[i])) {
        trailTable[i].count++;
        id = i;
        //showStatus ("[trailman.realRegisterTrail] old trail id = " + id);
        break;
      }
		
    if (id == -1) {
      trail.count = 1;
      trailTable.push (trail);
      id = trailTable.length - 1;
      trail.id = id;
      trail.initState.trails.push (id);
      trail.initState.posis.push (0);
      for (var j = 0; j < trail.states.length; j++) {
        trail.states[j].trails.push (id);
        trail.states[j].posis.push (j + 1);
      }
			
      showStatus ("[trailman.realRegisterTrail] New Trail ID = " + id);
    }		
  } catch (ex) {
    showStatus ("[trailman.realRegisterTrail] " + ex.message);
  }	
	
  //showStatus ("[trailman.realRegisterTrail] Trail ID = " + id);
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
    showStatus ("[trailman.saveTrails] " + ex.message);
  }
}

function writeURLSubmitValue (value) {
  return value.loc + "," + value.title;
}

function writeTrail (index, fos, trail) {
  try {
    var tmp = "<trail_" + index + "\n";
    fos.write (tmp, tmp.length);
    //tmp = "" + trail.reduced + "\n";
    //fos.write (tmp, tmp.length);
    tmp = "" + trail.count + "\n";
    fos.write (tmp, tmp.length);
    tmp = "" + trail.initState.id + "\n";
    fos.write (tmp, tmp.length);
    for (var i = 0; i < trail.states.length; i++) {
      tmp = "" + trail.states[i].id + " " + trail.etypes[i] + ",";
      switch (trail.etypes[i]) {
        case INPUT_EVENT:
        case PASTE_INPUT_EVENT:
          tmp += marshalSVFI (trail.evalues[i]);
          break;
        case URL_SUBMIT_EVENT:
          tmp += marshalSVDoc (trail.evalues[i]);
          break;
        case HIGHLIGHT_EVENT:
        case COPY_EVENT:
        case URL_COPY_EVENT:
          tmp += marshalSVHL (trail.evalues[i]);
          break;
        case URL_INPUT_EVENT:
          tmp += marshalSVUrl (trail.evalues[i]);
          break;
      }
      tmp += "\n";
      fos.write (tmp, tmp.length);
    }
    tmp = "/trail_" + index + ">\n";
    fos.write (tmp, tmp.length);
  } catch (ex) {
    showStatus ("[trailman.writeTrail] " + ex.message);
  }
}


function isSameTrail (t1, t2) {
  //if (t1.reduced != t2.reduced) return false;
  if (t1.initState.id != t2.initState.id) return false;
  if (t1.states.length != t2.states.length) return false;
  for (var i = 0; i < t1.states.length; i++)
    if (t1.states[i] != t2.states[i]) return false;
	
  return true;
}
	
function trailToString (trail) {
  if (trail == null) return "";
	
  var res = "" + trail.initState + " " + trail.states;

  return res;
}