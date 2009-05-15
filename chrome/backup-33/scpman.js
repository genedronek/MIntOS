/*
		Highlight:
			- startParent
			- endParent
			- startOffset
			- endOffset
 */

const SCP_SRC_LOC = "$$Copy/Paste Source Doc$$";

function scpman (tr) {
  try {
    this.trail = tr;
    this.src_root = null;
    this.cur_src_doc = null;
    this.highlights = [];
    this.src_indices = [];
    this.src_reduced_hls = [];
		
    this.struct_cache = [];

    this.addHighlight = addHighlight;
    this.getHLSessionTrail = getHLSessionTrail;
    this.selectSCPTrail = selectSCPTrail;
    this.hasValidHLSession = hasValidHLSession;
    this.saveHLSessions = saveHLSessions;
		
  } catch (ex) {
    showStatus ("[scpman] " + ex.message);
  }
}

function addHighlight (doc, pos, hl) {
  try {
    /*
		showStatus ("[addHighlight] doc= " + doc + " highlight=" + hl.highlight);
		
		for (var i = 0; i < this.highlights.length; i++) {
			showStatus ("[addHighlight] [" + i + "] spath=" + this.src_sp_path [i]);
			showStatus ("[addHighlight] [" + i + "] epath=" + this.src_ep_path [i]);
		}
     */
    var target = hl.node;
    if (doc == this.cur_src_doc) {
      if (this.src_root.ownerDocument == undefined || this.src_root.ownerDocument != target.ownerDocument) {
        this.src_root = getCorrespondingNode (target.ownerDocument, this.src_root_path);
        for (var i = 0; i < this.highlights.length; i++) {
          var tmp = this.highlights[i];
          //showStatus ("[addHighlight] oldstarttext=" + tmp.startParent.nodeValue + " path=" + this.src_sp_path [i]);
          //showStatus ("[addHighlight] oldendtext=" + tmp.endParent.nodeValue + " path=" + this.src_ep_path [i]);
          tmp.startParent = getCorrespondingNode (target.ownerDocument, this.src_sp_path [i]);
          tmp.endParent = getCorrespondingNode (target.ownerDocument, this.src_ep_path [i]);
          //showStatus ("[addHighlight] newstarttext=" + tmp.startParent.nodeValue);
          //showStatus ("[addHighlight] newendtext=" + tmp.endParent.nodeValue);
        }
        //showStatus ("[addHighlight] src_root Owner = " + this.src_root.ownerDocument);
        //showStatus ("[addHighlight] target Owner = " + this.src_root.ownerDocument);
      }
      this.src_root = findCommonAncestor (this.src_root, target);
      this.src_root_path = findPath (this.src_root);
      this.src_sp_path.push (findPath (hl.node));
      this.src_ep_path.push (findPath (hl.node));
      this.highlights.push (hl);
      this.src_indices.push (pos);
    } else {
      if (this.cur_src_doc != null) {
        //Save the previous highlight operations
        var reducedTrail = this.getHLSessionTrail (0);
        if (reducedTrail != null) registerTrail (reducedTrail);
        this.src_reduced_docs = [];
        this.src_reduced_hls = [];			
      }
      this.struct_cache = [];
      this.src_root = target;
      this.src_root_path = findPath (this.src_root);
      this.cur_src_doc = doc;
      //this.cur_src_elems = [];
      this.highlights = [];
      this.src_sp_path = [];
      this.src_ep_path = [];
      this.highlights.push (hl);
      this.src_sp_path.push (findPath (hl.node));
      this.src_ep_path.push (findPath (hl.node));
      //this.cur_src_indices = [];
      this.src_indices.push (pos);
    } 
  } catch (ex) {
    showStatus ("[scpman.addHighlight] " + ex.message);
  }
}

function saveHLSessions () {
  //showStatus ("[saveHLSessions] 19 clipboard=" + writeSCPHighlight (stateTable[19].clipboard));
	
  if (this.highlights.length < 2) return;
	
  var trail = this.getHLSessionTrail (0);
  //showStatus ("[saveHLSessions]2 19 clipboard=" + writeSCPHighlight (stateTable[19].clipboard));
  if (trail != null) {
    showStatus ("[saveHLSessions] trail length=" + trail.states.length);
    registerTrail (trail);
  }
}

function hasValidHLSession (n) {
  try {
    if (this.highlights.length == 0) return false;
    var node = this.src_root;
    for (var i = 0; i < n; i++) {
      if (node.parentNode == undefined || node.parentNode == null) return false;
      node = node.parentNode;
    }
			
    return true;
  } catch (ex) {
    showStatus ("[hasValidHLSession] " + ex.message);
  }
}

