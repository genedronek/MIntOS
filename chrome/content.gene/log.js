/*
	Log File Management (log.js)

        Dong Zhou
*/

var logfile = null;

function log (txt) {
	if (logfile == null) {
		logfile = openFile (LOG_FILE);
		//alert("logfile open returned " + logfile );
		if (!logfile.exists()) createFile (logfile);
	}
	var fos = getOutputStream (logfile, 'a');
	fos.write (txt, txt.length);
	fos.close();
}

function logline (txt) {
	//alert("logline " + txt);
	if (logfile == null) {
		logfile = openFile (LOG_FILE);
		//alert("logfile open 2returned " + logfile );
		if (!logfile.exists()) createFile (logfile);
	}
	var fos = getOutputStream (logfile, 'a');
	var ret = fos.write (txt, txt.length);
	//alert("fos.write returns " + ret);
	fos.write ("\n", 1);
	fos.close();
	dump(9999);
}

function clearLog () {
	if (logfile == null) {
		logfile = openFile (LOG_FILE);
		//alert("logfile open 3returned " + logfile );
		
	} 
	if (logfile.exists()) logfile.remove(false); 
	logfile = null;
}
