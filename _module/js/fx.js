/*
	BiNDFx v2.1
	090321
	require mootools v1.11 (http://mootools.net/)
*/
var BiNDFx = {
	version : 2.0,
	debug : false
};

/*
	BiNDZoom
	This code based on Slimbox
	by Christophe Beyls (http://www.digitalia.be) - MIT-style license.
*/
var BiNDZoom = new Class({
	groupCount: 0,
	initialize: function(ancs, caps, options){
		this.options = $extend({
			resizeDuration: 350,
			resizeTransition: false,	// default transition
			initialWidth: 250,
			initialHeight: 250,
			showCounter: true
		}, options || {});
		
		this.imageWidth = 0;
		this.imageHeight = 0;
		this.firstClick = true;
		
		this.addSet(ancs, caps);
		
		this.eventKeyDown = this.keyboardListener.bindAsEventListener(this);
		this.eventPosition = this.position.bind(this);

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
		
		this.image = new Element('div', {'id': 'bindbox_image', 'height': this.options.initialHeight,
			'styles':{'text-align':'center', 'margin-left':'auto', 'margin-right':'auto'}}).injectInside(mc);
		this.image.onclick = this.close.bind(this);
		
		this.comment = new Element('div', {'id': 'bindbox_comment', 'styles': {'visibility':'hidden'}}).injectInside(mc);
		
		this.lineDiv = new Element('div', {'id': 'bindbox_line', 'styles': {'visibility':'hidden'}}).injectInside(mc);
		
		this.controlDiv = new Element('div', {'id': 'bindbox_control', 'styles': {'visibility':'hidden'}}).injectInside(mc);
		
		this.prevLink = new Element('div', {'id': 'bindbox_back'}).injectInside(this.controlDiv);
		this.nextLink = new Element('div', {'id': 'bindbox_next'}).injectInside(this.controlDiv);
		this.prevLink.onclick = this.previous.bind(this);
		this.nextLink.onclick = this.next.bind(this);
		
		this.number = new Element('div', {'id': 'bindbox_num', 'styles': {'visibility':'hidden'}}).injectInside(this.controlDiv);
		
		var nextEffect = this.nextEffect.bind(this);
		this.fx = {
			resize: {},
			image: this.image.effect('opacity', {duration: 200, onComplete: nextEffect}),
			close: this.bindbox.effects($extend({duration: this.options.resizeDuration, onComplete: this.closeEnd.bind(this)},
					this.options.resizeTransition ? {transition: this.options.resizeTransition} : {}))
		};
		
		this.preloadPrev = new Image();
		this.preloadNext = new Image();
	},
	
	addSet: function(ancs, caps) {
		ancs = $A(ancs);
		caps = $A(caps);
		
		this.groupCount++;
		var groupName = "bindzoom-" + this.groupCount;
		
		$each(ancs, function(el, i) {
			if (el.hasClass("bindzoom")) {
				el.onclick = this.click.pass(el, this);
				el.setAttribute('rel', groupName);
				
				if (!this.anchors) this.anchors = [];
				this.anchors.push(el);
				
				if (!this.captions) this.captions = [];
				this.captions.push(caps[i]);
			}
		}, this);
		
	},
	
	click: function(link){
		var j, imageNum, images = [];
		var cnt = 0;
		this.anchors.each(function(el, i) {
			if (el.rel == link.rel){
				images.push([el, this.captions[i], el.rel]);
				if (el == link) imageNum = cnt;
				cnt++;
			}
		}, this);
		
		groupName = link.rel;
		
		if (typeof(this.currentGroup) != 'undefined'
			&& this.currentGroup == groupName
			&& typeof(this.activeImage) != 'undefined'
			&& this.activeImage == imageNum) {
			return false;
		}
		
		if (this.currentGroup != groupName) {
			this.images = images;
		}
		
		this.currentGroup = groupName;
		
		if (this.firstClick)
			return this.open(images, imageNum);
		else
			return this.changeImage(imageNum);
	},

	show: function(url, title){
		return this.open([[url, title]], 0);
	},

	open: function(images, imageNum){
		this.images = images;
		this.position();
		this.setup(true);
		
		var img = this.images[imageNum][0];
		
		var dim = img.getCoordinates();
		this.top = dim.top - 34;
		this.left = dim.left - 34;
		
		this.anchorHeight = dim.height + 64;
		this.anchorWidth = dim.width + 64;
		this.anchorTop = dim.top - 34;
		this.anchorLeft = dim.left - 34;
		
		this.bindbox.setStyles({top: this.top, marginLeft:this.left,
			height: this.anchorHeight, width:this.anchorWidth,
			display: ''});
		
		return this.changeImage(imageNum);
	},

	position: function(){
	},

	setup: function(open){
		var elements = $A(document.getElementsByTagName('object'));
		elements.extend(document.getElementsByTagName(window.ie ? 'select' : 'embed'));
		elements.each(function(el){
			if (open && el.style.visibility != 'hidden') el.lbBackupStyle = el.style.visibility;
			el.style.visibility = open ? 'hidden' : el.lbBackupStyle;
		});
		var fn = open ? 'addEvent' : 'removeEvent';
		window[fn]('scroll', this.eventPosition)[fn]('resize', this.eventPosition);
		document[fn]('keydown', this.eventKeyDown);
		this.step = 0;
	},

	keyboardListener: function(event){
		switch (event.keyCode){
			case 27: case 88: case 67: this.close(); break;
			case 37: case 80: this.previous(); break;	
			case 39: case 78: this.next();
		}
	},

	previous: function(){
		return this.changeImage(this.activeImage-1);
	},

	next: function(){
		return this.changeImage(this.activeImage+1);
	},

	changeImage: function(imageNum){
		if (this.step || (imageNum < 0) || (imageNum >= this.images.length)) return false;
		this.step = 1;
		this.activeImage = imageNum;
		
		this.prevLink.style.visibility = this.nextLink.style.visibility = 'hidden';
		if (this.firstClick) {
			this.firstClick = false;
		} else {
			this.fx.image.hide();
		}
		this.image.className = 'lbLoading';
		
		this.preload = new Image();
		this.preload.onload = this.nextEffect.bind(this);
		this.preload.src = (this.images[imageNum][0]).href;
		
		return false;
	},

	nextEffect: function(){
		switch (this.step++){
		case 1:
			this.image.className = '';
			
			var preWidth = this.imageWidth || 0;
			var preHeight = this.imageHeight || 0;
			this.imageWidth = this.preload.width;
			this.imageHeight = this.preload.height;
			if (this.imageWidth > document.body.offsetWidth - 50) {
				var rate = (document.body.offsetWidth - 50) / this.imageWidth;
				this.imageWidth = Math.round(this.imageWidth * rate);
				this.imageHeight = Math.round(this.imageHeight * rate);
			}
			
log('imageWidth:' + this.imageWidth + ' imageHeight:' + this.imageHeight);
			
			var img = $('imgContents');
			if (img) img.remove();
			img = new Element('img', {
				'id':'imgContents',
				'src':String(this.images[this.activeImage][0]),
				'styles':{
					'width': this.anchorWidth - 64,
					'height': this.anchorHeight - 64,
					'max-width':this.imageWidth, 'max-height':this.imageHeight}}).injectInside(this.image);
			
			this.comment.setHTML(this.images[this.activeImage][1] || '');
			var msg = (!this.options.showCounter || (this.images.length == 1)) ? '' :
				'Image '+(this.activeImage+1)+' of '+this.images.length + '<br />';
			msg += '<span id="bindbox_note"></span>';
			this.number.setHTML(msg);
			
			if (this.activeImage) this.preloadPrev.src = (this.images[this.activeImage-1][0]).href;
			if (this.activeImage != (this.images.length - 1)) this.preloadNext.src = (this.images[this.activeImage+1][0]).href;
			
			if (preWidth != this.imageWidth || preHeight != this.imageHeight) {
//			if (preWidth != this.imageWidth) {
				this.image.setStyles({
					'width' : this.anchorWidth - 64,
					'height' : this.anchorHeight - 64,
					'display' : ''
				});
				
				this.controlDiv.style.display = '';
				this.lineDiv.style.display = '';
				
				this.fx.resize = new Fx.Elements([this.bindbox, img, this.image],
					{duration: this.options.resizeDuration, onComplete: this.nextEffect.bind(this)});
				
				this.fx.resize.start({
					'0':{
						'height': this.imageHeight + 68,
						'width': this.imageWidth + 68,
						'marginLeft': (window.getScrollWidth() - (this.imageWidth + 68)) / 2,
						'top': window.getScrollTop() + (window.getHeight() / 15)
					},
					'1':{
						'height': [this.anchorHeight - 64, this.imageHeight],
						'width': [this.anchorWidth - 64, this.imageWidth]
					},
					'2':{
						'height': [this.anchorHeight - 64, this.imageHeight],
						'width': [this.anchorWidth - 64, this.imageWidth]
					}
				});
				
				break;
			}
			
			this.image.setStyles({
				'width' : this.imageWidth,
				'height' : this.imageHeight
			});
			
			img.setStyles({
				'width' : this.imageWidth,
				'height' : this.imageHeight
			});
			
			this.step++;
		case 2:
			if (!this.firstClick) {
				this.fx.image.start(1);
				break;
			}
		case 3:
			this.comment.style.visibility = 'visible';
			this.number.style.visibility = 'visible';
			this.controlDiv.style.visibility = 'visible';
			this.lineDiv.style.visibility = 'visible';
			if (this.activeImage) this.prevLink.style.visibility = '';
			if (this.activeImage != (this.images.length - 1)) this.nextLink.style.visibility = '';
			this.step = 0;
		}
	},
	
	closeEffect: function(){
		this.comment.style.visibility = 'hidden';
		this.number.style.visibility = 'hidden';
		this.number.innerHTML = '';
		this.lineDiv.style.display = 'none';
		this.controlDiv.style.display = 'none';
		this.image.style.display = 'none';
		this.fx.close.start({height: this.anchorHeight, width: this.anchorWidth,
			marginLeft: this.anchorLeft,
			top: this.anchorTop});
	},
	
	closeEnd: function() {
		this.bindbox.style.display = 'none';
		this.bindbox.setStyles({'width': this.options.initialWidth, 'height': this.options.initialHeight});
	},
	
	close: function(){
		if (this.step < 0) return;
		this.step = -1;
		if (this.preload){
			this.preload.onload = Class.empty;
			this.preload = null;
		}
		for (var f in this.fx) this.fx[f].stop();
		this.firstClick = true;
		this.imageWidth = 0;
		this.imageHeight = 0;
		this.activeImage = -1;
		this.currentGroup = '';
		
		this.setup.bind(this);
		this.setup(false);
		
		this.closeEffect.bind(this);
		this.closeEffect();
		
		return false;
	}
});


