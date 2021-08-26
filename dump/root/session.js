var fs = require('fs') ;
var mariadb = require('mariadb');

var apix = mariadb.createPool({
     host: '172.18.0.3', 
     user:'root', 
     password: 'mariadb',
	 database: 'sycotax'
});
var db = mariadb.createPool({
     host: '172.18.0.3', 
     user:'root', 
     password: 'mariadb',
	 database: 'sycotax'
});
var session = mariadb.createPool({
     host: '172.18.0.3', 
     user:'root', 
     password: 'mariadb',
	 database: 'session'
});

getquery();
async function getquery() {
	var tables=await db.query("create database If not Exists session");
	var size=tables.length;
	console.log('size '+tables.length);
	console.log('size '+size);
	console.log('user '+JSON.stringify(tables[0]));
	console.log('user '+JSON.stringify(tables[1]));
	
		console.log('datasets '+tables);
		console.log('user '+JSON.stringify(tables));
		console.log('affectedRows '+tables.affectedRows);
		console.log('insertId '+tables.insertId);
		console.log('warningStatus '+tables.warningStatus);
	
	tables=await session.query("show tables");
	var size=tables.length;
	console.log('size '+tables.length);
	console.log('size '+size);
	console.log('user '+JSON.stringify(tables[0]));
	console.log('user '+JSON.stringify(tables[1]));
	
	tables=await session.query("create table If not Exists session(id bigint AUTO_INCREMENT PRIMARY KEY,ip varchar(20) not null,user_agent varchar(256),token varchar(256) not null,session varchar(256) not null unique,domaine varchar(256) not null,debut datetime,nouveau datetime,status varchar(20))");
	var size=tables.length;
	console.log('size '+tables.length);
	console.log('size '+size);
	console.log('user '+JSON.stringify(tables[0]));
	console.log('user '+JSON.stringify(tables[1]));
	
		console.log('datasets '+tables);
		console.log('user '+JSON.stringify(tables));
		console.log('affectedRows '+tables.affectedRows);
		console.log('insertId '+tables.insertId);
		console.log('warningStatus '+tables.warningStatus);
		
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

exports.start=async function(ip,userAgent,token,sess,domaine){
	let request="INSERT INTO session VALUES (null,'"+ip+"', '"+userAgent+"', '"+token+"','"+sess+"','"+domaine+"',now(),now(),'running')";
		
	var row=await session.query(request);
	console.log('ligne '+JSON.stringify(row));
	console.log('affectedRows '+row.affectedRows);
	console.log('insertId '+row.insertId);
	console.log('warningStatus '+row.warningStatus);
}
exports.check=async function(requete){
	let request="select * from session where session="+requete+"";
		
	var row=await session.query(request);
	var size=row.length;
	console.log('size '+row.length);
	console.log('size '+size);
	console.log('row '+JSON.stringify(row[0]));
	console.log('row '+JSON.stringify(row[1]));
	var json=JSON.parse(JSON.stringify(row[0]));
	console.log('token '+json.token);
	console.log('domaine '+json.domaine);
	console.log('time '+json.nouveau);
	var date1 = new Date(''+json.nouveau);
	console.log("time "+date1.getTime());
	console.log("time "+Date.now());
	console.log("time "+(Date.now()-date1.getTime()));
	if(((Date.now()-date1.getTime())/1000)<=3600 && !json.status.includes('expire')){
		
		console.log('{"token": "'+json.token+'","domaine":"'+json.domaine+'"}');
		return '{"token": "'+json.token+'","domaine":"'+json.domaine+'"}';
	}
	else{
		let request="update session set status='expire' where session="+requete+"";
		
		var row=await session.query(request);
		console.log('ligne '+JSON.stringify(row));
		console.log('affectedRows '+row.affectedRows);
		console.log('insertId '+row.insertId);
		console.log('warningStatus '+row.warningStatus);
		console.log('{"token": "","domaine":""}');
		return '{"token": "","domaine":""}';
	}
}
exports.update=async function(requete){
	let request="update session set nouveau=now() where session="+requete+"";
		
	var row=await session.query(request);
	console.log('ligne '+JSON.stringify(row));
	console.log('affectedRows '+row.affectedRows);
	console.log('insertId '+row.insertId);
	console.log('warningStatus '+row.warningStatus);
}
exports.expire=async function(requete){
	let request="update session set status='expire' where session="+requete+"";
		
	var row=await session.query(request);
	console.log('ligne '+JSON.stringify(row));
	console.log('affectedRows '+row.affectedRows);
	console.log('insertId '+row.insertId);
	console.log('warningStatus '+row.warningStatus);
}
exports.logout=async function(requete){
	let request="update session set status='logout' where session="+requete+"";
		
	var row=await session.query(request);
	console.log('ligne '+JSON.stringify(row));
	console.log('affectedRows '+row.affectedRows);
	console.log('insertId '+row.insertId);
	console.log('warningStatus '+row.warningStatus);
}
