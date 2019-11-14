
var add=function(req,res){
    console.log('coffeeshop 모듈 안에 add호출!!');
    
    var paramName=req.body.name || req.query.name;
    var paramAddress=req.body.address || req.query.address;
    var paramTel=req.body.tel || req.query.tel;
    var paramLongitude=req.body.longitude || req.query.longitude;
    var paramLatitude=req.body.latitude || req.query.latitude;
    
    console.log('요청 파라미터:'+paramName+','+paramAddress+','+paramTel+','+paramLongitude+','+paramLatitude);
    
    // DB객체 참조
    var database=req.app.get('database');
    
    // DB 객체가 초기화된 경우
    if(database.db){
        addCoffeeShop(database,paramName,paramAddress,paramTel,paramLongitude,paramLatitude,function(err,result){
            
            if(err){
                console.error('커피숍 추가중 오류발생 :'+err.stack);
                
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>커피숍 추가중 오류발생</h2>');
                res.write('<p>'+err.stack+'</p>');
                res.end();
                
                return;
                
            }
            
        if(result){
            console.dir(result);
            
            res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>커피숍 추가 성공</h2>');
            res.end();
        }else{
             res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>커피숍 추가 실패</h2>');
            res.end();
        }
            
        });
        
    }else{
        
            res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>DB 연결 실패</h2>');
            res.end();
    }

};

var list=function(req,res){
    console.log('coffeeshop 모듈 안에 있는 list호출됨');
    
    // DB 객체 참조
    var database=req.app.get('database');
    
    // DB 객체가 초기화된 경우
    if(database.db){
        
        //1. 모든 커피숍 검색
        database.CoffeeShopModel.findAll(function(err,results){
            
            if(err){
                console.error('커피숍 리스트 조회 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>커피숍 리스트 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;  
            }
                if(results){
                    console.dir(results);
 
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>커피숍 리스트</h2>');
				res.write('<div><ul>');
				
				for (var i = 0; i < results.length; i++) {
					var curName = results[i]._doc.name;
					var curAddress = results[i]._doc.address;
					var curTel = results[i]._doc.tel;
					var curLongitude = results[i]._doc.geometry.coordinates[0];
					var curLatitude = results[i]._doc.geometry.coordinates[1];
					
					res.write('    <li>#' + i + ' : ' + curName + ', ' + curAddress + ', ' + curTel + ', ' + curLongitude + ', ' + curLatitude + '</li>');
                    
                }
                    res.write('</ul></div>');
                    res.end();
                
                }else{
                    res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>커피숍 리스트 조회 실패</h2>');
                    res.end();
                    
                }
            
            });
 
        }else{
                    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>데이터베이스 연결 실패</h2>');
                    res.end();
        }
     };

// 커피숍을 추가하는 함수

var addCoffeeShop=function(database,name,address,tel,longitude,latitude,callback){
    console.log('addCoffeeShop 호출됨');
    
    //CoffeeShopModel 인스턴스 생성
    var coffeeshop=new database.CoffeeShopModel(
        {name:name,address:address,tel:tel,
            geometry:{
                type:'Point',
                coordinates:[longitude,latitude]
                
            }
        
        }
    
    );
    
    
    // save()로 저장
    coffeeshop.save(function(err){
        if(err){
            
            callback(err,null);
            return;
        }
        console.log("커피숍 데이터 추가함");
        callback(null,coffeeshop);
    
    });
    
}

var findNear=function(req,res){
    console.log('coffeeshop 모듈 안에 있는 findNear 호출됨.');
    
    var maxDistance=2000;
    
    var paramLongitude=req.body.longitude || req.query.longitude;
    var paramLatitude=req.body.latitude || req.query.latitude;
    
    console.log('요청 파라미터:'+paramLongitude+','+paramLatitude);
    
    //DB 객체 참조
    var database=req.app.get('database');
    
    // DB객체가 초기화된 경우
    if(database.db){
        
        // 1. 가까운 커피숍 검색
        database.CoffeeShopModel.findNear(paramLongitude,paramLatitude,maxDistance,function(err,results){
            if(err){
                console.error('커피숍 검색 중 오류발생:'+err.stack);
                
                 res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>커피숍 검색 중 오료 발생</h2>');
                res.write('<p>'+err.stack+'</p>');
                    res.end();
                
                return;
            }
            
            if(results){
                 res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>가까운 커피숍</h2>');
                    res.write('<div><ul>');
                
                for(var i=0;i<results.length;i++){
                    
                    var curName=results[i]._doc.name;
                    var curAddress=results[i]._doc.address;
                    var curTel=results[i]._doc.tel;
                    var curLongitude=results[i]._doc.geometry.coordinates[0];
                    var curLatitude=results[i]._doc.geometry.coordinates[1];
                
                
                    res.write('<li>#'+i+':'+curName+','+curAddress+','+curTel+','+curLongitude+','+curLatitude+'</li>');
                }
                
                    res.write('</ul></div>');
                    res.end();
                
            }else{
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>가까운 커피숍 조회에 실패했습니다!!</h2>');
                res.end();
                
            }
        });
    }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>데이터베이스 연결 실패</h2>');
                    res.end();
        
    }

};