/*
Script: Accordion.js
	Contains <Accordion>

License:
	MIT-style license.
*/

/*
Class: Accordion
	The Accordion class creates a group of elements that are toggled when their handles are clicked. When one elements toggles in, the others toggles back.
	Inherits methods, properties, options and events from <Fx.Elements>.
	
Note:
	The Accordion requires an XHTML doctype.

Arguments:
	togglers - required, a collection of elements, the elements handlers that will be clickable.
	elements - required, a collection of elements the transitions will be applied to.
	options - optional, see options below, and <Fx.Base> options and events.

Options:
	show - integer, the Index of the element to show at start.
	display - integer, the Index of the element to show at start (with a transition). defaults to 0.
	fixedHeight - integer, if you want the elements to have a fixed height. defaults to false.
	fixedWidth - integer, if you want the elements to have a fixed width. defaults to false.
	height - boolean, will add a height transition to the accordion if true. defaults to true.
	opacity - boolean, will add an opacity transition to the accordion if true. defaults to true.
	width - boolean, will add a width transition to the accordion if true. defaults to false, css mastery is required to make this work!
	alwaysHide - boolean, will allow to hide all elements if true, instead of always keeping one element shown. defaults to false.
	
Events:
	onActive - function to execute when an element starts to show
	onBackground - function to execute when an element starts to hide
*/
var Accordion = Fx.Elements.extend({
	is1st: true,
	locked: false,
	
	options: {
		onActive: Class.empty,
		onBackground: Class.empty,
		display: 0,
		show: false,
		height: true,
		width: false,
		opacity: true,
		fixedHeight: false,
		fixedWidth: false,
		wait: false,
		alwaysHide: false,
		useMouseOver: false
	},

	initialize: function(){
		var options, togglers, elements, container;
		$each(arguments, function(argument, i){
			switch($type(argument)){
				case 'object': options = argument; break;
				case 'element': container = $(argument); break;
				default:
					var temp = $$(argument);
					if (!togglers) togglers = temp;
					else elements = temp;
			}
		});
		this.togglers = togglers || [];
		this.elements = elements || [];
		this.container = $(container);
		this.setOptions(options);
		this.previous = -1;
		if (this.options.alwaysHide) this.options.wait = true;
		if ($chk(this.options.show)){
			this.options.display = false;
			this.previous = this.options.show;
		}
		if (this.options.start){
			this.options.display = false;
			this.options.show = false;
		}
		this.effects = {};
		if (this.options.opacity) this.effects.opacity = 'fullOpacity';
		if (this.options.width) this.effects.width = this.options.fixedWidth ? 'fullWidth' : 'offsetWidth';
//		if (this.options.height) this.effects.height = this.options.fixedHeight ? 'fullHeight' :
//			(window.ie) ? 'originalHeight':'scrollHeight';
		if (this.options.height) this.effects.height = this.options.fixedHeight ? 'fullHeight' : 'scrollHeight';
		for (var i = 0, l = this.togglers.length; i < l; i++) this.addSection(this.togglers[i], this.elements[i]);
		this.elements.each(function(el, i){
			el.originalHeight = el.scrollHeight;
			
			if (window.ie7) {
				//setIE7CoreHeight(el, i, 8);
				setIE7CoreHeight(el, i, -1);
			}
			
			if (this.options.show === i){
				this.fireEvent('onActive', [this.togglers[i], el]);
			} else {
				for (var fx in this.effects) el.setStyle(fx, 0);
			}
		}, this);
		
		this.options.onComplete = function() {
			this.locked = false;
		};
		
		this.parent(this.elements);
		if ($chk(this.options.display)) this.display(this.options.display);
	},

	/*
	Property: addSection
		Dynamically adds a new section into the accordion at the specified position.

	Arguments:
		toggler - (dom element) the element that toggles the accordion section open.
		element - (dom element) the element that stretches open when the toggler is clicked.
		pos - (integer) the index where these objects are to be inserted within the accordion.
	*/

	addSection: function(toggler, element, pos){
		toggler = $(toggler);
		element = $(element);
		var test = this.togglers.contains(toggler);
		var len = this.togglers.length;
		this.togglers.include(toggler);
		this.elements.include(element);
		if (len && (!test || pos)){
			pos = $pick(pos, len - 1);
			toggler.injectBefore(this.togglers[pos]);
			element.injectAfter(toggler);
		} else if (this.container && !test){
			toggler.inject(this.container);
			element.inject(this.container);
		}
		var idx = this.togglers.indexOf(toggler);
		if (this.options.useMouseOver) {
			toggler.addEvent('mouseover', this.display.bind(this, idx));
		} else {
			toggler.addEvent('mouseup', this.display.bind(this, idx));
		}
		if (this.options.height) element.setStyles({'padding-top': 0, 'border-top': 'none', 'padding-bottom': 0, 'border-bottom': 'none'});
		if (this.options.width) element.setStyles({'padding-left': 0, 'border-left': 'none', 'padding-right': 0, 'border-right': 'none'});
		element.fullOpacity = 1;
		if (this.options.fixedWidth) element.fullWidth = this.options.fixedWidth;
		if (this.options.fixedHeight) element.fullHeight = this.options.fixedHeight;
		element.setStyle('overflow', 'hidden');
		if (!test){
			for (var fx in this.effects) element.setStyle(fx, 0);
		}
		return this;
	},

	/*
	Property: display
		Shows a specific section and hides all others. Useful when triggering an accordion from outside.

	Arguments:
		index - integer, the index of the item to show, or the actual element to show.
	*/

	display: function(index){
		if (this.locked) return;
		index = ($type(index) == 'element') ? this.elements.indexOf(index) : index;
		if ((this.timer && this.options.wait) || (index === this.previous && !this.options.alwaysHide)) return this;
		this.previous = index;
		var obj = {};
		this.elements.each(function(el, i){
			obj[i] = {};
			var hide = (i != index) || (this.options.alwaysHide && (el.offsetHeight > 0));
			this.fireEvent(hide ? 'onBackground' : 'onActive', [this.togglers[i], el]);
			for (var fx in this.effects) {
				obj[i][fx] = hide ? 0 : el[this.effects[fx]];
			}
		}, this);
		
		this.is1st = false;
		this.locked = true;
		
		return this.start(obj);
	},
	
	showThisHideOpen: function(index){return this.display(index);}

});

