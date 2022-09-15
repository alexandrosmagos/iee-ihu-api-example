const { Router } = require('express');
const utils = require('../utils.js');

const router = Router();

router.get('/', async (req, res) => {
	res.setHeader('Content-Type', 'text/html');
	res.write(`<h2>IEE IHU'S APPS API Auth Quickstart App</h2>`);
	if (utils.isAuthorized(req.sessionID)) {
		const accessToken = await utils.getAccessToken(req.sessionID);
		// const profile = await getProfile(accessToken);
		res.write(`<h4>Access token: ${accessToken}</h4>`);
		res.write(`<a href="/profile"><h3>Profile Info</h3></a>`);
		res.write(`<a href="/announcements"><h3>Last announcement</h3></a>`);
	} else {
		res.write(`<a href="/auth"><h3>Authenticate</h3></a>`);
	}
	res.end();
});
  
router.get('/profile', async (req, res) => {
	res.setHeader('Content-Type', 'text/html');
	res.write(`<h2>PROFILE</h2>`);

	if (utils.isAuthorized(req.sessionID)) {
		const accessToken = await utils.getAccessToken(req.sessionID);
		const profile = await utils.getProfile(accessToken);
		//pring profile object
		res.write(`<h4>Name: ${profile.cn}</h4>`);
		res.write(`<h4>Father's Name: ${profile.fathersname}</h4>`);
		res.write(`<h4>Username: ${profile.uid}</h4>`);
		res.write(`<h4>Email: ${profile.mail}</h4>`);
		res.write(`<h4>Title: ${profile.title}</h4>`);
		res.write(`<h4>Semester: ${profile.sem}</h4>`);
		res.write(`<h4>Year Registered: ${profile.regyear}</h4>`);
		res.write(`<h4>Student ID: ${profile.am}</h4>`);
		res.write("");
		res.write(`<a href="/"><h3>Home</h3></a>`);
	} else {
		res.write(`<a href="/auth"><h3>Authenticate</h3></a>`);
	}

	res.end();
});
  
router.get('/announcements', async (req, res) => {
	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	res.write(`<h2>Last Announcement</h2>`);
	
	if (utils.isAuthorized(req.sessionID)) {
		const accessToken = await utils.getAccessToken(req.sessionID);
		const announcements = await utils.getAnnouncements(accessToken);
		
		res.write(`<h4>By: ${announcements[0].publisher.name}</h4>`);
		res.write(`<h4>Posted at: ${announcements[0].date}</h4>`);
		res.write(`<h4>Title: ${announcements[0].title}</h4>`);
		res.write(`<h4>Body: ${announcements[0].text}</h4>`);
		res.write("");
		res.write(`<a href="/"><h3>Home</h3></a>`);
	} else {
		res.write(`<a href="/auth"><h3>Authenticate</h3></a>`);
	}
	res.end();
});
  
router.get('/error', (req, res) => {
	res.setHeader('Content-Type', 'text/html');
	res.write(`<h4>Error: ${req.query.msg}</h4>`);
	res.end();
});


module.exports = router;