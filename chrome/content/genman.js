// Managing trail generalization
const GENTYPE_DOCUMENT = 0;
const GENTYPE_HIGHLIGHT = 1; //Highlight is also applicable for clipboard and paste
const GENTYPE_URL = 2;
const GENTYPE_INPUT_DST = 3;

const GENTYPE_TAB_LENGTH = 4;
const TOTAL_GEN_METHODS = 1024;

const GEN_NONE = 0;
//const GEN_ANY = 1;
const GEN_STRUCTURE = 2;
const GEN_CONTENT = 3;

const GEN_HIGHLIGHT_MINICONTENT = 5;

//Generalization methods 100-199 are for methods on URL
const GEN_URL_ANY = 100;

//Generalization methods 200-299 are for methods on highlighed phrase
const GEN_HIGHLIGHT_ANY = 200;

//Generalization methods 300-399 are for input destinations
const GEN_INPUT_DST_ANY = 300;

//Generalization methods 400 - 1023 are for methods on Document (TOTAL_GEN_METHODS = 1024 in genman.js)
const GEN_DOCUMENT_ANY = 400;
//401 to 420 are reserved for HMS
const GEN_HIGHLIGHT_MINISTRUCT_0 = 401;

//Special child node ID
//const CHILD_ID_URL = 0x0fffffff;

var genTypeTab;
var genMethodTab;


function initGenMan () {
  try {
    genTypeTab = new Array (GENTYPE_TAB_LENGTH);
    genMethodTab = new Array (TOTAL_GEN_METHODS);	
	
    for (var i = 0; i < GENTYPE_TAB_LENGTH; i++) {
      //var tmp = [];
      var tmp = new Array ();
      tmp[0] = GEN_NONE;
      genTypeTab[i] = tmp;
    }
	
    initHighlightMiniStructs ();
    initAnyGen ();
  } catch (ex) {
    showStatus ("[genman.initGenMan] " + ex.message);
  }
}


function registerGeneralization (type, method) {
  try {
    if (type < 0 || type >= GENTYPE_TAB_LENGTH) {
      return false;
    }
    var tab = genTypeTab[type];
		
    tab.push (method.gen_id);
    genMethodTab[method.gen_id] = method; 
  } catch (ex) {
    showStatus ("[genman.registerGeneralizaion] " + ex.message);
  }
}

function genMethodByID (id) {
  return genMethodTab[id];
}

function createGenTrails (trail, endIndex, isForMatching) {
  try {
    var res = new Array ();
    var state = new Array (GENTYPE_TAB_LENGTH);
    for (var i = 0; i < GENTYPE_TAB_LENGTH; i++) state[i] = 0;
		
    var more = stateIncrement (state, GENTYPE_TAB_LENGTH - 1);
    while (more) {
      res.push (generalizeTrail (trail, state, endIndex, isForMatching));
      more = stateIncrement (state, GENTYPE_TAB_LENGTH - 1);
    }
		
    return res;
  } catch (ex) {
    showStatus ("[genman.createGenTrails] " + ex.message);
  }
}

function generalizeTrail (trail, state, endIndex, isForMatching) {
  try {
    //showStatus ("[genman.generalizeTrail] original initstateid at entry=" + trail.initState.id);
    //showStatus ("[genman.generalizeTrail]
    var res = trail.clone (trail.etypes.length);
    for (var i = 0; i < GENTYPE_TAB_LENGTH; i++) {
      var gen_id = genTypeTab[i][state[i]];
      if (gen_id != GEN_NONE) {
        //showStatus ("[genman.generalizeTrail] gen_id =" + gen_id);
        var method = genMethodByID (gen_id);
        method.generalizeTrail (res, endIndex, isForMatching);
      }
    } 
		
    //showStatus ("[genman.generalizeTrail] original initstateid at exit=" + trail.initState.id);
    return res;
  } catch (ex) {
    showStatus ("[genman.generalizeTrail] " + ex.message);
  }
}

function stateIncrement (state, level) {
  try {
    var res = true;
		
    var s = state[level];
    var list = genTypeTab[level];
    if (s == list.length - 1) {
      if (level == 0) 
        res = false;
      else {
        res = stateIncrement (state, level - 1);
        if (res) state[level] = 0;
      }
    } else state[level] = s + 1;
		
    return res;
  } catch (ex) {
    showStatus ("[genman.stateIncrement] " + ex.message);
  }
}