function getHLSessionTrail (n) {
  try {
		
    //showStatus ("[getHLSessionTrail] n=" + n);
    var reduced_doc = null;
    var root = getParent (this.src_root, n);
    if (this.cur_src_doc != null) reduced_doc = getElementStructure (root);
    //showStatus ("[getHLSessionTrail] 1.1");
    this.src_reduced_hls = [];
    for (var i = 0; i < this.highlights.length; i++) {
      //this.src_reduced_docs.push (root);
      getReducedHighlight (root, this.highlights[i]);
      //showStatus ("[getHLSessionTrail] nodeID=" + hl.nodeID);
      this.src_reduced_hls.push (this.highlights[i]);
      //showStatus ("[getHLSessionTrail] this.src_reduced_hls[this.src_reduced_hls.length - 1].nodeID=" + this.src_reduced_hls[this.src_reduced_hls.length - 1].nodeID);
    }
    //showStatus ("[getHLSessionTrail] 2");
    var si = this.src_indices[0];
    //var ei = this.src_indices[this.highlights.length - 1];
    var ei = this.trail.states.length - 1;
    var ss = new MIOState (REDUCED_SCP);

    ss.document = reduced_doc;
    ss.highlight = this.src_reduced_hls[0];
		
    var tmp = registerState (ss);

    var tr = new newTrail (tmp);
    tr.reduced = REDUCED_SCP;
    tr.src_root = root;
		
    var hlindex = 1;
    var last_reduced_doc = new Object ();
    last_reduced_doc.loc = "$$Copy/Paste Source Doc$$";
    last_reduced_doc.title = "Copy/Paste Source Doc";
    var last_real_doc = stateTable[this.trail.states[this.src_indices[0]]].document;
    //showStatus ("[getHLSessionTrail] src_indices[0]=" + this.src_indices[0] + " last_real_doc=" + last_real_doc);
    var state = ss;			
    for (var i = si + 1; i <= ei; i++) {
      state = state.clone ();
      var et = this.trail.etypes[i];
      var ev = this.trail.evalues[i];
      tr.etypes.push (et);
      switch (et) {
        case HIGHLIGHT_EVENT:
          state.highlight = this.src_reduced_hls[hlindex];
          //showStatus ("[getHLSessionTrail] hlindex=" + hlindex + " state.highlight.nodeID=" + //state.highlight.nodeID);
          tr.evalues.push (state.highlight);
          hlindex++;
          break;
        case URL_SUBMIT_EVENT:
          //showStatus ("[getHLSessionTrail] i=" + i + " ev=" + ev.loc);
          if (ev.loc == last_real_doc) tr.evalues.push (last_reduced_doc);
          else tr.evalues.push (ev);
          state.document = tr.evalues[tr.evalues.length - 1].loc;
          break; 
        case URL_INPUT_EVENT:
          state.input = ev;
          tr.evalues.push (ev);
          break;
        case COPY_EVENT:
          state.clipboard = state.highlight;
          tr.evalues.push (state.clipboard);
          break;
        case PASTE_EVENT:
          tr.evalues.push (ev);
          break;
        case INPUT_EVENT:
          state.currentInput = ev;
          tr.evalues.push (ev);
          break;
        case PASTE_INPUT_EVENT:
          var evtp = new FormInput (true, ev.name, null, ev.type);
          evtp.value = state.clipboard;
          state.currentInput = evtp;
          tr.evalues.push (evtp);
          break;
        case URL_COPY_EVENT:
          var rh = new Object ();
          rh.nodeID = -1;
          rh.allText = true;
          state.clipboard = rh;
          tr.evalues.push (state.clipboard);
          break;
      }
			
      /*
			showStatus ("[getHLSessionTrail] et=" + et + " hl=" + writeSCPHighlight(state.highlight) + " cb=" +
				writeSCPHighlight(state.clipboard));
       */
      state = registerState (state);
      /*
			showStatus ("[getHLSessionTrail] id=" + state.id + " hl=" + writeSCPHighlight(state.highlight) + " cb=" +
				writeSCPHighlight(state.clipboard));
       */
      //showStatus ("[getHLSessionTrail] state=" + state.id + " doc=" + state.document);
      tr.states.push (state.id);			
    }
    //registerTrail (tr);
    //showStatus ("[getHLSessionTrail] tr.states.length=" + tr.states.length);
    return tr;
  } catch (ex) {
    showStatus ("[getHLSessionTrail] " + ex.message);
  }	
  return null;
}

