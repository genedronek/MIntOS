//In this file we define some default generalization methods

const HMS_MINI_LEVEL = 4;
const HMS_MAX_LEVEL = 4;

//var HMS_levels;
var HMSOptTab;

//This is the function exposed to the main system, and called when the 
//system starts up
function initHighlightMiniStructs () {
	
  HMS_levels = new Array ();
  for (var i = HMS_MINI_LEVEL; i <= HMS_MAX_LEVEL; i++) {
    HMS_levels[i] = 0;
    initHighlightMiniStruct (i);
  }
}


function initHighlightMiniStruct (level) {
  var res = new HighlightMiniStruct (level);
	
  //calling function in genman.js to register
  registerGeneralization (GENTYPE_DOCUMENT, res);
}


function HighlightMiniStruct (level) {
  //Standard fields
  this.gen_id = GEN_HIGHLIGHT_MINISTRUCT_0 + level;
  this.marshal = HMSMarshal;
  this.unmarshal = HMSUnmarshal;
  this.isSameValue = HMSIsSameValue;
  this.generalizeTrail = HMSGeneralizeTrail;
  this.generalizeStateVar = HMSGeneralizeStateVar;
  this.instantiateEvent = HMSInstantiateEvent;
  this.getContextForLevel = HMSGetContextForLevel;
	
  //Non-standard fields
  this.level = level;
}

function isHMSGenID (id) {
  return id >= GEN_HIGHLIGHT_MINISTRUCT_0 + HMS_MINI_LEVEL && id <= GEN_HIGHLIGHT_MINISTRUCT_0 + HMS_MAX_LEVEL;
}

function HMSMarshal (type, value) {
  try {
    var res = null;
    if (type == GENTYPE_DOCUMENT) {
      res = "" + value;
    } else if (type == GENTYPE_HIGHLIGHT) {
      res = value.level + " ";
      res += value.marshal (); //phsMarshal (value);
    }
    return res;
  } catch (ex) {
    showStatus ("[hmsgen.HMSMarshal] " + ex.message);
  }
}

function HMSUnmarshal (type, s) {
  try {
    var res;	
    if (type == GENTYPE_DOCUMENT) {
      res = s - 0;
    } else if (type == GENTYPE_HIGHLIGHT) {
      res = new PhraseStruct ();
      var index = s.indexOf (" ");
      res.level = s.substring (0, index) - 0;
      s = s.substr (index + 1);
      res.unmarshal (s);
    }
    return res;
  } catch (ex) {
    showStatus ("[defaultgen.HMSMarshal] " + ex.message);
  }
}

function HMSIsSameValue (type, v1, v2) {
  try {
    if (type == GENTYPE_DOCUMENT) return v1 == v2;
    if (type == GENTYPE_HIGHLIGHT) return isSamePhraseStruct (v1, v2);
		
    //	return v1.struct_id == v2.struct_id && v1.node_id == v2.node_id && v1.offset_type == v2.offset_type 
    //		&& v1.start == v2.start && v1.end == v2.end;
		
    return true;
  } catch (ex) {
    showStatus ("[defaultgen.HMSIsSameValue] " + ex.message);
  }
}

function addDocRecord (list, docrec) {
  list.push (docrec);
}

function getDocRecord (list, doc) {
  for (var i = 0; i < list.length; i++)
    if (list[i].doc == doc) return list[i];
  
  return null;
}

function getHMSOptRecord (docrec) {
  try {
    if (HMSOptTab == null) return null;
    for (var i = 0; i < HMSOptTab.length; i++) {
      var rec = HMSOptTab[i];
      if (rec.doc != docrec.doc) continue;
      if (rec.nodes.length != docrec.nodes.length) continue;
      var j;
      for (j = 0; j < rec.nodes.length; j++) {
        if (rec.nodes[j] != docrec.nodes[j]) break;
      }
      if (j == rec.nodes.length) return rec;
    }   
    return null;
  } catch (ex) {
     showStatus ("[hmsgen.getHMSOptRecord] " + ex.message);
  }
}

