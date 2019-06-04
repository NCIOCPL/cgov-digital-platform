import { NCIAnalytics } from 'Core/libraries/analytics/nci-analytics-functions';
import { attachEvents } from 'Core/libraries/analytics/nci-analytics-functions';

var AppMeasurementCustom = {

    /** 
     * Send tagging requests to correct server and set namespace.
     * WARNING: Changing any of the below variables will cause drastic
     * changes to how your visitor data is collected. Changes should only be
     * made when instructed to do so by your account manager.*/
    trackingServer: 'nci.122.2o7.net',
    visitorNamespace: 'nci',

    /** 
     * Set configuration variable values for AppMeasurement. 
     * See https://marketing.adobe.com/resources/help/en_US/sc/implement/configuration-variables.html
     */
    linkInternalFilters: 'javascript:,cancer.gov,localhost,www.devbox,ncigovcdode,cgov.ncigov',
    linkTrackEvents: 'none',
    linkTrackVars: 'none',
    trackInineStats: true,
    useForcedLinkTracking: true,
    forcedLinkTrackingTimeout: 500,
    debug: false,

    /** Valid Cgov host identifiers. */
    cgovHosts: [
        // 'www.devbox',
        'cancer.gov',
        'ncigovcdode',
        'acsitefactory'
    ],

    /** Daylight savings time parting configuration. */
    tpDst: {
        2019:'3/10,11/3',
        2020:'3/8,11/1',
        2021:'3/14,11/7',
        2022:'3/13,11/6',
        2023:'3/12,11/5',
        2024:'3/10,11/3',
        2025:'3/9,11/2',
        2026:'3/8,11/1',
        2027:'3/14,11/7',
        2028:'3/12,11/5'
    },

    /**
     * Get the page name (hostname + path).
     */
    getLocalPageName: function() {
        let canonicalLink = document.querySelector("link[rel='canonical']").href;
        let localPageName = canonicalLink || (window.location.hostname + window.location.pathname);
        localPageName = localPageName.replace(/(^\w+:|^)\/\//, '');
        return localPageName.toLowerCase();
    },

    /**
     * Get an index value for a cgov host identifier within the local pagename.
     */
    getMainCGovIndex: function() {
        let index = -1;
        let pageName = AppMeasurementCustom.getLocalPageName();
        let hosts = AppMeasurementCustom.cgovHosts;
        for (let i = 0; i < hosts.length; i++) {
            index = pageName.indexOf(hosts[i]);
            if (index > -1) { break; }
        }
        return index;
    },

    /**
     * Build the s object using DTM and DOM elements.
     * 
     * @param {*} s 
     */
    setScodeProperties: function(s) {

        /************************** CONFIG SECTION **************************/
        
        /*
         * Set the report suite value(s).
         * s.account and s_account (report suites) should be defined before this function is called.
         * If not, set a default value of 'ncidevelopment'.
         */
        if (!s.account) {
            s.account = s_account || 'ncidevelopment';            
        }
        
        // For debugging only 
        if (AppMeasurementCustom.debug) {
            console.log('Debug AppMeasurementCustom.setScodeProperties():');
            console.log(s.account);
        };

        /* Configure tracking server and namespace. */
        s.trackingServer = s.trackingServer || AppMeasurementCustom.trackingServer;
        s.visitorNamespace = AppMeasurementCustom.visitorNamespace;

        /* Configure link tracking settings. */
        s.trackInlineStats = AppMeasurementCustom.trackInlineStats;
        s.linkInternalFilters = AppMeasurementCustom.linkInternalFilters;
        s.linkTrackVars = AppMeasurementCustom.linkTrackVars;
        s.linkTrackEvents = AppMeasurementCustom.linkTrackEvents;
        s.useForcedLinkTracking = AppMeasurementCustom.useForcedLinkTracking;
        s.forcedLinkTrackingTimeout = AppMeasurementCustom.forcedLinkTrackingTimeout;
        
        /* Get the page name to be used in tracking variables. */
        s.localPageName = AppMeasurementCustom.getLocalPageName();

        /** Plugin configs. */
        s.usePlugins = true;
        s.maxDelay='1000'; // Wait for 3rd party api response - different from s.forcedLinkTracking.

        /**
         * Fire off plugins. Add calls to plugins here.
         * 
         * @param {*} s
         *   The 's' object.
         */
        function s_doPlugins(s) {

            // Set prop1 - and prop2 if necessary.
            let fullURL = document.URL.toLowerCase();
            s.prop1 = fullURL.substring(0,100);
            s.prop2 = (fullURL.length > 100) ? fullURL.substring(100) : null;

            // Set language tracking values.
            s.prop8 = s.getNciPageLang();
            s.eVar2 = s.prop8;

            // Set audience tracking values.
            s.prop7 = s.getNciAudience();
            s.eVar7 = s.prop7;

            // Set page title tracking values.
            s.prop10 = getNciPageTitle();

            // Set the font size variable.
            s.prop42 = 'Normal';

            // Set timestamp variable.
            s.prop26 = getNciDate();

            // Set prop29 via getTimeParting() plugin.
            s.prop29 = s.getTimeParting('n','-5');

            // Set ID param variable value.
            s.prop15 = (fullURL.indexOf('cts.print/display') > -1) ? getNciPrintID() : '';
            s.prop15 = s.prop15 || s.getNciSearchId();
            s.eVar15 = s.prop15;

            // Set Previous Page values.
            s.prop61 = s.getPreviousValue(s.pageName, 'gpv_pn', '');

            // Set load time of the page.
            s.prop65 = s.getLoadTime(); 

            // Set browser width value.
            s.eVar5 = getNciViewPort(); 

            // Track scroll percentage of previous page / percent visible on current page.
            s.prop48 = NCIAnalytics.cookieRead("nci_scroll");

            // Dynamically Capture Hierarchy Variable via Custom Plugin.
            s.hier1 = getNciHierarchy();
                        
            // Set campaign & urs tracking values.
            let s_campaign = s.getNciCampaign();
            if (s_campaign && NCIAnalytics.urs) {
                window.urs = NCIAnalytics.urs.get({
                    campaign: s_campaign,
                    referrer: document.referrer
                });
                // console.info('urs', JSON.stringify(window.urs, null, 2));
                s.eVar54 = urs.value;
                s.prop51 = (s.eVar54) ? 'D=v54' : '';
                s.eVar55 = urs.seoKeyword;
                s.eVar56 = urs.ppcKeyword;
                s.eVar57 = urs.stacked;
            }
            s.eVar35 = s_campaign;
            s.campaign = s.getValOnce(s_campaign,'s_campaign',30);

            /**
             * Set pageName and eVar1 to localPageName.
             */
            s.setNciPageNameAdditions();
            s.pageName = s.localPageName;
            s.eVar1 = s.pageName;
            s.mainCGovIndex = AppMeasurementCustom.getMainCGovIndex();

            // Social platform.
            // TODO: update the list provided by Adobe.
            s.socialPlatforms('eVar74');

            // Set prop64 for percent page viewed - if 0, then set to 'zero'
            s.getPercentPageViewed();
            if(s._ppvPreviousPage) {
                s.prop64 = s._ppvInitialPercentViewed + '|' + s._ppvHighestPercentViewed;
                s.prop64 = (s.prop64=='0') ? 'zero' : s.prop64;
            }





            /**
             * TODO: the tags below will be implemented in separate tickets when the components
             * are built on dev. 
             */
            // // Will be used to set additional suite values, if needed
            // s_resultsCount = getNciMetaTagContent('[property="dcterms.coverage"]');
            // // Will be used to populate eVar10, listing, CTS, and search values.
            // s_resultsCount = getNciMetaTagContent('totalResults,[property="dcterms.extent"]');
            // // Will be used to populate multiple values on CTS, trial listing, trial detail, & redirect CT pages.
            // s_ctSearchType = getNciMetaTagContent('[property="dcterms.accrualMethod"]');
            // // Will be used to populate prop/eVar16, dictionary pages, definition pages.
            // s_cdrId = getNciDataAttr('dfn[data-cdr-id]', 'cdrId');





            // Set short title, pub date, and content group from meta tags.
            s.prop6 = getNciMetaTagContent('[property="og:title"]');
            s.prop25 = getNciMetaTagContent('[name="dcterms.issued"]');
            s.prop44 = getNciMetaTagContent('[name="dcterms.isPartOf"]');
            s.eVar44 = s.prop44;

            // Set channel based on dcterms.subject meta tag.
            s.channel = getNciMetaTagContent('[name="dcterms.subject"]');
            
            // Set pageType based on dcterms.type meta tag.
            s.pageType = getNciMetaTagContent('[name="dcterms.type"]');

            // Set concatenated events list.
            s.setNciEvents();

            // Set props and eVars from data attributes.
            s.setNciNumberedVars('prop');
            s.setNciNumberedVars('evar');            
        }
        s.doPlugins=s_doPlugins 
        

        /************************* FUNCTIONS SECTION ************************/
        /* Custom NCI functions can be added here.                          */
        /********************************************************************/        

        /**
         * Get the document title.
         */
        function getNciPageTitle() {
            // If this  is an R4R page, set the generic title 
            if(document.querySelector('#r4r-root .r4r-resource')) {
                return 'Resources for Researchers - National Cancer Institute';
            } else {
                return document.title;
            }
        }

        /**
         * Check for meta attribute and get content if exists.
         * 
         * @param {*} selector 
         */
        function getNciMetaTagContent (selector) {
            let metaTag = document.head.querySelector(selector) || null;
            if (metaTag) {
                if (metaTag.content) { return metaTag.content; }
            }
            return metaTag;
        }

        /**
         * Check for meta attribute and get content if exists.
         * 
         * @param {*} selector 
         */
        function getNciDataAttr (selector, attribute) {
            let elem = document.querySelector(selector);
            let value = null;
            if (elem) {
                value = elem.dataset[attribute] || null;
            }
            return value;
        }

        /**

         * Set date to Time Stamp format: <year>|<month>|<day>|<hour>.
         */
        function getNciDate() {
            let now = new Date();
            return now.getFullYear() + "|" + (now.getMonth() + 1) + "|" + now.getDate() + "|" + now.getHours();
        }

        /**
         * Get the Trial Print ID from a URL.
         */
        function getNciPrintID(){
            var url = window.location.href;
            var regex = new RegExp("[?&]" + "PrintID" + "(=([^&#]*)|&|#|$)", "i");
            var results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        /* Set a name for the view port based on the current screen size */
        function getNciViewPort() {
            var screen = '';
            if(window.innerWidth)
            {
                if (window.innerWidth > 1440) { screen = "Extra wide"; }
                else if (window.innerWidth > 1024) { screen = "Desktop"; }
                else if (window.innerWidth > 640) { screen = "Tablet"; }
                else { screen = "Mobile"; }
            }
            return screen;
        }

        /**
         * Dynamically create s.hier (hierarchy) variables.
         */
        function getNciHierarchy() {
            var h1 = new String(document.location.host + document.location.pathname);
            if (h1.charAt(h1.length - 1) == "/") {
                var temp = new String();
                for (var i = 0; i < h1.length - 1; i++) {
                    temp += h1.charAt(i);
                }
                h1 = temp;
            }
            var intMatch = h1.indexOf("/");
            while (intMatch != -1) {
                h1 = h1.replace("/", "|");
                intMatch = h1.indexOf("/");
            }
            return h1;
        }

        /**
         * Get the language code from pagename, DOM, or URL param.
         */
        s.getNciPageLang = function() {
            let s = this;
            let language = 'english';
            if (s.localPageName.indexOf('espanol') >= 0 ||
                document.querySelector('[lang="es"]') ||
                s.Util.getQueryParam('lang') == 'spanish' ||
                s.Util.getQueryParam('language') == 'spanish') {
                    language = 'spanish';
            }
            return language;
        }

        /**
         * Get the audience from query param or DOM.
         */
        s.getNciAudience = function() {
            let s = this;
            let audience = getNciMetaTagContent('[name="dcterms.audience"]') || s.Util.getQueryParam('version');
            if (audience) {
                switch (audience.toLowerCase())
                {
                    case 'patient':
                    case 'patients':
                    case '0':
                        audience = 'Patient';
                        break;
                    case 'healthprofessional':
                    case 'healthprofessionals':
                    case '1':
                        audience = 'Health professional';
                        break;
                    default:
                        if (s.localPageName.indexOf('patient') > -1)
                            audience = 'Patient';
                        if (s.localPageName.indexOf('healthprofessional') > -1 ||
                            s.localPageName.indexOf('/hp/') > -1)
                            audience = 'Health professional';
                        break;
                }
                return audience;
            }
            else { return null; }
        }

        /**
         * Get value of  'protoclsearchid' or 'PrintID' (depends on the page being loaded).
         */
        s.getNciSearchId = function() {
            let s = this;
            let id = s.Util.getQueryParam('protocolsearchid') || s.Util.getQueryParam('PrintID');
            return id;
        }
            
        /**
         * Set the campagin value if there are any matching queries in the URL.
         */
        s.getNciCampaign = function() {
            // Set 'cid' if available, then 'gclid' if available.
            let s = this;
            let campaign = s.Util.getQueryParam('cid') || s.Util.getQueryParam('gclid');

            // If still no value, try the utm_* parameters. 
            // Return a value if one or more params are set.
            if (!campaign) {
                let hasUtm = false;
                let utmJoin  = [];
                let utmArr = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
                utmArr.forEach(function(parm) {
                    let val = s.Util.getQueryParam(parm) || '_';
                    utmJoin.push(val);
                    hasUtm = (val !== '_') ? true : hasUtm;
                });
                campaign = (hasUtm) ? utmJoin.join('|') : null;
            }
            return campaign;
        }

        /**
         * Build out additional tracking values for page name.
         */
        s.setNciPageNameAdditions = function() {
            let s = this;
            let pageNameAdditions = [];
            let pageNum = s.Util.getQueryParam('page');

            // Add audience.
            if (s.prop7) {
                pageNameAdditions.push(s.prop7);
            }

            // Add dictionary types.
            if (s.localPageName.indexOf("dictionaries") > -1 || s.localPageName.indexOf("diccionario") > -1) {
                if (s.Util.getQueryParam('expand')) {
                    pageNameAdditions.push('AlphaNumericBrowse');
                } else if (s.localPageName.indexOf("/def/") >= 0 ) {
                    pageNameAdditions.push('Definition');
                }
            }

            // Add page number query parameter value.
            if (pageNum) {
                pageNameAdditions.push('Page ' + pageNum.toString());
            }

            // Concatenate pageName with any additional strings.
            if(pageNameAdditions.length > 0) {
                s.localPageName += " - " + pageNameAdditions.join(', ');
            }
        }

        /** 
         * Build comma-separated string of s.event values.
         */
        s.setNciEvents = function() {
            // Start building event data from existing values on the "s" object
            let s = this;
            let eventsArr = (s.events && s.events.length > 0) ? s.events.split(',') : [];
            let headData = getNciMetaTagContent('[name="dcterms.isReferencedBy"]');
            let elemData = document.querySelector('[class*="wa-data"][data-events]');
        
            // Add any events from dcterms.isReferencedBy meta tag.
            if(headData) {
                eventsArr = eventsArr.concat(headData.split(','));
            }

            // Add any events from the on the on the wa-data class.
            if(elemData) {
                let eventData = elemData.getAttribute('data-events');
                if (eventData) eventsArr = eventsArr.concat(eventData.split(','));
            }
        
            // Add the standard load events
            eventsArr.push('event1');
            eventsArr.push('event47=' + s.getLoadTime());
        
            // Add engagement tracking (event92)
            if(s.mainCGovIndex >= 0) {
                try {
                    if (typeof (window.NCIEngagementPageLoadComplete) === 'undefined' || !window.NCIEngagementPageLoadComplete) {
        
                        // check the cookie
                        let engagementScore = window.NCIEngagement.getAndResetEngagementCookie();
        
                        // add engagement metrics to the page load call, if needed
                        if (engagementScore && parseInt(engagementScore) > 0) {
                            eventsArr.push('event92=' + engagementScore);
                        }
        
                        // flag to prevent firing this logic more than once per page load
                        window.NCIEngagementPageLoadComplete = true;
                    }
                } catch (err) {
                    // console.log(err);
                }
            }    
        
            // Remove event duplicates and join everything
            eventsArr = eventsArr.filter((item, index) => eventsArr.indexOf(item) === index);
            s.events = eventsArr.join(',');
        }

        /** 
         * Dynamically add numbered variables (e.g. prop1, eVar8) and values to the 's' object.
         * 
         * @param {*} varName 
         * @param {*} selector 
         */
        s.setNciNumberedVars = function(varName, selector) {

            // Get the data element; '.wa-data-element' is the default
            selector = selector || '.wa-data-element';
            let s = this;
            let waData = document.querySelector(selector);
        
            if(varName && waData) {
                for(dataAttr in waData.dataset) {
                    if(dataAttr.indexOf(varName) > -1)
                    {
                        let nvKey = dataAttr.replace('evar', 'eVar'); // 'eVar' must be specified on s object
                        let nvValue = waData.dataset[dataAttr].replace(/(^'+|'+$)/mg, ''); // strip out single quotes
                        s[nvKey] = nvValue;
                    }
                }
            }
        }
                
        /************************** PLUGINS SECTION *************************/
        /* Adobe / 3rd party plugins can be added here.                     */
        /********************************************************************/
        /*
         * Plugin: getValOnce_v1.0
         */
        s.getValOnce=new Function("v","c","e",""
        +"var s=this,a=new Date,v=v?v:v='',c=c?c:c='s_gvo',e=e?e:0,k=s.c_r(c"
        +");if(v){a.setTime(a.getTime()+e*86400000);s.c_w(c,v,e?a:0);}return"
        +" v==k?'':v");

        /*
         * Copyright 2011-2013 Adobe Systems, Inc.
         * s.getLoadTime v1.36 - Get page load time in units of 1/10 seconds
         */
        s.getLoadTime=function(){if(!window.s_loadT){var e="",n=(new Date).getTime(),i=window.performance?performance.timing:0,
        r=i?i.requestStart:window.inHeadTS||0;e=r?Math.round((n-r)/100):""}return e};

        /*
        * Plugin: getTimeParting 3.4
        */
        s._tpDST = AppMeasurementCustom.tpDst;
        s.getTimeParting=new Function("h","z",""
        +"var s=this,od;od=new Date('1/1/2000');if(od.getDay()!=6||od.getMont"
        +"h()!=0){return'Data Not Available';}else{var H,M,D,U,ds,de,tm,da=['"
        +"Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturda"
        +"y'],d=new Date();z=z?z:0;z=parseFloat(z);if(s._tpDST){var dso=s._tp"
        +"DST[d.getFullYear()].split(/,/);ds=new Date(dso[0]+'/'+d.getFullYea"
        +"r());de=new Date(dso[1]+'/'+d.getFullYear());if(h=='n'&&d>ds&&d<de)"
        +"{z=z+1;}else if(h=='s'&&(d>de||d<ds)){z=z+1;}}d=d.getTime()+(d.getT"
        +"imezoneOffset()*60000);d=new Date(d+(3600000*z));H=d.getHours();M=d"
        +".getMinutes();M=(M<10)?'0'+M:M;D=d.getDay();U=' AM';if(H>=12){U=' P"
        +"M';H=H-12;}if(H==0){H=12;}D=da[D];tm=H+':'+M+U;return(tm+'|'+D);}");

        /* Adobe Consulting Plugin: getPercentPageViewed v3.01 w/handlePPVevents helper function (Requires AppMeasurement and p_fo plugin) */
        /* See https://marketing.adobe.com/resources/help/en_US/sc/implement/getPercentPageViewed.html */
        s.getPercentPageViewed=function(pid,ch){var s=this,a=s.c_r("s_ppv");a=-1<a.indexOf(",")?a.split(","):[];a[0]=s.unescape(a[0]); 
        pid=pid?pid:s.pageName?s.pageName:document.location.href;s.ppvChange=ch?ch:!0;if("undefined"===typeof s.linkType||"o"!==
        s.linkType)s.ppvID&&s.ppvID===pid||(s.ppvID=pid,s.c_w("s_ppv",""),s.handlePPVevents()),s.p_fo("s_gppvLoad")&&window
        .addEventListener&&(window.addEventListener("load",s.handlePPVevents,!1),window.addEventListener("click",s.handlePPVevents, !1),window.addEventListener("scroll",s.handlePPVevents,!1),window.addEventListener("resize",s.handlePPVevents,!1)),s._ppvPreviousPage
        =a[0]?a[0]:"",s._ppvHighestPercentViewed=a[1]?a[1]:"",s._ppvInitialPercentViewed=a[2]?a[2]:"",s._ppvHighestPixelsSeen=a[3]?a[3]:""}; 

        /* Adobe Consulting Plugin: handlePPVevents helper function (for getPercentPageViewed v3.01 Plugin) */ 
        s.handlePPVevents=function(){if("undefined"!==typeof s_c_il){for(var c=0,d=s_c_il.length;c<d;c++)if(s_c_il[c]&& 
        s_c_il[c].getPercentPageViewed){var a=s_c_il[c];break}if(a&&a.ppvID){var f=Math.max(Math.max(document.body.scrollHeight, 
        document.documentElement.scrollHeight),Math.max(document.body.offsetHeight,document.documentElement.offsetHeight),Math.max(document.
        body.clientHeight,document.documentElement.clientHeight));c=(window.pageYOffset||window.document.documentElement.scrollTop||window.document.body.scrollTop)+(window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight);d=Math.min(Math.round
        (c/f*100),100);var e="";!a.c_r("s_tp")||a.unescape(a.c_r("s_ppv").split(",")[0])!==a.ppvID||1==a.ppvChange&&
        a.c_r("s_tp")&&f!= a.c_r("s_tp")?(a.c_w("s_tp",f),a.c_w("s_ppv","")):e=a.c_r("s_ppv");var b=e&&-1<e.indexOf(",")?e.split(",",4):[];f=0<b.length?b[0]: 
        escape(a.ppvID);var g=1<b.length?parseInt(b[1]):d,h=2<b.length?parseInt(b[2]):d;b=3<b.length?parseInt(b[3]):c;0<d&&(e=f+"," 
        +(d>g?d:g)+","+h+","+(c>b?c:b));a.c_w("s_ppv",e)}}}; 

        /* Adobe Consulting Plugin: p_fo (pageFirstOnly) v2.0 (Requires AppMeasurement) */ 
        s.p_fo=function(on){var s=this;s.__fo||(s.__fo={});if(s.__fo[on])return!1;s.__fo[on]={};return!0}; 

        /******************************
         * Plugin: socialPlatforms v1.0
         ******************************/
        s.socialPlatforms=new Function("a",""
        +"var s=this,g,K,D,E,F;g=s.referrer?s.referrer:document.referrer;g=g."
        +"toLowerCase();K=s.split(s.socPlatList,'|');for(i=0;i<K.length;i++){"
        +"D=s.split(K[i],'>');if(g.indexOf(D[0])!=-1){if(a){s[a]=D[1];}}}");

        s.socPlatList="facebook.com>Facebook|twitter.com>Twitter|t.co/>Twitter|youtube.com>Youtube|clipmarks.com>Clipmarks|dailymotion.com>Dailymotion|delicious.com>Delicious|digg.com>Digg|diigo.com>Diigo|flickr.com>Flickr|flixster.com>Flixster|fotolog.com>Fotolog|friendfeed.com>FriendFeed|google.com/buzz>Google Buzz|buzz.googleapis.com>Google Buzz|plus.google.com>Google+|hulu.com>Hulu|identi.ca>identi.ca|ilike.com>iLike|intensedebate.com>IntenseDebate|myspace.com>MySpace|newsgator.com>Newsgator|photobucket.com>Photobucket|plurk.com>Plurk|slideshare.net>SlideShare|smugmug.com>SmugMug|stumbleupon.com>StumbleUpon|tumblr.com>Tumblr|vimeo.com>Vimeo|wordpress.com>WordPress|xanga.com>Xanga|metacafe.com>Metacafe|";

        // append list
        s.apl=new Function("L","v","d","u","var s=this,m=0;if(!L)L='';if(u){var i,n,a=s.split(L,d);for(i=0;i<a.length;i++){n=a[i];m=m||(u==1?(n==v):(n.toLowerCase()==v.toLowerCase()));}}if(!m)L=L?L+d+v:v;return L");

        // split v1.5
        s.split=new Function("l","d","var i,x=0,a=new Array;while(l){i=l.indexOf(d);i=i>-1?i:l.length;a[x++]=l.substring(0,i);l=l.substring(i+d.length);}return a");

        // ver. 1.0 - s.join(v,p)| v - Array | p - formatting parameters (front,back,delim,wrap)
        s.join=new Function("v","p","var s=this;var f,b,d,w;if(p){f=p.front?p.front:'';b=p.back?p.back:'';d=p.delim?p.delim:'';w=p.wrap?p.wrap:'';}var str='';for(var x=0;x<v.length;x++){if(typeof(v[x])=='object' )str+=s.join( v[x],p);else str+=w+v[x]+w;if(x<v.length-1)str+=d;}return f+str+b;");

        /*
        * Plugin: getPreviousValue_v1.0 - return previous value of designated
        *   variable (requires split utility)
        */
        s.getPreviousValue = new Function("v", "c", "el", ""
        + "var s=this,t=new Date,i,j,r='';t.setTime(t.getTime()+1800000);if(el"
        + "){if(s.events){i=s.split(el,',');j=s.split(s.events,',');for(x in i"
        + "){for(y in j){if(i[x]==j[y]){if(s.c_r(c)) r=s.c_r(c);v?s.c_w(c,v,t)"
        + ":s.c_w(c,'no value',t);return r}}}}}else{if(s.c_r(c)) r=s.c_r(c);v?"
        + "s.c_w(c,v,t):s.c_w(c,'no value',t);return r}");

        /*
        * Plugin: custom engagement tracking
        */
        s.EvoEngagementPlugin=function(ae){var s=this,engagementObject='NCIEngagement';window[engagementObject]={loggingEnabled:!1,pollingInterval:1e4,scorePerInterval:10,
        hasScrolled:!1,hasMoused:!1,hasClicked:!1,defaultEngagementScore:0,engagementScore:0,minimumEngagementScore:1,cookieName:'engagementTracking',
        logger:function(e,n){var n=n||'log';this.loggingEnabled&&console[n](engagementObject.toUpperCase()+' LOGGER:',e)},
        initialize:function(e){window[engagementObject].logger('initialize');var n=e;window[engagementObject].startTime=(new Date).getTime(),
        this.isFocused=document.hasFocus()},doScroll:function(){this.isFocused=document.hasFocus(),this.isFocused&&(window[engagementObject].logger('doScroll'),
        this.hasScrolled=!0)},doMouse:function(){this.isFocused=document.hasFocus(),window[engagementObject].logger('doMouse'),
        this.isFocused&&(this.hasMoused=!0)},doClick:function(){this.isFocused=document.hasFocus(),window[engagementObject].logger('doClick'),
        this.isFocused&&(this.hasClicked=!0)},getEngagementScore:function(e){var n=e.action,t=e.status,o=e.score,g=t?o+10:o;
        return this[n]=!1,g},getEngagementStatus:function(e){return this.engagementScore=this.getEngagementScore({action:'hasScrolled',
        status:this.hasScrolled,score:this.engagementScore}),this.engagementScore=this.getEngagementScore({action:'hasMoused',status:this.hasMoused,score:this.engagementScore}),
        this.engagementScore=this.getEngagementScore({action:'hasClicked',status:this.hasClicked,score:this.engagementScore}),this.status={engagementScore:this.engagementScore},
        this.status},getAndResetEngagementCookie:function(){var e=this.cookieName,n=NCIAnalytics.cookieRead(e)||'';return NCIAnalytics.cookieWrite(e,'0'),n}},
        window[engagementObject].initialize(window[engagementObject]);var engagement_timer=setInterval(function(){window[engagementObject].getEngagementStatus();
        var e=window[engagementObject].engagementScore>=window[engagementObject].minimumEngagementScore,n=NCIAnalytics.cookieRead(window[engagementObject].cookieName)||0,
        t=e?'engaged':'not engaged';if('engaged'===t){var o=parseInt(n)+window[engagementObject].scorePerInterval;NCIAnalytics.cookieWrite(window[engagementObject].cookieName,o),
        window[engagementObject].logger('engagement-score_'+o),window[engagementObject].engagementScore=window[engagementObject].defaultEngagementScore}else 
        window[engagementObject].logger('engagement-score: '+t.toUpperCase())},window[engagementObject].pollingInterval);ae({element:window,event:'scroll',
        action:function(){window[engagementObject].doScroll()}}),ae({element:window,event:'mouseover',action:function(){window[engagementObject].doMouse()}}),
        ae({element:window,event:'click',action:function(){window[engagementObject].doClick()}})};
        s.EvoEngagementPlugin(attachEvents);

        /*
        * Get mapped NCI suite names.
        */
        function getNciSuites(){var live_or_other=document.URL.indexOf("www.cancer.gov")>-1?"live":"other",wa_hier1="",wa_hier2="",wa_lang="",
        AllSuites={nciglobal:{live:"nciglobal",other:"ncidevelopment"},ncienterprise:{live:"ncienterprise",other:"ncienterprise-dev"},
        "ncienglish-all":{live:"ncienglish-all",other:"ncienglish-all-dev"},"ncispanish-all":{live:"ncispanish-all",other:"ncispanish-all-dev"},
        ncincidictionary:{live:"ncincidictionary",other:"ncincidictionary-dev"},ncidrugdictionary:{live:"ncidrugdictionary",other:"ncidrugdictionary-dev"},
        ncinews:{live:"ncinews",other:"ncinews-dev"},nciresearch:{live:"nciresearch",other:"nciresearch-dev"},nciabout:{live:"nciabout",other:"nciabout-dev"},
        nciclinicaltrials:{live:"nciclinicaltrials",other:"nciclinicaltrials-dev"},ncicancertopics:{live:"ncicancertopics",other:"ncicancertopics-dev"},
        ncitiposdecancer:{live:"ncitiposdecancer",other:"ncitiposdecancer-dev"},ncinoticias:{live:"ncinoticias",other:"ncinoticias-dev"},
        ncinuestroinstituto:{live:"ncinuestroinstituto",other:"ncinuestroinstituto-dev"},ncielcancer:{live:"ncielcancer",other:"ncielcancer-dev"},
        "nciogcr-governmentcongressionalrelations":{live:"nciogcr-governmentcongressionalrelations",other:"nciogcr-govcongressionalrelations-dev"}},
        AnalyticsMapping={GetSuites:function(e){var n=e.split(","),c="";for(i=0;i<n.length;i++)try{var t=n[i].replace(" ","");
        c+=AllSuites[t][live_or_other],i<n.length-1&&(c+=",")}catch(i){c+=""}return c}},suiteMeta=document.head.querySelector('[name="dcterms.coverage"]'),
        suites=suiteMeta?suiteMeta.content:"nciglobal,ncienterprise",s_account=AnalyticsMapping.GetSuites(suites);return s_account;}

        /****************************** MODULES *****************************/

        /*
        * AppMeasurement_Module_Media
        * This replaces the Integrate module from s_code
        * https://marketing.adobe.com/resources/help/en_US/sc/implement/appmeasure_mjs_migrate.html
        */
        function AppMeasurement_Module_Integrate(l){var c=this;c.s=l;var e=window;e.s_c_in||(e.s_c_il=[],e.s_c_in=0);c._il=e.s_c_il;c._in=e.s_c_in;c._il[c._in]=c;e.s_c_in++;c._c="s_m";c.list=[];c.add=function(d,b){var a;b||(b="s_Integrate_"+d);e[b]||(e[b]={});a=c[d]=e[b];a.a=d;a.e=c;a._c=0;a._d=0;void 0==a.disable&&(a.disable=0);a.get=function(b,d){var f=document,h=f.getElementsByTagName("HEAD"),k;if(!a.disable&&(d||(v="s_"+c._in+"_Integrate_"+a.a+"_get_"+a._c),a._c++,a.VAR=v,a.CALLBACK="s_c_il["+c._in+"]."+
        a.a+".callback",a.delay(),h=h&&0<h.length?h[0]:f.body))try{k=f.createElement("SCRIPT"),k.type="text/javascript",k.setAttribute("async","async"),k.src=c.c(a,b),0>b.indexOf("[CALLBACK]")&&(k.onload=k.onreadystatechange=function(){a.callback(e[v])}),h.firstChild?h.insertBefore(k,h.firstChild):h.appendChild(k)}catch(l){}};a.callback=function(b){var c;if(b)for(c in b)Object.prototype[c]||(a[c]=b[c]);a.ready()};a.beacon=function(b){var d="s_i_"+c._in+"_Integrate_"+a.a+"_"+a._c;a.disable||(a._c++,d=e[d]=
        new Image,d.src=c.c(a,b))};a.script=function(b){a.get(b,1)};a.delay=function(){a._d++};a.ready=function(){a._d--;a.disable||l.delayReady()};c.list.push(d)};c._g=function(d){var b,a=(d?"use":"set")+"Vars";for(d=0;d<c.list.length;d++)if((b=c[c.list[d]])&&!b.disable&&b[a])try{b[a](l,b)}catch(e){}};c._t=function(){c._g(1)};c._d=function(){var d,b;for(d=0;d<c.list.length;d++)if((b=c[c.list[d]])&&!b.disable&&0<b._d)return 1;return 0};c.c=function(c,b){var a,e,g,f;"http"!=b.toLowerCase().substring(0,4)&&
        (b="http://"+b);l.ssl&&(b=l.replace(b,"http:","https:"));c.RAND=Math.floor(1E13*Math.random());for(a=0;0<=a;)a=b.indexOf("[",a),0<=a&&(e=b.indexOf("]",a),e>a&&(g=b.substring(a+1,e),2<g.length&&"s."==g.substring(0,2)?(f=l[g.substring(2)])||(f=""):(f=""+c[g],f!=c[g]&&parseFloat(f)!=c[g]&&(g=0)),g&&(b=b.substring(0,a)+encodeURIComponent(f)+b.substring(e+1)),a=e));return b}}

   }

};

// Export our AppMeasurementCustom object.
export { AppMeasurementCustom };
