/* load.js
  - Loading order
--------------------------------------------------------- */
// domready
window.addEvent('domready', function() {
	////////// parts
	if (bindobj.printstate) Bindprint.control();
	else Bindprint.set();
	
	//Textsize.start();
//	Bindmenu.set();
	
	////////// footer for IE
	//if (window.ie) Bindfooter.set();
	
//	if (bindobj.ie60) clearpng.fix();
	
	////////// blockeditor
	if (bindobj.isLocal && !bindobj.ie52) BindApp.onload();
	
	////////// fx
	if (!bindobj.printstate) initFx();
	
});

// onload
window.addEvent('load', function() {
	////////// for legacy browser
	legacyCheck();
	
	////////// clear png for ie6
//	if (bindobj.ie60) clearpng.fix();
	
	////////// footer for Sarari or Firefox
	//if (window.attachEvent) Bindfooter.set();
	Bindfooter.set();
	
});
