const debug = false;
const displayAlerts = false;

// Old var for forcing the page name
const pageName = 'D=pageName';

/**
 * Legacy click tracking.
 * @param {HTMLElement} sender The item that raised the event.
 * @param {string} reportSuites This is ignored.
 * @param {string} linkType the s.tl type for the event.
 * @param {string} linkName The linkname for the analytics
 */
const ClickParams = function (sender, reportSuites, linkType, linkName) {
  /*
   The facility for defining report suites by the parameter reportSuites
   has been discontinued - now report suites are defined in the s_account variable
   set in the Omniture s_code.js file.  The supporting code for the parameter method
   has been retained in case the requirements change.
   */
  this.ReportSuites = (s_account) ? s_account : 'ncidevelopment'; // Formerly the reportSuites argument

  // For debugging only
  if (debug) {
      console.log('Debug NCIAnalytics.ClickParams():');
      console.log(s.account);
  };
  this.sender = sender;
  this.LinkType = linkType;
  this.LinkName = linkName;
  this.Props = {};
  this.Evars = {};
  this.Events = {};
  this.EventsWithIncrementors = {};

  this.LogToOmniture = function () {

      // Only fire off click events if the s_gi() function is found
      var local_s;
      if (typeof(s_gi) === 'function' && this.ReportSuites) {
          local_s = s_gi(this.ReportSuites);
      } else {
          return;
      }
      local_s.linkTrackVars = '';

      // add language prop8 - Warning: adding prop8 to individual onclick functions will cause duplication
      local_s['prop8'] = document.querySelector('[lang="es"]') ? 'spanish' : 'english';
      local_s.linkTrackVars += 'channel,';
      local_s.linkTrackVars += 'prop8';

      for (var i in this.Props) {
          local_s['prop' + i] = this.Props[i];
          if (local_s.linkTrackVars.length > 0) {
              local_s.linkTrackVars += ',';
          }

          local_s.linkTrackVars += 'prop' + i;
      }
      // add link page prop (prop67) to all link tracking calls when not already present; existing values are given preference
      if(!this.Props[67]) {

          local_s['prop67'] = pageName;

          if (local_s.linkTrackVars.length > 0){
              local_s.linkTrackVars += ',';
          }

          local_s.linkTrackVars += 'prop67';
      }

      // add engagement score (event92) to all link tracking calls
      if(local_s.mainCGovIndex >= 0) {
          try {
              var engagementScore = '';
              var engagementObject = 'NCIEngagement';

              // depends on engagement plugin
              engagementScore = window[engagementObject].getAndResetEngagementCookie() || 0;

              if (engagementScore && parseInt(engagementScore) > 0) {
                  // add the engagement event, but check to see if EventsWithIncrementors is an array before doing so
                  if (this.EventsWithIncrementors && this.EventsWithIncrementors.hasOwnProperty('push')) {
                      this.EventsWithIncrementors.push('92=' + engagementScore); // add to existing events
                  } else {
                      this.EventsWithIncrementors = ['92=' + engagementScore]; // it's the only event
                  }
              }
          } catch (err) {
              /** console.log(err); */
          }
      }

      // add link.href value (prop4) to all link tracking calls when not already present; existing values are given preference
      if(!this.Props[4]) {
          local_s['prop4'] = 'D=pev1';

          if (local_s.linkTrackVars.length > 0){
              local_s.linkTrackVars += ',';
          }

          local_s.linkTrackVars += 'prop4';
      }

      // add language eVar2 - Warning: adding eVar2 to individual onclick functions will cause duplication
      local_s['eVar2'] = local_s['prop8'];
      if (local_s.linkTrackVars.length > 0){
          local_s.linkTrackVars += ',';
      }

      local_s.linkTrackVars += 'eVar2';

      for (var i in this.Evars) {
          local_s['eVar' + i] = this.Evars[i];

          if (local_s.linkTrackVars.length > 0){
              local_s.linkTrackVars += ',';
          }

          local_s.linkTrackVars += 'eVar' + i;
      }

      if (this.Events.length > 0) {
          var eventsString = '';
          if (local_s.linkTrackVars.length > 0){
              local_s.linkTrackVars += ',';
          }

          local_s.linkTrackVars += 'events';

          for (var i = 0; i < this.Events.length; i++) {
              if (eventsString.length > 0){
                  eventsString += ',';
              }

              eventsString += 'event' + this.Events[i];
          }
          local_s.linkTrackEvents = eventsString;
          local_s.events = eventsString;
      }

      // provide support for events including values (event999=4) or serial ids (event999:abc123)
      if (this.EventsWithIncrementors.length > 0) {
          var eventNum = '',
              eventsString = '',
              cleanEventsString = '';
          if (local_s.linkTrackVars.length > 0 && local_s.linkTrackVars.indexOf('events') < 0){
              local_s.linkTrackVars += ',';
          }

          local_s.linkTrackVars += 'events';

          for (var i = 0; i < this.EventsWithIncrementors.length; i++) {
              if (eventsString.length > 0){
                  eventsString += ',';
              }

              eventNum = 'event' + this.EventsWithIncrementors[i];
              eventsString += eventNum;

              cleanEventsString = eventNum.split(':');
              cleanEventsString = cleanEventsString[0].split('=');
              cleanEventsString = cleanEventsString[0];

          }
          local_s.linkTrackEvents = (local_s.linkTrackEvents) ? local_s.linkTrackEvents + ',' + cleanEventsString : cleanEventsString;
          local_s.events = (local_s.events) ? local_s.events + ',' + eventsString : eventsString;;
      }
      local_s.tl(sender, this.LinkType, this.LinkName);

      //Clear events and all props and eVars set in this click event image request
      local_s.events = '';
      for (var i in this.Props) {
          local_s['prop' + i] = '';
      }
      for (var i in this.Evars) {
          local_s['eVar' + i] = '';
      }

      if (displayAlerts) {
          var alertString = 'ScriptBuilder:\n' + 'local_s.linkTrackVars=' + local_s.linkTrackVars;
          if (local_s.linkTrackEvents != 'None'){
              alertString += '\nlocal_s.linkTrackEvents=' + local_s.linkTrackEvents;
          }

          if (local_s.linkTrackVars.length > 0) {
              var linkTrackVarArray = local_s.linkTrackVars.split(',');
              for (var i = 0; i < linkTrackVarArray.length; i++) {
                  if (linkTrackVarArray[i] != 'events') {
                      alertString += '\nlocal_s.' + linkTrackVarArray[i];
                      alertString += '=' + local_s[linkTrackVarArray[i]];
                  }
              }
          }
          alertString += '\nReport Suites=' + this.ReportSuites;
          alertString += '\nLink Type=' + this.LinkType;
          alertString += '\nLink Name=' + this.LinkName;
          alert(alertString);
      }
  }
};

export default ClickParams;