Fx.Accordion = Accordion;


/*
Class: ToggleAccordion
*/
var ToggleAccordion = Fx.Base.extend({
	is1st: true,
	
	options: {
		onActive: Class.empty,
		onBackground: Class.empty,
		useMouseOver: false,
		open: false
	},

	initialize: function(toggler, element, pos, options){
		this.toggler = $(toggler);
		this.element = $(element);
		this.setOptions(options);
		this.previous = -1;
		
		this.hide = true;
		this.locked = false;
		
		var e = this.setUp(this.toggler, this.element, pos);
		this.fx = this.element.effects({
			duration: 500,
			transition:Fx.Transitions.Expo.easeOut,
			onComplete:this.effectEnd.bind(this)
		});
		
		if (options.open) {
			this.hide = false;
		}
		
		this.display();
	},

	setUp: function(toggler, element, pos){
		if (this.options.useMouseOver) {
			toggler.addEvent('mouseover', this.display.bind(this));
		} else {
			toggler.addEvent('mouseup', this.display.bind(this));
		}
		element.setStyle('overflow', 'hidden');
		
		var dim = element.getCoordinates();
		this.element.originalHeight = dim.height;
		//this.element.originalHeight = element.scrollHeight;
		
		if (window.ie7) {
			//setIE7CoreHeight(element, pos, 3);
			setIE7CoreHeight(element, pos, -1);
		}
		
		return this;
	},
	
	display: function(){
		if (this.options.useMouseOver && this.locked) return;
		
		this.fx.stop();
		
		this.fireEvent(this.hide ? 'onBackground' : 'onActive', [this.toggler, this.element]);
		
		if (this.options.useMouseOver) this.locked = true;
		if (this.is1st) {
			if (this.hide) {
				this.element.setOpacity(0);
				this.element.setStyle('height', 0);
				this.element.setStyle('display', 'none');
			} else {
				this.element.setOpacity(100);
				if (window.ie) {
					this.element.setStyle('height', this.element.originalHeight);
				} else {
					this.element.setStyle('height', this.element.scrollHeight);
				}
			}
			this.locked = false;
			
		} else {
			if (window.ie) {
				if (this.hide) {
					this.element.setOpacity(0);
					this.fx.start({'height': [this.element.originalHeight, 0]});
				} else {
					this.element.setStyle('display', 'block');
					this.fx.start({'height': [0, this.element.originalHeight], 'opacity': [0, 1]});
				}
			} else {
				if (this.hide) {
					this.fx.start({'height': [this.element.scrollHeight, 0], 'opacity': [1, 0]});
				} else {
					this.element.setStyle('display', 'block');
					this.fx.start({'height': [0, this.element.scrollHeight], 'opacity': [0, 1]});
				}
			}
		}
		this.hide = !this.hide;
		
		if (this.is1st) this.is1st = false;
	},
	
	effectEnd: function(){
		if (this.options.useMouseOver) {
			this.locked = false;
		}
		if (!this.hide) this.element.setStyle('display', 'none');
	}
});