function addHMSOptRecord (docrec) {
  if (HMSOptTab == null) HMSOptTab = new Array ();
  HMSOptTab.push (docrec);
}

function HMSOptimize (docrec) {
  try {
    var optrec = getHMSOptRecord (docrec);
    if (optrec != null) return optrec;
   
    docrec.sca_path = getSCAPath (docrec.nodes);
    //showStatus ("[hmsgen.HMSOptimize] sca_path=" + docrec.sca_path);
    var sca = getCorrespondingNode (docrec.nodes[0].ownerDocument, docrec.sca_path);
    docrec.sca_level = getChildDepth (sca, docrec.nodes[0]);
    //showStatus ("[hmsgen.HMSOptimize] sca_level=" + docrec.sca_level);
    docrec.levels = new Array ();
    
    addHMSOptRecord (docrec);
    
    return docrec;
  } catch (ex) {
     showStatus ("[hmsgen.HMSOptimize] " + ex.message);
  }
  
  return null;
}

function getDocHighlights (trail) {
  try {
    var tmpdocs = new Array ();
    for (var i = 0; i < trail.evalues.length; i++) {		
      if (trail.etypes[i] != HIGHLIGHT_EVENT) continue;
      
      if (trail.evalues[i].gen != GEN_NONE && trail.evalues[i].gen != this.gen_id) {
        //showStatus ("[hmsgen.getDocHighlights] Generalization conflict detected!"); 
        throw new GeneralizationConflict ();
      }
      
      var doc;
      if (trail.evalues[i].gen == GEN_NONE) 
        doc = trail.states[i].document.value.loc;
      else 
        doc = trail.evalues[i].value.HMSOptLoc;
      
      var docrec = getDocRecord (tmpdocs, doc);
      if (docrec == null) {
        docrec = new Object ();
        docrec.nodes = new Array ();
        //docrec.level = this.level;
        docrec.doc = doc;
        addDocRecord (tmpdocs, docrec);
      }
      
      if (trail.evalues[i].gen == GEN_NONE)
        docrec.nodes.push (trail.evalues[i].value.hlStruct.child_id);
      else 
        docrec.nodes.push (trail.evalues[i].value.HMSOptNode);     
    }

    for (var j = 0; j < tmpdocs.length; j++) {
      docrec = tmpdocs[j];
      tmpdocs[j] = HMSOptimize (docrec);
    }
    
    return tmpdocs;
  } catch (ex) {
    if (ex instanceof GeneralizationConflict) throw ex;
    showStatus ("[hmsgen.getDocHighlights] " + ex.message);
  }
}

function HMSGetContextForLevel (docrec, level, ev) {
  try {
    if (docrec.levels[level] != null) return docrec.levels[level];
    
    if (level - docrec.sca_level > docrec.sca_path.length) {
      //showStatus ("[hmsgen.getContextForLevel] The document doesn't have so many levels[" + level + "]");
      return null;
    }
     
    var ance_path = new Array ();
    
    for (var i = level - docrec.sca_level; i < docrec.sca_path.length; i++)
      ance_path.push (docrec.sca_path[i]);
    
    var ancestor = getCorrespondingNode (docrec.nodes[0].ownerDocument, ance_path);
    var root_id = registerStructure (getElementStructure (ancestor));
    var child_id = getNodeStructureID (ancestor, ev.value.hlStruct.child_id);	
    
    var gs = new MIOState ();
    gs.document = new SVDoc ();
    gs.document.gen = this.gen_id; 
    gs.document.value = root_id;
    gs.document.HMStmp = docrec.doc;
    gs.highlight = new SVHL ();
    gs.highlight.gen = this.gen_id;
    gs.highlight.value = new PhraseStruct ();
    gs.highlight.value.root_id = root_id;
    gs.highlight.value.level = this.level;
    gs.highlight.value.child_id = child_id;
    gs.highlight.value.offset_type =  ev.value.hlStruct.offset_type;
    gs.highlight.value.start = ev.value.hlStruct.start;
    gs.highlight.value.end = ev.value.hlStruct.end;
    gs.highlight.value.HMSOptNode = ev.value.hlStruct.child_id;
    gs.highlight.HMStmp = docrec.doc;
    gs.highlight.HMSancestor = ancestor;
    gs.highlight.HMSancepath = ance_path
    
    docrec.levels[level] = gs;
    
    return gs;
  } catch (ex) {
    if (ex instanceof GeneralizationConflict) throw ex;
    showStatus ("[hmsgen.getDocHighlights] " + ex.message);
  }
  
  return null;
}

