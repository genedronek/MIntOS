//In this file we define some default generalization methods

var HMS_levels;
const HMS_MINI_LEVEL = 2;
const HMS_MAX_LEVEL = 15;

//This is the function exposed to the main system, and called when the 
//system starts up
function initHighlightMiniStructs () {
	HMS_levels = new Array ();
	for (var i = HMS_MINI_LEVEL; i <= HMS_MAX_LEVEL; i++) {
		HMS_levels.push (0);
		initHighlightMiniStruct (i);
	}
}

function initHighlightMiniStruct (level) {
	var res = new HighlightMiniStruct (level);
	
	//calling function in genman.js to register
	registerGeneralization (GEN_DOCUMENT, res);
}

function MinimalStructure (level) {
	this.level = level;
	this.gen_id = GEN_HIGHLIGHT_MINISTRUCT;
	this.marshal = HMSMarshal;
	this.unmarshal = HMSUnmarshall;
	this.isSameValue = HMSIsSameValue;
	this.generalizeTrail = HMSGeneralizeTrail;
}

function HMSMarshal (type, value) {
	try {
		var res = null;
		if (type == GENMAN_DOCUMENT) {
			res = "" + value.struct_id;
		} else if (type == HIGHLIGHT) {
			res = value.marshal (); //phsMarshal (value);
		}
		return res;
	} catch (ex) {
		showStatus ("[defaultgen.HMSMarshal] " + ex.message);
	}
}

function HMSUnmarshal (type, s) {
	try {
		var res;	
		if (type == GENMAN_DOCUMENT) {
			res = new Object ();
			res.struct_id = s - 0;
		} else if (type == HIGHLIGHT) {
			res = new PhraseStruct ();
			res.unmarshall (s);
		}
		return res;
	} catch (ex) {
		showStatus ("[defaultgen.HMSMarshal] " + ex.message);
	}
}

function HMSIsSameValue (type, v1, v2) {
	try {
		if (type == GENMAN_DOCUMENT) return v1.struct_id == v2.struct_id;
		if (type == GEN_HIGHLIGHT) return isSamePhraseStruct (v1, v2);
		/*
			return v1.struct_id == v2.struct_id && v1.node_id == v2.node_id && v1.offset_type == v2.offset_type 
				&& v1.start == v2.start && v1.end == v2.end;
		*/
		return true;
	} catch (ex) {
		showStatus ("[defaultgen.HMSIsSameValue] " + ex.message);
	}
}

//		int initState; //The starting state of the trail
//		int[] etypes; //Types of events
//		Object[] evalues; //Values of events
//		int[] states; //Resulting states of events
function HMSGeneralizeTrail (trail) {
	try {
		for (var i = 0; i < trail.evalues.length; i++) {
			if (etypes[i] == HIGHLIGHT_EVENT) {
				var root = evalues[i].hlStruct.root_id;
				var child = evalues[i].hlStruct.child_id;
				var ancester = getAncester (child, this.level);
				var root_id = getStructureID (getElementStructure (anceter));
				var child_id = getNodeStructureID (ancester, child);
				if (!backwardProbe (GEN_DOCUMENT, trail, i) || !forwardProbe (GEN_DOCUMENT, trail, i)
					|| !forwardProbe (GEN_HIGHLIGHT, trail, i))
				
				var docv = new Object ();
				docv.struct_id = root_id;
				
			}
		}
	} catch (ex) {
		showStatus ("[defaultgen.HMSGeneralizeTrail] " + ex.message);
	}
}