var findNear2=function(req,res){
    console.log('coffeeshop 모듈 안에있는 findNear2 호출됨.');
    
    var maxDistance=1000;
    
    var paramLongitude=req.body.longitude || req.query.longitude;
    var paramLatitude=req.body.latitude || req.query.latitude;
    
    console.log('요청 파라미터:'+paramLongitude+','+paramLatitude);
    
    // DB 객체 참조
    var database=req.app.get('database');
    
    // DB 객체가 초기화된 경우
    if(database.db){
        
        // 1. 가까운 커피숍 검색
        database.CoffeeShopModel.findNear(paramLongitude,paramLatitude,maxDistance,function(err,results){
            if (err) {
                console.error('커피숍 검색 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>커피숍 검색 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
        }
            
            if(results){
                console.dir(results);
                
                if(results.length>0){
                    res.render('findnear.ejs',{result:results[0]._doc,
                     paramLatitude:paramLatitude,
                     paramLongitude:paramLongitude });
                    
                }else{
                    res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>가까운 커피숍 데이터가 없습니다!!</h2>');
                    res.end();
                    
                }
                
            }else{
                     res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>가까운 커피숍 조회 실패!!</h2>');
                    res.end();
            }
            });
    
    }else{
                     res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                    res.write('<h2>DB 연결 실패!!</h2>');
                    res.end();
    }
};



// 등록할 커피숍위치를 구글맵 API를 이용해서 보여주기
var mapLoad=function(req,res){
  
    console.log('위치정보 등록을위한 구글맵 API 띄우기');
    var root=req.query.num;
    console.log('body>>>>>>>>>>>>>'+root);
    
    res.render('loadMap.ejs',{root:root});
    
    return;
};

// 등록할 커피숍위치를 구글맵API에서 선택했으면, 해당하는 장소에 위경도값, 주소 가져오기
var toBack=function(req,res){
   var results=req.body.results.split(',');
   var lat=results[0];
   var lng=results[1];
  
  if(results.length>2){
       var addr=results[2];

       console.log(lat+','+lng+','+addr);
       res.redirect('/public/addcoffeeshop.html?lat='+lat+'&lng='+lng+'&addr='+addr);
  }else{
      
      console.log(lat+','+lng);
      res.redirect('/public/nearCoffeeshop.html?lat='+lat+'&lng='+lng);
  }
     
    return;
};



module.exports.toBack=toBack;
module.exports.mapLoad=mapLoad;
module.exports.findNear2=findNear2;
module.exports.findNear=findNear;
module.exports.list=list;
module.exports.add=add;