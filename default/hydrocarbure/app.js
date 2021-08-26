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

exports.execute=async function(requete,reponse,token){
	try{
		body='';
		var page = url.parse(requete.url).pathname ;
		var query=url.parse(requete.url).query ;
		var method=requete.method;
		console.log("user-agent "+requete.headers['user-agent']);
		var host=requete.headers.host;
		var protocole=url.protocol;
		var remote_ip=requete.connection.remoteAddress;
		var remote_port=requete.connection.remotePort;
		var local_ip=requete.connection.localAddress;
		var local_port=requete.connection.localPort;
		var headers=requete.headers;
		const FORM_URLENCODED = 'application/x-www-form-urlencoded';
		const FORM_json = 'application/json';
		var path='';
		var redir='';
		
		if(page=='/'){
			page='/index.html';
		}
		console.log('url '+query+' '+page+' '+host+' method '+method);
		
		path=__dirname+''+page;
		console.log("path "+path);
		var asset=false;
		
		if (fs.existsSync(path)||page.includes('sap_ppc')||page.includes('acobank_qr')||page.includes('/api/transaction')) {
			console.log('file exists');
			if(asset==true){
				reponse.writeHead(200,{"Content-Language": "fr"}) ;
				reponse.write(fs.readFileSync(path));
				reponse.end();
			}
			else{
				if(typeof token !== 'undefined'){
					
					if (page.includes('sap_ppc')) {
						let bod='';
						if(method=='POST'){
							requete.on('data', chunk => {
								bod += chunk.toString();
							});
							requete.on('end', () => {
								console.log('body '+bod);
								let dat = 'APIX:@p1xIntegrated';
								let buff = new Buffer(dat);
								let base64data = buff.toString('base64');
								console.log('auth '+base64data);
								var options = {
								  hostname: 'mysappiq.ppc.co.za',
								  port: 1443,
								  path: '/RESTAdapter/api/apix/payment',
								  method: 'POST',
								  headers: {
									'Authorization': 'Basic '+base64data,
									'Host': 'mysappiq.ppc.co.za',
									'Accept': 'application/json',
									'Content-Type': 'application/json',
									'User-Agent': 'ANZ_https',
									'Content-Length': Buffer.byteLength(bod)
								  }
								};

								post_interval();
								function post_interval(){
									var bod2='';
									var json;
									var req = https.request(options, (res) => {
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
										reponse.writeHead(500,{"Content-Language": "fr"});
										reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
										reponse.end();
									});
									req.write(bod);
									req.end();
								}
							});
						}
					}
					else if (page.includes('acobank_qr')) {
						let bod='';
						if(method=='POST'){
							requete.on('data', chunk => {
								bod += chunk.toString();
							});
							requete.on('end', () => {
								console.log('body '+bod);
								var options = {
								  hostname: 'rafiki.ecobank.com',
								  port: 443,
								  path: '/DynamicQRService/resources/ecoqr/getdynamicqr',
								  method: 'POST',
								  headers: {
									'Host': 'rafiki.ecobank.com',
									'Accept': 'application/json',
									'Host': 'rafiki.ecobank.com',
									'Content-Type': 'application/json',
									'User-Agent': 'ANZ_https',
									'Content-Length': Buffer.byteLength(bod)
								  }
								};

								post_interval();
								function post_interval(){
									var bod2='';
									var json;
									var req = https.request(options, (res) => {
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
										reponse.writeHead(500,{"Content-Language": "fr"});
										reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
										reponse.end();
									});
									req.write(bod);
									req.end();
								}
							});
						}
					}
					else if (page.includes('dynamicqr.html')) {
						
						reponse.writeHead(200,{"Content-Language": "fr"});
						reponse.write(fs.readFileSync(__dirname+'/dynamicqr.html'));
						reponse.end();
					}
					else if (page.includes('crm-customers.html')) {
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction?datasetCode=TE001&page=0&size=10',
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
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								for(var i=0;i<10&&size>0&&i<size;i++){
									console.log('i '+i);
									cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.vcPaymentReference+'</td><div class="json_cnt" id="line'+i+'">'+JSON.stringify(content[i])+'</div></tr>';
								}
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/crm-customers.html');
								res=res.replace("{tbody}",cnt);
								reponse.write(res);
								reponse.end();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.end();
						}
					}
					else if (page.includes('crm-order.html')) {
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction?datasetCode=EC000&page=0&size=10',
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
								//console.log(`BODY: ${JSON.stringify(bod2)}`);
								//console.log('No more data in response.');
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								async function go1(){
									for(var i=0;i<10&&size>0&&i<size;i++){
										cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.quoteNr+'</td><td>'+content[i].datasetSpecificFields.quoteCrDt+'</td><td>'+content[i].datasetSpecificFields.customerNr+'</td><td>'+content[i].datasetSpecificFields.customerNm+'</td><td>'+content[i].datasetSpecificFields.totAmtS+'</td><td>'+content[i].datasetSpecificFields.validFromDt+'</td><td>'+content[i].datasetSpecificFields.validToDt+'</td><td>'+content[i].datasetSpecificFields.quoteuidaa888+'</td><div class="json_cnt" id="line'+i+'">'+JSON.stringify(content[i])+'</div></tr>';
										
									}
									reponse.writeHead(200,{"Content-Language": "fr"});
									var res=''+fs.readFileSync(__dirname+'/crm-order.html');
									res=res.replace("{tbody}",cnt);
									reponse.write(res);
									reponse.end();
								}
								go1();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.end();
						}
					}
					else if (page.includes('crm-VPC01.html')) {
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction?datasetCode=VPC01&page=0&size=10',
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
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								for(var i=0;i<10&&size>0&&i<size;i++){
									console.log('i '+i);

									cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.vcPaymentReference+'</td><td>'+content[i].datasetSpecificFields.TransactionReference+'</td><td>'+content[i].datasetSpecificFields.ModeExploitation+'</td><td>'+content[i].datasetSpecificFields.TypeDocument+'</td><td>'+content[i].datasetSpecificFields.TypeImmatriculation+'</td><td>'+content[i].datasetSpecificFields.Type+'</td><td>'+content[i].datasetSpecificFields.MontantCarteGrise+'</td><td>'+content[i].datasetSpecificFields.MontantVignette+'</td><td>'+content[i].datasetSpecificFields.MontantAutorisation+'</td><div class="json_cnt" id="line_'+i+'">'+JSON.stringify(content[i])+'</div></tr>';

								}
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/crm-VPC01.html');
								res=res.replace("{tbody}",cnt);
								var totelmt=0;
								var ind=0;
								if(json.totalElements>0){
									totelmt=Math.round(json.totalElements/50);
									ind=1;
								}
								if(json.totalElements/50>totelmt){
									totelmt++;
								}
								res=res.replace("{index}",ind);
								res=res.replace("{totelmt}",totelmt);
								reponse.write(res);
								reponse.end();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.end();
						}
					}
					else if (page.includes('crm-VPC01.html')) {
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction?datasetCode=VPC01&page=0&size=10',
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
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								for(var i=0;i<10&&size>0&&i<size;i++){
									console.log('i '+i);

									cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.vcPaymentReference+'</td><td>'+content[i].datasetSpecificFields.TransactionReference+'</td><td>'+content[i].datasetSpecificFields.ModeExploitation+'</td><td>'+content[i].datasetSpecificFields.TypeDocument+'</td><td>'+content[i].datasetSpecificFields.TypeImmatriculation+'</td><td>'+content[i].datasetSpecificFields.Type+'</td><td>'+content[i].datasetSpecificFields.MontantCarteGrise+'</td><td>'+content[i].datasetSpecificFields.MontantVignette+'</td><td>'+content[i].datasetSpecificFields.MontantAutorisation+'</td><div class="json_cnt" id="line_'+i+'">'+JSON.stringify(content[i])+'</div></tr>';

								}
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/crm-VPC01.html');
								res=res.replace("{tbody}",cnt);
								var totelmt=0;
								var ind=0;
								if(json.totalElements>0){
									totelmt=Math.round(json.totalElements/50);
									ind=1;
								}
								if(json.totalElements/50>totelmt){
									totelmt++;
								}
								res=res.replace("{index}",ind);
								res=res.replace("{totelmt}",totelmt);
								reponse.write(res);
								reponse.end();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.end();
						}
					}
					else if (page.includes('dashboard-hotels.html')) {
						var postData='{"datasetCode" : "MB001","sendersPhonePart" : "","recipientsPhonePart" : "","fromDate" : "","toDate" : "","currency" : "","amountMin" : 0,"amountMax" : 99999999999,"searchCriteria" : "type_commerce","searchValue" : "HO","timestampStatus" : ""}';
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction/filtered?page=0&size=10',
							method: 'GET',
							headers: {
								'Content-Type': 'application/json',
								'X-API-Key': token,
								'Content-Length': Buffer.byteLength(postData)
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
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								for(var i=0;i<10&&size>0&&i<size;i++){
									console.log('i '+i);
									cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.numero_commerce+'</td><td>'+content[i].datasetSpecificFields.commune_commerce+'</td><td>'+content[i].datasetSpecificFields.type_commerce+'</td><td>'+content[i].datasetSpecificFields.nom_commerce+'</td><td>'+content[i].datasetSpecificFields.nif_commerce+'</td><td>'+content[i].datasetSpecificFields.activite_commerce+'</td><td>'+content[i].datasetSpecificFields.gps_commerce+'</td><td>'+content[i].datasetSpecificFields.service_commerce+'</td><td>'+content[i].datasetSpecificFields.adresse_commerce+'</td><td>'+content[i].datasetSpecificFields.gerant_commerce+'</td><td>'+content[i].datasetSpecificFields.telephone_commerce+'</td><td>'+content[i].datasetSpecificFields.email_commerce+'</td><div class="json_cnt" id="line_'+i+'">'+JSON.stringify(content[i])+'</div></tr>';

								}
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/dashboard-hotels.html');
								res=res.replace("{tbody}",cnt);
								var totelmt=0;
								var ind=0;
								if(json.totalElements>0){
									totelmt=Math.round(json.totalElements/50);
									ind=1;
								}
								if(json.totalElements/50>totelmt){
									totelmt++;
								}
								res=res.replace("{index}",ind);
								res=res.replace("{totelmt}",totelmt);
								reponse.write(res);
								reponse.end();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.write(postData);
							req.end();
						}
					}
					else if (page.includes('dashboard-pharmacies.html')) {
						var postData='{"datasetCode" : "MB001","sendersPhonePart" : "","recipientsPhonePart" : "","fromDate" : "","toDate" : "","currency" : "","amountMin" : 0,"amountMax" : 99999999999,"searchCriteria" : "type_commerce","searchValue" : "PH","timestampStatus" : ""}';
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction/filtered?page=0&size=10',
							method: 'GET',
							headers: {
								'Content-Type': 'application/json',
								'X-API-Key': token,
								'Content-Length': Buffer.byteLength(postData)
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
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								for(var i=0;i<10&&size>0&&i<size;i++){
									console.log('i '+i);
									cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.numero_commerce+'</td><td>'+content[i].datasetSpecificFields.commune_commerce+'</td><td>'+content[i].datasetSpecificFields.type_commerce+'</td><td>'+content[i].datasetSpecificFields.nom_commerce+'</td><td>'+content[i].datasetSpecificFields.nif_commerce+'</td><td>'+content[i].datasetSpecificFields.activite_commerce+'</td><td>'+content[i].datasetSpecificFields.gps_commerce+'</td><td>'+content[i].datasetSpecificFields.service_commerce+'</td><td>'+content[i].datasetSpecificFields.adresse_commerce+'</td><td>'+content[i].datasetSpecificFields.gerant_commerce+'</td><td>'+content[i].datasetSpecificFields.telephone_commerce+'</td><td>'+content[i].datasetSpecificFields.email_commerce+'</td><div class="json_cnt" id="line_'+i+'">'+JSON.stringify(content[i])+'</div></tr>';

								}
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/dashboard-hotels.html');
								res=res.replace("{tbody}",cnt);
								var totelmt=0;
								var ind=0;
								if(json.totalElements>0){
									totelmt=Math.round(json.totalElements/50);
									ind=1;
								}
								if(json.totalElements/50>totelmt){
									totelmt++;
								}
								res=res.replace("{index}",ind);
								res=res.replace("{totelmt}",totelmt);
								reponse.write(res);
								reponse.end();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.write(postData);
							req.end();
						}
					}
					else if (page.includes('dashboard-quincailleries.html')) {
						var postData='{"datasetCode" : "MB001","sendersPhonePart" : "","recipientsPhonePart" : "","fromDate" : "","toDate" : "","currency" : "","amountMin" : 0,"amountMax" : 99999999999,"searchCriteria" : "type_commerce","searchValue" : "QUIN","timestampStatus" : ""}';
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction/filtered?page=0&size=10',
							method: 'GET',
							headers: {
								'Content-Type': 'application/json',
								'X-API-Key': token,
								'Content-Length': Buffer.byteLength(postData)
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
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								for(var i=0;i<10&&size>0&&i<size;i++){
									console.log('i '+i);
									cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.numero_commerce+'</td><td>'+content[i].datasetSpecificFields.commune_commerce+'</td><td>'+content[i].datasetSpecificFields.type_commerce+'</td><td>'+content[i].datasetSpecificFields.nom_commerce+'</td><td>'+content[i].datasetSpecificFields.nif_commerce+'</td><td>'+content[i].datasetSpecificFields.activite_commerce+'</td><td>'+content[i].datasetSpecificFields.gps_commerce+'</td><td>'+content[i].datasetSpecificFields.service_commerce+'</td><td>'+content[i].datasetSpecificFields.adresse_commerce+'</td><td>'+content[i].datasetSpecificFields.gerant_commerce+'</td><td>'+content[i].datasetSpecificFields.telephone_commerce+'</td><td>'+content[i].datasetSpecificFields.email_commerce+'</td><div class="json_cnt" id="line_'+i+'">'+JSON.stringify(content[i])+'</div></tr>';

								}
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/dashboard-hotels.html');
								res=res.replace("{tbody}",cnt);
								var totelmt=0;
								var ind=0;
								if(json.totalElements>0){
									totelmt=Math.round(json.totalElements/50);
									ind=1;
								}
								if(json.totalElements/50>totelmt){
									totelmt++;
								}
								res=res.replace("{index}",ind);
								res=res.replace("{totelmt}",totelmt);
								reponse.write(res);
								reponse.end();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.write(postData);
							req.end();
						}
					}
					else if (page.includes('dashboard-restaurants.html')) {
						var postData='{"datasetCode" : "MB001","sendersPhonePart" : "","recipientsPhonePart" : "","fromDate" : "","toDate" : "","currency" : "","amountMin" : 0,"amountMax" : 99999999999,"searchCriteria" : "type_commerce","searchValue" : "RESTO","timestampStatus" : ""}';
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction/filtered?page=0&size=10',
							method: 'GET',
							headers: {
								'Content-Type': 'application/json',
								'X-API-Key': token,
								'Content-Length': Buffer.byteLength(postData)
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
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								for(var i=0;i<10&&size>0&&i<size;i++){
									console.log('i '+i);
									cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.numero_commerce+'</td><td>'+content[i].datasetSpecificFields.commune_commerce+'</td><td>'+content[i].datasetSpecificFields.type_commerce+'</td><td>'+content[i].datasetSpecificFields.nom_commerce+'</td><td>'+content[i].datasetSpecificFields.nif_commerce+'</td><td>'+content[i].datasetSpecificFields.activite_commerce+'</td><td>'+content[i].datasetSpecificFields.gps_commerce+'</td><td>'+content[i].datasetSpecificFields.service_commerce+'</td><td>'+content[i].datasetSpecificFields.adresse_commerce+'</td><td>'+content[i].datasetSpecificFields.gerant_commerce+'</td><td>'+content[i].datasetSpecificFields.telephone_commerce+'</td><td>'+content[i].datasetSpecificFields.email_commerce+'</td><div class="json_cnt" id="line_'+i+'">'+JSON.stringify(content[i])+'</div></tr>';

								}
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/dashboard-hotels.html');
								res=res.replace("{tbody}",cnt);
								var totelmt=0;
								var ind=0;
								if(json.totalElements>0){
									totelmt=Math.round(json.totalElements/50);
									ind=1;
								}
								if(json.totalElements/50>totelmt){
									totelmt++;
								}
								res=res.replace("{index}",ind);
								res=res.replace("{totelmt}",totelmt);
								reponse.write(res);
								reponse.end();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.write(postData);
							req.end();
						}
					}
					else if (page.includes('dashboard-menuiseries.html')) {
						var postData='{"datasetCode" : "MB001","sendersPhonePart" : "","recipientsPhonePart" : "","fromDate" : "","toDate" : "","currency" : "","amountMin" : 0,"amountMax" : 99999999999,"searchCriteria" : "type_commerce","searchValue" : "MEUN","timestampStatus" : ""}';
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction/filtered?page=0&size=10',
							method: 'GET',
							headers: {
								'Content-Type': 'application/json',
								'X-API-Key': token,
								'Content-Length': Buffer.byteLength(postData)
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
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								for(var i=0;i<10&&size>0&&i<size;i++){
									console.log('i '+i);
									cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.numero_commerce+'</td><td>'+content[i].datasetSpecificFields.commune_commerce+'</td><td>'+content[i].datasetSpecificFields.type_commerce+'</td><td>'+content[i].datasetSpecificFields.nom_commerce+'</td><td>'+content[i].datasetSpecificFields.nif_commerce+'</td><td>'+content[i].datasetSpecificFields.activite_commerce+'</td><td>'+content[i].datasetSpecificFields.gps_commerce+'</td><td>'+content[i].datasetSpecificFields.service_commerce+'</td><td>'+content[i].datasetSpecificFields.adresse_commerce+'</td><td>'+content[i].datasetSpecificFields.gerant_commerce+'</td><td>'+content[i].datasetSpecificFields.telephone_commerce+'</td><td>'+content[i].datasetSpecificFields.email_commerce+'</td><div class="json_cnt" id="line_'+i+'">'+JSON.stringify(content[i])+'</div></tr>';

								}
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/dashboard-hotels.html');
								res=res.replace("{tbody}",cnt);
								var totelmt=0;
								var ind=0;
								if(json.totalElements>0){
									totelmt=Math.round(json.totalElements/50);
									ind=1;
								}
								if(json.totalElements/50>totelmt){
									totelmt++;
								}
								res=res.replace("{index}",ind);
								res=res.replace("{totelmt}",totelmt);
								reponse.write(res);
								reponse.end();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.write(postData);
							req.end();
						}
					}
					else if (page.includes('dashboard54')) {
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction?datasetCode=MB001&page=0&size=10',
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
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								for(var i=0;i<10&&size>0&&i<size;i++){
									console.log('i '+i);
									cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.numero_commerce+'</td><td>'+content[i].datasetSpecificFields.commune_commerce+'</td><td>'+content[i].datasetSpecificFields.type_commerce+'</td><td>'+content[i].datasetSpecificFields.nom_commerce+'</td><td>'+content[i].datasetSpecificFields.nif_commerce+'</td><td>'+content[i].datasetSpecificFields.activite_commerce+'</td><td>'+content[i].datasetSpecificFields.gps_commerce+'</td><td>'+content[i].datasetSpecificFields.service_commerce+'</td><td>'+content[i].datasetSpecificFields.adresse_commerce+'</td><td>'+content[i].datasetSpecificFields.gerant_commerce+'</td><td>'+content[i].datasetSpecificFields.telephone_commerce+'</td><td>'+content[i].datasetSpecificFields.email_commerce+'</td><div class="json_cnt" id="line_'+i+'">'+JSON.stringify(content[i])+'</div></tr>';

								}
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/crm-hotels.html');
								res=res.replace("{tbody}",cnt);
								var totelmt=0;
								var ind=0;
								if(json.totalElements>0){
									totelmt=Math.round(json.totalElements/50);
									ind=1;
								}
								if(json.totalElements/50>totelmt){
									totelmt++;
								}
								res=res.replace("{index}",ind);
								res=res.replace("{totelmt}",totelmt);
								reponse.write(res);
								reponse.end();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.end();
						}
					}
					
					else if (page.includes('crm-quotation.html')) {
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction?datasetCode=TE001&page=0&size=10',
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
								//console.log(`BODY: ${JSON.stringify(bod2)}`);
								//console.log('No more data in response.');
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								async function go1(){
									for(var i=0;i<10&&size>0&&i<size;i++){
										console.log('index '+i+' '+content[i].uid);
										cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.quoteNr+'</td><td>'+content[i].datasetSpecificFields.quoteCrDt+'</td><td>'+content[i].datasetSpecificFields.customerNr+'</td><td>'+content[i].datasetSpecificFields.customerNm+'</td><td>'+content[i].datasetSpecificFields.totAmtS+'</td><td>'+content[i].datasetSpecificFields.validFromDt+'</td><td>'+content[i].datasetSpecificFields.validToDt+'</td><td>'+content[i].datasetSpecificFields.quoteStatus+'</td><div class="json_cnt" id="line'+i+'">'+JSON.stringify(content[i])+'</div></tr>';
										
									}
									reponse.writeHead(200,{"Content-Language": "fr"});
									var res=''+fs.readFileSync(__dirname+'/crm-quotation.html');
									res=res.replace("{tbody}",cnt);
									reponse.write(res);
									reponse.end();
								}
								go1();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.end();
						}
					}
					else if (page.includes('eco-token.html')) {
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction?datasetCode=EC000&page=0&size=10',
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
								var json=JSON.parse(bod2);
								var content=json.content;
								var pageable=json.pageable;
								var totalPages=json.totalPages;
								var totalElements=json.totalElements;
								var numberOfElements=json.numberOfElements;
								var first=json.first;
								var last=json.last;
								var empty=json.empty;
								
								var size=content.length;
								var cnt='';
								for(var i=0;i<10&&size>0&&i<size;i++){
									cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+content[i].datasetSpecificFields.responseMessage+'</td><td>'+content[i].datasetSpecificFields.responseCode+'</td><td>'+content[i].datasetSpecificFields.ec_termianl_id+'</td><td>'+content[i].datasetSpecificFields.ec_ccy+'</td><td>'+content[i].datasetSpecificFields.ec_transaction_id+'</td><td>'+content[i].datasetSpecificFields.paymentRef+'</td><td>'+content[i].datasetSpecificFields.ec_amount_paid+'</td><td>'+content[i].datasetSpecificFields.cba_reference_no+'</td><td>'+content[i].datasetSpecificFields.ec_customer_id+'</td><td>'+content[i].datasetSpecificFields.paymentStatus+'</td><div class="json_cnt" id="line'+i+'">'+JSON.stringify(content[i])+'</div></tr>';
								}
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/eco-token.html');
								res=res.replace("{tbody}",cnt);
								reponse.write(res);
								reponse.end();
							  });
							});
							req.on('error', (e) => {
								console.error(`problem with request: ${e.message}`);
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.end();
						}
					}
					else if (page.includes('log-sap.html')) {
						var options = {
							hostname: 'localhost',
							port: 8081,
							path: '/api/transaction?datasetCode=AA777&page=0&size=10',
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
								try{
									var json=JSON.parse(bod2);
									var content=json.content;
									var pageable=json.pageable;
									var totalPages=json.totalPages;
									var totalElements=json.totalElements;
									var numberOfElements=json.numberOfElements;
									var first=json.first;
									var last=json.last;
									var empty=json.empty;
									
									var size=content.length;
									var cnt='';
									for(var i=0;i<10&&size>0&&i<size;i++){
										cnt+='<tr class="clickable-row" id="lin'+i+'"><td>'+(new Buffer(content[i].datasetSpecificFields.payload, 'base64').toString('ascii'))+'</td><td>'+(new Buffer(content[i].datasetSpecificFields.log, 'base64').toString('ascii'))+'</td><div class="json_cnt" id="line'+i+'">'+JSON.stringify(content[i])+'</div></tr>';
									}
									reponse.writeHead(200,{"Content-Language": "fr"});
									var res=''+fs.readFileSync(__dirname+'/log-sap.html');
									res=res.replace("{tbody}",cnt);
									reponse.write(res);
									reponse.end();
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
								reponse.writeHead(500,{"Content-Language": "fr"});
								reponse.write(fs.readFileSync(__dirname+'/pages-500.html'));
								reponse.end();
							});
							req.end();
						}
					}
					else if (page.includes('index.html')) {
						async function go(){
							var customers=await getquery3('TE001',token,0);
							var vignettes=await getquery3('VPC01',token,0);
							var eco_token=await getquery3('TE001',token,0);
							var order=await getquery3('TE001',token,0);
							var sap=await getquery3('TE001',token,0);
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
							//console.log("total elements quot "+quotations.total);
							
							if(customers.total>=0 && vignettes.total>=0){	
								reponse.writeHead(200,{"Content-Language": "fr"});
								var res=''+fs.readFileSync(__dirname+'/index.html');
								res=res.replace("{customers}",customers.total);
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
						reponse.writeHead(200,{"Content-Language": "fr"}) ;
						reponse.write(fs.readFileSync(path));
						reponse.end();
						console.log('cookie else');
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
								  port: 8081,
								  path: '/api/company',
								  method: 'GET',
								  headers: {
									'Content-Type': 'application/json',
									'X-API-Key': 'T1nR1CEVI0knQWZLgExYsJIzfz2X9a4ZcFKG5Bhzh9BpUICOHNdPQmNQoMFcMxcSCrtcZztBgc3HaUvTObeLcUCJlz5QyUa9IdYN4zeZqHNLEXD9kWCQUHo5kcy5rvrS',
									'Content-Length': Buffer.byteLength(postData)
								  }
								};

								var bod;
								var req = http.request(options, (res) => {
								  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
								  res.setEncoding('utf8');
								  res.on('data', (chunk) => {
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
									//console.log(`BODY: ${JSON.stringify(bod[0])}`);
								  });
								  res.on('end', () => {
									console.log('No more data in response.');
									postData =`{"email": "${output.email}",`;
									postData +='"companyId": '+id+',';
									postData +=`"password": "${output.password}"}`;
									console.log('postData '+postData);
									if(id>=1){
										var options = {
										  hostname: 'localhost',
										  port: 8081,
										  path: '/api/auth',
										  method: 'GET',
										  headers: {
											'Content-Type': 'application/json',
											'X-API-Key': 'T1nR1CEVI0knQWZLgExYsJIzfz2X9a4ZcFKG5Bhzh9BpUICOHNdPQmNQoMFcMxcSCrtcZztBgc3HaUvTObeLcUCJlz5QyUa9IdYN4zeZqHNLEXD9kWCQUHo5kcy5rvrS',
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
											if(bod.length==128){
												var cook=''+bod;
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
			var res = await fetch('http://localhost:8081/api/transaction?datasetCode='+dataset+'&page='+ind+'&size=10',options);
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
async function getquery4(uid) {
	let ret=JSON.parse('{"content":[],"elements":0,"offset":0,"pages":0,"empty": false,"first": false,"last":false,"taille":0,"uid":"","total":0}');
	var bb="{";
	bb+='"datasetCode" : "TE001",';
	bb+='"sendersPhonePart" : "",';
	bb+='"recipientsPhonePart" : "",';
	bb+='"fromDate" : "2021-02-27",';
	bb+='"toDate" : "'+formatDate(new Date())+'",';
	bb+='"currency" : "",';
	bb+='"amountMin" : 1,';
	bb+='"amountMax" : 99999999999999,';
	bb+='"searchCriteria" : "CustomerNr",';
	bb+='"searchValue" : "0010050257",';
	bb+='"timestampStatus" : ""';
	bb+='"}"';
	await post_interval2();
		
	async function post_interval2(){
		var options = {
			hostname: 'localhost',
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': 'T1nR1CEVI0knQWZLgExYsJIzfz2X9a4ZcFKG5Bhzh9BpUICOHNdPQmNQoMFcMxcSCrtcZztBgc3HaUvTObeLcUCJlz5QyUa9IdYN4zeZqHNLEXD9kWCQUHo5kcy5rvrS',
				'Content-Length': Buffer.byteLength(bb)
			},
			body: bb
		};
		var bod2='';
		var json;
		try{
			console.log('test 1 '+cookie);
			var res = await fetch('http://localhost:8081/api/transaction/filtered?page=0&size=50',options);
			console.log('test 2 '+JSON.stringify(res));
			var bo=await res.text();
			console.log('test 2 '+bo);
			var json=JSON.parse(JSON.stringify(bo));
			var content=json.content;
			ret.content=content;
			var pageable=json.pageable;
			var numberOfElements=json.numberOfElements;
			ret.elements=numberOfElements;
			var number=json.number;
			ret.offset=number;
			ret.uid=json.uid;
			
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
	return ret;
}
function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) 
		month = '0' + month;
	if (day.length < 2) 
		day = '0' + day;

	return [year, month, day].join('-');
}


async function getquery2(chaine) {
	var tables=await apix.query("select * from transactions where ds_id=12 and ds_fields_json like '%\"quoteuidaa888\":\""+chaine+"\"%'");
	var size=tables.length;
	console.log('size '+tables.length);
	console.log('size '+size);
	//console.log('user '+JSON.stringify(tables[0]));
	//console.log('user '+JSON.stringify(tables[1]));
	//console.log('user '+tables[1].);
	
	if(size>0){
		let temp=tables[0].ds_fields_json;
		temp=temp.substr(1, temp.length-22);
		console.log('temp '+temp);
	} 
	else{
		var tables=await apix.query("select * from transactions where ds_id=1 and trx_uid='"+chaine+"'");
		var size=tables.length;
		console.log('size '+tables.length);
		console.log('size '+size);
		let temp=tables[0].ds_fields_json;
		var json=JSON.parse(temp);
		console.log('temp '+json.quoteNr);
		temp=temp.substr(1, temp.length-22);
		console.log('temp '+temp);
		
		var transaction_id=chaine;
		var terminal_id="32665654";
		var secret="xp6yB98yR4twn000";
		terminal_id="32606030";
		secret="kewd334yDs";
		var amount=json.totAmtS;
		var currency="USD";
		var payment_description="quotation ppc";
		var customer_name=json.customerNr;
					
		console.log("digest "+sha512(terminal_id+secret+amount+transaction_id));
		var data="{\r\n";
		data=data+"\t\"ec_version\" : \"1.0\",\r\n";
		data=data+"\t\"ec_lang\" : \"EN\",\r\n";
		data=data+"\t\"ec_terminal_id\" : \""+terminal_id+"\",\r\n";
		data=data+"\t\"ec_transaction_id\" : \""+transaction_id+"\",\r\n";
		data=data+"\t\"ec_hash\" : \""+sha512(terminal_id+secret+amount+transaction_id)+"\",\r\n";
		data=data+"\t\"ec_amount\" : \""+amount+"\",\r\n";
		data=data+"\t\"ec_charges\" : \"0\",\r\n";
		data=data+"\t\"ec_fees_type\" : \"F\",\r\n";
		data=data+"\t\"ec_ccy\" : \""+currency+"\",\r\n";
		data=data+"\t\"ec_payment_method\" : \"QR\",\r\n";
		data=data+"\t\"ec_customer_id\" : \"FBB1085/08\",\r\n";
		data=data+"\t\"ec_customer_name\" : \""+customer_name+"\",\r\n";
		data=data+"\t\"ec_mobile_no\" : \"0260516997\",\r\n";
		data=data+"\t\"ec_email\" : \"anz@fiscalbalckbox.com\",\r\n";
		data=data+"\t\"ec_payment_description\" : \""+payment_description+"\",\r\n";
		data=data+"\t\"ec_product_code\" : \"lab_18\",\r\n";
		data=data+"\t\"ec_product_name\" : \"Lab_bopeto\",\r\n";
		data=data+"\t\"ec_udf1\" : \"\",\r\n";
		data=data+"\t\"ec_udf2\" : \"\",\r\n";
		data=data+"\t\"ec_udf3\" : \"\",\r\n";
		data=data+"\t\"ec_udf4\" : \"\",\r\n";
		data=data+"\t\"ec_udf5\" : \"\"\r\n";
		data=data+"}";
		console.log("data "+data);
		var options = {
		  hostname: 'rafiki.ecobank.com',
		  port: 443,
		  path: '/DynamicQRService/resources/ecoqr/getdynamicqr',
		  method: 'POST',
		  headers: {
			'Host': 'rafiki.ecobank.com',
			'Accept': 'application/json',
			'Host': 'rafiki.ecobank.com',
			'Content-Type': 'application/json',
			'User-Agent': 'ANZ_https',
			'Content-Length': Buffer.byteLength(data)
		  }
		};

		post_interval();
		function post_interval(){
			var bod2='';
			var json;
			var qr;
			var req = https.request(options, (res) => {
			  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
			  res.setEncoding('utf8');
			  res.on('data', (chunk) => {
				bod2 += chunk.toString();
			  });
			  res.on('end', () => {
				console.log(`BODY: ${JSON.stringify(bod2)}`);
				console.log('No more data in response.');
				json=JSON.parse(bod2);
				qr=json.dynamicQR;
				console.log("qr "+qr);
				var content='';
				temp=temp+',"quoteuidaa888":"'+chaine+'","ecobankqrcode":"'+qr+'"';
				content+='{"src" : {"countryCode" : "CD","currencyCode" : "CDF","phoneNumber" : "+123456789","taxCode" : "1234","latitude" : 12.3456,"longitude" : 12.3456';
				content+='},"dest" : {"countryCode" : "CD","currencyCode" : "CDF","phoneNumber" : "+123456789","taxCode" : "1234","latitude" : 12.3456,"longitude" : 12.3456';
				content+='},"srcCryptoWallet" : "XXX-XXX-XXX-XXX","destCryptoWalletCode" : "XXX","amount" : 1234.5678,"datasetCode" : "ZZ888",';
				content+='"datasetSpecificFields" : {'+temp;
				content+='},"fakeTransaction" : true}';
				post_interval2();
				async function post_interval2(){
					var options = {
						hostname: 'localhost',
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-API-Key': 'T1nR1CEVI0knQWZLgExYsJIzfz2X9a4ZcFKG5Bhzh9BpUICOHNdPQmNQoMFcMxcSCrtcZztBgc3HaUvTObeLcUCJlz5QyUa9IdYN4zeZqHNLEXD9kWCQUHo5kcy5rvrS',
							'Content-Length': Buffer.byteLength(content)
						},
						body: content
					};
					var bod2='';
					var json;
					try{
						console.log('test 1 '+cookie);
						var res = await fetch('http://localhost:8081/api/transaction/',options);
						console.log('test 2 '+JSON.stringify(res));
						var bo=await res.json();
						console.log('test 2 '+bo);
						var json=JSON.parse(JSON.stringify(bo));
						console.log(JSON.stringify(bo));
						
					}
					catch (error) {
						console.log('erreur fetch '+JSON.stringify(error.response));
					}
				}
			  });
			});
			req.on('error', (e) => {
				console.error(`problem with request: ${e.message}`);
				
			});
			req.write(data);
			req.end();
		}
	}
}