/*
Class:BindTab
*/
var BindTab = Fx.Elements.extend({
	is1st: true,
	hasXmc: false,
	
	options: {
		onActive: Class.empty,
		onBackground: Class.empty,
		display: 0,
		height: true,
		opacity: true,
		fixedHeight: false,
		fixedWidth: false,
		wait: true,
		alwaysHide: false,
		useMouseOver: false,
		blockOption: ''
	},
	
	initialize: function(){
		var options, togglers, elements, container;
		$each(arguments, function(argument, i){
			switch($type(argument)){
				case 'object': options = argument; break;
				case 'element': container = $(argument); break;
				default:
					var temp = $$(argument);
					if (!togglers) togglers = temp;
					else elements = temp;
			}
		});
		this.togglers = togglers || [];
		this.elements = elements || [];
		
		this.contents = [];
		this.elements.each(function(el, i) {
			var xmc = findDiv(el, 'xmc');
			if (!xmc) {
				xmc = el;
				this.hasXmc = false;
			} else this.hasXmc = true;
			if (xmc) {
				var cont = new Element('div', {'class': 'pocket'});
				var cl = xmc.childNodes;
				var total = cl.length;
				for (var j=0; j<total; j++) {
					cont.appendChild(cl[0]);
				}
				
				cont.injectInside(xmc);
				this.contents.push(cont);
				
			}
		}, this);
		
		this.container = $(container);
		this.setOptions(options);
		this.previous = -1;
		if (this.options.alwaysHide) this.options.wait = true;
		if ($chk(this.options.show)){
			this.options.display = false;
			this.previous = this.options.show;
		}
		if (this.options.start){
			this.options.display = false;
			this.options.show = false;
		}
		
		for (var i = 0, l = this.togglers.length; i < l; i++) this.addSection(this.togglers[i], this.elements[i]);
		this.maxHeight = 0;
		
		this.elements.each(function(el, i){
			el.originalHeight = el.scrollHeight;
			if (el.scrollHeight > this.maxHeight) this.maxHeight = el.scrollHeight;
			
			if (window.ie7) {
				setIE7CoreHeight(el, i, -1);
			}
			
		}, this);
		this.parent(this.elements);
		this.display(0);
	},
	
	addSection: function(toggler, element, pos){
		toggler = $(toggler);
		element = $(element);
		this.togglers.include(toggler);
		this.elements.include(element);
		var idx = this.togglers.indexOf(toggler);
		if (this.options.useMouseOver) {
			toggler.addEvent('mouseover', this.hideCurrent.bind(this, idx));
		} else {
			toggler.addEvent('mouseup', this.hideCurrent.bind(this, idx));
		}
		element.fullOpacity = 1;
		if (this.options.fixedWidth) element.fullWidth = this.options.fixedWidth;
		if (this.options.fixedHeight) element.fullHeight = this.options.fixedHeight;
		element.setStyle('overflow', 'hidden');
		return this;
	},
	
	hideCurrent: function(index) {
		if (index == this.previous) return;
		var prev = this.contents[this.previous];
		if (prev) {
			if (this.hideFx) this.hideFx.stop();
			if (this.showFx) this.showFx.stop();
			
			this.hideFx = prev.effects({duration: 150, transition: Fx.Transitions.linear, onComplete: this.display.bind(this, index)});
			this.hideFx.start({'opacity':0});
		}
	},
	
	display: function(index){
		index = ($type(index) == 'element') ? this.elements.indexOf(index) : index;
		if ((this.timer && this.options.wait) || (index === this.previous && !this.options.alwaysHide)) return this;
		var prevHeight = 0;
		if (this.previous > -1) {
			if (window.ie) {
				prevHeight = this.maxHeight;
			} else {
				var prev = this.elements[this.previous];
				//if (prev) prevHeight = prev.originalHeight;
				if (prev) prevHeight = this.contents[this.previous].offsetHeight;
			}
			
			var cur = this.elements[index];
			cur.setStyle('height', prevHeight);
			cur.setOpacity(1);
		}
		
		this.elements.each(function(el, i){
			var hide = (i != index) || (this.options.alwaysHide && (el.offsetHeight > 0));
			this.fireEvent(hide ? 'onBackground' : 'onActive', [this.togglers[i], el]);
			
			if (hide) {
				el.setStyle('height', 0);
				el.setOpacity(0);
				//el.originalBorder = el.getStyle('border');
				//el.setStyle('border', 'none');
				el.setStyle('display', 'none');
			} else {
				//if (el.originalBorder) {
				//	el.setStyle('border', el.originalBorder);
				//}
				el.setStyle('display', 'block');
			}
			
		}, this);
		
		this.previous = index;
		this.is1st = false;
		
		var el = this.elements[index];
		var cn = this.contents[index];
		/* subtract side padding and side border width from box width */
		bw = el.parentNode.offsetWidth;
		bw -= el.getStyle('padding-left').match(/[0-9]*/) - 0;
		bw -= el.getStyle('padding-right').match(/[0-9]*/) - 0;
		bw -= el.getStyle('border-left-width').match(/[0-9]*/) - 0;
		bw -= el.getStyle('border-left-width').match(/[0-9]*/) - 0;
		bw += "px";
		el.setStyle('width', bw);
		this.showFx = new Fx.Elements([el, cn],
			{duration: 200, transition: Fx.Transitions.Expo.easeOut});
		return this.showFx.start({
			'0':{
//				'height':el.originalHeight
				'height':cn.offsetHeight + ((this.hasXmc) ? 30:15)
 			},
			'1':{
				'opacity':1
			}
		});
	},
	
	showThisHideOpen: function(index){return this.display(index);}
	
});


