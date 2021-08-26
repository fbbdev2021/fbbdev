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
const session = require('./session');

let body = '';
var pool = mariadb.createPool({
	host: '172.18.0.3', 
	user:'root', 
	password: 'mariadb',
	database: 'sycotax'
});

const option = {
  key: fs.readFileSync('etimbre-selfsigned.key'),
  cert: fs.readFileSync('etimbre-selfsigned.crt')
};

var monServeur=function(requete, reponse){
	body='';
	var page = url.parse(requete.url).pathname ;
	var query=url.parse(requete.url).query ;
	var method=requete.method;
	console.log("user-agent "+requete.headers['user-agent']);
	var host=requete.headers.host;
	var protocole=url.protocol;
	//var remote_ip=requete.headers['x-real-ip'];
	var remote_ip=requete.connection.remoteAddress;
	//var remote_port=requete.headers['x-forwarded-port'];
	var remote_port=requete.connection.remotePort;
	remote_ip = remote_ip.substring(7);
	var local_ip=requete.connection.localAddress;
	var local_port=requete.connection.localPort;
	var headers=requete.headers;
	const FORM_URLENCODED = 'application/x-www-form-urlencoded';
	const FORM_json = 'application/json';
	var path='';
	var redir='';

	try{
		var cookies = cookie.parse(headers.cookie || '');
		console.log('url '+query+' '+page+' '+host+' method '+method);
		console.log('cookie '+cookies.name);
		console.log('cookie '+cookies.company);
		console.log('url '+requete.url);
		console.log('ip '+remote_ip);
		console.log('ip_local '+local_ip);
		console.log('header '+JSON.stringify(headers));
		console.log('check cookies ');
		
		var token="";
		var company="";
		async function test(){
			if(typeof cookies.name !== 'undefined' ){
				var b=await session.check(cookies.name);
				var bb=JSON.parse(b);
				token=(bb.token.length>0?bb.token:null);
				company=(bb.domaine.length>0?bb.domaine:null);
			}
			else{
				token=undefined;
				company=undefined;
			}
		
			var asset=false;
			if(page=='/'){
				page='/index.html';
			}
			console.log('url '+query+' '+page+' '+host+' method '+method);
			if(page.lastIndexOf('/assets/', 0)==0){
				path='/home/timbre/html/'+page;
				asset=true;
			}
			else{
				path=__dirname+page;
				console.log("path "+path);
			}
			/*else{
				if(typeof company !== 'undefined' ){
					path=__dirname+'/'+company+'/app.js';
					console.log("path "+path);
				}
				else if(page.includes('auth-logout.html')||page.includes('auth-login.html')||page.includes('pages-404.html')||page.includes('auth-register.html')||page.includes('auth-recoverpw.html')){
					path=__dirname+page;
					console.log("path "+path);
				}
				else{
					//path=__dirname+'/auth-login.html';
					console.log("path "+path);
				}
			}*/
			
			if (page.includes('log_out')) {
				var cook=''+cookies.name;
				console.log("cook "+cook);
				session.logout(cook);
				reponse.setHeader('Set-Cookie', cookie.serialize('name', cook, {
					httpOnly: true,
					overwrite: true,
					maxAge: 0
				}));
				reponse.writeHead(302,{Location: '/auth-logout.html'});
				reponse.end();
			}
			
			else if (page.includes('ip_port')) {
				var cook=''+cookies.name;
				reponse.writeHead(200,{"Content-Language": "fr"});
				reponse.write('{"ip": "'+remote_ip+'", "port": '+remote_port+'}');
				reponse.end();
			}
			else if (fs.existsSync(path)||page.includes('sign_in')||page.includes('/api/transaction')) {
				console.log('file exists');
				if(asset==true){
					reponse.writeHead(200,{"Content-Language": "fr"}) ;
					reponse.write(fs.readFileSync(path));
					reponse.end();
				}
				else if (page.includes('timbres.html')) {
					async function go(){
						var customers=await getquery3('AA002',token,0);
						var vignettes=await getquery3('VPC01',token,0);
						var eco_token=await getquery3('CB000',token,0);
						var order=await getquery3('ZZ888',token,0);
						var sap=await getquery3('AA777',token,0);
						/*console.log("content "+re.content);
						console.log("offset "+re.offset);
						console.log("Nbre pages "+re.pages);
						console.log("taille pages "+re.taille);
						console.log("total elements "+re.total);
						console.log("elements "+re.elements);
						console.log("empty "+re.empty);
						console.log("first "+re.first);
						console.log("last "+re.last);*/
						//console.log("total elements cus "+customers.total);
						console.log("total elements quot "+vignettes.total);
						
						if(customers.total>=0 && vignettes.total>=0){	
							reponse.writeHead(200,{"Content-Language": "fr"});
							var res=''+fs.readFileSync(__dirname+'/timbres.html');
							res=res.replace("{customer}",customers.total);
							res=res.replace("{vignettes}",vignettes.total);
							res=res.replace("{eco_token}",eco_token.total);
							res=res.replace("{orders}",order.total);
							res=res.replace("{log_sap}",sap.total);
							reponse.write(res);
							reponse.end();
						}
						else{
							console.error(`problem with request: invalid variable`);
							reponse.writeHead(500,{"Content-Language": "fr"});
							reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
							reponse.end();
						}
					}
					go();
				}
				else{
					reponse.writeHead(404,{"Content-Language": "fr"}) ;
					reponse.write(fs.readFileSync(__dirname+'/pages-404.html'));
					reponse.end();
				}
			}
			else{
				console.log('no file exists');
				reponse.writeHead(404,{"Content-Type": "text/html; charset=UTF-8"}) ;
				reponse.write(fs.readFileSync(__dirname+'/pages-404.html'));
				reponse.end();
			}
		}
		test();
	}
	catch (error) {
		console.log('erreur try '+error);
		reponse.writeHead(500,{"Content-Language": "fr"});
		reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
		reponse.end();
	}
}
var serveur = https.createServer(option,monServeur) ;

serveur.listen(3000) ;
console.log('serveur en marche');

async function getquery3(dataset,cookie,ind) {
	let ret=JSON.parse('{"content":[],"elements":0,"offset":0,"pages":0,"empty": false,"first": false,"last":false,"taille":0,"total":0}');
	await post_interval(dataset,cookie,ind);
		
	async function post_interval(){
		var options = {
			hostname: 'localhost',
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': cookie
			}
		};
		var bod2='';
		var json;
		try{
			var res = await fetch('http://localhost:8080/api/transaction?datasetCode='+dataset+'&page='+ind+'&size=10',options);
			var bo=await res.json();
			var json=JSON.parse(JSON.stringify(bo));
			var content=json.content;
			ret.content=content;
			var pageable=json.pageable;
			var numberOfElements=json.numberOfElements;
			ret.elements=numberOfElements;
			var number=json.number;
			ret.offset=number;
			
			console.log('test '+number);
			var totalPages=json.totalPages;
			ret.pages=totalPages;
			var empty=json.empty;
			ret.empty=empty;
			var first=json.first;
			ret.first=first;
			var size=json.size;
			ret.taille=size;
			var last=json.last;
			ret.last=last;
			var totalElements=json.totalElements;
			ret.total=totalElements;
		}
		catch (error) {
			console.log('erreur fetch '+JSON.stringify(error.response));
		}
	}
	console.log('après 3 '+ret.total);	
	return ret;
}