function HMSGeneralizeTrail (trail, endIndex, isForMatching) {
  try {
    var docs = getDocHighlights (trail);
    
    if (docs.length == 0) {
      //showStatus ("[hmsgen.HMSGeneralizeTrail] No highlight event in trail!")
      genMethodAbort (trail, this, "No highlight to generalize for trail!");
      return;
    }
    
    //var doctab = new DocTab ();
    for (var i = 0; i < trail.evalues.length; i++) {		
      if (trail.etypes[i] != HIGHLIGHT_EVENT) continue;
      if (trail.evalues[i].gen == this.gen_id) continue;
      
      if (trail.evalues[i].gen != GEN_NONE) {
        //showStatus ("[hmsgen.HMSGeneralizeTrail] current highlight gen[" + this.gen_id 
        //  + "] conflicts with existing gen[" + trail.evalues[i].gen + "]");
        genMethodAbort (trail, this, "");
        return;
      }
  
      if (trail.states[i].document.gen != GEN_NONE && trail.states[i].document.gen != this.gen_id) {
        //showStatus ("[hmsgen.HMSGeneralizeTrail] current document gen[" + this.gen_id 
        //  + "] conflicts with existing gen[" + trail.states[i].document.gen + "]");
        genMethodAbort (trail, this, "");
        return;
      }
        
      var docrec = getDocRecord (docs, trail.states[i].document.value.loc);
      var sca_level = docrec.sca_level;
      
      //showStatus ("[hmsgen.HMSGeneralizeTrail] sca_level=" + sca_level);
      
      if (this.level < sca_level) {
        //showStatus ("[hmsgen.HMSGeneralizeTrail] sca_level[" + sca_level
        //  + "] higher than current level[" + this.level + "]");
        genMethodAbort (trail, this, "");
        return;
      }
      
      if (!isForMatching && this.level > sca_level) {
        //showStatus ("[hmsgen.HMSGeneralizeTrail] sca_level[" + sca_level
        //  + "] not same as current level[" + this.level + "]");
        genMethodAbort (trail, this, "");
        return;
      }

      var gs = this.getContextForLevel (docrec, this.level, trail.evalues[i]);
      if (!generalizeTryForEvent (trail, i, this, gs)) {
        genMethodAbort (trail, this, "Generalization trial failed for event " + i);
        return;
      }						
      
      /*
        
        var gs = doctab.getContext (trail.states[i].document.value.loc);
        if (gs == null) {
          showStatus ("[hmsgen.HMSGeneralizeTrail] First highlight event in trail!");
          //var root = trail.evalues[i].value.hlStruct.root_id;
          var child = trail.evalues[i].value.hlStruct.child_id;
          //showStatus ("[hmsgen.HMSGeneralizeTrail] 1");
          var ancestor = getAncestor (child, this.level);
          //showStatus ("[hmsgen.HMSGeneralizeTrail] 2");
          if (ancestor == null) {
            genMethodAbort (trail, this, "No ancetor with level " + this.level);
            return;
          }
          //showStatus ("[hmsgen.HMSGeneralizeTrail] 3");
          var root_id = registerStructure (getElementStructure (ancestor));
          var child_id = getNodeStructureID (ancestor, child);			
          
          gs = new MIOState ();
          gs.document = new SVDoc ();
          gs.document.gen = this.gen_id;
          gs.document.value = root_id;
          gs.document.HMStmp = trail.states[i].document.value.loc;
          gs.highlight = new SVHL ();
          gs.highlight.gen = this.gen_id;
          gs.highlight.value = new PhraseStruct ();
          gs.highlight.value.root_id = root_id;
          gs.highlight.value.level = this.level;
          gs.highlight.value.child_id = child_id;
          gs.highlight.value.offset_type =  trail.evalues[i].value.hlStruct.offset_type;
          gs.highlight.value.start = trail.evalues[i].value.hlStruct.start;
          gs.highlight.value.end = trail.evalues[i].value.hlStruct.end;
          gs.highlight.HMStmp = trail.states[i].document.value.loc;
          gs.highlight.HMSancestor = ancestor;
          gs.highlight.HMSancepath = findPath (ancestor);
          
          gs.hlnodes = new Array ();
          gs.hlnodes.push (child_id);
          
          doctab.addContext (trail.states[i].document.value.loc, gs);
          
          if (!generalizeTryForEvent (trail, i, this, gs)) {
            genMethodAbort (trail, this, "Generalization trial failed for first highlight event in trail!");
            return;
          }						
        } else {
          //We are not the first highlight event
          showStatus ("[hmsgen.HMSGeneralizeTrail] This is not the first highlight event in trail!");
          gs = doctab.getContext (trail.evalues[i].value.hlStruct.root_id);
          
          if (!generalizeTryForEvent (trail, i, this, gs)) {
            genMethodAbort (trail, this, "Generalization trial failed for non-first highlight event in trail!");
            return;
          }
          var ancestor = getCorrespondingNode (child.ownerDocument, gs.highlight.HMSancepath);
          var child_id = getNodeStructureID (ancestor, child);
          gs.hlnodes.push (child_id);
        }
        
        
        } else {
          // Somebody already generalized the document!
          if (isHMSGenID (trail.states[i].document.gen)) {
            showStatus ("[hmsgen.HMSGeneralizeTrail] This is not the first highlight event in trail!");
            //Document already has been generalized with HMS. make sure that they are compatible
                      
          } else {
            //This is not even HMS. Abort it
            genMethodAbort (trail, this, "Conflict with other generalization methods!");
            return;
          }
        } 
      } else {
        //This highlight event has already been generalized! Make sur ethat it is compatible
        genMethodAbort (trail, this, "Highlight has already been generalized!");
        return;
      }
      */    
    }
	
    //showStatus ("[hmsgen.HMSGeneralizeTrail] sucess level: " + this.level);
    genMethodCommit (trail, this);
    //HMS_levels[this.level] = 1
  } catch (ex) {
    showStatus ("[hmsgen.HMSGeneralizeTrail] " + ex.message);
  }
}

