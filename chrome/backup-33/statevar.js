const GEN_NONE = 0;
const GEN_ANY = 1;
const GEN_STRUCTURE = 2;
const GEN_CONTENT = 3;

const GEN_HIGHLIGHT_MINISTRUCT = 4;
const GEN_HIGHLIGHT_MINICONTENT = 5;

//Generalization methods 100-199 are for methods on URL
const GEN_URL_ANY = 100;

//Generalization methods 200-299 are for methods on highlighed phrase
const GEN_HIGHLIGHT_ANY = 200;

//Generalization methods 300-399 are for input destinations
const GEN_INPUT_DST_ANY = 300;

//Generalization methods 400 - 1023 are for methods on Document (TOTAL_GEN_METHODS = 1024 in genman.js)
const GEN_DOCUMENT_ANY = 400;

//Special child node ID
const HLCONTENT_URL = "$$HLCONTENT_URL$$";

function SVUrl () {
  this.gen = GEN_NONE; //By default no generalization is performed
  //this.value = null;
}

function SVUrl (url) {
  this.gen = GEN_NONE;
  //this.value = url; 
}

function isSameSVUrl (url1, url2) {
  if (url1 == null && url2 == null) return true;
  if (url1 == null || url2 == null) return false;
	
  if (url1.gen == GEN_ANY && url2.gen == GEN_ANY) return true;
  if (url1.gen != url2.gen) return false;
  if (url1.gen == GEN_NONE) return url1.value == url2.value;
	
  var method = getMethodByID (url1.gen);
  return method.isSameValue (GEN_URL, url1.value, url2.value);

}

function marshalSVUrl (svurl) {
  try {
    if (svurl == null) return "";
    var res = svurl.gen;
		
    if (svurl.gen == GEN_ANY) return res;
    res += " ";
    if (svurl.gen == GEN_NONE) res += svurl.value;
    else {
      var method = getMethodByID (url1.gen);
      res += method.marshal (GEN_URL, svurl.value);
    }
    return res;
  } catch (ex) {
    showStatus ("[statevar.marshalSVUrl] " + ex.message);
  }
}

function unmarshalSVUrl (s) {
  try {
    if (s.length == 0) return null;
    var res = new SVUrl ();	
    var index = s.indexOf (" ");
    if (index < 0) res.gen = s - 0;
    else {
      res.gen = s.substring (0, index) - 0;
      if (res.gen == GEN_NONE) res.value = s.substr (index + 1);
      else {
        var method = getMethodByID (url1.gen);
        res.value = method.unmarshal (GEN_URL, s.substr (index + 1));   
      }
    }
    return res;
  } catch (ex) {
    showStatus ("[statevar.unmarshalSVUrl] " + ex.message);
  }
}

function SVDoc () {
  this.gen = GEN_NONE; //By default no generalization is performed
  //this.value = new Object ();
  //this.value.doc = null;
  //this.value.title = null;
  //this.value.loc = loc;
}

function SVDoc (title, loc, doc) {
  this.gen = GEN_NONE;
  this.value = new Object ();
  this.value.doc = doc;
  this.value.title = title;
  this.value.loc = loc;
}

function isSameSVDoc (doc1, doc2) {
  if (doc1 == null && doc2 == null) return true;
  if (doc1 == null || doc2 == null) return false;
	
  if (doc1.gen == GEN_ANY && doc2.gen == GEN_ANY) return true;
  if (doc1.gen != doc2.gen) return false;

  /*
	if (doc1.gen == GEN_NONE)
		return doc1.value.doc == doc2.value.doc && doc1.value.title == doc2.title 
			&& doc1.value.loc == doc2.value.loc;
   */	
  if (doc1.gen == GEN_NONE)
    return doc1.value.title == doc2.value.title && doc1.value.loc == doc2.value.loc;
	
  var method = getMethodByID (doc1.gen);
  return method.isSameValue (GEN_DOCUMENT, doc1.value, doc2.value);
}

function marshalSVDoc (svdoc) {
  try {
    if (svdoc == null) return "";
    var res = svdoc.gen;
    if (svdoc.gen == GEN_ANY) return res;
    if (svdoc.gen == NONE)		
      res += " " + svdoc.value.loc + " " + svdoc.value.doc + " " + svdoc.value.title; 
    else {
      var method = getMethodByID (svdoc.gen);
      res += " " + method.marshal (GEN_DOCUMENT, svdoc.value);
    }
    return res;
  } catch (ex) {
    showStatus ("[statevar.marshalSVDoc] " + ex.message);
  }
}

