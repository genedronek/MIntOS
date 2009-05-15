/*
 * Select a trail that best matches the input trail
 * 
 * Dong Zhou
 */
 
const TT_FILE = WORK_DIR + "ttdb.txt";
//var TT_count = 0;
function saveTTTrails (trails) {
  try {
    //showStatus ("[trailman.saveTTTrails] in");
    var trailFile = openFile (TT_FILE/* + TT_count++*/);
    if (!trailFile.exists()) createFile (trailFile);
    fos = getOutputStream (trailFile, 'w');
    //showStatus ("# of trail is " + trailTable.length);
    for (var i = 0; i < trails.length; i++) {
      //showStatus ("Trail is " + trailTable[i]);
      writeTrail (i, fos, trails[i]);
    }
    fos.close ();
  } catch (ex) {
    showStatus ("[trailman.saveTTTrails] " + ex.message);
  }
}
  
function selectTrail (trail) {
  try {
  	if (trail.states.length == 0) return null;
    var res = realSelectTrail (trail);
    if (res != null && res.length != 0) return res;
  
    var gtrails = createGenTrails (trail, trail.etypes.length, true);
    if (gtrails == null || gtrails.length == 0) return null;
  
    showStatus ("[selecttrail.selectTrail] gtrails length=" + gtrails.length);
    saveTTTrails (gtrails);
  
    res = new Array ();
    for (var i = 0; i < gtrails.length; i++) {
      var tmp = realSelectTrail (gtrails[i]);
    
      if (tmp != null && tmp.length != 0) {
      
        tmp = instantiateTrails (tmp, trail);
      
        if (tmp == null || tmp.length == 0)
          showStatus ("[selecttrail.selectTrail] No trails instantiated!");
      
        for (var j = 0; tmp != null && j < tmp.length; j++) {
          //showStatus ("[selecttrail.selectTrail] matching trail:" + tmp[j].id);
          res.push (tmp[j]);
        }
      }
    }
  
    showStatus ("[selecttrail.selectTrail] selected trail #=" + res.length);
    //saveTTTrails (res);
    return res;
  } catch (ex) {
    showStatus ("[selecttrail.selectTrail] " + ex.message);
  } 
}

function realSelectTrail (trail) {
  try {
    var matches = getMatchingTrails (trail, 0);

    //if (matches.length == 0) return -1;

    //var res = matches[0];
    //for (var i = 1; i < matches.length; i++) {
    //	if (trailTable[matches[i]].count > trailTable[res].count) 
    //		res = matches[i];
    //} 

    //return res;

    return matches;
  } catch (ex) {
    showStatus ("[selecttrail.realSelectTrail] " + ex.message);
  }
}

function isIdenticalTmpTrail (t1, s1, t2, s2) {
	try {
		if (t1 == null && t2 == null) return true;
		if (t1 == null || t2 == null) return false;
		
		if (!isSameState (t1.initState, t2.initState)) return false;
		if (t1.states.length - s1 != t2.states.length - s2) return false;
		
		for (var i = s1; i < t1.states.length; i++)
			if (!isSameState (t1.states[i], t2.states[i])) return false;
	
		return true;
	} catch (ex) {
    showStatus ("[selecttrail.isIdenticalTmpTrail] " + ex.message);
  }
}

function trailExists (list, trail, start) {
	try {
		if (list == null || list.length == 0) return false;
		for (var i = 0; i < list.length; i++)
			if (isIdenticalTmpTrail (list[i].trail, list[i].start, trail, start)) return true;
		
		return false;
	} catch (ex) {
    showStatus ("[selecttrail.trailExists] " + ex.message);
  }
}

function instantiateTrails (gtrails, trail) {
  var res = new Array ();

  if (gtrails == null || gtrails.length == 0) return null;
  for (var i = 0; i < gtrails.length; i++) {
    var ctrail = genInstantiateTrail (gtrails[i].trail, trail);
    if (ctrail != null && !trailExists (res, ctrail, gtrails[i].start)) {
    	var tmp = new Object ();
    	tmp.trail = ctrail;
    	tmp.start = gtrails[i].start;
    	showStatus ("[selecttrail.instantiateTrails] matching trail, i=" + i + " id=" + gtrails[i].trail.id + " start=" + gtrails[i].start);
    	res.push (tmp);
    }
  }

  return res;
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

    for (var i = 0; i < ss.trails.length; i++) {
      var found = true;
      //showStatus ("[selecttrail.getMatchingTrails] trails=" + ss.trails);
      var tmp = trailTable[ss.trails[i]];
      //showStatus ("[selecttrail.getMatchingTrails] trail_id=" + ss.trails[i] + " state_len" + tmp.states.length);
      for (var j = 0; j < trail.states.length - offset; j++) {
        var index = ss.posis[i] + j;
        //showStatus ("[getMatchingTrails] t1_state=" + trail.states[offset + j] + " index=" + index + " state=" + tmp.states[index]);
        if (index >= tmp.states.length - 1 || trail.states[offset + j].id != tmp.states[index].id) {
          found = false;
          break;
        }
      }
      if (found) {
        var matrail = new Object ();
        matrail.trail = trailTable[ss.trails[i]];
        matrail.start = ss.posis[i] + (trail.states.length - offset);
        //showStatus ("[selecttrail.getMatchingTrails] matching trail, id=" + matrail.trail.id + " start=" + matrail.start);
        res.push (matrail);
      }
    }

    //showStatus ("[selecttrail.getMatchingTrails] trails found =" + res.length);
    //saveTTTrails (res);
    return res;
  } catch (ex) {
    showStatus ("[selecttrail.getMatchingTrails] " + ex.message);
  }
}
