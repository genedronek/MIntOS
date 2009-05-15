//ANY operation

function initAnyGen () {
  var res;
 
  res = new DocAny ();
  registerGeneralization (GENTYPE_DOCUMENT, res);
  
  res = new UrlAny ();
  registerGeneralization (GENTYPE_URL, res);
  
  res = new HLAny ();
  registerGeneralization (GENTYPE_HIGHLIGHT, res);
  
  //	res = new InputDstAny ();
  //	registerGeneralization (GENTYPE_INPUT_DST, res);
}


function DocAny () {
  this.gen_id = GEN_DOCUMENT_ANY;
  this.marshal = DocAnyMarshal;
  this.unmarshal = DocAnyUnmarshal;
  this.isSameValue = DocAnyIsSameValue;
  this.generalizeTrail = DocAnyGeneralizeTrail;
  this.generalizeStateVar = DocAnyGeneralizeStateVar;
  this.instantiateEvent = DocAnyInstantiateEvent;
}

function DocAnyMarshal () {
  return "";
}

function DocAnyUnmarshal () {
  return null;
}

function DocAnyIsSameValue (gen_type, v1, v2) {
  return true;
}

function DocAnyGeneralizeTrail (trail, endIndex, isForMatching) {
try {
  var context = new Object ();
  for (var i = 0; i < trail.evalues.length && i <= endIndex; i++) {
    if (trail.etypes[i] == URL_SUBMIT_EVENT) {
      context.document = 1;
      if (!generalizeTryForEvent (trail, i, this, context)) {
        genMethodAbort (trail, this, "failed trying to apply DocAny to trail!");
        return;
      }
    }
  }
  genMethodCommit (trail, this);
} catch (ex) {
  showStatus ("[anygen.DocAnyGeneralizeTrail] " + ex.message);
}
}


function DocAnyGeneralizeStateVar (gen_type, state, ev, context) {
try {
  if (gen_type == GENTYPE_DOCUMENT) {
    if (ev == null) return null;
    var res = new SVDoc ();
    res.gen = GEN_DOCUMENT_ANY;
    if (ev.gen == GEN_NONE || ev.gen == GEN_DOCUMENT_ANY) return res;
  }
} catch (ex) {
  showStatus ("[anygen.DocAnyGeneralizeTrail] " + ex.message);
}
throw new GeneralizationConflict ();
}

function DocAnyInstantiateEvent (gen_trail, gen_cur, con_trail, con_cur) {
  throw new InstantiationException ();
}

function UrlAny () {
  this.gen_id = GEN_URL_ANY;
  this.marshal = UrlAnyMarshal;
  this.unmarshal = UrlAnyUnmarshal;
  this.isSameValue = UrlAnyIsSameValue;
  this.generalizeTrail = UrlAnyGeneralizeTrail;
  this.generalizeStateVar = UrlAnyGeneralizeStateVar;
  this.instantiateEvent = UrlAnyInstantiateEvent;
}

function UrlAnyMarshal () {
  return "";
}

function UrlAnyUnmarshal () {
  return null;
}

function UrlAnyIsSameValue (gen_type, v1, v2) {
  return true;
}

function UrlAnyGeneralizeTrail (trail, endIndex, isForMatching) {
try {
  var context = new Object ();
  for (var i = 0; i < trail.evalues.length && i <= endIndex; i++) {
    if (trail.etypes[i] == URL_INPUT_EVENT || trail.etypes[i] == URL_SUBMIT_EVENT) {
      context.urlbar = 1; 
      if (!generalizeTryForEvent (trail, i, this, context)) {
        genMethodAbort (trail, this, "failed trying to apply UrlAny to trail!");
        return;
      }
    }
  }
  genMethodCommit (trail, this);
} catch (ex) {
  showStatus ("[anygen.UrlAnyGeneralizeTrail] " + ex.message);
}	
}

function UrlAnyGeneralizeStateVar (gen_type, state, ev, context) {
try {
  if (gen_type == GENTYPE_URL) {
    if (ev == null) return null;
    var res = new SVUrl ();
    res.gen = GEN_URL_ANY;
    if (ev.gen == GEN_NONE || ev.gen == GEN_URL_ANY) return res;;
  } 
} catch (ex) {
  showStatus ("[anygen.UrlAnyGeneralizeStateVar] " + ex.message);
}	
throw new GeneralizationConflict ();
}