function processAccordion(b) {
	var opt = getBlockOption(b);
	var cmcs = getCmcs(b);
	if (opt=="opt-1" || opt=="opt-2" || opt=="opt-5" || opt=="opt-6") {
		for (var i=0; i<cmcs.length; i++) {
			var cmc = cmcs[i];
			var togglers = [];
			var elements = [];
			
			var prevToggler = null;
			var cl = cmc.childNodes;
			for (var j=0; j<cl.length; j++) {
				c = cl[j];
				if (c.tagName=='DIV') {
					if (c.className.indexOf("h2") > -1) {
						prevToggler = c;
						wrapAnchor(c);
						
						if (opt=="opt-2" || opt=="opt-6")
							c.style.cursor = 'default';
						else
							c.style.cursor = 'pointer';
					} else if (c.className.indexOf("box") > -1) {
						// toggle, element pair only.
						if (prevToggler!=null) {
							togglers.push(prevToggler);
							elements.push(c);
							prevToggler = null;
						}
					}
				}
			}
			
			// set wrapper
			var tgls = [];
			var elms = [];
			var ttl = togglers.length;
			for (var j=0; j<ttl; j++) {
				var is1st = (j==0);
				var isLast = (j==ttl-1);
				
				var cls = 'twrap';
				if (is1st) cls += ' top';
				if (isLast) cls += ' btm';
				var twrap = new Element('div', {'class':cls});
				if (isLast) twrap.isLast = true;
				
				var t = togglers[j];
				twrap.injectBefore(t);
				t.injectInside(twrap);
				tgls.push(twrap);
				
				cls = 'bwrap';
				if (is1st) cls += ' top';
				if (isLast) cls += ' btm';
				var bwrap = new Element('div', {'class':cls});
				
				var t = elements[j];
				bwrap.injectBefore(t);
				t.injectInside(bwrap);
				elms.push(bwrap);
			}
			
			if (tgls.length > 0 && elms.length > 0) {
				var accordion = new Accordion(tgls, elms, {
					duration: 350,
					transition: Fx.Transitions.Expo.easeOut,
					opacity: true,
					useMouseOver:(opt=="opt-2" || opt=="opt-6"),
					show:(opt=="opt-5" || opt=="opt-6") ? tgls.length - 1:0,
					onActive: function(t, e){
						t.addClass('cr');
						if (t.isLast) t.removeClass('btm');
						stopMovies(e, false);
					},
					
					onBackground: function(t, e){
						t.removeClass('cr');
						if (t.isLast) t.addClass('btm');
						stopMovies(e, true);
					}
				});
			}
			
		}
		
	} else if (opt=="opt-3" || opt=="opt-4" || opt=="opt-7" || opt=="opt-8") {
		for (var i=0; i<cmcs.length; i++) {
			var cmc = cmcs[i];
			var prevToggler = {};
			var pos = 0;
			
			// count togglers.
			var cl = cmc.childNodes;
			var ttl = 0;
			for (var j=0; j<cl.length; j++) {
				var c = cl[j];
				if (c.tagName=='DIV' && c.className.indexOf('h2') > -1) ttl++;
			}
			
			var tcnt = 0;
			for (var j=0; j<cl.length; j++) {
				var c = cl[j];
				if (c.tagName=='DIV') {
					if (c.className.indexOf("h2") > -1) {
						prevToggler = c;
						wrapAnchor(c);
						
						if (opt=="opt-4" || opt=="opt-8")
							c.style.cursor = 'default';
						else
							c.style.cursor = 'pointer';
						
					} else if (c.className.indexOf("box") > -1) {
						if (prevToggler) {
							tcnt++;
							var is1st = (tcnt==1);
							var isLast = (tcnt==ttl);
							var cls = 'twrap';
							if (is1st) cls += ' top';
							if (isLast) cls += ' btm';
							var t = new Element('div', {'class':cls});
							if (isLast) t.isLast = true;
							t.injectBefore(prevToggler);
							prevToggler.injectInside(t);
							
							cls = 'bwrap';
							if (is1st) cls += ' top';
							if (isLast) cls += ' btm';
							var e = new Element('div', {'class':cls});
							e.injectBefore(c);
							c.injectInside(e);
							
							var tglAccordion = new ToggleAccordion(t, e, pos, {
								useMouseOver:(opt=="opt-4" || opt=="opt-8"),
								onActive: function(t, e){
									t.addClass('cr');
									if (t.isLast) t.removeClass('btm');
									stopMovies(e, false);
								},
								onBackground: function(t, e){
									t.removeClass('cr');
									if (t.isLast) t.addClass('btm');
									stopMovies(e, true);
								},
								open:(opt=="opt-7" || opt=="opt-8")
							});
							prevToggler = null;
							pos++;
						}
					}
				}
			}
		}
	}
	
}