function HMSGeneralizeStateVar (gen_type, state, sv, context) {
  try {
    switch (gen_type) {
      case GENTYPE_DOCUMENT:
        if (sv.gen == GEN_NONE && sv.value.loc == context.document.HMStmp) 
          return context.document;
        else {
          if (isHMSGenID (sv.gen)) {
            if (sv.HMStmp == context.document.HMStmp) 
              return context.document;
            else return sv;
          }
          //showStatus ("[hmsgen.HMSGeneralizeStateVar] GenStateVar failed for document type!");
        }
        break;
      case GENTYPE_URL:
        break;
      case GENTYPE_HIGHLIGHT:
        if (sv.gen == GEN_NONE && sv.value.hlStruct.root_id == context.highlight.HMStmp) {
          var root = sv.value.hlStruct.child_id.ownerDocument;
          var path = context.highlight.HMSancepath;
          var ancestor = getCorrespondingNode (root, path);
          var rank = getNodeStructureID (ancestor, sv.value.hlStruct.child_id);
          if (rank < 0) {
            //showStatus ("[hmsgen.HMSGeneralizeStateVar] GenStateVar failed rank=!" + rank);
            break;
          }
          var res = new SVHL ();
          res.gen = this.gen_id;
          res.value = new PhraseStruct ();
          res.value.root_id = context.highlight.value.root_id;
          res.value.child_id = rank;
          res.value.level = getChildDepth (ancestor, sv.value.hlStruct.child_id);
          res.value.offset_type = sv.value.hlStruct.offset_type;
          res.value.start = sv.value.hlStruct.start;
          res.value.end = sv.value.hlStruct.end;
          //context.hlnodes.push (rank);
					
          return res;
        } else {
          if (isHMSGenID (sv.gen)) {	 
            if (sv.HMStmp == context.highlight.HMStmp) {
              if (sv.value.root_id == context.highlight.value.root_id)
                return sv;
            } else return sv;
          }
          //showStatus ("[hmsgen.HMSGeneralizeStateVar] GenStateVar failed for highlight type!");
        }
        break;
      case GENTYPE_INPUT_DST:
        break;
    }
  } catch (ex) {
    showStatus ("[hmsgen.HMSGeneralizeStateVar] " + ex.message);
  }

  //showStatus ("[hmsgen.HMSGeneralizeStateVar] GenStateVar failed! gen_type=" + gen_type + " level=" + this.level);       
  throw new GeneralizationConflict ();
}


