

var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {
	
	// 스키마 정의
	var UserSchema = mongoose.Schema({
	    email: {type: String,'default':''},
	    hashed_password: {type: String, 'default':''},
	    salt: {type:String},
	    name: {type: String, index: 'hashed', 'default':''},
	    created_at: {type: Date, index: {unique: false}, 'default': Date.now},
	    updated_at: {type: Date, index: {unique: false}, 'default': Date.now},
        provider:{type:String,'default':''},
        authToken:{type:String,'default':''},
        facebook:{ }
	});
	
	// password를 virtual 메소드로 정의 : MongoDB에 저장되지 않는 편리한 속성임. 특정 속성을 지정하고 set, get 메소드를 정의함
	UserSchema
	  .virtual('password')
	  .set(function(password) {
	    this._password = password;
	    this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
	    console.log('virtual password 호출됨 : ' + this.hashed_password);
	  })
	  .get(function() { return this._password });
	console.log('Schema 아이디>>>'+UserSchema.id);
   
	// 스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
	// 비밀번호 암호화 메소드
	UserSchema.method('encryptPassword', function(plainText, inSalt) {
        console.log('thisSalt>>>'+this.salt);
		if (inSalt) {
			return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
		} else {
			return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
		}
	});
	
	// salt 값 만들기 메소드
	UserSchema.method('makeSalt', function() {
        console.log('round>>>>'+Math.round((new Date().valueOf() * Math.random())) + '');
		return Math.round((new Date().valueOf() * Math.random())) + '';
	});
	
	// 인증 메소드 - 입력된 비밀번호와 비교 (true/false 리턴)
	UserSchema.method('authenticate', function(plainText, inSalt, hashed_password) {
        console.log('inSalt의 정체>>>>'+inSalt);
		if (inSalt) {
			console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), hashed_password);
			return this.encryptPassword(plainText, inSalt) === hashed_password;
		} else {
			console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText), this.hashed_password);
			return this.encryptPassword(plainText) === this.hashed_password;
		}
	});
	
	// 값이 유효한지 확인하는 함수 정의
	var validatePresenceOf = function(value) {
		return value && value.length;
	};
		
	
	
	// 필수 속성에 대한 유효성 확인 (길이값 체크)
	UserSchema.path('email').validate(function (email) {
		return email.length;
	}, 'email 칼럼의 값이 없습니다.');
	
	UserSchema.path('name').validate(function (name) {
		return name.length;
	}, 'name 칼럼의 값이 없습니다.');
	
	
	   
	// 스키마에 static 메소드 추가
	UserSchema.static('findByEmail', function(email, callback) {
		return this.find({email:email}, callback);
	});
	
	UserSchema.static('findAll', function(callback) {
		return this.find({}, callback);
	});
	
    
    
	console.log('UserSchema 정의함.');

	return UserSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;