function getBWPropStart (gen_type, trail, current) {
  try {
    var start;
    for (start = current; start >= 0; start--) {
      switch (gen_type) {
        case GENTYPE_DOCUMENT:
          if (trail.etypes[start] == URL_SUBMIT_EVENT) return start;
          break;
        case GENTYPE_HIGHLIGHT:
          if (trail.etypes[start] == HIGHLIGHT_EVENT) return start;
          break;
        case GENTYPE_URL:
          if (trail.etypes[start] == URL_SUBMIT_EVENT || trail.etypes[start] == URL_INPUT_EVENT) 
            return start;
          break;
        case GENTYPE_INPUT_DST:
          if (trail.etypes[start] == PASTE_INPUT_EVENT || trail.etypes[start] == INPUT_EVENT) 
            return start;
          break; 
      }
    }
    return start;
  } catch (ex) {
    showStatus ("[genman.getBWPropStart] " + ex.message);
  }
}

function getFWPropEnd (gen_type, trail, current) {
  try {
    var end;
    for (end = current + 1; end < trail.states.length; end++) {
      switch (gen_type) {
        case GENTYPE_DOCUMENT:
          if (trail.etypes[end] == URL_SUBMIT_EVENT) return end;
          break;
        case GENTYPE_HIGHLIGHT:
          if (trail.etypes[end] == HIGHLIGHT_EVENT) return end;
          break;
        case GENTYPE_URL:
          if (trail.etypes[end] == URL_SUBMIT_EVENT || trail.etypes[end] == URL_INPUT_EVENT) 
            return end;
          break;
        case GENTYPE_INPUT_DST:
          if (trail.etypes[end] == PASTE_INPUT_EVENT || trail.etypes[end] == INPUT_EVENT) 
            return end;
          break; 
      }
    }
    return end;
  } catch (ex) {
    showStatus ("[genman.getFWPropEnd] " + ex.message);
  }
}


function GeneralizationConflict () {
}

function InstantiationException () {
}


function generalizeTryForEvent (trail, current, gen_method, gen_state) {
  try { 
    //showStatus ("[genman.generalizeTryForEvent] start");
		
    var tmp = new Object ();
    tmp.docs = tmp.urls = tmp.hls = tmp.inds = -2;
    tmp.doce = tmp.urle = tmp.hle = tmp.inde = -3;
	
    if (gen_state.document != null) {
      tmp.docs = getBWPropStart (GENTYPE_DOCUMENT, trail, current);
      tmp.doce = getFWPropEnd (GENTYPE_DOCUMENT, trail, current) - 1;
    }
		
    if (gen_state.urlbar != null) {
      tmp.urls = getBWPropStart (GENTYPE_URL, trail, current);
      tmp.urle = getFWPropEnd (GENTYPE_URL, trail, current) - 1;
    }
		
    if (gen_state.highlight != null) {
      tmp.hls = getBWPropStart (GENTYPE_HIGHLIGHT, trail, current);
      tmp.hle = getFWPropEnd (GENTYPE_HIGHLIGHT, trail, current) - 1;
      //showStatus ("[genman.generalizeTryForEvent] current=" + current +  " hls=" + tmp.hls + " hle=" + tmp.hle);
    }
		
    if (gen_state.currentInput != null) {
      tmp.inds = getBWPropStart (GENTYPE_INPUT_DST, trail, current);
      tmp.inde = getFWPropEnd (GENTYPE_INPUT_DST, trail, current) - 1;
    }
	
    if (genTrailWalkTry (trail, gen_method, gen_state, tmp)) return true;
    else return false;
  } catch (ex) {
    showStatus ("[genman.generalizeTryForEvent] " + ex.message);
  }
}

