/* common.js
  - Popup window control
  HTML: onclick="popup(this.href,this.target,500,600,0,1);return false;"
  Parameter order: url,target,width,height,scrollbars,resizable
--------------------------------------------------------- */
////////// popup
function popup(u,t,w,h,s,r) {
	param = '';
	if (w>0) param += 'width=' + w + ',';
	if (h>0) param += 'height=' + h + ',';
	if (!t) t = '_blank';
	param += 'scrollbars=' + s + ',resizable=' + r;
	popwin = window.open(u,t,param);
	popwin.focus();
}