function processTab(b) {
	var opt = getBlockOption(b);
	var cmcs = getCmcs(b);
	for (var i=0; i<cmcs.length; i++) {
		var cmc = cmcs[i];
		var tabs = [];
		var boxes = [];
		
		var twrap = new Element('div', {'class':'twrap'});
		twrap.injectTop(cmc);
		
		var bwrap = new Element('div', {'class':'bwrap'});
		bwrap.injectAfter(twrap);
		
		var prevTab = null;
		cmc.getChildren().each(function(e){
			if (e.hasClass("h2")) {
				e.injectInside(twrap);
				wrapAnchor(e);
				
				prevTab = e;
			}
			
			if (e.hasClass("box")) {
				if (prevTab!=null) {
					e.injectInside(bwrap);
					tabs.push(prevTab);
					boxes.push(e);
					prevTab = null;
				}
			}
		});
		
		try {
			var tab = new BindTab(tabs, boxes, bwrap, {
				onActive: function(t, e){
					t.addClass('cr');
					stopMovies(e, false);
				},
				
				onBackground: function(t, e){
					t.removeClass('cr');
					stopMovies(e, true);
				},
				
				useMouseOver: (opt=='opt-2' || opt=='opt-4' || opt=='opt-6' || opt=='opt-8'),
				
				blockOption: opt
			});
		} catch (e) {
			log(e);
		}
		
	}
}