function genTrailWalkTry (trail, gen_method, gen, bound) {
  try { 
    //showStatus ("[genman.genTrailWalkTry] id=" + gen_method.gen_id);
		
    var cs, tmp;
		
    if (trail.shadow == null) trail.shadow = trail.clone (trail.etypes.length);
		
    var oldtrail = trail;
    trail = trail.shadow;

    cs = trail.initState.clone();
    if (bound.docs == -1) 
      cs.document = gen_method.generalizeStateVar (GENTYPE_DOCUMENT, cs, cs.document, gen);
    if (bound.urls == -1) 
      cs.urlbar = gen_method.generalizeStateVar (GENTYPE_URL, cs, cs.urlbar, gen);
    if (bound.hls == -1) 
      cs.highlight = gen_method.generalizeStateVar (GENTYPE_HIGHLIGHT, cs, cs.highlight, gen);
    if (bound.inds == -1) 
      cs.currentInput.dest = gen_method.generalizeStateVar (GENTYPE_INPUT_DST, cs, cs.currentInput.dest, gen);
    trail.initState = cs;

    for (var i = 0; i < trail.etypes.length; i++) {
      var newstate = cs.clone ();
      switch (trail.etypes[i]) {
        case URL_INPUT_EVENT:
          if (i >= bound.urls && i <= bound.urle) {
            trail.evalues[i] = gen_method.generalizeStateVar (GENTYPE_URL, newstate, trail.evalues[i], gen);
          } 
          newstate.urlbar = trail.evalues[i];
          break;
        case HIGHLIGHT_EVENT:
          if (i >= bound.hls && i <= bound.hle) {
            trail.evalues[i] = gen_method.generalizeStateVar (GENTYPE_HIGHLIGHT, newstate, trail.evalues[i], gen);
          }
          newstate.highlight = trail.evalues[i];
          break;
        case COPY_EVENT:
          //showStatus ("[genman.genTrailWalkTry] oldclipboard=" + marshalSVCB (newstate.clipboard));
          newstate.clipboard = newstate.highlight;
          trail.evalues[i] = newstate.clipboard;
          //showStatus ("[genman.genTrailWalkTry] newclipboard=" + marshalSVCB (newstate.clipboard));
          break;
        case PASTE_EVENT:
          showStatus ("[genman.genTrailWalk] Paste event not expected!");
          break;
        case URL_SUBMIT_EVENT:
          var urls = new SVUrl ();
          urls.value = trail.evalues[i].value.loc;
          if (i >= bound.urls && i <= bound.urle) {
            //TODO
            newstate.urlbar = gen_method.generalizeStateVar (GENTYPE_URL, newstate, urls, gen);
          } else newstate.urlbar = trail.states[i].urlbar;
            
          if (i >= bound.docs && i <= bound.doce) {
            trail.evalues[i] = gen_method.generalizeStateVar (GENTYPE_DOCUMENT, newstate, trail.evalues[i], gen);
          }
          newstate.document = trail.evalues[i];

          break;
        case INPUT_EVENT:
          newstate.currentInput = new SVFI ();
          if (i >= bound.inds && i <= bound.inde) {
            newstate.currentInput.dest = gen_method.generalizeStateVar (GENTYPE_INPUT_DST, newstate, trail.evalues[i].dest, gen);
          } else
            newstate.currentInput.dest = trail.evalues[i].dest;
          newstate.currentInput.source = trail.evalues[i].source;
          trail.evalues[i] = newstate.currentInput;
          break;
        case PASTE_INPUT_EVENT:
          newstate.currentInput = new SVFI ();
          if (i >= bound.inds && i <= bound.inde) {
            newstate.currentInput.dest = gen_method.generalizeStateVar (GENTYPE_INPUT_DST, newstate, trail.evalues[i].dest, gen);
          } else 
            newstate.currentInput.dest = trail.evalues[i].dest;
          newstate.currentInput.source = newstate.clipboard;
          trail.evalues[i] = newstate.currentInput
          break;
        case URL_COPY_EVENT:
          newstate.clipboard = new SVCB ();
          newstate.clipboard.value = new Object ();
          newstate.clipboard.value.hlStruct = new PhraseStruct ();
          newstate.clipboard.value.hlContent = HLCONTENT_URL;
          break;
      }
      trail.states[i] = newstate;
      //if (newstate.urlbar.value == undefined)
      //  showStatus ("[genman.genTrailWalkTry] url undefined: i=" + i + " etype=" + trail.etypes[i]);
      cs = newstate;
    }		
    return true;
  } catch (ex) {
    if (ex instanceof GeneralizationConflict) {
      //showStatus ("[genman.genTrailWalkTry] generalization conflict");
      return false;
    }
    else showStatus ("[genman.genTrailWalkTry] " + ex.message);
  }
}

