var url = require('url') ;
var fs = require('fs') ;
var http = require('http') ;
var https = require('https') ;
var mariadb = require('mariadb');
var bcrypt = require('bcrypt');
var net = require('net');
var cookie = require('cookie');
var fetch = require('node-fetch');
var sha512 = require('js-sha512');
var httpProxy = require('http-proxy');

const option = {
  key: fs.readFileSync('etimbre-selfsigned.key'),
  cert: fs.readFileSync('etimbre-selfsigned.crt')
};

var proxy = httpProxy.createProxyServer({});

proxy.on('proxyRes', function(proxyRes, req, res) {
	if(proxyRes.headers.location!=undefined){
		proxyRes.headers.location=proxyRes.headers.location.replace("http","https");
	}
  //console.log(proxyRes.headers);
  //console.log(res.headers);
});
var monServeur=function(requete, reponse){
	proxy.web(requete, reponse, { target: 'http://127.0.0.1:8081' });
}
var serveur = https.createServer(option,monServeur) ;

serveur.listen(8080) ;
console.log('serveur en marche');
