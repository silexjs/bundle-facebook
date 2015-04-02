var Facebook = function(containerService, configService) {
	this.containerService = containerService;
	this.configService = configService;
	this.config = {};
	this.fb = require('fb');
};
Facebook.prototype = {
	containerService: null,
	configService: null,
	config: null,
	fb: null,
	
	onKernelReady: function(next) {
		this.config = this.configService.get('facebook');
		if(this.config === undefined) {
			throw new Error('[silex.facebook.service] Configuration is empty !');
		}
		this.fb.options({
			appId: this.config.appId,
			appSecret: this.config.appSecret,
		});
		this.containerService.set('fb', this);
		next();
	},
	
	getLoginUrl: function(redirectUri, options) {
		if(typeof redirectUri === 'string') {
			options = options || {};
			options.redirectUri = redirectUri;
		} else {
			options = redirectUri;
		}
		options.scope = options.scope || this.config.scopeDefault;
		return this.fb.getLoginUrl(options);
	},
	api: function() {
		return this.fb.api.apply(this.fb, arguments);
	},
	
	getUserToken: function(redirectUri, code, callbackValid, callbackError) {
		callbackValid = callbackValid || function(){};
		callbackError = callbackError || function(){};
		this.fb.api('oauth/access_token', {
			client_id:		this.config.appId,
			client_secret:	this.config.appSecret,
			redirect_uri:	redirectUri,
			code:			code,
		}, function(response) {
			if(response !== undefined && response.error === undefined) {
				callbackValid(response);
			} else {
				callbackError(response.error, response);
			}
		});
	},
	getUserExtendToken: function(token, callbackValid, callbackError) {
		callbackValid = callbackValid || function(){};
		callbackError = callbackError || function(){};
		this.fb.api('oauth/access_token', {
			client_id:			this.config.appId,
			client_secret:		this.config.appSecret,
			grant_type:			'fb_exchange_token',
			fb_exchange_token:	token,
		}, function(response) {
			if(response !== undefined && response.error === undefined) {
				callbackValid(response);
			} else {
				callbackError(response.error, response);
			}
		});
	},
	getUserData: function(action, fields, token, callbackValid, callbackError) {
		if(token === undefined || typeof token === 'function') {
			callbackError = callbackValid;
			callbackValid = token;
			token = fields;
			fields = action;
			action = '/me';
		}
		callbackValid = callbackValid || function(){};
		callbackError = callbackError || function(){};
		this.fb.api(action, {
			access_token: token,
			fields: fields,
		}, function(response) {
			if(response !== undefined && response.error === undefined) {
				callbackValid(response);
			} else {
				callbackError(response.error, response);
			}
		});
	},
};


module.exports = Facebook;