/*
function isAncestor (p, c) {
	//showStatus ("[isAncestor] p=" + p.localName + " childCount=" + p.childNodes.length);
	if (p.childNodes == undefined) return false;
	var nodes = p.childNodes;
	for (var i = 0; i < nodes.length; i++) 
		if (nodes[i] == c || isAncestor (nodes[i], c)) return true;
	return false;
}

function getElementStructure (elem) {
	if (elem.structureID != undefined) {
		//showStatus ("[getElementStructure] structureID found!");
		return elem.structureID;
	}
	var res = "<" + elem.localName;
	if (elem.childNodes == undefined || elem.childNodes.length == 0) {
		res += "/>";
	} else {
		res += ">";
		var nodes = elem.childNodes;
		var prevStruct = null;
		for (var i = 0; i < nodes.length; i++) {
			var structure = getElementStructure (nodes[i]);
			if (structure != prevStruct) {
				prevStruct = structure;
				res += structure;
			}
		}
		res += "</" + elem.localName + ">"; 
	}
	//showStatus ("[getElementStructure] elem=" + elem.localName + " struct=" + res);
	elem.structureID = res;
	return res;
}
 */

//
//		Reduced Highlight:
//			- nodeID, allText, startOffset, endOffset, 
//
// This is actually instantiating GEN_STRUCTURE
function getReducedHighlight (root, hl) {
  try {
    if (hl.nodeID != null && root == hl.rhlRoot) return;

    /*
		showStatus ("[getReducedHighlight] so=" + hl.startOffset + " eo=" + hl.endOffset + " stext=" + 
			hl.startParent.nodeValue + " etext=" + hl.endParent.nodeValue); 	
     */

    hl.nodeID = getNodeStructureID (root, hl.node);
    hl.rhlRoot = root;
  } catch (ex) {
    showStatus ("[getReducedHighlight] " + ex.message);
  }
}

function selectSCPTrail () {
  var res = new Object ();
  res.id = -1;
	
  //showStatus ("[selectSCPTrail] Start");
  try {
    var i = 0;
    //showStatus ("[selectSCPTrail] This.highlights=" + this.highlights); 
    while (this.hasValidHLSession (i)) {
      var trail = this.getHLSessionTrail (i);
			
      showStatus ("[selectSCPTrail] trying trail: " + trailToString (trail));
			
      res.id = selectTrail (trail);
			
      if (res.id >= 0) {
        res.trail = trail;
        break;		
      }
      i++;
    }
		
  } catch (ex) {
    showStatus ("[selectSCPTrail] " + ex.message);
  } 
	
  //showStatus ("[selectSCPTrail] End");
  return res;
}

/*
function getParent (node, n) {
	var res = node;
	for (var i = 0; i < n; i++) 
		res = res.parentNode;
	return res;
}

function getNodeStructureID (root, node) {
	try { 
		//showStatus ("[getNodeStructureID] root=" + root.localName + " node=" + node.localName);
		//if (node.nodeValue != undefined) showStatus ("[getNodeStructureID] nodeText=" + node.nodeValue); 
		if (node == root) return 0;
		if (!isAncestor (root, node)) {
			showStatus ("[getNodeStructureID] root is not ancestor of node!");
			showStatus ("[getNodeStructureID] root=" + root.localName + " node=" + node.localName);
			if (node.nodeValue != undefined) showStatus ("[getNodeStructureID] nodeText=" + node.nodeValue); 
			
			return -1;
		}
		
		var cnodes = root.childNodes;
		//showStatus ("[getNodeStructureID] cnodes.length=" + cnodes.length);
		if (cnodes == undefined || cnodes.length == 0) return -1;
		
		var count = 1;
		var res = -1;
		
		var pre_struct = null;
		for (var i = 0; i < cnodes.length; i++) {
			if (cnodes[i] == node) {
				res = count;
				break;
			}
			var cur_struct = getElementStructure (cnodes[i]);
			if (pre_struct == cur_struct) continue;
			pre_struct = cur_struct;
			if (isAncestor (cnodes[i], node)) {
				res = count + getNodeStructureID (cnodes[i], node);
				break;
			} else count += getUniqueStructNodeCount (cnodes[i]);
		}
		
		//showStatus ("[getNodeStructureID] nodeID=" + res);
		return res;
	} catch (ex) {
		showStatus ("[getNodeStructureID] " + ex.message);
	}
}

function getUniqueStructNodeCount (root) {
	try {
		if (root == null) return 0;
		var cnodes = root.childNodes;
		
		if (cnodes == undefined || cnodes.length == 0) return 1;
		
		var res = 1;
		var pre_struct = null;
		for (var i = 0; i < cnodes.length; i++) {
			var cur_struct = getElementStructure (cnodes[i]);
			if (pre_struct == cur_struct) continue;
			res += getUniqueStructNodeCount (cnodes[i])
		}
		
		return res;
	} catch (ex) {
		showStatus ("[getUniqueStructNodeCount] " + ex.message);
	}
}
 */