function genMethodCommit (trail, method) {
  try {
    var newt = trail.shadow;
    if (newt == null) return;
    trail.initState = registerState (newt.initState);
    for (var i = 0; i < trail.etypes.length; i++) {
      trail.evalues[i] = newt.evalues[i];
      trail.states[i] = registerState (newt.states[i]);
    }
    trail.shadow = null;
  } catch (ex) {
    showStatus ("[genman.genMethodCommit] " + ex.message);
  }
}

function genMethodAbort (trail, method, desc) {
  trail.shadow = null;
  //showStatus ("[genman.genMethodAbort] Aborted for method-" + method.gen_id + ":" + desc);
}

function genInstantiateTrail (gtrail, ctrail) {
  try {
    var res = ctrail.clone (ctrail.etypes.length);
		
    //showStatus ("[genman.genInstantiateTrail] gtrail.evalues=" + gtrail.evalues);
    //showStatus ("[genman.genInstantiateTrail] gtrail.estates=" + gtrail.states);
    //showStatus ("[genman.genInstantiateTrail] gtrail.etypes=" + gtrail.etypes);
		
    for (var i = ctrail.etypes.length; i < gtrail.etypes.length; i++) {
      //showStatus ("[genman.genInstantiateTrail] type=" + gtrail.etypes[i]);
			
      var et = gtrail.etypes[i];
      var cev, gev = gtrail.evalues[i];
      var method;
			
      if (et == PASTE_INPUT_EVENT || et == INPUT_EVENT) {
        cev = new SVFI ();
        if (gev.source.gen == GEN_NONE) cev.source = gev.source;
        else {
          method = genMethodByID (gev.source.gen);
          method.instantiateEvent (gtrail, i, res, i);
          cev.source = res.evalues[i].source;
        }
				
        if (gev.dest.gen == GEN_NONE) cev.dest = gev.dest;
        else {
          method = genMethodByID (gev.dest.gen);
          method.instantiateEvent (gtrail, i, res, i);
          cev.dest = res.evalues[i].dest;
        }
      } else {
				
        //if (et == URL_SUBMIT_EVENT) 
        // showStatus ("[genman.genInstantiateTrail] gev.gen=" + gev.gen);
        if (gev.gen == GEN_NONE) {
          cev = gev;
		
        } else {
          method = genMethodByID (gev.gen);
          method.instantiateEvent (gtrail, i, res, i);
          cev = res.evalues[i];
        }
      }
			
      res.etypes[i] = et;
      res.evalues[i] = cev;
      var state;
      if (i == 0) state = res.initState.clone ();
      else state = res.states[i - 1].clone ();
				
      switch (gtrail.etypes[i]) {
        case URL_INPUT_EVENT:
          state.urlbar = cev;
          break;
        case HIGHLIGHT_EVENT:
          state.highlight = cev;
          break;
        case COPY_EVENT:
          state.clipboard = cev;
          break;
        case PASTE_EVENT:
          showStatus ("[genman.genInstantiateTrail] We shouldn't see this!");
          break;
        case URL_SUBMIT_EVENT:
          state.urlbar = new SVUrl ();
          state.urlbar.value = cev.value.loc;
          state.document = cev			
          //showStatus ("[genman.genInstantiateTrail] state.document.gen=" + state.document.gen);
          break;
        case INPUT_EVENT:
          state.currentInput = cev;
          break;
        case PASTE_INPUT_EVENT:
          state.currentInput = cev;
          break;
        case URL_COPY_EVENT:
          state.clipboard = new SVCB ();
          state.clipboard.value = new Object ();
          state.clipboard.value.hlStruct = new PhraseStruct ();
          //state.clipboard.value.hlStruct.child_id = CHILD_ID_URL;
          state.clipboard.value.hlContent = HLCONTENT_URL;
          break;
      }
      res.states.push (state);
    }
    //showStatus ("[genman.genInstantiateTrail] Instantiation sucessful!");
    return res;
  } catch (ex) {
    if (ex instanceof InstantiationException) {
      //showStatus ("[genman.genInstantiateTrail] InstantiationException!");
      return null;
    }
    showStatus ("[genman.genInstantiateTrail] " + ex.message);
  }
}
