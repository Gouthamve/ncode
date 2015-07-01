var mongoose = require('mongoose');


var userSchema = mongoose.Schema({
	nvisionId: String,
	facebook: {
		id: String,
		displayName: String,
		name: {
			familyName: String,
			givenName: String
		},
		gender: String,
		profileUrl: String,
		email: String,
		token: String
	},
	google: {
		id: String,
		token: String,
		displayName: String,
		name: {
			familyName: String,
			givenName: String
		},
		email: String,
		photo: String,
		gender: String,
		domain: String,
		profileUrl: String
	}
});

module.exports = mongoose.model('User', userSchema);
