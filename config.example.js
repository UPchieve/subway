// Server configuration

module.exports = {
	host: process.env.SERVER_HOST || 'localhost:3000',
	database: 'mongodb://user:password@mongodb/database',
	sessionSecret: process.env.SESSION_SECRET || 'PoKtSuRS2phosxZRV9XEVS9hVyMTzSyB',
	saltRounds: 10,
	sendgrid: {
		apiKey: process.env.SENDGRID_API_KEY || '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',
		templateId: '142a621c-127a-46a1-b36a-d0689fd07877'
	}, 
	mail: {
		senders: {
			noreply: 'noreply@example.com'
		}
	},
	client: {
		host: 'localhost:8080'
	},
	socketsPort: 3001
};
