/*
	BiNDMovie
	08/11/05
*/
var BiNDMovie = new Class({
	movies: [],
	sizes: [],
	movieObj: null,
	initialize: function(anc, options){
		this.options = $extend({
			resizeDuration: 200,
			resizeTransition: false,	// default transition
			initialWidth: 200,
			initialHeight: 30,
			showCounter: true
		}, options || {});
		
		this.addAnchor(anc);
		
		this.eventKeyDown = this.keyboardListener.bindAsEventListener(this);
		
		this.bindbox = new Element('div', {'id': 'bindbox', 'styles': {
			'width': this.options.initialWidth, 'height': this.options.initialHeight, 'marginLeft': -(this.options.initialWidth/2),
			'display': 'none'}}).injectInside(document.body);
		new Element('div', {'class': 'tl'}).injectInside(this.bindbox);
		new Element('div', {'class': 'tr'}).injectInside(this.bindbox);
		new Element('div', {'class': 'tc'}).injectInside(this.bindbox);
		
		var mm = new Element('div', {'class': 'mm'}).injectInside(this.bindbox);
		new Element('div', {'class': 'ml'}).injectInside(mm);
		new Element('div', {'class': 'mr'}).injectInside(mm);
		
		var mc = new Element('div', {'class': 'mc'}).injectInside(mm);
		
		new Element('div', {'class': 'bl'}).injectInside(this.bindbox);
		new Element('div', {'class': 'br'}).injectInside(this.bindbox);
		new Element('div', {'class': 'bc'}).injectInside(this.bindbox);
		
		this.image = new Element('div', {'id': 'bindbox_image'}).injectInside(mc);
		
		this.comment = new Element('div', {'id': 'bindbox_comment'}).injectInside(mc);
		
		this.lineDiv = new Element('div', {'id': 'bindbox_line', 'styles': {'display':'none'}}).injectInside(mc);
		
		this.controlDiv = new Element('div', {'id': 'bindbox_control', 'styles': {'display':'none'}}).injectInside(mc);
		var clz = new Element('div', {'id': 'bindbox_close'}).injectInside(this.controlDiv);
		clz.onclick = this.close.bind(this);
		
		var nextEffect = this.nextEffect.bind(this);
		this.fx = {
			resize: this.bindbox.effects($extend({duration: this.options.resizeDuration, onComplete: nextEffect},
					this.options.resizeTransition ? {transition: this.options.resizeTransition} : {})),
			close: this.bindbox.effects($extend({duration: this.options.resizeDuration, onComplete: this.closeEnd.bind(this)},
					this.options.resizeTransition ? {transition: this.options.resizeTransition} : {}))
		};
	},
	
	addAnchor: function(anc){
		anc = $(anc);
		anc.onclick = this.click.pass(anc, this);
		this.movies.push(anc);
		var sz = anc.getProperty("rel");
		var pair = sz.split(',');
		this.sizes.push({width: Number(pair[0]), height: Number(pair[1])});
	},
	
	click: function(link){
		var anc, sz;
		for (var i=0; i<this.movies.length; i++) {
			var a = this.movies[i];
			if (a.href == link) {
				var dim = a.getCoordinates();
				if (this.movieObj==null) {
					this.top = dim.top - 34;
					this.left = dim.left - 34;
				}
				this.anchorHeight = dim.height;
				this.anchorWidth = dim.width;
				this.anchorTop = dim.top - 16;
				this.anchorLeft = dim.left - 16;
				anc = a;
				sz = this.sizes[i];
				break;
			}
		}
		
		this.removeMovie();
		this.setup(true);
		
		this.movie = anc;
		this.movieWidth = sz.width;
		this.movieHeight = sz.height;
		
		this.bindbox.setStyles({top: this.top, marginLeft:this.left, display: ''});
		return this.dispMovie();
	},
	
	setup: function(open){
		var elements = $A(document.getElementsByTagName('object'));
		elements.extend(document.getElementsByTagName(window.ie ? 'select' : 'embed'));
		elements.each(function(el){
			if (open && el.style.visibility != 'hidden') el.lbBackupStyle = el.style.visibility;
			el.style.visibility = open ? 'hidden' : el.lbBackupStyle;
		});
		var fn = open ? 'addEvent' : 'removeEvent';
		this.step = 0;
	},
	
	keyboardListener: function(event){
		switch (event.keyCode){
			case 27: case 88: case 67: this.close();
		}
	},
	
	dispMovie: function(){
		this.step = 1;
		this.image.className = 'lbLoading';
		
		this.nextEffect.bind(this)
		this.nextEffect();
		
		return false;
	},
	
	nextEffect: function(){
		switch (this.step++){
		case 1:
			this.image.className = '';
			
			if (this.bindbox.clientHeight != this.movieHeight){
				this.fx.resize.start({height: this.movieHeight + 68, width: this.movieWidth + 68,
					marginLeft: (window.getWidth() - (this.movieWidth + 68)) / 2,
					top: window.getScrollTop() + (window.getHeight() / 15)});
				break;
			}
			this.step++;
			
		case 2:
			this.movieObj = this.createObj();
			this.controlDiv.style.display = '';
			this.lineDiv.style.display = '';
			this.step = 0;
		}
	},
	
	closeEffect: function(){
		this.controlDiv.style.display = 'none';
		this.lineDiv.style.display = 'none';
		this.fx.close.start({height: this.anchorHeight, width: this.anchorWidth,
			marginLeft: this.anchorLeft,
			top: this.anchorTop});
	},
	
	closeEnd: function() {
		this.bindbox.style.display = 'none';
		this.bindbox.setStyles({'width': this.options.initialWidth, 'height': this.options.initialHeight});
	},
	
	createObj: function(){
		var t = this.movie.getProperty("movtype");
		var p = this.getMovieParams(t);
		var movieId = getNextMovieId();
		var outer = document.createElement('object');
		
		outer.setAttribute('id', movieId);
		outer.setAttribute('classid', p.cls);
		outer.setAttribute('width', this.movieWidth);
		outer.setAttribute('height', this.movieHeight + 16);
		if (p.codebase && p.codebase.length > 0) outer.setAttribute('codebase', p.codebase);
		addParameter(outer, "src", this.movie.href);
		
		if (window.gecko) {
			var e = document.createElement('embed');
			e.setAttribute('type', p.tp);
			e.setAttribute('src', this.movie.href);
			e.setAttribute('width', this.movieWidth);
			e.setAttribute('height', this.movieHeight + 16);
			outer.appendChild(e);
			
		} else if (!window.ie) {
			var e = document.createElement('object');
			e.setAttribute('type', p.tp);
			e.setAttribute('data', this.movie.href);
			e.setAttribute('id', movieId + 'Inner');
			e.setAttribute('width', this.movieWidth);
			e.setAttribute('height', this.movieHeight + 16);
			addParameter(e, 'autoplay', 'true');
			addParameter(e, 'controller', 'true');
			addParameter(e, 'cache', 'true');
			addParameter(e, 'saveembedtags', true);
			
			outer.appendChild(e);
			outer.inner = e;
		}
		
		addParameter(outer, 'autoplay', 'true');
		addParameter(outer, 'controller', 'true');
		addParameter(outer, 'cache', 'true');
		addParameter(outer, 'saveembedtags', true);
		
		if (t == 'rm') {
			addParameter(e, 'controls', 'ImageWindow');
			addParameter(outer, 'controls', 'ImageWindow');
			addParameter(e, 'autostart', 'true');
			addParameter(outer, 'autostart', 'true');
		}
		
		if (!window.ie) {
			this.image.appendChild(outer);
		} else {
			var markup = "";
			markup = outer.outerHTML.replace('</OBJECT>', '');
			for (var i = 0; i < outer.childNodes.length; i++) {
				markup += outer.childNodes[i].outerHTML;
			}
			markup += '</OBJECT>';
			this.image.innerHTML = markup;
		}
		
		return outer;
	},
	
	close: function(e){
		if (this.step < 0) return;
		this.step = -1;
		for (var f in this.fx) this.fx[f].stop();
		
		this.removeMovie();
		
		this.closeEffect.bind(this);
		this.closeEffect();
		
		this.setup(false);
		
		return false;
	},
	
	removeMovie: function() {
		if (this.movieObj != null) {
			if (window.ie) {
				this.movieObj.style.display = 'none';		// for ie6.
			} else {
				this.movieObj.style.visibility = 'hidden';
			}
			
			if (typeof(this.movieObj.Stop)=="function") {
				this.movieObj.Stop();
			} else if (typeof(this.movieObj.pause)=="function") {
				this.movieObj.pause();
			} else if (this.movieObj.inner) {
				if (typeof(this.movieObj.inner.Stop)=="function") {
					try {
						this.movieObj.inner.Stop();
					} catch(e) {}
				} else if (typeof(this.movieObj.inner.pause)=="function") {
					try {
						this.movieObj.inner.pause();
					} catch(e) {}
				}
			}
			
			this.movieObj = null;
			
			this.image.innerHTML = '';
			
		}
	},
	
	getMovieParams: function(t) {
		var cls, cb, tp, pg;
		if (t=='mov') {
			cls = 'clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B';
			cb = 'http://www.apple.com/qtactivex/qtplugin.cab#version=7,3,0,0';
			tp = 'video/quicktime';
			pg = 'http://www.apple.com/quicktime/download/';
			
		} else if (t=='swf') {
			cls = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
			cb = 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,45,0';
			tp = 'application/x-shockwave-flash';
			pg = 'http://www.macromedia.com/go/getflashplayer';
			
		} else if (t=='asf') {
			cls = 'clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95';
			cb = 'http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,5,715';
			tp = 'application/x-mplayer2';
			pg = 'http://www.microsoft.com/isapi/redir.dll?prd=windows&sbp=mediaplayer&ar=Media&sba=Plugin&';
			
		} else if (t=='wmv') {
			if (window.webkit) {
				cls = 'clsid:6BF52A52-394A-11d3-B153-00C04F79FAA6';
				cb = '';
				tp = 'video/x-ms-wmv';
				pg = '';
			} else {
				cls = 'clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95';
				cb = 'http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,5,715';
				tp = 'application/x-mplayer2';
				pg = 'http://www.microsoft.com/isapi/redir.dll?prd=windows&sbp=mediaplayer&ar=Media&sba=Plugin&';
			}
			
		} else if (t=='rm') {
			cls = 'clsid:CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA';
			cb = '';
			tp = 'audio/x-pn-realaudio-plugin';
			pg = 'http://www.real.com/player/index.html';
			
		}
		
		return {'cls':cls, 'codebase':cb, 'tp':tp, 'pluginspage':pg};
	}
	
});




