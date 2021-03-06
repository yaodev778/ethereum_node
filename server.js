import express from 'express';
import bodyParser from 'body-parser';
import jsonwebtoken from 'jsonwebtoken';
import cors from 'cors';
import Config from './config';
import { authenticate, authError } from './middleware';
import fs from 'fs';
import path from 'path'

const { port, secretKey, expiredAfter } = Config;
const app = express();

function doesUserExists(username, password) {
	const user = {
		id: 1,
		username: 'demo@gmail.com',
		password: 'demodemo',
	};
	if (username === user.username && password === user.password) {
		return true;
	}
	return false;
}

app
	.use(bodyParser.urlencoded({ extended: true }))
	.use(bodyParser.json())
	.use(cors());

app.get('/', (req, res) => {
	res.json({ status: 'OK' });
});

app.post('/api/login', (req, res) => {
	const { username, password } = req.body;
	const response = {};
	// You can use DB checking here

	if (doesUserExists(username, password)) {
		response.token = jsonwebtoken.sign(
			{
				expiredAt: new Date().getTime() + expiredAfter,
				username,
				id: 1,
			},
			secretKey
		);
	} else {
		response.error = 'Not found';
	}
	res.json(response);
});
app.use('/api/secret', [authenticate, authError]);
app.post('/api/secret/test', (req, res) => {
	res.json({
		status: 200,
		message: 'succcesful',
	});
});

const AFT = require('./aft');
app.post('/api/sendToken', AFT.sendToken);

// const ACT = require('./account');
// app.post('/api/sendToken', ACT.sendTransaction);


// set path for static
const walletBuild = path.join(__dirname, 'public');
const indexPagePath = path.join(__dirname, 'public/wallet/index.html');
const indexPage = fs.readFileSync(indexPagePath);

// set static route
app.use(express.static(walletBuild));

// send file for refresh
app.use(async (ctx) => {
  ctx.body = indexPage.toString();
});

app.listen(port, () => {
	console.log('Smartvoucher JWT login ' + port);
});
