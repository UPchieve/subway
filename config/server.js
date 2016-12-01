// Server configuration

module.exports = {
	host: process.env.SERVER_HOST || 'localhost:3000',
	database: 'mongodb://admin:NyN6Ff7pTjn2HL@ds011331.mlab.com:11331/believeachieve',
	sessionSecret: process.env.SESSION_SECRET || 'PoKtSuRS2phoslZRV9XEVS9hVyMTzSyB',
	saltRounds: 10
};