function wrapAnchor(e) {
	if (!window.ie6) return;
	
	var cl = e.childNodes;
	for (var j=0; j<cl.length; j++) {
		var c = cl[ j ];
		if (c.nodeName.toUpperCase() == 'H2') {
			var cll = c.childNodes;
			var a = new Element('a');
			for (var k=0; k<cll.length; k++) {
				var cc = cll[ k ];
				a.appendChild(cc);
			}
			a.injectInside(c);
			break;
		}
		if (c.hasChildNodes()) wrapAnchor(c);
	}
}

var namedAnchors = [];
var namePointers = [];
var smoothScroll = null;
function processImageAndMovie(b) {
	var ancs = [];
	var caps = [];
	var isNameFind = false;
	var findPageTop = false;
	var cls = getClassedTags(b, ['SPAN', 'A'], null, true);
	for (var i=0; i<cls.length; i++) {
		var cl = cls[i];
		var tagName = cl.tagName;
		var className = cl.className;
		if (tagName=='SPAN' && className.indexOf('img') > -1) {
			var hasZoom = false;
			var hasComment = false;
			var imgs = cl.childNodes;
			for (var j=0; j<imgs.length; j++) {
				var e = $(imgs[j]);
				if (e.tagName=='A') {
					ancs.push(e);
					hasZoom = true;
				} else if (hasZoom && e.tagName=='SPAN') {
					caps.push(e.getText());
					hasComment = true;
				}
			}
			if (hasZoom && !hasComment) caps.push('');
			
		} else if (tagName=='A') {
			if (className.indexOf('movieButton') > -1) processMovieButton(cl);
			else if (className=='bindtexts' || className=='size-s') cl.onclick = function() {Textsize.resize(10); return false;};
			else if (className=='bindtextm' || className=='size-m') cl.onclick = function() {Textsize.resize(12); return false;};
			else if (className=='bindtextl' || className=='size-l') cl.onclick = function() {Textsize.resize(14); return false;};
			else if (cl.name && cl.name.length > 0) {
				namedAnchors.push(cl);
				isNameFind = true;
			} else if (cl.href.indexOf('#') > -1) {
				var nm = cl.href.substring(cl.href.indexOf('#') + 1);
				if (nm.length > 0) {
					namePointers.push(cl);
					isNameFind = true;
					if (nm == 'page') findPageTop = true;
				}
			}
		}
		
	}
	
	if (isNameFind) {
		for (var i=0; i<namePointers.length; i++) {
			var p = namePointers[i];
			var href = p.href;
			var nm = href.substring(href.indexOf('#') + 1);
			
			if (findPageTop && nm == 'page') {
				addSmoothScroll(p, document.getElementById('page'));
			} else {
				for (var j=0; j<namedAnchors.length; j++) {
					var a = namedAnchors[j];
					if (a.name == nm) {
						addSmoothScroll(p, a);
						break;
					}
				}
			}
		}
	}
	
	if (ancs.length > 0) {
		if (myBindZoom==null) {
			myBindZoom = new BiNDZoom(ancs, caps, {});
		} else {
			myBindZoom.addSet(ancs, caps);
		}
	}
}

function addSmoothScroll(pointer, namedAnchor) {
	if (smoothScroll==null)
		smoothScroll = new SmoothScroll({
			duration: 1000,
			transition: Fx.Transitions.Expo.easeOut
		});
	
	smoothScroll.useLink(pointer, namedAnchor);
}

function findDiv(p, cls) {
	var ns = p.childNodes;
	for (var i=0; i<ns.length; i++) {
		var n = $(ns[i]);
		if (n) {
			if (n.hasClass(cls)) return n;
			if (n.hasChildNodes()) {
				var rtn = findDiv(n, cls);
				if (rtn!=null) return rtn;
			}
		}
	}
	return null;
}

