/* script.js
  - Setting global variables - These variables are used in other scripts as well.
  - Selecting js files to be loaded - For app use.
--------------------------------------------------------- */
////////// global variables
var bindobj = new Object();
bindobj.ua = navigator.userAgent.toLowerCase();
bindobj.win = bindobj.ua.indexOf('windows')>-1 || bindobj.ua.indexOf('win32')>-1 ? true : false;
bindobj.vista = bindobj.win && bindobj.ua.indexOf('nt 6.0')>-1 ? true : false;
bindobj.xp = bindobj.win && (bindobj.ua.indexOf('nt 5.1')>-1 || bindobj.ua.indexOf('windows xp')>0) ? true : false;
bindobj.mac = bindobj.ua.indexOf('macintosh')>-1 || bindobj.ua.indexOf('mac_power')>-1 ? true : false;
bindobj.opr = bindobj.ua.indexOf('opera')>-1 ? true : false;
bindobj.ie = bindobj.ua.indexOf('msie')>-1 && !bindobj.opr ? true : false;
bindobj.ffx = bindobj.ua.indexOf('firefox')>0 ? true : false;
bindobj.ie80 = bindobj.ua.indexOf('msie 8')>0 && !bindobj.opr ? true : false;
bindobj.ie70 = bindobj.ua.indexOf('msie 7')>0 && !bindobj.opr ? true : false;
bindobj.ie60 = bindobj.ua.indexOf('msie 6.0')>0 && !bindobj.opr && bindobj.ua.indexOf('safari')<0 ? true : false;
bindobj.ie55 = bindobj.ua.indexOf('msie 5')>0 && !bindobj.opr ? true : false;
bindobj.ie52 = bindobj.ua.indexOf('msie 5')>0 && bindobj.mac ? true : false;
bindobj.ie40 = bindobj.ua.indexOf('msie 4')>0 ? true : false;
bindobj.wff = bindobj.ffx && bindobj.win ? true : false;
bindobj.mff = bindobj.ffx && bindobj.mac ? true : false;
bindobj.ff1 = bindobj.ua.indexOf('firefox/1.0')>0 ? true : false;
bindobj.sf1 = bindobj.ua.indexOf('safari/85')>0 ? true : false;
bindobj.msf = (bindobj.ua.indexOf('safari')>0 || bindobj.ua.indexOf('applewebkit')>0) && bindobj.mac ? true : false;
bindobj.wsf = bindobj.ua.indexOf('safari')>0 && bindobj.win ? true : false;
bindobj.op8 = bindobj.ua.indexOf('opera/8')>0 || bindobj.ua.indexOf('opera 8')>0 ? true : false;
bindobj.op7 = bindobj.ua.indexOf('opera/7')>0 || bindobj.ua.indexOf('opera 7')>0 ? true : false;
bindobj.op6 = bindobj.ua.indexOf('opera 6')>0 ? true : false;
bindobj.ns7 = bindobj.ua.indexOf('netscape/7')>0 ? true : false;
bindobj.ns6 = bindobj.ua.indexOf('netscape6')>0 ? true : false;

bindobj.printstate = window.location.search.indexOf('printstate=true')>-1 ? true : false;
bindobj.disablecss = function() {
	document.getElementById('theme-css').disabled = true;
	document.getElementById('page-css').disabled = true;
};
bindobj.isLegacy = false;
bindobj.isLocal = false;
if (document.URL.indexOf('file://')==0 && location.search.indexOf('bindapp=1')>-1) bindobj.isLocal = true;
bindobj.level = '';
bindobj.textsize = '';
bindobj.theme = '';
bindobj.font = '';
bindobj.fontsize = '';

param = document.getElementById('script-js').src.replace(/^.*\?(.*)$/g,'$1');
param = param.split(',');
for (i=0;i<param.length;i++) {
	kv = param[i].split('=');
	id = kv[0];
	val = kv[1];
	if (id=='l') eval('bindobj.level = ' + val);
	if (id=='s') eval('bindobj.textsize = ' + val);
	if (id=='t') eval('bindobj.theme = "' + val + '"');
	if (id=='f') eval('bindobj.font = "' + val + '"');
	if (id=='fs') eval('bindobj.fontsize = "' + val + '"');
}
bindobj.dir = '';
for (i=0;i<bindobj.level;i++) bindobj.dir += '../';


/* include view.js start */
/* view.js
  - Browser Optimization
  - Print setting - Checking if the page is for print.
  - Legacy browser view - Setting for IE5.5, IE5.2, Netscape 6, Netscape 7, Opera 8, Safari 1.03.
    Cuts the theme style off from default setting.
--------------------------------------------------------- */
var optionscss = document.getElementById('options-css') ? true : false;

