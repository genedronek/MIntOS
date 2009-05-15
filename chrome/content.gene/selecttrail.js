/*
 * Select a trail that best matches the input trail
 * 
 * Dong Zhou
 */

function selectTrail (trail) {
	try {
		var matches = getMatchingTrails (trail, 0);
		if (matches.length == 0) return -1;
	
		var res = matches[0];
		for (var i = 1; i < matches.length; i++) {
			if (trailTable[matches[i]].count > trailTable[res].count) 
				res = matches[i];
		} 
	
		return res;
	} catch (ex) {
		showStatus ("[selectTrail] " + ex.message);
	}
}