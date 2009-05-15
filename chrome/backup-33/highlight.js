//Highlight related operations

//	The purpose of the following function is to figure out the user's highligh action
function refineHighlight (sp, soff, ep, eoff) {
	
  try {
    //showStatus ("[highlight.getRefineHighlight] sp=" + sp.nodeValue + " soff=" + soff + 
    //	" ep=" + ep.nodeValue + " eoff=" + eoff);
    var res = new SVHL ();
    res.value = new Object ();
    var root = findCommonAncestor (sp, ep);
		
    if (sp != ep && nodeComp (root, ep, sp) < 0 || sp == ep && soff > eoff) {
      //showStatus ("[getReducedHighlight] 1");
      var tmp = sp;
      sp = ep;
      ep = tmp;
      tmp = soff;
      soff = eoff;
      eoff = tmp;
    }
		
    if (sp.nodeValue == undefined) {
      //showStatus ("[getReducedHighlight] 2");
      soff = 0;
      sp = ep;
    }
		
    if (ep.nodeValue == undefined) {
      //showStatus ("[getReducedHighlight] 3");
      eoff = sp.nodeValue.length;
      ep = sp;
    }
		
    if (sp != ep) {
      if (allLeadingBlank (ep.nodeValue, eoff)) {
        ep = sp;
        eoff = sp.nodeValue.length;
      } else if (allTrailingBlank (sp.nodeValue, soff)) {
        sp = ep;
        soff = 0;
      } else {
        ep = sp;
        eoff = sp.nodeValue.length;
      }
    }	
	
    //showStatus ("[highlight.getRefineHighlight2] sp=" + sp.nodeValue + " soff=" + soff + 
    //  " ep=" + ep.nodeValue + " eoff=" + eoff);
    //The following segment tried to determine which "words" are highlighted
    var start, end, wc = -1, lws = -1, lwe = -1;
    var olds = ep.nodeValue;
    var s = stringLTrim (olds);
    soff -= olds.length - s.length;
    eoff -= olds.length - s.length;
    s= stringRTrim (s);
    
    var i;
    for (i = 0; i < s.length; i++) {
      while (i < s.length && (s.charAt (i) == ' ' || s.charAt (i) == '\t')) i++;
      //showStatus ("[highlight.getRefineHighlight 1] i=" + i + " lws=" + lws + " lwe=" + lwe + " soff=" + soff + " eoff=" + eoff);
      if (eoff > lws && eoff <= i) end = wc;
      lws = i;
      if (i < s.length) {
        while (i < s.length && s.charAt (i) != ' ' && s.charAt (i) != '\t') i++;
        wc++;
        if (soff > lwe && soff < i) start = wc;		
        lwe = i - 1;	
      }
    }
    
    //showStatus ("[highlight.getRefineHighlight 2] i=" + i + " lws=" + lws + "  lwe=" + lwe + " start=" + start + " end=" + end + " wc=" + wc);
    if (eoff > lws && eoff <= s.length) end = wc;
    if (wc == -1) return null; //If no word is in the text node, then we assume nothing is highlighted
    
    res.value.hlStruct = new PhraseStruct ();
    res.value.hlStruct.start = start;
    res.value.hlStruct.end = end;
    if (start == 0 && end == wc) res.value.hlStruct.offset_type = 0;
    else if (end == wc) {
      res.value.hlStruct.offset_type = -1;
      res.value.hlStruct.start = wc - start;
    } else res.value.hlStruct.offset_type = 1;
    
    tmp = s.split (/[ \t]+/);
    res.value.hlContent = "";
    
    //showStatus ("[highlight.getRefineHighlight 3] i=" + i + " lws=" + lws + "  lwe=" + lwe + " start=" + start + " end=" + end);
    for (i = start; i <= end; i++) {
      if (i != start) res.value.hlContent += " ";
      res.value.hlContent += tmp[i];
    }
    
    //res.node = ep;
    res.value.hlStruct.child_id = ep;
    return res;
  } catch (ex) {
    showStatus ("[highlight.refineHighlight] " + ex.message);
  }
}

function getHighlightContent (s, hlStruct) {
  try {
    s = stringLTrim (s);
    s = stringRTrim (s);
   
    if (hlStruct.offset_type == 0) return s;
    var start, end;
    var tmp = s.split (/[ \t]/);
    if (hlStruct.offset_type == -1) {
      start = tmp.length - hlStruct.start - 1;
      if (start < 0) start = 0;
      end = tmp.length - 1;
    } 
    
    if (start >= tmp.length) return "";
    if (end >= tmp.length) end = tmp.length - 1;
    
    var res = "";
    for (i = start; i <= end; i++) {
      if (i != start) res += " ";
      res += tmp[i];
    }
    
    return res;
    
  } catch (ex) {
    showStatus ("[highlight.getHighlightContent] " + ex.message);
  }
}
        
function findCommonAncestor (e1, e2) {
  try {
    //showStatus ("[findCommonAncestor] e1=" + e1.localName + " e2=" + e2.localName);	
    
    if (e1.ownerDocument != e2.ownerDocument) {
      showStatus ("[findCommonAncestor] Not for same document!");
      return null;
    }
    
    if (e1 == e2) return e1;
    if (isAncestor (e1, e2)) return e1;
    if (isAncestor (e2, e1)) return e2;
    
    var p = e1.parentNode;
    //showStatus ("[findCommonAncestor] p=" + p.localName);
    while (p != null && !isAncestor (p, e2)) {
      e1 = p;
      p = e1.parentNode;
      //if (p != null) showStatus ("[findCommonAncestor] p=" + p.localName);
    } 
    
    if (p == null) {
      showStatus ("[findCommonAncestor] Common Ancestor not found!");
      return null;
    } else {
      showStatus ("[findCommonAncestor] Common Ancestor is " + p.localName);
      return p;
    }
  } catch (ex) {
    showStatus ("[findCommonAncestor] " + ex.message);
  }
}

function nodeComp (root, n1, n2) {
  try {
    if (n1 == n2) return 0;
    var cnodes = root.childNodes;
    if (cnodes == undefined || cnodes == null) return 0; 
    for (var i = 0; i < cnodes.length; i++) {
      if (n1 == cnodes[i]) return -1; 
      if (n2 == cnodes[i]) return 1;
      var res = nodeComp (cnodes[i], n1, n2);
      if (res != 0) return res;
    }		
    return 0;
  } catch (ex) {
    showStatus ("[highlight.nodeComp] " + ex.message);
  }	
} 

function stringLTrim (s) {
  if (s == null) return null;

  var i;
  for (i = 0; i < s.length; i++)
    if (s.charAt (i) != ' '&& s.charAt (i) != '\n' && s.charAt (i) != '\t') break;
  if (i == s.length) return "";

  return s.substr (i);
}

function stringRTrim (s) {
  if (s == null) return null;

  var i;
  for (i = s.length - 1; i >= 0; i--)
    if (s.charAt (i) != ' '&& s.charAt (i) != '\n' && s.charAt (i) != '\t') break;
  
  if (i < 0) return "";
  
  return s.substring (0, i + 1);
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
