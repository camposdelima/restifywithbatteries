module.exports.create = function create(params) {
	params = params || {};
	const restify = require('restify'),
	logger  = require('morgan'),
	corsMiddleware = require('restify-cors-middleware'),
	cache = new (require("node-cache"))({ stdTTL: params.ttl || 18000 }),
	cors = corsMiddleware({ preflightMaxAge: 5, origins: ['*'], allowHeaders: ['API-Token'], exposeHeaders: ['API-Token-Expiry']}),
	
	withDefault = (func) =>
		async (req, res) => {
			try {
				await func(req, res);
			} catch (err) {
				console.warn(err);
				if(err.message.indexOf('not found') > 0)
					res.status(404);
				else if(err.code == 'ETIMEDOUT' || err.code == 'EHOSTUNREACH')
					res.status(504);
				else
					res.status(500);
			} finally {
				res.end(); 
			}  
		},
	withCache = (factoryFunc, ttl) =>
		withDefault(async (req, res) => {
			let key = req.href();
			res.send(				
				cache.get(key) || ( cache.set(key, await factoryFunc(req.params), ttl) && cache.get(key) )
			);
		}),
	
	server = restify.createServer();
	
	server.pre(cors.preflight);	
	server.use(cors.actual).use(restify.plugins.bodyParser()).use(logger('dev')).use((req, res, next)=> {
		res.setHeader('Access-Control-Allow-Origin','*');
		res.setHeader('content-type','application/json');
		next();
	}).get('/', (req, res) =>  res.end());
	server.start = port => server.listen(port || params.port, () => console.info('listening url %s', server.url));
	server.prepare = func => {
		func(server);
		return server;
	};
	
	return server;	
};