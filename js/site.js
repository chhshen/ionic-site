/*
 _             _
(_)           (_)
 _  ___  _ __  _  ___
| |/ _ \| '_ \| |/ __|
| | (_) | | | | | (__
|_|\___/|_| |_|_|\___|

*/

var ionicSite = (function(){
  var smoothScrollingTo,
      fixedMenu,
      winHeight = $(window).height(),
      docContent = $('.main-content'),
      devicePreview,
      defaultScreen;

  window.rAF = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 16);
            };
  })();

  /* Header menu toggle for mobile */
  $("#menu-toggle").click(function(e) {
      e.preventDefault();
      $(this).toggleClass("active");
  });

  // smooth scroll
  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        smoothScrollingTo = '#' + target.attr('id');
        $('html,body').animate({ scrollTop: target.offset().top }, 100, 'swing',
          function() {
            if(docContent) {
              previewSection(smoothScrollingTo);
            }
            smoothScrollingTo = undefined;
          });
        return false;
      }
    }
  });

  // left menu link highlight
  var leftMenu = $('.left-menu');
  var activeLink = leftMenu.find('[href="' + window.location.pathname + '"]');
  activeLink.parents('li').addClass("active");

  leftMenu.find('.api-section').click(function(){
    if( $(this).attr('href') == '#' ) {
      $(this).closest('.left-menu').find("li").removeClass('active');
      $(this).closest('li').toggleClass('active');
      return false;
    }
  });


  /* Fixed left menu */
  (function() {
    var activeId;
    fixedMenu = $('.docked-menu');
    if(fixedMenu.length) {

      var targets = fixedMenu.find('.active-menu').find('a');
      targets.each(function() {
        var href = $(this).attr('href');
        if(href && href.indexOf('#') > -1) {
          href = href.split('#');
          href = "#" + href[ href.length - 1 ];
          $(this).attr('href', href);
        }
      });

      var scrollSpyOffset = 40;
      if( $(document.body).hasClass("device-preview-page") ) {
        scrollSpyOffset = 300;
      }

      $(document.body).scrollspy({ target: '.docked-menu', offset: scrollSpyOffset });

      var fixedMenuTop = fixedMenu.offset().top;
      var menuTopPadding = 20;
      fixedMenu.css({
        top: menuTopPadding + 'px'
      });

      function docScroll() {
        var win = $(window);
        var scrollTop = win.scrollTop();
        var winWidth = win.width();
        if(scrollTop + menuTopPadding > fixedMenuTop && winWidth >= 768) {
          // middle of the page
          if(!fixedMenu.hasClass("fixed-menu")) {
            fixedMenu
              .css({
                width: fixedMenu.width() + 'px',
                top: '20px'
              })
              .addClass("fixed-menu");
          }
        } else {
          // top of page
          if(fixedMenu.hasClass("fixed-menu")) {
            fixedMenu
              .removeClass("fixed-menu")
              .css({
                width: 'auto',
                top: '20px'
              });
          }
          if(scrollTop < 200) {
            $('.active').removeClass(".active");
          }
        }
      }
      $(window).resize(function() {
        //preFooterTop = $('.pre-footer').offset().top;
        winHeight = $(window).height();
        fixedMenu
            .removeClass("fixed-menu")
            .css({
              width: 'auto'
            });
        docScroll();
      });
      var docScrollGovernor;
      function governDocScroll(){
        clearTimeout(docScrollGovernor);
        docScrollGovernor = setTimeout(docScroll, 15);
      }
      $(window).scroll(governDocScroll);

      function scrollSpyChange(e) {
        if(smoothScrollingTo || !docContent) {
          window.history.replaceState && window.history.replaceState({}, smoothScrollingTo, smoothScrollingTo);
          return;
        }

        var id;
        if(e.target.children.length > 1) {
          // this is a top level nav link
          var activeSublinks = $(e.target).find('.active');
          if(!activeSublinks.length) {
            // no children are active for this top level link
            id = e.target.children[0].hash;
          }
        } else if(e.target.children.length === 1) {
          // this is a sub nav link
          id = e.target.children[0].hash;
        }

        if(id) {
          if(devicePreview) {
            window.rAF(function(){
              previewSection(id);
            });
          } else {
            var activeSection = $(id);
            if(activeSection.length) {
              window.rAF(function(){
                docContent.find('.active').removeClass('active');
                activeSection.addClass("active");
              });
            }
          }
          window.history.replaceState && window.history.replaceState({}, id, id);
        }
      }
      fixedMenu.on('activate.bs.scrollspy', scrollSpyChange);
    }
  })();

  // initDevicePreview
  (function() {
    /* Fixed device preview on the docs page */
    devicePreview = $('.device-preview');
    if(devicePreview.length) {
      var orgDeviceTop = devicePreview.offset().top;

      function onScroll() {
        if($(window).scrollTop() > orgDeviceTop) {
          if( !devicePreview.hasClass('fixed-preview') ) {
            devicePreview
              .css({
                left: Math.round(devicePreview.offset().left) + 'px'
              })
              .addClass("fixed-preview");
            }
        } else {
          if( devicePreview.hasClass('fixed-preview') ) {
            devicePreview
              .removeClass("fixed-preview")
              .css({
                left: 'auto'
              });
          }
        }

      }
      $(window).resize(function(){
        devicePreview
            .removeClass("fixed-preview")
            .css({
              left: 'auto'
            });
        onScroll();
      });
      $(window).scroll(governScroll);

      var scrollGovernor;
      function governScroll() {
        clearTimeout(scrollGovernor);
        scrollGovernor = setTimeout(onScroll, 15);
      }
      onScroll();

      var firstSection = docContent.find('.docs-section').first();
      if(firstSection.length) {
        previewSection( '#' + firstSection[0].id, true );
      }

    }
  })();


  function previewSection(id) {
    var activeSection = $(id);
    if(!activeSection.length || !devicePreview) return;

    var title = activeSection.find('h1,h2,h3').first();
    var newTitle = "Ionic Components";
    activeId = activeSection.attr('id');
    if(title.length) {
      newTitle = title.text() + " - " + newTitle;
    }
    document.title = newTitle;

    docContent.find('.active').removeClass('active');
    activeSection.addClass("active");

    devicePreview.find('.active-preview').removeClass('active-preview');
    var docExample = activeSection.find('.doc-example');
    if( docExample.length ) {
      // this
      var exampleId = 'example-' + activeId;
      var examplePreview = $('#' + exampleId);
      if(examplePreview.length) {
        // preview has already been added
        window.rAF(function(){
          examplePreview.addClass('active-preview');
        });
      } else if(devicePreview) {
        // create a new example preview
        devicePreview.append( '<div id="' + exampleId + '" class="ionic-body">' + docExample.html() + '</div>' );
        window.rAF(function(){
          $('#' + exampleId)
            .addClass('active-preview')
            .find('a').click(function(){
              return false;
            });
        });
      }

    } else {
      window.rAF(function(){
        if(!defaultScreen) {
          defaultScreen = devicePreview.find('.default-screen');
        }
        defaultScreen.addClass('active-preview');
      });
    }
  }

})();


