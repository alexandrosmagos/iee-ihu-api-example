require('dotenv').config();
const express = require('express');
const session = require('express-session');
const routes = require('./routes/main');
const utils = require('./utils.js');
const chalk = require('chalk');
const app = express();

//===========================================================================//
//  APPS APP CONFIGURATION

const PORT = process.env.PORT || 3000;

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
	// throw new Error('Missing CLIENT_ID or CLIENT_SECRET environment variable.');
	return console.log(chalk.bgRed('Missing CLIENT_ID or CLIENT_SECRET environment variable.'));
}

if (!process.env.SCOPES) {
	return console.log(chalk.bgRed('Missing SCOPES environment variable.'));
}

if (!process.env.REDIRECT_URI) {
	return console.log(chalk.bgRed('Missing REDIRECT_URI environment variable.'));
}

//===========================================================================//

// Use a session to keep track of client ID
app.use(session({
	secret: Math.random().toString(36).substring(2),
	resave: false,
	saveUninitialized: true
}));
 
//================================//
//   Running the OAuth 2.0 Flow   //
//================================//

// Step 1
// Building the authorization URL to transfer the user to when they need to authenticate
const authUrl =
  'https://login.iee.ihu.gr/authorization/' +
  `?client_id=${encodeURIComponent(process.env.CLIENT_ID)}` + // app's client ID
  `&response_type=code` +
  `&scope=${process.env.SCOPES}` + // scopes being requested by the app
  `&redirect_uri=${process.env.REDIRECT_URI}`; // where to send the user after the consent page

// Redirect the user from the installation page to the authorization URL
app.get('/auth', (req, res) => {
	console.log('');
	console.log("=== Initiating OAuth 2.0 protocol with IEE IHU's Apps ===");
	console.log('');
	console.log("===> Step 1: Redirecting user to your app's OAuth URL");
	res.redirect(authUrl);
	console.log('===> Step 2: User is being prompted for consent by Apps');
});

// Step 2
// The user is prompted to accept or deny his permissions to the app. This is all done by IEE'S APPS, so no work is necessary on our end

// Step 3
// We receive the authorization code from the OAuth 2 and process it
app.get('/callback', async (req, res) => {
	console.log('===> Step 3: Handling the request sent by the server');

	// Received a user authorization code, so now combine that with the other
	// required values and exchange both for an access token and a refresh token
	if (req.query.code) {
		console.log(chalk.green('       > Received an authorization token'));

		const authCodeProof = {
			grant_type: 'authorization_code',
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			redirect_uri: process.env.REDIRECT_URI,
			code: req.query.code
		};

		// Step 4
		// Exchange the authorization code for an access token and refresh token
		console.log('===> Step 4: Exchanging authorization code for an access token and refresh token');
		const token = await utils.exchangeForTokens(req.sessionID, authCodeProof);
		//If any error occurs, redirect user to the /error endpoint with the error message
		if (token.message) {
			return res.redirect(`/error?msg=${token.message}`);
		}

		// Once the tokens have been retrieved, we are done and ready to make queries
		res.redirect(`/`);
	}
});

//Initializing routes
app.use(routes);

//Start the express app
app.listen(PORT, () => console.log(chalk.bgWhite(`=== App started on http://localhost:${PORT} ===`)));
