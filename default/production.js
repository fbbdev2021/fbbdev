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

const option = {
};

var monServeur=function(requete, reponse){

	try{
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
			try{
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
					path='/home/ubuntu/html'+page;
					asset=true;
				}
				else{
					if(typeof company !== 'undefined' ){
						path=__dirname+'/'+company+'/app.js';
						console.log("path "+path);
					}
					else if(page.includes('auth-logout.html')||page.includes('auth-login.html')||page.includes('pages-404.html')||page.includes('auth-register.html')||page.includes('auth-recoverpw.html')){
						path=__dirname+page;
						console.log("path "+path);
					}
					else{
						path=__dirname+'/auth-login.html';
						console.log("path "+path);
					}
				}
				
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
				else if(page.includes('mariadb.tar')){
					reponse.writeHead(200,{"Content-Language": "fr"}) ;
					path=__dirname+'/mariadb.tar';
					reponse.write(fs.readFileSync(path));
					reponse.end();
				}
				else if(page.includes('redis.tar')){
					reponse.writeHead(200,{"Content-Language": "fr"}) ;
					path=__dirname+'/redis.tar';
					reponse.write(fs.readFileSync(path));
					reponse.end();
				}
				else if(page.includes('ubold.zip')){
					reponse.writeHead(200,{"Content-Language": "fr"}) ;
					path=__dirname+'/ubold.zip';
					reponse.write(fs.readFileSync(path));
					reponse.end();
				}
				else if (fs.existsSync(path)||page.includes('sign_in')||page.includes('/api/transaction')) {
					console.log('file exists');
					if(asset==true){
						reponse.writeHead(200,{"Content-Language": "fr"}) ;
						reponse.write(fs.readFileSync(path));
						reponse.end();
					}
					else{
						if(typeof token !== 'undefined' || typeof company !== 'undefined'){
							console.log('cookie exists');
							var cook=''+cookies.name;
							console.log('oui avant');
							session.update(cook);
							reponse.setHeader('Set-Cookie', cookie.serialize('name', cook, {
								httpOnly: true,
								overwrite: true,
								maxAge: 60*60
							}));
							if(page.includes('sign_in')||page.includes('auth-logout.html')||page.includes('auth-login.html')||page.includes('pages-404.html')||page.includes('auth-register.html')||page.includes('auth-recoverpw.html')){
								reponse.writeHead(302,{Location: '/index.html'});
								reponse.end();
								console.log('cookie if');
							}
							else if (page.includes('/api/transaction')) {
								let bod='';
								if(method=='GET'){
									requete.on('data', chunk => {
										bod += chunk.toString();
									});
									requete.on('end', () => {
										console.log('body '+bod);
										console.log('url '+page+'?'+query);
										var options = {
											hostname: 'localhost',
											port: 8080,
											path: page+'?'+query,
											method: 'GET',
											headers: {
												'Content-Type': 'application/json',
												'X-API-Key': token
											}
										};

										post_interval();
										function post_interval(){
											var bod2='';
											var json;
											var req = http.request(options, (res) => {
											  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
											  res.setEncoding('utf8');
											  res.on('data', (chunk) => {
												bod2 += chunk.toString();
											  });
											  res.on('end', () => {
												console.log(`BODY: ${JSON.stringify(bod2)}`);
												console.log('No more data in response.');
												
												reponse.writeHead(200,{"Content-Language": "fr"});
												reponse.write(bod2);
												reponse.end();
											  });
											});
											req.on('error', (e) => {
												console.error(`problem with request: ${e.message}`);
												reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
												reponse.end();
											});
											req.write(bod);
											req.end();
										}
									});
								}
							}
							
							else{
								var cook=''+cookies.name;
								session.update(cook);
								reponse.setHeader('Set-Cookie', cookie.serialize('name', cook, {
									httpOnly: true,
									overwrite: true,
									maxAge: 60*60
								}));
								console.log('company '+company);
								try{
									const app=require(__dirname+'/'+company+'/app');
									app.execute(requete,reponse,token);
								}
								catch (error) {
									console.log('erreur try '+error);
									reponse.writeHead(500,{"Content-Language": "fr"});
									reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
									reponse.end();
								}
							}
						}
						else{
							console.log('else file exists ');
							if(page.includes('sign_in')&&method=='POST'){
								if(requete.headers['content-type'] === FORM_URLENCODED) {
									requete.on('data', chunk => {
										body += chunk.toString();
									});
									requete.on('end', () => {
										console.log('body '+body);
										body=decodeURIComponent(body);
										console.log('body '+body);
										var output = {};
										body = body.split('&');
										body.forEach(function(param) {
											console.log('post '+param);
											var param = param.split('=');
											output[param[0]] = param[1].replace('+',' ');
										})
										console.log('email '+output.email);
										console.log('company '+output.company);
										console.log('password '+output.password);
										
										var id=0;
										var postData='';

										var options = {
										  hostname: 'localhost',
										  port: 8080,
										  path: '/api/company',
										  method: 'GET',
										  headers: {
											'Content-Type': 'application/json',
											'X-API-Key': 'oNyToAnfCcaIKk9QTwsMEc0oJLcGf3bMWTEVC7iHV5rO9yz4KLMhzXcpqcLdFt1RqwoeRWUJCwTbA7SAcgTWCbaairwgwlmMIEtyV9ObCSBS264oTokejqmJaos9QVqj',
											'Content-Length': Buffer.byteLength(postData)
										  }
										};

										var bod;
										var req = http.request(options, (res) => {
										  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
										  res.setEncoding('utf8');
										  res.on('data', (chunk) => {
											try{
												console.log(chunk.toString());
												bod = JSON.parse(chunk.toString());
												for(var i=0;i<bod.length;i++){
													console.log(i+' '+JSON.stringify(bod[i]));
													console.log('name '+bod[i].name);
													console.log('name '+output.company);
													if(bod[i].name.toLowerCase()==output.company.toLowerCase()){
														console.log('match');
														id=i+1;
														break;
													}
												}
											}
											catch (error) {
												console.log('erreur try '+error);
												reponse.writeHead(500,{"Content-Language": "fr"});
												reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
												reponse.end();
											}
											//console.log(`BODY: ${JSON.stringify(bod[0])}`);
										  });
										  res.on('end', () => {
											console.log('No more data in response.');
											postData =`{"email": "${output.email}",`;
											postData +='"companyId": '+id+',';
											postData +=`"password": "${output.password}"}`;
											console.log('postData '+postData);
											try{
												if(id>=1){
													var options = {
													  hostname: 'localhost',
													  port: 8080,
													  path: '/api/auth',
													  method: 'GET',
													  headers: {
														'Content-Type': 'application/json',
														'X-API-Key': 'oNyToAnfCcaIKk9QTwsMEc0oJLcGf3bMWTEVC7iHV5rO9yz4KLMhzXcpqcLdFt1RqwoeRWUJCwTbA7SAcgTWCbaairwgwlmMIEtyV9ObCSBS264oTokejqmJaos9QVqj',
														'Content-Length': Buffer.byteLength(postData)
													  }
													};

													var bod='';
													var req = http.request(options, (res) => {
													  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
													  res.setEncoding('utf8');
													  res.on('data', (chunk) => {
														bod = chunk.toString();
														console.log(`BODY: ${JSON.stringify(bod)}`);
													  });
													  res.on('end', () => {
														console.log('No more data in response.');
														try{
															if(bod.length==128){
																
																var cook=''+session.get_session();
																console.log("cook "+cook);
																session.start(remote_ip,requete.headers['user-agent'],bod,cook,output.company.toLowerCase());
																reponse.setHeader('Set-Cookie', cookie.serialize('name', cook, {
																	httpOnly: true,
																	overwrite: true,
																	maxAge: 60*60
																}));
																if(typeof query !== 'undefined'&&query!=null){
																	console.log('No more '+query);
																	var search = query.split('=');
																	redir=search[1];
																	reponse.writeHead(302,{Location: decodeURIComponent(redir)});
																	reponse.end();

																}
																else{
																	reponse.writeHead(302,{Location: '/index.html'});
																	reponse.end();
																}
															}
															else{
																reponse.writeHead(302,{Location: '/auth-login.html'});
																reponse.end();
															}
														}
														catch (error) {
															console.log('erreur try '+error);
															reponse.writeHead(500,{"Content-Language": "fr"});
															reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
															reponse.end();
														}
													  });
													});

													req.on('error', (e) => {
														console.error(`problem with request: ${e.message}`);
														reponse.writeHead(302,{Location: '/auth-login.html'});
														reponse.end();
													});

													// Write data to request body
													req.write(postData);
													req.end();
												}
												else{
													reponse.writeHead(302,{Location: '/auth-login.html'});
													reponse.end();
												}
											}
											catch (error) {
												console.log('erreur try '+error);
												reponse.writeHead(500,{"Content-Language": "fr"});
												reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
												reponse.end();
											}
										  });
										});

										req.on('error', (e) => {
											console.error(`problem with request: ${e.message}`);
											reponse.writeHead(302,{Location: '/auth-login.html'});
											reponse.end();
										});

										// Write data to request body
										req.write(postData);
										req.end();
									});
								}
							}
							else if(page.includes('auth-logout.html')||page.includes('auth-login.html')||page.includes('pages-404.html')||page.includes('auth-register.html')||page.includes('auth-recoverpw.html')){
								reponse.writeHead(200,{"Content-Type": "text/html; charset=UTF-8"}) ;
								reponse.write(fs.readFileSync(path));
								reponse.end();
								console.log(' file exists if ');
							}
							else{
								var redirect='redirect_uri='+encodeURIComponent(requete.url);
								reponse.writeHead(302,{Location: '/auth-login.html?'+redirect});
								reponse.end();
							}
						}
					}
				}
				else{
					reponse.writeHead(404,{"Content-Type": "text/html; charset=UTF-8"}) ;
					reponse.write(fs.readFileSync(__dirname+'/pages-404.html'));
					reponse.end();
				}
			}
			catch (error) {
				console.log('erreur try '+error);
				reponse.writeHead(500,{"Content-Language": "fr"});
				reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
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
var serveur = http.createServer(monServeur) ;

serveur.listen(3000) ;
console.log('serveur en marche');