// yes I manually concatinated lunr.min.js into this file, deal with it

/**
 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 0.4.5
 * Copyright (C) 2014 Oliver Nightingale
 * MIT Licensed
 * @license
 */
var lunr=function(t){var e=new lunr.Index;return e.pipeline.add(lunr.stopWordFilter,lunr.stemmer),t&&t.call(e,e),e};lunr.version="0.4.5","undefined"!=typeof module&&(module.exports=lunr),lunr.utils={},lunr.utils.warn=function(t){return function(e){t.console&&console.warn&&console.warn(e)}}(this),lunr.utils.zeroFillArray=function(){var t=[0];return function(e){for(;e>t.length;)t=t.concat(t);return t.slice(0,e)}}(),lunr.EventEmitter=function(){this.events={}},lunr.EventEmitter.prototype.addListener=function(){var t=Array.prototype.slice.call(arguments),e=t.pop(),n=t;if("function"!=typeof e)throw new TypeError("last argument must be a function");n.forEach(function(t){this.hasHandler(t)||(this.events[t]=[]),this.events[t].push(e)},this)},lunr.EventEmitter.prototype.removeListener=function(t,e){if(this.hasHandler(t)){var n=this.events[t].indexOf(e);this.events[t].splice(n,1),this.events[t].length||delete this.events[t]}},lunr.EventEmitter.prototype.emit=function(t){if(this.hasHandler(t)){var e=Array.prototype.slice.call(arguments,1);this.events[t].forEach(function(t){t.apply(void 0,e)})}},lunr.EventEmitter.prototype.hasHandler=function(t){return t in this.events},lunr.tokenizer=function(t){if(!arguments.length||null==t||void 0==t)return[];if(Array.isArray(t))return t.map(function(t){return t.toLowerCase()});for(var e=(""+t).replace(/^\s+/,""),n=e.length-1;n>=0;n--)if(/\S/.test(e.charAt(n))){e=e.substring(0,n+1);break}return e.split(/\s+/).map(function(t){return t.replace(/^\W+/,"").replace(/\W+$/,"").toLowerCase()})},lunr.Pipeline=function(){this._stack=[]},lunr.Pipeline.registeredFunctions={},lunr.Pipeline.registerFunction=function(t,e){e in this.registeredFunctions&&lunr.utils.warn("Overwriting existing registered function: "+e),t.label=e,lunr.Pipeline.registeredFunctions[t.label]=t},lunr.Pipeline.warnIfFunctionNotRegistered=function(t){var e=t.label&&t.label in this.registeredFunctions;e||lunr.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n",t)},lunr.Pipeline.load=function(t){var e=new lunr.Pipeline;return t.forEach(function(t){var n=lunr.Pipeline.registeredFunctions[t];if(!n)throw Error("Cannot load un-registered function: "+t);e.add(n)}),e},lunr.Pipeline.prototype.add=function(){var t=Array.prototype.slice.call(arguments);t.forEach(function(t){lunr.Pipeline.warnIfFunctionNotRegistered(t),this._stack.push(t)},this)},lunr.Pipeline.prototype.after=function(t,e){lunr.Pipeline.warnIfFunctionNotRegistered(e);var n=this._stack.indexOf(t)+1;this._stack.splice(n,0,e)},lunr.Pipeline.prototype.before=function(t,e){lunr.Pipeline.warnIfFunctionNotRegistered(e);var n=this._stack.indexOf(t);this._stack.splice(n,0,e)},lunr.Pipeline.prototype.remove=function(t){var e=this._stack.indexOf(t);this._stack.splice(e,1)},lunr.Pipeline.prototype.run=function(t){for(var e=[],n=t.length,r=this._stack.length,o=0;n>o;o++){for(var i=t[o],s=0;r>s&&(i=this._stack[s](i,o,t),void 0!==i);s++);void 0!==i&&e.push(i)}return e},lunr.Pipeline.prototype.toJSON=function(){return this._stack.map(function(t){return lunr.Pipeline.warnIfFunctionNotRegistered(t),t.label})},lunr.Vector=function(t){this.elements=t},lunr.Vector.prototype.magnitude=function(){if(this._magnitude)return this._magnitude;for(var t,e=0,n=this.elements,r=n.length,o=0;r>o;o++)t=n[o],e+=t*t;return this._magnitude=Math.sqrt(e)},lunr.Vector.prototype.dot=function(t){for(var e=this.elements,n=t.elements,r=e.length,o=0,i=0;r>i;i++)o+=e[i]*n[i];return o},lunr.Vector.prototype.similarity=function(t){return this.dot(t)/(this.magnitude()*t.magnitude())},lunr.Vector.prototype.toArray=function(){return this.elements},lunr.SortedSet=function(){this.length=0,this.elements=[]},lunr.SortedSet.load=function(t){var e=new this;return e.elements=t,e.length=t.length,e},lunr.SortedSet.prototype.add=function(){Array.prototype.slice.call(arguments).forEach(function(t){~this.indexOf(t)||this.elements.splice(this.locationFor(t),0,t)},this),this.length=this.elements.length},lunr.SortedSet.prototype.toArray=function(){return this.elements.slice()},lunr.SortedSet.prototype.map=function(t,e){return this.elements.map(t,e)},lunr.SortedSet.prototype.forEach=function(t,e){return this.elements.forEach(t,e)},lunr.SortedSet.prototype.indexOf=function(t,e,n){var e=e||0,n=n||this.elements.length,r=n-e,o=e+Math.floor(r/2),i=this.elements[o];return 1>=r?i===t?o:-1:t>i?this.indexOf(t,o,n):i>t?this.indexOf(t,e,o):i===t?o:void 0},lunr.SortedSet.prototype.locationFor=function(t,e,n){var e=e||0,n=n||this.elements.length,r=n-e,o=e+Math.floor(r/2),i=this.elements[o];if(1>=r){if(i>t)return o;if(t>i)return o+1}return t>i?this.locationFor(t,o,n):i>t?this.locationFor(t,e,o):void 0},lunr.SortedSet.prototype.intersect=function(t){for(var e=new lunr.SortedSet,n=0,r=0,o=this.length,i=t.length,s=this.elements,l=t.elements;;){if(n>o-1||r>i-1)break;s[n]!==l[r]?s[n]<l[r]?n++:s[n]>l[r]&&r++:(e.add(s[n]),n++,r++)}return e},lunr.SortedSet.prototype.clone=function(){var t=new lunr.SortedSet;return t.elements=this.toArray(),t.length=t.elements.length,t},lunr.SortedSet.prototype.union=function(t){var e,n,r;return this.length>=t.length?(e=this,n=t):(e=t,n=this),r=e.clone(),r.add.apply(r,n.toArray()),r},lunr.SortedSet.prototype.toJSON=function(){return this.toArray()},lunr.Index=function(){this._fields=[],this._ref="id",this.pipeline=new lunr.Pipeline,this.documentStore=new lunr.Store,this.tokenStore=new lunr.TokenStore,this.corpusTokens=new lunr.SortedSet,this.eventEmitter=new lunr.EventEmitter,this._idfCache={},this.on("add","remove","update",function(){this._idfCache={}}.bind(this))},lunr.Index.prototype.on=function(){var t=Array.prototype.slice.call(arguments);return this.eventEmitter.addListener.apply(this.eventEmitter,t)},lunr.Index.prototype.off=function(t,e){return this.eventEmitter.removeListener(t,e)},lunr.Index.load=function(t){t.version!==lunr.version&&lunr.utils.warn("version mismatch: current "+lunr.version+" importing "+t.version);var e=new this;return e._fields=t.fields,e._ref=t.ref,e.documentStore=lunr.Store.load(t.documentStore),e.tokenStore=lunr.TokenStore.load(t.tokenStore),e.corpusTokens=lunr.SortedSet.load(t.corpusTokens),e.pipeline=lunr.Pipeline.load(t.pipeline),e},lunr.Index.prototype.field=function(t,e){var e=e||{},n={name:t,boost:e.boost||1};return this._fields.push(n),this},lunr.Index.prototype.ref=function(t){return this._ref=t,this},lunr.Index.prototype.add=function(t,e){var n={},r=new lunr.SortedSet,o=t[this._ref],e=void 0===e?!0:e;this._fields.forEach(function(e){var o=this.pipeline.run(lunr.tokenizer(t[e.name]));n[e.name]=o,lunr.SortedSet.prototype.add.apply(r,o)},this),this.documentStore.set(o,r),lunr.SortedSet.prototype.add.apply(this.corpusTokens,r.toArray());for(var i=0;r.length>i;i++){var s=r.elements[i],l=this._fields.reduce(function(t,e){var r=n[e.name].length;if(!r)return t;var o=n[e.name].filter(function(t){return t===s}).length;return t+o/r*e.boost},0);this.tokenStore.add(s,{ref:o,tf:l})}e&&this.eventEmitter.emit("add",t,this)},lunr.Index.prototype.remove=function(t,e){var n=t[this._ref],e=void 0===e?!0:e;if(this.documentStore.has(n)){var r=this.documentStore.get(n);this.documentStore.remove(n),r.forEach(function(t){this.tokenStore.remove(t,n)},this),e&&this.eventEmitter.emit("remove",t,this)}},lunr.Index.prototype.update=function(t,e){var e=void 0===e?!0:e;this.remove(t,!1),this.add(t,!1),e&&this.eventEmitter.emit("update",t,this)},lunr.Index.prototype.idf=function(t){var e="@"+t;if(Object.prototype.hasOwnProperty.call(this._idfCache,e))return this._idfCache[e];var n=this.tokenStore.count(t),r=1;return n>0&&(r=1+Math.log(this.tokenStore.length/n)),this._idfCache[e]=r},lunr.Index.prototype.search=function(t){var e=this.pipeline.run(lunr.tokenizer(t)),n=lunr.utils.zeroFillArray(this.corpusTokens.length),r=[],o=this._fields.reduce(function(t,e){return t+e.boost},0),i=e.some(function(t){return this.tokenStore.has(t)},this);if(!i)return[];e.forEach(function(t,e,i){var s=1/i.length*this._fields.length*o,l=this,u=this.tokenStore.expand(t).reduce(function(e,r){var o=l.corpusTokens.indexOf(r),i=l.idf(r),u=1,a=new lunr.SortedSet;if(r!==t){var h=Math.max(3,r.length-t.length);u=1/Math.log(h)}return o>-1&&(n[o]=s*i*u),Object.keys(l.tokenStore.get(r)).forEach(function(t){a.add(t)}),e.union(a)},new lunr.SortedSet);r.push(u)},this);var s=r.reduce(function(t,e){return t.intersect(e)}),l=new lunr.Vector(n);return s.map(function(t){return{ref:t,score:l.similarity(this.documentVector(t))}},this).sort(function(t,e){return e.score-t.score})},lunr.Index.prototype.documentVector=function(t){for(var e=this.documentStore.get(t),n=e.length,r=lunr.utils.zeroFillArray(this.corpusTokens.length),o=0;n>o;o++){var i=e.elements[o],s=this.tokenStore.get(i)[t].tf,l=this.idf(i);r[this.corpusTokens.indexOf(i)]=s*l}return new lunr.Vector(r)},lunr.Index.prototype.toJSON=function(){return{version:lunr.version,fields:this._fields,ref:this._ref,documentStore:this.documentStore.toJSON(),tokenStore:this.tokenStore.toJSON(),corpusTokens:this.corpusTokens.toJSON(),pipeline:this.pipeline.toJSON()}},lunr.Store=function(){this.store={},this.length=0},lunr.Store.load=function(t){var e=new this;return e.length=t.length,e.store=Object.keys(t.store).reduce(function(e,n){return e[n]=lunr.SortedSet.load(t.store[n]),e},{}),e},lunr.Store.prototype.set=function(t,e){this.store[t]=e,this.length=Object.keys(this.store).length},lunr.Store.prototype.get=function(t){return this.store[t]},lunr.Store.prototype.has=function(t){return t in this.store},lunr.Store.prototype.remove=function(t){this.has(t)&&(delete this.store[t],this.length--)},lunr.Store.prototype.toJSON=function(){return{store:this.store,length:this.length}},lunr.stemmer=function(){var t={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},e={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},n="[^aeiou]",r="[aeiouy]",o=n+"[^aeiouy]*",i=r+"[aeiou]*",s="^("+o+")?"+i+o,l="^("+o+")?"+i+o+"("+i+")?$",u="^("+o+")?"+i+o+i+o,a="^("+o+")?"+r;return function(n){var i,h,c,p,f,d,v;if(3>n.length)return n;if(c=n.substr(0,1),"y"==c&&(n=c.toUpperCase()+n.substr(1)),p=/^(.+?)(ss|i)es$/,f=/^(.+?)([^s])s$/,p.test(n)?n=n.replace(p,"$1$2"):f.test(n)&&(n=n.replace(f,"$1$2")),p=/^(.+?)eed$/,f=/^(.+?)(ed|ing)$/,p.test(n)){var m=p.exec(n);p=RegExp(s),p.test(m[1])&&(p=/.$/,n=n.replace(p,""))}else if(f.test(n)){var m=f.exec(n);i=m[1],f=RegExp(a),f.test(i)&&(n=i,f=/(at|bl|iz)$/,d=RegExp("([^aeiouylsz])\\1$"),v=RegExp("^"+o+r+"[^aeiouwxy]$"),f.test(n)?n+="e":d.test(n)?(p=/.$/,n=n.replace(p,"")):v.test(n)&&(n+="e"))}if(p=/^(.+?)y$/,p.test(n)){var m=p.exec(n);i=m[1],p=RegExp(a),p.test(i)&&(n=i+"i")}if(p=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,p.test(n)){var m=p.exec(n);i=m[1],h=m[2],p=RegExp(s),p.test(i)&&(n=i+t[h])}if(p=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,p.test(n)){var m=p.exec(n);i=m[1],h=m[2],p=RegExp(s),p.test(i)&&(n=i+e[h])}if(p=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,f=/^(.+?)(s|t)(ion)$/,p.test(n)){var m=p.exec(n);i=m[1],p=RegExp(u),p.test(i)&&(n=i)}else if(f.test(n)){var m=f.exec(n);i=m[1]+m[2],f=RegExp(u),f.test(i)&&(n=i)}if(p=/^(.+?)e$/,p.test(n)){var m=p.exec(n);i=m[1],p=RegExp(u),f=RegExp(l),d=RegExp("^"+o+r+"[^aeiouwxy]$"),(p.test(i)||f.test(i)&&!d.test(i))&&(n=i)}return p=/ll$/,f=RegExp(u),p.test(n)&&f.test(n)&&(p=/.$/,n=n.replace(p,"")),"y"==c&&(n=c.toLowerCase()+n.substr(1)),n}}(),lunr.Pipeline.registerFunction(lunr.stemmer,"stemmer"),lunr.stopWordFilter=function(t){return-1===lunr.stopWordFilter.stopWords.indexOf(t)?t:void 0},lunr.stopWordFilter.stopWords=new lunr.SortedSet,lunr.stopWordFilter.stopWords.length=119,lunr.stopWordFilter.stopWords.elements=["","a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"],lunr.Pipeline.registerFunction(lunr.stopWordFilter,"stopWordFilter"),lunr.TokenStore=function(){this.root={docs:{}},this.length=0},lunr.TokenStore.load=function(t){var e=new this;return e.root=t.root,e.length=t.length,e},lunr.TokenStore.prototype.add=function(t,e,n){var n=n||this.root,r=t[0],o=t.slice(1);return r in n||(n[r]={docs:{}}),0===o.length?(n[r].docs[e.ref]=e,this.length+=1,void 0):this.add(o,e,n[r])},lunr.TokenStore.prototype.has=function(t){if(!t)return!1;for(var e=this.root,n=0;t.length>n;n++){if(!e[t[n]])return!1;e=e[t[n]]}return!0},lunr.TokenStore.prototype.getNode=function(t){if(!t)return{};for(var e=this.root,n=0;t.length>n;n++){if(!e[t[n]])return{};e=e[t[n]]}return e},lunr.TokenStore.prototype.get=function(t,e){return this.getNode(t,e).docs||{}},lunr.TokenStore.prototype.count=function(t,e){return Object.keys(this.get(t,e)).length},lunr.TokenStore.prototype.remove=function(t,e){if(t){for(var n=this.root,r=0;t.length>r;r++){if(!(t[r]in n))return;n=n[t[r]]}delete n.docs[e]}},lunr.TokenStore.prototype.expand=function(t,e){var n=this.getNode(t),r=n.docs||{},e=e||[];return Object.keys(r).length&&e.push(t),Object.keys(n).forEach(function(n){"docs"!==n&&e.concat(this.expand(t+n,e))},this),e},lunr.TokenStore.prototype.toJSON=function(){return{root:this.root,length:this.length}};


$(document).ready(function () {

  var searchInput = $('#search-input');

  if(!searchInput.length || $(window).width() < 768) return;

  var searchResultsDiv = $('#search-results');

  setTimeout(function(){
    // check if there if there is recent search data in local storage
    try {
      var localData = JSON.parse(localStorage.getItem('search-index'));
      if(localData && (localData.ts + 86400000) > Date.now()) {
        searchReady(localData);
        return;
      }
    } catch(e){}

    $.getJSON('/data/index.json', function (requestData) {
      searchReady(requestData);
      setTimeout(function(){
        try{
          requestData.ts = Date.now();
          localStorage.setItem('search-index', JSON.stringify(requestData))
        }catch(e){}
      }, 100);
    });

  }, 5);

  var debounce = function (fn) {
    var timeout;
    return function () {
      var args = Array.prototype.slice.call(arguments),
          ctx = this;

      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(ctx, args);
      }, 50);
    }
  }

  function searchReady(data) {
    var idx = lunr.Index.load(data.index);

    searchInput.closest('.search-bar').css({visibility: 'visible'});

    searchInput.on('keyup', debounce(function () {
      var query = $(this).val();

      if (!query || query.length < 2 || query == 'Search') {
        hideResults();
        return;
      }

      var
      results = {
        api: {},
        css: {},
        content: {}
      },
      queryResult,
      queryResultId,
      queryData,
      queryResults = idx.search(query);

      for(queryResultId in queryResults) {
        queryResult = queryResults[queryResultId];
        queryData = data.ref[ queryResult.ref ];

        if(queryData.l == 'docs_api') {
          results.api[ queryResult.ref ] = queryData;
        } else if(queryData.l == 'docs_css') {
          results.css[ queryResult.ref ] = queryData;
        } else {
          results.content[ queryResult.ref ] = queryData;
        }
      }

      showResults(results);
    }));

  }

  function showResults(resultsData) {
    addResults('#results-api', resultsData.api, 42);
    addResults('#results-css', resultsData.css, 14);
    addResults('#results-content', resultsData.content, 14);

    clearTimeout(removeOverlay);
    searchResultsDiv.show();

    if( !$('#search-overlay').length ) {
      $(document.body).append('<div id="search-overlay"></div>');
    }

    setTimeout(function(){
      $(document.body).addClass('search-open');
    }, 16);
  }

  function addResults(sectionId, data, limit) {
    var links = '';
    var section = searchResultsDiv.find(sectionId);
    var total = 0;

    for(var i in data) {
      links += '<li><a href="' + data[i].p + '">' + data[i].t + '</a></li>';
      total++;
      if(total >= limit) break;
    }

    section.html(links);
  }

  var removeOverlay;
  function hideResults(){
    $(document.body).removeClass('search-open');
    removeOverlay=setTimeout(function(){
      $('#search-overlay').remove();
      searchResultsDiv.hide();
    }, 200);
  }

  $(document).keyup(function(e) {
    if(e.keyCode == 27) {
      searchInput.val('');
      hideResults();
    }
  });

  searchInput.focus(function(){
    if( $(this).val() == 'Search' ) {
      $(this).val('');
    }
    $(this).closest('.search-bar').addClass('active');
  });

  searchInput.blur(function(){
    $(this).val('Search');
    $(this).closest('.search-bar').removeClass('active');
    setTimeout(function(){
      hideResults();
    }, 200);
  });

});
