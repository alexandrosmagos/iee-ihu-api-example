const axios = require('axios');
const NodeCache = require('node-cache');
const chalk = require('chalk');

const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });


//==========================================//
//   Exchanging Proof for an Access Token   //
//==========================================//

const exchangeForTokens = async (userId, exchangeProof) => {
	try {
		const token = await axios.request({
			url: "/token",
			method: "post",
			baseURL: "https://login.iee.ihu.gr/",
			data: exchangeProof
		}).then(function(res) {
			return res.data;
		});
	
		// Usually, this token data should be persisted in a database and associated with
		// a user identity.
		refreshTokenStore[userId] = token.refresh_token;
		accessTokenCache.set(userId, token.access_token, Math.round(token.expires_in * 0.75));
  
		console.log(chalk.green('       > Received an access token and refresh token'));
		return token.access_token;
	} catch (e) {
		console.error(chalk.red(`       > Error exchanging ${exchangeProof.grant_type} for access token`));
		return JSON.parse(e.response.body);
	}
};
  
const refreshAccessToken = async (userId) => {
	const refreshTokenProof = {
		grant_type: 'refresh_token',
		client_id: process.env.CLIENT_ID,
		client_secret: process.env.CLIENT_SECRET,
		redirect_uri: process.env.REDIRECT_URI,
		refresh_token: refreshTokenStore[userId]
	};
	return await exchangeForTokens(userId, refreshTokenProof);
};
  
const getAccessToken = async (userId) => {
	// If the access token has expired, retrieve
	// a new one using the refresh token
	if (!accessTokenCache.get(userId)) {
		console.log('Refreshing expired access token');
		await refreshAccessToken(userId);
	}
	return accessTokenCache.get(userId);
};
  
const isAuthorized = (userId) => {
	return refreshTokenStore[userId] ? true : false;
};
  
//====================================================//
//   Using an Access Token to Query the APPS API   //
//====================================================//
  
const getProfile = async (accessToken) => {
	try {
		const config = {
			headers:{
				'x-access-token': `${accessToken}`,
				'Content-Type': 'application/json'
			}
		};
		console.log('===> request.get(\'https://api.iee.ihu.gr/profile\')');
		const profile = await axios.get('https://api.iee.ihu.gr/profile', config).then((res) => {
			return res.data;
		});
	
		return profile;
  
	} catch (e) {
		console.error(chalk.red('  > Unable to retrieve profile'));
		return JSON.parse(e.response.body);
	}
};
  
const getAnnouncements = async (accessToken) => {
	try {
		const config = {
			headers:{
				'x-access-token': `${accessToken}`,
				'Content-Type': 'application/json'
			}
		};
		//pageSize is part of filtering mentioned in the documentation https://github.com/apavlidi/IT_API/wiki/API-Documentation#filtering
		console.log('===> request.get(\'https://api.iee.ihu.gr/announcements?pageSize=1\')');
		const announcements = await axios.get('https://api.iee.ihu.gr/announcements?pageSize=1', config).then((res) => {
			return res.data;
		});
		console.log(announcements[0]);
		return announcements;
	
	} catch (e) {
		console.error(chalk.red('  > Unable to retrieve announcements'));
		return JSON.parse(e.response.body);
	}
};


//export all functions
module.exports = {
	exchangeForTokens,
	refreshAccessToken,
	getAccessToken,
	isAuthorized,
	getProfile,
	getAnnouncements
};