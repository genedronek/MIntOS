/*
    State Management Functions (stateman.js)

    Dong Zhou
*/

var stateTable = null;

/*
	class MIOState {
		int id;	//Not saved
		String document;	//The page display
		String urlbar;	//Content of URL bar
		FormInput currentInput;	//
		String highlight;
		String clipboard;
		int[] trails; //ID of trail that this state is a part of
		int[] posis; //Position of this state in each trail
	}
*/

function MIOState (reduced) {
	if (reduced == REDUCED_NONE) {
		this.highlight = "";
		this.clipboard = "";
	} else {
		this.highlight = null;
		this.clipboard = null;
	}
	
	this.urlbar = "";
	this.document = "";
	this.currentInput = null;
	
	this.reduced = reduced;
	
	this.clone = clone;
}

function clone () {
	var res = new MIOState (this.reduced);
	res.urlbar = this.urlbar;
	res.highlight = this.highlight;
	res.clipboard = this.clipboard;
	res.document = this.document;
	res.currentInput = this.currentInput;

	return res;
}

//Loads states stored in disk file to an array and returns the array
function loadStates (fileName) {
	stateTable = new Array ();
	try {
		var stateFile = openFile (fileName);
		if (!stateFile.exists()) createFile (stateFile);
		var lis = getLineInputStream (stateFile);
		var line = {}, hasMore;

		var id = 0;
		do {
			hasMore = lis.readLine (line);
			if (!hasMore && line.value.length == 0) break;
			if (line.value.indexOf ("<state") == 0) stateTable.push (readState (lis, id++));
		} while (true);	
		
		showStatus ("[loadStates] Number of states loaded: " + stateTable.length);
	} catch (ex) {
		showStatus ("[loadStates] " + ex.message);
	}
}

function readState (lis, id) {
	try {
		var res = new MIOState (REDUCED_NONE);
		var line = {};
	
		lis.readLine (line);
		res.reduced = line.value - 0;
		lis.readLine (line);
		res.document = line.value;	
		lis.readLine (line);
		res.urlbar = line.value;
		lis.readLine (line);
		res.currentInput = readFormInput (line.value, 0);
		lis.readLine (line);
		if (res.reduced == REDUCED_SCP) {
			res.highlight = readSCPHighlight (line.value);
			lis.readLine (line);
			res.clipboard = readSCPHighlight (line.value);
		} else {
			res.highlight = line.value;
			lis.readLine (line);
			res.clipboard = line.value;
		}
		
		res.trails = new Array ();
		res.posis = new Array ();
	
		lis.readLine (line);
		var tmp = line.value;

		while (tmp.indexOf (",") > 0) {
			var index1 = tmp.indexOf (",");
			res.trails.push (tmp.substring (0, index1) - 0);
			var index2 = tmp.indexOf (" ");
			res.posis.push (tmp.substring (index1 + 1, index2) - 0);
			tmp = tmp.substr (index2 + 1);
		}
	
		lis.readLine (line);
		
		res.id = id;
		return res;

	} catch (ex) {
		showStatus ("[readState] " + ex.message);
	}
}

function registerState (state) {
	try {
		var found = -1
		
		for (var i = 0; i < stateTable.length; i++) {

			if (isSameState (state, stateTable[i])) { 
				found = i; 
				break; 
			}
		}
		
		if (found == -1) {
			state.trails = new Array ();
			state.posis = new Array ();
			stateTable.push (state);
			found = stateTable.length - 1;
		}
		
		//showStatus ("[registerState] state ID = " + found);
		stateTable[found].id = found; 
		
		//showStatus ("[registerState] registerd state" + found);
		
		return stateTable[found];
	} catch (ex) {
		showStatus ("[registerState] " + ex.message);
	}
}

function saveStates (fileName) {
	try {
		var stateFile = openFile (fileName);
		if (!stateFile.exists()) createFile (stateFile);
		fos = getOutputStream (stateFile, 'w');
		for (var i = 0; i < stateTable.length; i++)
			writeState (i, fos, stateTable[i]);
		fos.close ();
	} catch (ex) {
		showStatus ("[saveStates] " + ex.message);
	}
}

function writeState (index, fos, state) {
	try {
		var tmp = "<state_" + index + "\n";
		fos.write (tmp, tmp.length);
		tmp = state.reduced + "\n";
		fos.write (tmp, tmp.length);
		tmp = state.document + "\n";
		fos.write (tmp, tmp.length);
		tmp = "" + state.urlbar + "\n";
		fos.write (tmp, tmp.length);
		tmp = writeFormInput(state.currentInput) + "\n";
		fos.write (tmp, tmp.length);
		if (state.reduced == REDUCED_SCP) {
			tmp = writeSCPHighlight (state.highlight) + "\n";
			fos.write (tmp, tmp.length);
			tmp = writeSCPHighlight (state.clipboard) + "\n";
			fos.write (tmp, tmp.length);
		} else {
			tmp = "" + state.highlight + "\n";
			fos.write (tmp, tmp.length);
			tmp = "" + state.clipboard + "\n";
			fos.write (tmp, tmp.length);
		}
		
		tmp = "";
		for (var i = 0; i < state.trails.length; i++) {
			tmp += state.trails[i] + "," + state.posis[i] + " ";
		}
		tmp += "\n";
		fos.write (tmp, tmp.length);
		tmp = "/state_" + index + ">\n";
		fos.write (tmp, tmp.length);
	} catch (ex) {
		showStatus ("[writeState] " + ex.message);
	}
}

function isSameState (s1, s2) {

	if (s1.reduced != s2.reduced) return false;
	if (s1.document != s2.document || s1.urlbar != s2.urlbar) {
		return false;
	}

	if (s1.reduced == REDUCED_SCP) {
		if (!sameSCPHighlight (s1.highlight, s2.highlight) || !sameSCPHighlight (s1.clipboard, s2.clipboard))
			return false;
	}	else if (s1.highlight != s2.highlight || s1.clipboard != s2.clipboard) return false;

	if (!isSameFormInput (s1.currentInput, s2.currentInput)) {
		/*
		if (s1.currentInput != null && s2.currentInput != null)
			showStatus ("[isSameState] FormInput is different! n1=" + s1.currentInput.name + " v1=" 
				+ s1.currentInput.value + "  n2=" + s2.currentInput.name + " v2=" + s2.currentInput.value);
		*/
		return false;
	}

	return true;
}