function unmarshalSVDoc (s) {
  try {
    if (s.length == 0) return null;
    var res = new SVDoc ();	
    var index = s.indexOf (" ");
    if (index < 0) {
      res.gen = s - 0;
    } else {
      res.gen = s.substring (0, index) - 0;
      res.value = new Object ();
      if (res.gen == GEN_NONE) {
        s = s.substr (index + 1);
        index = s.indexOf (" ");
        res.value.loc = s.substring (0, index);
        s = s.substr (index + 1);
        index = s.indexOf (" ");
        res.value.doc = s.substring (0, index);
        res.value.title = s.substr (index + 1);  
      } else {
        var method = getMethodByID (res.gen);
        res.value = method.unmarshal (GEN_DOCUMENT, s.substr (index + 1));
      }
    }
    return res;
  } catch (ex) {
    showStatus ("[statevar.unmarshalSVDoc] " + ex.message);
  }
}

function SVHL () {
  this.gen = GEN_NONE; //By default no generalization is performed
  //this.value = new Object ();
  //this.value.hlStruct = null;
  //this.value.hlContent = null;
}

function isSameSVHL (hl1, hl2) {
  if (hl1 == null && hl2 == null) return true;
  if (hl1 == null || hl2 == null) return false;
	
  if (hl1.gen == GEN_ANY && hl2.gen == GEN_ANY) return true;
  if (hl1.gen != hl2.gen) return false;

  if (hl1.gen == GEN_NONE) {
    //return hl1.value.hlContent == hl2.value.hlContent && isSamePhraseStruct (hl1.value.hlStruct, hl2.value.hlStruct);
    return hl1.value.hlContent == hl2.value.hlContent
  } else {
    var method = getMethodByID (hl1.gen);
    return method.isSameValue (GEN_HIGHLIGHT, hl1.value, hl2.value);
  }

  return false;
}

function PhraseStruct () {
  this.root_id = -1;
  this.child_id = -1; //ID of the text node
  this.offset_type = 0; //0: select all; 1: start from head; -1: start from rear
  this.start = -1; //
  this.end = -1;
  this.marshal = phsMarshal;
  this.unmarshal = phsUnMarshal;
}

function phsMarshal () {
  var res = this.root_id + " " + this.child_id + " " + this.offset_type + " " + this.start + " " + this.end;
  return res;
}

function phsUnmarshal (s) {
  var index = s.indexOf (" ");
  this.root_id = s.substring (0, index) - 0;
  s = s.substr (index + 1);
  index = s.indexOf (" ");
  this.child_id = s.substring (0, index) - 0;
  s = s.substr (index + 1);
  index = s.indexOf (" ");
  this.offset_type = s.substring (0, index) - 0;
  s = s.substr (index + 1);
  index = s.indexOf (" ");
  this.start = s.substring (0, index) - 0;
  s = s.substr (index + 1);
  index = s.indexOf (" ");
  this.end = s.substr (index + 1);
}

function isSamePhraseStruct (sp1, sp2) {
  if (sp1 == null && sp2 == null) return true;
  if (sp1 == null || sp2 == null) return false;

  return sp1.root_id == sp2.root_id && sp1.child_id == sp2.child_id && sp1.offset_type == sp2.offset_type 
    && sp1.start == sp2.start && sp1.end == sp2.end;
}

//"gen nid range_type start end content"
function marshalSVHL (svhl) {
  try {
    if (svhl == null) return "";
    var res = svhl.gen;
    if (svhl.gen == GEN_ANY) return res;

    res += " ";
    if (svhl.gen == GEN_NONE) res += svhl.value.hlStruct.marshal () + "," + svhl.value.hlContent;
    else {
      var method = getMethodByID (svhl.gen);
      res += method.marshal (GEN_HIGHLIGHT, svhl.value);
    }
    return res;
  } catch (ex) {
    showStatus ("[statevar.marshalSVHL] " + ex.message);
  }
}

