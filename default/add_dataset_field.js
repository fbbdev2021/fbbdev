var mariadb = require('mariadb');

var apix = mariadb.createPool({
     host: '172.18.0.3', 
     user:'root', 
     password: 'mariadb',
	 database: 'sycotax'
});

async function add_field() {//1
	var tables=await apix.query("insert into dataset_fields(name,company_id) values('al1',1)");
	var size=tables.length;
	var id=tables.insertId;
	var affected=tables.affectedRows;
	console.log('size '+JSON.stringify(tables));
	console.log('id '+id);
	console.log('affected '+affected);
	
}
async function add_constraint() {//2,3
	//var tables=await apix.query("insert into constraints(constraint_type,string_length,number_min,number_max,basic_type) values('type_constraint',null,null,null,'NUMBER')");
	var tables=await apix.query("insert into constraints(constraint_type,string_length,number_min,number_max,basic_type) values('number_range_constraint',null,0,10,null)");
	//var tables=await apix.query("insert into constraints(constraint_type,string_length,number_min,number_max,basic_type) values('type_constraint',null,null,null,'STRING')");
	//var tables=await apix.query("insert into constraints(constraint_type,string_length,number_min,number_max,basic_type) values('string_length_constraint',80,null,null,null)");
	//var tables=await apix.query("insert into constraints(constraint_type,string_length,number_min,number_max,basic_type) values('type_constraint',null,null,null,'RAW')");
	//var tables=await apix.query("insert into constraints(constraint_type,string_length,number_min,number_max,basic_type) values('type_constraint',null,null,null,'BOOLEAN')");
	var size=tables.length;
	var id=tables.insertId;
	var affected=tables.affectedRows;
	console.log('size '+JSON.stringify(tables));
	console.log('id '+id);
	console.log('affected '+affected);
	
}
async function add_datasets_ref_dataset_fields() {//6
	var tables=await apix.query("insert into datasets_ref_dataset_fields(ds_id,dsf_id) values(5,56)");
	var size=tables.length;
	var id=tables.insertId;
	var affected=tables.affectedRows;
	console.log('size '+JSON.stringify(tables));
	console.log('id '+id);
	console.log('affected '+affected);
	
}
async function add_dataset_field_constraint() {//4,5
	var tables=await apix.query("insert into dataset_fields_constraints(dsf_id,ct_id) values(56,112)");
	var size=tables.length;
	var id=tables.insertId;
	var affected=tables.affectedRows;
	console.log('size '+JSON.stringify(tables));
	console.log('id '+id);
	console.log('affected '+affected);
	
}
add_datasets_ref_dataset_fields();