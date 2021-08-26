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

var token="oNyToAnfCcaIKk9QTwsMEc0oJLcGf3bMWTEVC7iHV5rO9yz4KLMhzXcpqcLdFt1RqwoeRWUJCwTbA7SAcgTWCbaairwgwlmMIEtyV9ObCSBS264oTokejqmJaos9QVqj";
var email,telephone,gerant,adresse,service,gps,type,activite,commune,nom,nif;
var numero=0;
var path='/home/timbre/html/default/entreprises.json';

var data=fs.readFileSync(path)
var json=JSON.parse(data);

var size=json.GNF.length;
for(var i=0;i<size;i++){
	email="";
	telephone="";
	gerant="";
	adresse="";
	service="";
	gps="";
	type="";
	activite="";
	commune="";
	nom="";
	nif="";
	numero=0;
	console.log('i '+i);
	if(i==0){
		for (var key in json.GNF[0]){
			console.log('key '+key+' value '+json.GNF[0][key]);
		}
	}
	else{
		for (var key in json.GNF[i]){
			if(!key.localeCompare("A")){
				numero=json.GNF[i][key];
				console.log(' '+numero);
			}
			else if(!key.localeCompare("B")){
				commune=json.GNF[i][key];
				console.log(' '+commune);
			}
			else if(!key.localeCompare("C")){
				type=json.GNF[i][key];
				console.log(' '+type);
			}
			else if(!key.localeCompare("D")){
				nom=json.GNF[i][key];
				console.log(' '+nom);
			}
			else if(!key.localeCompare("E")){
				nif=json.GNF[i][key];
				console.log(' '+nif);
			}
			else if(!key.localeCompare("F")){
				activite=json.GNF[i][key];
				console.log(' '+activite);
			}
			else if(!key.localeCompare("G")){
				gps=json.GNF[i][key];
				console.log(' '+gps);
			}
			else if(!key.localeCompare("H")){
				service=json.GNF[i][key];
				console.log(' '+service);
			}
			else if(!key.localeCompare("I")){
				adresse=json.GNF[i][key];
				console.log(' '+adresse);
			}
			else if(!key.localeCompare("J")){
				gerant=json.GNF[i][key];
				console.log(' '+gerant);
			}
			else if(!key.localeCompare("K")){
				telephone=json.GNF[i][key];
				console.log(' '+telephone);
			}
			else if(!key.localeCompare("L")){
				email=json.GNF[i][key];
				console.log(' '+email);
			}
		}
		exec(email,telephone,gerant,adresse,service,gps,type,activite,numero,commune,nom,nif);
	}
}

function exec(email,telephone,gerant,adresse,service,gps,type,activite,numero,commune,nom,nif){
	var postData='{"src" : {"countryCode" : "CD","currencyCode" : "CDF","phoneNumber" : "+123456789","taxCode" : "1234","latitude" : 12.3456,"longitude" : 12.3456},"dest" : {"countryCode" : "CD","currencyCode" : "CDF","phoneNumber" : "+123456789","taxCode" : "1234","latitude" : 12.3456,"longitude" : 12.3456},';
	postData+='"srcCryptoWallet" : "XXX-XXX-XXX-XXX","destCryptoWalletCode" : "XXX","amount" : 1234.5678,"datasetCode" : "MB001","datasetSpecificFields" : {';
	postData+='"email_commerce":"'+email+'",';
	postData+='"telephone_commerce":"'+telephone+'",';
	postData+='"gerant_commerce":"'+gerant+'",';
	postData+='"adresse_commerce":"'+adresse+'",';
	postData+='"service_commerce":"'+service+'",';
	postData+='"gps_commerce":"'+gps+'",';
	postData+='"activite_commerce":"'+activite+'",';
	postData+='"type_commerce":"'+type+'",';
	postData+='"commune_commerce":"'+commune+'",';
	postData+='"nom_commerce":"'+nom+'",';
	postData+='"numero_commerce":'+numero+',';
	postData+='"nif_commerce":"'+nif+'"';
	postData+='},"fakeTransaction" : true}';
	console.log('postData '+postData);

	options = {
	  hostname: 'localhost',
	  port: 8081,
	  path: '/api/transaction',
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'X-API-Key': 'oNyToAnfCcaIKk9QTwsMEc0oJLcGf3bMWTEVC7iHV5rO9yz4KLMhzXcpqcLdFt1RqwoeRWUJCwTbA7SAcgTWCbaairwgwlmMIEtyV9ObCSBS264oTokejqmJaos9QVqj',
		'Content-Length': Buffer.byteLength(postData)
	  }//,
	  //ca: rootCas
	};

	var bod4='';
	var req4 = http.request(options, (res) => {
	  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
	  res.setEncoding('utf8');
	  res.on('data', (chunk) => {
		console.log(chunk.toString());
		bod4 += chunk.toString();
		
	  });
	  res.on('end', () => {
		console.log(`BODY: ${JSON.stringify(bod4)}`);
		console.log('No more data in response. ');
		
	  });
	});

	req4.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});

	// Write data to request body
	req4.write(postData);
	req4.end();
}