/*
	bindmovie functions
*/
var bindMovieNum = 0;

function bindmovie() {
	if (bindobj.printstate) return;	//*** modified by sato

	var t = arguments[0];
	var f = arguments[1];
	var w = arguments[2];
	var h = arguments[3];
	var at = arguments[4];
	var dl = arguments[5];
	var pu = arguments[6];
	var cp = arguments[7];
	
	if (f=='') return;
	
	if (t=="mov") {
		writeQt(t, f, w, h, at, dl, pu, cp);
		
	} else if (t=="swf") {
		writeSwf(t, f, w, h, at, dl, pu, cp);
		
	} else if (t=="wmv" || t=="asf") {
		writeWmv(t, f, w, h, at, dl, pu, cp);
		
	} else if (t=="rm") {
		writeReal(t, f, w, h, at, dl, pu, cp);
		
	} else if (t=="flv") {
		alert("flvにはプレイヤーswfが必要です！");
	}
}

function writeQt(t, f, w, h, at, dl, pu, cp) {
	if (pu == "0") {
		writeDirectQt(f, w, h, at, dl);
	} else {
		writeEnlergeQt(t, f, w, h, at, dl, cp);
	}
}

function writeEnlergeQt(t, f, w, h, at, dl, cp) {
	writeMovieButton(t, f, w, h, cp);
}