////////// browser optimization
////////// legacy browser view
if (bindobj.ie52 || bindobj.ie55 || bindobj.ns7 || bindobj.ff1 || bindobj.op8) {
	bindobj.disablecss();
	bindobj.isLegacy = true;
	///// options
	if (optionscss) document.getElementById('options-css').href = bindobj.dir + '_module/layout/legacy.css';
	else document.write('<link rel="stylesheet" type="text/css" href="' + bindobj.dir + '_module/layout/legacy.css" />');
	
////////// modern browser view
} else {
	var optcss = bindobj.dir + '_module/layout/';
	if (bindobj.ie70) {
		if (bindobj.vista) optcss += '_ie7v.css';
		else optcss += '_ie7x.css';
	}
	else if (bindobj.ie60) optcss += '_ie6.css';
	else if (bindobj.msf) optcss += '_msf.css';
	else if (bindobj.mff) optcss += '_mff.css';
	else if (bindobj.wff) {
		if (bindobj.vista) optcss += '_wffv.css';
		else optcss += '_wffx.css';
	}
	else if (bindobj.mac) optcss += '_mac.css';
	else optcss += '_else.css';
	if (optionscss) document.getElementById('options-css').href = optcss;
	else addCSS(optcss);
	
	///// font
	if (bindobj.font != '' && bindobj.fontsize != '') {
		
		///// directory
		var fcss = bindobj.dir + '_module/layout/font/';
		switch (bindobj.font)	{
			case 'm': fcss += 'mincho/'; break;
			case 'g': fcss += 'gothic/'; break;
		}
		switch (bindobj.fontsize) {
			case 'l': fcss += 'l/'; break;
			case 'm': fcss += 'm/'; break;
			case 's': fcss += 's/'; break;
		}
		
		///// filename
		if (bindobj.ie70) {
			if (bindobj.vista) fcss += '_ie7v.css';
			else fcss += '_ie7x.css';
		}
		else if (bindobj.ie60) fcss += '_ie6.css';
		else if (bindobj.msf) fcss += '_msf.css';
		else if (bindobj.mff) fcss += '_mff.css';
		else if (bindobj.wff) {
			if (bindobj.vista) fcss += '_wffv.css';
			else fcss += '_wffx.css';
		}
		else if (bindobj.mac) fcss += '_mac.css';
		else fcss += '_else.css';
		
		addCSS(fcss);
	}
}

////////// print setting
if (bindobj.printstate) {
	bindobj.disablecss();
	startcss = '<style type="text/css"><!-- ';
	endcss = ' --></style>';
	printcss = '';
	if (bindobj.ffx) printcss += startcss + '#area-print * { font-weight:normal !important;}' + endcss;
	if (bindobj.ie60) printcss += '<link rel="stylesheet" type="text/css" href="' + bindobj.dir + '_module/layout/printlayout-ie6.css" />';
	document.write(printcss);
}

function legacyCheck() {
	if (bindobj.ns6 || bindobj.op7 || bindobj.op6) {
		bindobj.disablecss();
		bindobj.isLegacy = true;
	}
	
	if (bindobj.ie52 || bindobj.ie40) {
		bindobj.disablecss();
		bindobj.isLegacy = true;
		pick = function(e) {
			if (e.className.indexOf(' ')) {
				cN = e.className.split(' ');
				e.className = cN[0];
			}
		};
		erace = function() {
			divs = document.getElementsByTagName('div');
			for (i=0;i<divs.length;i++) pick(divs[i]);
		};
		erace();
	}
}
/* include view.js end */

function addCSS(csssrc) {
	document.write('<link rel="stylesheet" type="text/css" href="' + csssrc + '" />');
	if (bindobj.ie60) document.write('<link rel="stylesheet" type="text/css" href="' + bindobj.dir + '_module/layout/printlayout-ie6.css" media="print" />');
}
function addJS(src, id) {
	document.write('<script type="text/javascript" src="' + src + '" charset="utf-8" id="' + id + '"></script>');
}

////////// load js files
bindobj.js = new Array();
if (!bindobj.ie52) {
	bindobj.js = [
		['mootools.js','mootools-js'],
		['png.js','png-js'],['movie.js','movie-js'],['common.js','common-js'],['parts.js','parts-js'],['fx.js','fx-js']];
	if (bindobj.isLocal) bindobj.js.push(['blockeditor/blockeditor.js','blockeditor-js']); ///Works only on local.
	bindobj.js.push(['load.js','load-js']);
	for (i=0;i<bindobj.js.length;i++) addJS(bindobj.dir + '_module/js/' + bindobj.js[i][0], bindobj.js[i][1]);
} else {
	legacyCheck();
}
