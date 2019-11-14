
 var LocalStrategy=require('passport-local').Strategy;

module.exports=new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
},function(req,email,password,done){
    
    var paramName=req.param('name');
    console.log('passport의 local-signup 호출됨:'+email+','+password+','+paramName);
    
    //findOne 메소드가 blocking되지 않도록 하기 위해선 async방식으로
    process.nextTick(function(){
        var database=req.app.get('database');
            database.UserModel.findOne({'email':email},function(err,user){
                if(err){return done(err);}
                
                //기존에 사용자 정보가 있을때
                if(user){
                    console.log('기존에 계정이 있음.');
                    return done(null,false,req.flash('signupMessage','계정이 이미 있습니다.'));
                }else{
                    // 모델 인스턴스 객체 만들어서 저장
       var user=new database.UserModel({'email':email,'password':password,'name':paramName});
        user.save(function(err){
            if(err){
                    throw err;
                    }            
        console.log("사용자 데이터 추가함");
                    return done(null,user);
                                });
                    
                }
            });
    });
    
});