function writeDirectQt(f, w, h, at, dl) {
	var buf = '';
	buf = '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B"'
		+ ' codebase="http://www.apple.com/qtactivex/qtplugin.cab#version=7,3,0,0"';
	
	var ht = new Number(h) + 16;
	
	buf += ' width="' + w + '"';
	buf += ' height="' + ht + '"';
	buf += '>';
	
	buf += '<param name="src" value="' + f + '" />';
	
	if (at=="1")
		buf += '<param name="autoplay" value="true" />';
	else
		buf += '<param name="autoplay" value="false" />';
	
	buf += '<embed src="' + f + '" type="video/quicktime"'
	buf += ' width="' + w + '"';
	buf += ' height="' + ht + '"';
	
	if (at=="1")
		buf += ' autoplay="true"';
	else
		buf += ' autoplay="false"';
	
	buf += '></embed>';
	
	buf += '</object>';
	
	if (dl=="1") {
		buf += '<p><a href="' + f + '">ダウンロード</a></p>';
	}
	
	document.write(buf);
}

function writeSwf(t, f, w, h, at, dl, pu, cp) {
	if (pu == "0") {
		writeDirectSwf(f, w, h, at, dl);
	} else {
		writeEnlergeSwf(t, f, w, h, at, dl, cp);
	}
}

