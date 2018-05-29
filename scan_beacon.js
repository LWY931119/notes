////connect mysql/////
var mysql = require('mysql');
var conn = mysql.createConnection({
	host:'192.168.0.100',
	user:'root',
	password:'root',
	database:'pass',
	port:3306
})
try{
	conn.connect();
}catch(err){
	console.log(err);
}

function battery_log(band_id,level){
	var date = parseInt(Date.now()/1000);
	var sql = 'insert into battery_log (band_id,battery_level,created_at,update_at) values (?,?,?,?)';
	var sqlparams = [band_id,level,date,date];
	conn.query(sql,sqlparams,function(err,result){
		if(err)console.log(err);
		else {
			console.log(result);
			//sendBT(type,band,0,time);
		}
	});
}
var insertAble = true;
var timer = setInterval(function() {
  insertAble = true;
}, 300000)
var noble = require('noble');

noble.on('discover', function(peripheral){
  //if(peripheral.uuid == addressToTrack){
    //socket.emit('deviceData', {mac: peripheral.uuid, rssi:peripheral.rssi});    
  //}
  var macAddress = peripheral.uuid;
  var rss = peripheral.rssi;
  var localName =  peripheral.advertisement.localName; 
  if(localName == "ICTWSN"){
  	var serviceData = peripheral.advertisement.serviceData;
  	if (serviceData && serviceData.length) {
	    console.log('\there is my service data:');
	    var level = -1;
    	var id = -1;
    	for (var i in serviceData) {
    		if(serviceData[i].uuid == '0f18'){
    			level= parseInt(serviceData[i].data.toString('hex'),16);
    			console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex'))+"/"+parseInt(serviceData[i].data.toString('hex'),16));
    		}
    		if(serviceData[i].uuid == '3412'){
    			id= parseInt(serviceData[i].data.toString('hex'),16);
    			console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex'))+"/"+parseInt(serviceData[i].data.toString('hex'),16));
    		}
    	}
    	if(insertAble && level != -1 && id != -1){
    			battery_log(id,level);
    			level = -1;
    			id = -1;
    			insertAble = false;
    	}
  	}
  	if (peripheral.advertisement.manufacturerData) {
    	console.log('\there is my manufacturer data:');
    	console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
  	}
  }
  //console.log('found device: ', macAddress, ' ', localName, ' ', rss); 
});

noble.startScanning([], true) //allows dubplicates while scanning