function processMovieButton(e) {
	if (myBindMovie==null) {
		myBindMovie = new BiNDMovie(e, {});
	} else {
		myBindMovie.addAnchor(e);
	}
}

function getBlockOption(b) {
	var o = b.firstChild;
	if (o) {
		var opt = o.className;
		if (opt.indexOf('color') > -1) {
			opt = opt.substring(0, opt.indexOf(' '));
		}
		return opt;
	}
	return "";
}

function getClassedTags(b,names,clazz,deep) {
	var cl = b.childNodes;
	var rtn = [];
	for (var i=0; i<cl.length; i++) {
		var c = cl[i];
		var nmfind = false;
		var nm = c.nodeName;
		var cls = c.className;
		
		if (nm=='#text') continue;
		
		for (var j=0; j<names.length; j++) {
			if (nm == names[j]) {
				nmfind = true;
				break;
			}
		}
		
		var find = false;
		if (nmfind) {
			var clsfind = false;
			
			if (clazz==null) {
				clsfind = true;
			} else {
				for (var j=0; j<clazz.length; j++) {
					if (cls.indexOf(clazz[j]) > -1) {
						clsfind = true;
						break;
					}
				}
			}
			
			if (clsfind) {
				rtn.push(c);
				find = !deep;
			}
		}
		
		if (find == false && c.hasChildNodes) {
			var wkary = getClassedTags(c, names, clazz, deep);
			for (var j=0; j<wkary.length; j++) {
				rtn.push(wkary[j]);
			}
		}
	}
	return rtn;
}

function getCmcs(b) {
	var rtn = getClassedTags(b, ['DIV'], ['cmc'], false);
	if (rtn.length == 0) rtn = getClassedTags(b, ['DIV'], ['column'], false);
	return rtn;
}

function stopMovies(e, sw) {
	var elements = getClassedTags(e, ['object', 'embed'], null, true);
	elements.each(function(el){
		if (window.webkit) {
			el.style.visibility = (sw) ? 'hidden':'';
		} else {
			el.style.display = (sw) ? 'none':'';
		}
		
		if (el.disabled) el.disabled = sw;
		if (window.ie && sw) {
			var mv = document.all(el.id);
			if (mv) {
				if (typeof(mv.stop)=='function') mv.stop();
				if (typeof(mv.Stop)=='function') mv.Stop();
			}
		}
	});
}

function setIE7CoreHeight(el, i, amnt) {
	var xmcs = getClassedTags(el, ['DIV'], ['xmc'], false);
	if (xmcs.length==0) {
		xmcs = getClassedTags(el, ['DIV'], ['box'], false);
	}
	if (xmcs.length > 0) {
		var xmc = $(xmcs[0]);
		if (amnt == -1) {
			xmc.setStyle('max-height', xmc.scrollHeight - 12);
		} else {
			var perc = Math.round(xmc.scrollHeight / el.originalHeight * 100) - (amnt + i);
			xmc.setStyle('max-height', perc + '%');
		}
	}
}

function dig(p) {
	var cl = p.childNodes;
	for (var i=0; i<cl.length; i++) {
		var c = cl[i];
		
		var nm = c.nodeName;
		var cls = c.className;
		
		switch (nm)
		{
		case '#text': continue;
		case 'DIV':
			if (cls.indexOf("block") > -1) {
				if (typeof(Value)=="undefined" || Value.preview) {
					if (cls.indexOf('accordion') > -1) {
						processAccordion(c);
						
					} else if (cls.indexOf('tab') > -1) {
						processTab(c);
					}
					
				}
				
				processImageAndMovie(c);
				
				if (!window.ie6) continue;
			}
			break;
			
		default:
			break;
			
		}
		
		if (window.ie6) {
			clearpng.fixone(c);
		}
		
		if (c.hasChildNodes()) {
			dig(c);
		}
	}
}

function log(msg) {
	if (BiNDFx.debug) {
		var n = document.getElementById("log");
		if (n) {
			var buf = n.innerHTML;
			n.innerHTML = buf + msg + "<br />";
		}
	}
	if (typeof(console)!='undefined') {
		console.log(msg);
	}
}

function setupLog() {
	if (BiNDFx.debug) {
		var logDiv = document.createElement("div");
		logDiv.setAttribute("id", "log");
		
		var css = "";
		if (window.ie6) {
			css = "position:absolute; height:200px; width:400px; left:0px; top:0px; " +
				"background-color:#ffffff; filter: alpha(opacity=60);" +
				"overflow-y:scroll;";
		} else {
			css = "position:absolute; height:200px; width:400px; left:0px; top:0px; " +
				"background-image:url(_module/theme/_default/blockskin/rich_wht/acc_box_bg.png);" +
				"overflow:scroll;";
		}
		logDiv.style.cssText = css;
		document.body.appendChild(logDiv);
	}
}

var myBindZoom = null;
var myBindMovie = null;
function initFx() {
	setupLog();
	
	dig(document.body);
	
}