function writeEnlergeSwf(t, f, w, h, at, dl, cp) {
	writeMovieButton(t, f, w, h, cp);
}

function writeDirectSwf(f, w, h, at, dl) {
	var mvId = getNextMovieId();
	var buf = '';
	
	if (window.ie) {
		buf = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"'
			+ ' codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,45,0"';
		
		buf += ' id="' + mvId + '"';
		buf += ' width="' + w + '"';
		buf += ' height="' + h + '"';
		buf += '>';
		
		buf += '<param name="src" value="' + f + '" />';
		
		if (at=="1")
			buf += '<param name="play" value="true" />';
		else
			buf += '<param name="play" value="false" />';
		
		buf += '<param name="wmode" value="transparent" />';
		buf += '</object>';
		
	} else {
		buf = '<embed src="' + f + '" type="application/x-shockwave-flash"'
		buf += ' id="' + mvId + '"';
		buf += ' width="' + w + '"';
		buf += ' height="' + h + '"';
		
		if (at=="1")
			buf += ' play="true"';
		else
			buf += ' play="false"';
		
		buf += ' wmode="transparent"';
		buf += '></embed>';
	
	}
	
	
	if (dl=="1") {
		buf += '<p><a href="' + f + '">ダウンロード</a></p>';
	}
	
	document.write(buf);
}

function writeWmv(t, f, w, h, at, dl, pu, cp) {
	if (pu == "0") {
		writeDirectWmv(f, w, h, at, dl);
	} else {
		writeEnlergeWmv(t, f, w, h, at, dl, cp);
	}
}

function writeEnlergeWmv(t, f, w, h, at, dl, cp) {
	writeMovieButton(t, f, w, h, cp);
}

function writeDirectWmv(f, w, h, at, dl) {
	var mvId = getNextMovieId();
	var buf = '';
	buf = '<object classid="clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95"'
		+ ' codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,5,715"';
	
	buf += ' id="' + mvId + '"';
	buf += ' width="' + w + '"';
	h = Number(h) + 60;
	buf += ' height="' + h + '"';
	buf += '>';
	
	buf += '<param name="src" value="' + f + '" />';
	
	if (at=="1")
		buf += '<param name="autoplay" value="true" />';
	else
		buf += '<param name="autoplay" value="false" />';
	
	buf += '<embed src="' + f + '" type="application/x-mplayer2"'
	buf += ' id="' + mvId + '"';
	buf += ' width="' + w + '"';
	buf += ' height="' + h + '"';
	
	if (at=="1")
		buf += ' autoplay="true"';
	else
		buf += ' autoplay="false"';
	
	buf += '></embed>';
	
	buf += '</object>';
	
	if (dl=="1") {
		buf += '<p><a href="' + f + '">ダウンロード</a></p>';
	}
	
	document.write(buf);
}