function HMSInstantiateEvent (gen_trail, gen_cur, con_trail, con_cur) {
	
  try {		
    var v = gen_trail.evalues[gen_cur];
		
    switch (gen_trail.etypes[gen_cur]) {	

      case HIGHLIGHT_EVENT:		
        //There must be at leat one previous HMS highlight event

        for (var i = gen_cur - 1; i >= 0; i--) {
          if (gen_trail.etypes[i] == HIGHLIGHT_EVENT) {
            
            //showStatus ("[hmsgen.HMSInstantiateStateVar] gen_trail.evalues[i].value.root_id=" + 
            //  gen_trail.evalues[i].value.root_id + " v.value.root_id" + v.value.root_id);
            if (gen_trail.evalues[i].gen == this.gen_id
              && gen_trail.evalues[i].value.root_id == v.value.root_id) {
              
              var pge = gen_trail.evalues[i];
              var pce = con_trail.evalues[con_cur - gen_cur + i];
              var cce = new SVHL ();
              //cce.gen = GEN_NONE;
              cce.value = new Object ();
              cce.value.hlStruct = new PhraseStruct ();
              
              var ancestor = getAncestor (pce.value.hlStruct.child_id, pge.value.level);
              cce.value.hlStruct.root_id = con_trail.states[con_cur - gen_cur + i].document.value.loc;
              cce.value.hlStruct.child_id = findNodeByStructureID (ancestor, v.value.child_id);
              cce.value.hlStruct.offset_type = v.value.offset_type;
              cce.value.hlStruct.start = v.value.start;
              cce.value.hlStruct.end = v.value.end;
                                         
              var s = cce.value.hlStruct.child_id.nodeValue;
              cce.value.hlContent = getHighlightContent (s, cce.value.hlStruct);
              
              con_trail.evalues[con_cur] = cce;
              return;	
            }
          }
        }
			
        throw new InstantiationException ();
			
        break;
      case URL_SUBMIT_EVENT:
		
        for (var i = gen_cur - 1; i >= 0; i--) {
          if (gen_trail.states[i].document.gen == this.gen_id
            && gen_trail.states[i].document.value == v.value) {
            var doce = new SVDoc ();
            doce.value = con_trail.states[con_cur - gen_cur + i].document.value;
            con_trail.evalues[con_cur] = doce;
            return;
          }				
        }		
			
        throw new InstantiationException ();
			
        break;
      case COPY_EVENT:
        con_trail.evalues[con_cur] = con_trail.states[con_cur - 1].highlight;
        return;
      case PASTE_INPUT_EVENT:
        con_trail.evalues[con_cur] = new SVFI ();
        con_trail.evalues[con_cur].source = con_trail.states[con_cur - 1].clipboard;
        con_trail.evalues[con_cur].source.HMSFlag = true;
        return;
    }
  } catch (ex) {
    if (ex instanceof InstantiationException) throw ex;
    else showStatus ("[hmsgen.HMSInstantiateStateVar] " + ex.message);
		
  }
	
}

