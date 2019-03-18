/**
 * This module wraps the s object so we can reference it from plugins.
 * @param  {[type]} require) {	return     window.s;} [description]
 * @return {[type]}          [description]
 */
export default {
	getSObject: function() {
		return window.s;
	},
	getInstance: function() {
		return window.s_gi(window.s_account);
	}
}