function UrlAnyInstantiateEvent (gen_trail, gen_cur, con_trail, con_cur) {
throw new InstantiationException ();
}

function HLAny () {
this.gen_id = GEN_HIGHLIGHT_ANY;
this.marshal = HLAnyMarshal;
this.unmarshal = HLAnyUnmarshal;
this.isSameValue = HLAnyIsSameValue;
this.generalizeTrail = HLAnyGeneralizeTrail;
this.generalizeStateVar = HLAnyGeneralizeStateVar;
this.instantiateEvent = HLAnyInstantiateEvent;
}

function HLAnyMarshal () {
return "";
}

function HLAnyUnmarshal () {
return null;
}

function HLAnyIsSameValue (v1, v2) {
return true;
}

function HLAnyGeneralizeTrail (trail, endIndex, isForMatching) {
try {
  //showStatus ("[anygen.HLAnyGeneralizeTrail] 1");
		
  var context = new Object ();
  context.highlight = 1;
  for (var i = 0; i < trail.etypes.length && i <= endIndex; i++) {
    if (trail.etypes[i] == HIGHLIGHT_EVENT) {
      if (!generalizeTryForEvent (trail, i, this, context)) {
        genMethodAbort (trail, this, "failed trying to apply HLAny to trail!");
        return;
      }
    }
  }
		
  //showStatus ("[anygen.HLAnyGeneralizeTrail] committing");
  genMethodCommit (trail, this);
} catch (ex) {
  showStatus ("[anygen.HLAnyGeneralizeTrail] " + ex.message);
}	
}

function HLAnyGeneralizeStateVar (gen_type, state, ev, context) {
try {
  if (gen_type == GENTYPE_HIGHLIGHT) {
    //showStatus ("[anygen.HLAnyGeneralizeStateVar] 1");
			
    if (ev == null) return null;
    var res = new SVHL ();
    res.gen = GEN_HIGHLIGHT_ANY;
    if (ev.gen == GEN_NONE || ev.gen == GEN_HIGHLIGHT_ANY) return res;
  }
} catch (ex) {
  showStatus ("[anygen.HLAnyGeneralizeStateVar] " + ex.message);
}	
	
throw new GeneralizationConflict ();
}

function HLAnyInstantiateEvent (gen_trail, gen_cur, con_trail, con_cur) {
if (gen_trail.etypes[gen_cur] == COPY_EVENT) {
  if (con_cur == 0) con_trail.evalues[con_cur] = con_trail.initState.highlight;
  else con_trail.evalues[con_cur] = con_trail.states[con_cur - 1].highlight;
} else if (gen_trail.etypes[gen_cur] == PASTE_INPUT_EVENT) {
  var res = new SVFI ();
  res.dest = gen_trail.evalues[gen_cur].dest;
  if (con_cur == 0) res.source = con_trail.initState.clipboard;
  else res.source = con_trail.states[con_cur - 1].clipboard;
  con_trail.evalues[con_cur] = res;
} else throw new InstantiationException ();
}


/*
function InputDstAny () {
	this.gen_id = GEN_INPUT_DST_ANY;
	this.marshal = InputDstAnyMarshal;
	this.unmarshal = InputDstAnyUnmarshal;
	this.isSameValue = InputDstAnyIsSameValue;
	this.generalizeTrail = InputDstAnyGeneralizeTrail;
	this.generalizeStateVar = InputDstAnyGeneralizeStateVar;
	this.instantiateEvent = InputDstAnyInstantiateEvent;
}

function InputDstAnyMarshal () {
	return "";
}

function InputDstAnyUnmarshal () {
	return null;
}

function InputDstAnyIsSameValue (v1, v2) {
	return true;
}

function InputDstAnyGeneralizeTrail (trail, endIndex) {
	try {
	} catch (ex) {
		showStatus ("[anygen.DocAnyGeneralizeTrail] " + ex.message);
	}	
}

function InputDstAnyGeneralizeStateVar (gen_type, state, ev, context) {
	try {
	} catch (ex) {
		showStatus ("[anygen.DocAnyGeneralizeTrail] " + ex.message);
	}	
}

function InputDstAnyInstantiateEvent (gen_trail, gen_cur, con_trail, con_cur) {
	try {
	} catch (ex) {
		showStatus ("[anygen.DocAnyGeneralizeTrail] " + ex.message);
	}
}
*/