function writeSCPHighlight (hl) {
  try {
    if (hl == undefined || hl == null) return "";
		
    var res = "" + hl.nodeID + " ";
    if (hl.allText) res += "1 ";
    else {
      res += "0 ";
      res += hl.startOffset + " " + hl.endOffset;
    }
    return res;
  } catch (ex) {
    showStatus ("[writeSCPHighlight] " + ex.message);
  }
}

function readSCPHighlight (line) {
  try {
    //showStatus ("[readSCPHighlight] line=" + line);
		
    if (line == null || line.length == 0) return null;
    var res = new Object();
		
		
		
    var ss = line.split (" ");
    res.nodeID = ss[0] - 0;
    var tmp = ss[1] - 0;
    if (tmp == 1) res.allText = true;
    else {
      res.allText = false;
      res.startOffset = ss[2] - 0;
      res.endOffset = ss[3] - 0;
    }
    return res;
  } catch (ex) {
    showStatus ("[readSCPHighlight] " + ex.message);
  }
}

function myprint (s) {
  var res = "";
  for (var i = 0; i < s.length; i++) {
    res += s.charAt (i);
    res += ",";
  }
  showStatus (res);
}


function sameSCPHighlight (hl1, hl2) {
	
  if (hl1 == null && hl2 == null) return true;

  if (hl1 == null || hl2 == null) return false;

  if (hl1.nodeID != hl2.nodeID) return false;

  if (hl1.allText != hl2.allText) return false;

  if (hl1.allText) return true;
	
  return hl1.startOffset == hl2.startOffset && hl1.endOffset == hl2.endOffset;
}

/*
function findNodeByStructureID (root, id) {
	var res = null;
	try {
		//debugMessage ("[findNodeByStructureID] nodeID=" + id);
		
		if (id == 0) res = root;
		else if (root.childNodes == undefined || root.childNodes.length == 0) res = null;
		else {
			var pre_str = null;
			id--;
			for (var i = 0; i < root.childNodes.length; i++) {
				var cur_str = getElementStructure (root.childNodes[i]);
				if (cur_str == pre_str) continue;
				pre_str = cur_str;
				res = findNodeByStructureID (root.childNodes[i], id);
				if (res != null) break; 
				id -= getUniqueStructNodeCount (root.childNodes[i]);
			}
		}
		
		//debugMessage ("[findNodeByStructureID] node=" + res);
	} catch (ex) {
		debugMessage ("[findNodeByStructureID] " + ex.message);
	}
	
	return res;
}
 */

function getSCPHighlightText (node, hl) {
  var res = null;
  try {
    //debugMessage ("[getSCPHighlightText] allText=" + hl.allText);

    if (hl.allText) res = node.nodeValue;
    else {
      debugMessage ("[getSCPHighlightText] end=" + hl.endOffset);
			
      var start, end;
      if (hl.startOffset < 0) start = 0;
      else start = hl.startOffset;
      if (hl.endOffset <= 0) end = node.nodeValue.length;
      else end = hl.endOffset;
				
      if (start > end) {
        var tmp = start;
        start = end;
        end = tmp;
      }	
      //debugMessage ("[getSCPHighlightText] nodeValue=" + node.nodeValue + " start=" + start + " end=" + end);
      res = node.nodeValue.substring (start, end);
    }
		
    //debugMessage ("[getSCPHighlightText] res=" + res); 
  } catch (ex) {
    debugMessage ("[getSCPHighlightText] " + ex.message);
  }
	
  return res;
}

function allLeadingBlank (s, start) {
  for (var i = 0; i < start; i++) 
    if (s.charAt (i) != ' '&& s.charAt (i) != '\n' && s.charAt (i) != '\t') return false;
  return true;
}

function allTrailingBlank (s, end) {
  for (var i = end; i < s.length; i++) 
    if (s.charAt (i) != ' ' && s.charAt (i) != '\n' && s.charAt (i) != '\t') return false;
  return true;
}