function writeReal(t, f, w, h, at, dl, pu, cp) {
	if (pu == "0") {
		writeDirectReal(f, w, h, at, dl);
	} else {
		writeEnlergeReal(t, f, w, h, at, dl, cp);
	}
}

function writeEnlergeReal(t, f, w, h, at, dl, cp) {
	writeMovieButton(t, f, w, h, cp);
}

function writeDirectReal(f, w, h, at, dl) {
	var hh = Number(h) + 36;
	var mvId = getNextMovieId();
	var buf = '';
	buf = '<object classid="clsid:CFCDAA03-8BE4-11CF-B84B-0020AFBBCCFA"';
	
	buf += ' id="' + mvId + '"';
	buf += ' width="' + w + '"';
	buf += ' height="' + h + '"';
	buf += '>';
	
	buf += '<param name="src" value="' + f + '" />';
	buf += '<param name="controls" value="ImageWindow" />';
	
	if (at=="1")
		buf += '<param name="autoplay" value="true" />';
	else
		buf += '<param name="autoplay" value="false" />';
	
	buf += '<embed src="' + f + '" type="audio/x-pn-realaudio-plugin"'
	buf += ' id="' + mvId + '"';
	buf += ' width="' + w + '"';
	buf += ' height="' + h + '"';
	buf += 'controls="ImageWindow"';	// <--> ControlPanel
	
	if (at=="1")
		buf += ' autoplay="true"';
	else
		buf += ' autoplay="false"';
	
	buf += '></embed>';
	
	buf += '</object>';
	
	if (dl=="1") {
		buf += '<p><a href="' + f + '">ダウンロード</a></p>';
	}
	
	document.write(buf);
}



/*
	ムービーボタン！
*/
function writeMovieButton(t, f, w, h, cp) {
	var buf = '';
	var mvId = getNextMovieId();
	buf = '<a href="' + f + '" class="movieButton"' +
		' id="' + mvId + '"' +
		' movtype="' + t + '"' +
		' rel="' + w + ',' + h + '">' +
		'<span>' + cp + '</span></a>';
	document.write(buf);
}

function getNextMovieId() {
	bindMovieNum++;
	return 'bindMovie' + bindMovieNum;
}

function idflash() {
	var f = arguments[0];
	var w = arguments[1];
	var h = arguments[2];
	var bg = arguments[3];
	
	var ua = navigator.userAgent;
	var tm = (new Date()).getTime();
	var idbase = f.substring(0, f.lastIndexOf("/")+1);
	
	var buf = '';
	
	buf = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"'
		+ ' codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,45,0"';
	
	buf += ' id="idswf"';
	buf += ' width="' + w + '"';
	buf += ' height="' + h + '"';
	buf += '>';
	
	buf += '<param name="movie" value="' + f + "&tm=" + tm + '" />';
	buf += '<param name="base" value="." />';
	
	buf += '<param name="bgcolor" value="' + bg + '" />';
	buf += '<param name="wmode" value="transparent" />';
//	buf += "<param name=\"FlashVars\" value=\"b='" + ua + "'&idbase='" + idbase + "'\"/>";
	buf += "<param name=\"FlashVars\" value=\"b=" + ua + "&idbase=" + idbase + "\"/>";
	
	buf += '<embed src="' + f + "&tm=" + tm + '" type="application/x-shockwave-flash"'
	buf += ' id="idswf"';
	buf += ' width="' + w + '"';
	buf += ' height="' + h + '"';
	buf += ' base="."';
	buf += ' wmode="transparent"';
	
	buf += ' bgcolor="' + bg + '"';
//	buf += " FlashVars=\"b='" + ua + "'&idbase='" + idbase + "'\"";
	buf += " FlashVars=\"b=" + ua + "&idbase=" + idbase + "\"";
	
	buf += '></embed>';
	
	buf += '</object>';
	
	document.write(buf);

}

function addParameter(parent,name,value){
	if(!parent){
		return;
	}

	var param=document.createElement('param');
	param.setAttribute('value',value);
	param.setAttribute('name',name);
	parent.appendChild(param);
}
