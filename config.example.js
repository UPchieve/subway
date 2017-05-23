// Server configuration

module.exports = {
	host: process.env.SERVER_HOST || 'localhost:3000',
	database: 'mongodb://user:password@mongodb/database',
	sessionSecret: process.env.SESSION_SECRET || 'PoKtSuRS2phosxZRV9XEVS9hVyMTzSyB',
	saltRounds: 10,
	sendgridApiKey: process.env.SENDGRID_API_KEY || '',
	client: {
		host: 'localhost:8080'
	},
	socketsPort: 3001
};
