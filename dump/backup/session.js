var fs = require('fs') ;

var session;
if (fs.existsSync("session.db")){
	var db=fs.readFileSync("session.db");
	session = new Map(JSON.parse(db));
}
else{
	session = new Map();
}

function gen(nbre){
	var ret="";
	for(var i=0;i<nbre;i++){
		if(i==0){
			var a=Math.floor(Math.random() * 9);
			ret=ret+""+(a>0?a:1);
		}
		else{
			ret=ret+""+(Math.floor(Math.random() * 9));
		}
	}
	return ret;
}
exports.get_session=function(){
	return ""+gen(29)+""+Date.now()+""+gen(28);
}

exports.set=function(key,value){
	session.set(key,value);
	fs.writeFile ("session.db", JSON.stringify([...session]), function(err) {
		if (err) throw err;
		console.log('complete');
		}
	);
}
exports.get=function(key){
	console.log("get "+session.get(key));
	return session.get(key);
}
exports.check=function(key){
	var data=session.get(key);
	var json=JSON.parse(data);
	console.log("time "+Date.now());
	console.log("time "+json.time);
	console.log("time "+(Date.now()-json.time));
	if(((Date.now()-json.time)/1000)<=300){
		console.log('{"token": "'+json.token+'","domaine":"'+json.domaine+'"}');
		return '{"token": "'+json.token+'","domaine":"'+json.domaine+'"}';
	}
	else{
		session.delete(key);
		fs.writeFile ("session.db", JSON.stringify([...session]), function(err) {
			if (err) throw err;
			console.log('complete');
			}
		);
		console.log('{"token": "","role":""}');
		return '{"token": "","domaine":""}';
	}
}
exports.update=function(key){
	var data=session.get(key);
	var json=JSON.parse(data);
	json.time=Date.now();
	session.set(key,JSON.stringify(json));
	fs.writeFile ("session.db", JSON.stringify([...session]), function(err) {
		if (err) throw err;
		console.log('complete');
		}
	);
}
exports.expire=async function(requete){
	session.delete(key);
	fs.writeFile ("session.db", JSON.stringify([...session]), function(err) {
		if (err) throw err;
		console.log('complete');
		}
	);
}
exports.logout=async function(key){
	session.delete(key);
	fs.writeFile ("session.db", JSON.stringify([...session]), function(err) {
		if (err) throw err;
		console.log('complete');
		}
	);
}