function unmarshalSVHL (s) {
  try {
    //showStatus ("[statevar.unmarshalSVHL] s=" + s);
    if (s.length == 0) return null;
    var res = new SVHL ();	
    var index = s.indexOf (" ");
    if (index < 0) {
      res.gen = s - 0;
    } else {
      res.gen = s.substring (0, index) - 0;
      res.value = new Object ();
      s = s.substr (index + 1);
      if (res.gen == GEN_NONE) {
        index = s.indexOf (",");
        res.value.hlStruct = new PhraseStruct ();
        res.value.hlStruct.unmarshal (s.substring (0, index));
        res.value.hlContent = s.substr (index + 1);
      } else {
        var method = getMethodByID (svhl.gen);
        res.value = method.unmarshal (GEN_HIGHLIGHT, s);
      }
    }
		
    return res;
  } catch (ex) {
    showStatus ("[statevar.unmarshalSVHL] " + ex.message);
  }
}

function SVCB () {
  this.gen = GEN_NONE; //By default no generalization is performed
  //this.value = new Object ();
  //this.value.hlStruct = null;
  //this.value.hlContent = null;
}

function isSameSVCB (cb1, cb2) {
  return isSameSVHL (cb1, cb2);
}

function marshalSVCB (svcb) {
  return marshalSVHL (svcb);
}

function unmarshalSVCB (s) {
  return unmarshalSVHL (s);
}

function SVFI () {
  this.dest = new Object ();
  this.dest.gen = GEN_NONE; //must conform with doc gen
  //this.dest.value = new Object ();
  //this.dest.value.field_name = null;
  //this.dest.value.field_type = null;
  //this.dest.value.field_id = -1;
  //this.source = new SVHL ();
}

function isSameSVFI (fi1, fi2) {
  if (fi1 == null && fi2 == null) return true;
  if (fi1 == null || fi2 == null) return false;

  if (fi1.dest.gen != fi2.dest.gen || fi1.source.gen != fi2.source.gen) return false;
  if (fi1.dest.gen == GEN_NONE) {
    if (fi1.dest.value.field_name != fi2.dest.value.field_name 
      || fi1.dest.value.field_type != fi2.dest.value.field_type 
      || fi1.dest.value.field_id != fi2.dest.value.field_id)
      return false;
  } else {
    var method = getMethodByID (fi1.dest.gen);
    if (!method.isSameValue (GEN_INPUT_DST, fi1.dest.value, fi1.dest.value)) return false;
  }

  return isSameSVHL (fi1.source, fi2.source);
}

function marshalSVFI (svfi) {
  try {
    if (svfi == null) return "";
		
    var res = svfi.dst_gen;
		
    if (svfi.dst_gen != GEN_ANY) {
      if (svfi.dst_gen == GEN_NONE) 
        res += " " + svfi.dst_value.field_type + " " + svfi.dst_value.field_id + " " + svfi.dst_value.field_name;
      else {
        var method = getMethodByID (svfi.dst_gen);
        res += " " + method.marshal (GEN_INPUT_SRC, svfi.dst_value);
      }
    }
		
    res += "," + marshalSVHL (svfi.source);
    return res;
  } catch (ex) {
    showStatus ("[statevar.marshalSVFI] " + ex.message);
  }
}

function unmarshalSVFI (s) {
  try {
    if (s.length == 0) return null;
    var res = new SVFI ();	

    var index = s.indexOf (/[ ,]/);
    res.dest.gen = s.substring (0, index) - 0;

    s = s.substr (index + 1);
    if (res.dest.gen != GEN_ANY) {	
      if (res.dest.gen == GEN_NONE) {
        res.dest.value = new Object ();
        index = s.indexOf (" ");
        res.dest.value.field_type = s.substring (0, index);
        s = s.substr (index + 1);
        index = s.indexOf (" ");
        res.dest.value.field_id = s.substring (0, index) - 0;
        s = s.substr (index + 1);
        index = s.indexOf (",");
        res.dest.value.field_name = s.substring (0, index);
        s = s.substr (index + 1);
      } else {
        index = s.indexOf (",");
        var method = getMethodByID (svfi.dest.gen);
        res.dest.value = method.unmarshal (GEN_INPUT_DST, s.substring (0, index));
        s = s.substr (index + 1);
      }
    }
		
    res.source = unmarshalSVHL (s);

    return res;
  } catch (ex) {
    showStatus ("[statevar.unmarshalSVFI] " + ex.message);
  }
}