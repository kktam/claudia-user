/*global require, module*/
var ApiBuilder = require('claudia-api-builder'),
	AWS = require('aws-sdk'),
	api = new ApiBuilder(),
	dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = api;

// Create new user
api.post('/user', function (request) {
	'use strict';

	var items = {};
	var values = request.body;
	Object.keys(values).map(function(k, i) { 
		let data = values[k];
		items[k] = data;
	}); 

	items["id"]= request.body.userId;

	var params = {
		TableName: request.env.tableName,
		Item: items
	};
	// return dynamo result directly
	return dynamoDb.put(params).promise();
}, { success: 201 }); // Return HTTP status 201 - Created when successful

// get user for {id}
api.get('/user/{id}', function (request) {
	'use strict';
	var id, params;
	// Get the id from the pathParams
	id = request.pathParams.id;
	params = {
		TableName: request.env.tableName,
		Key: {
			id: id
		}
	};

	// post-process dynamo result before returning
	return dynamoDb.get(params).promise().then(function (response) {
		return response.Item;
	});
});

// delete user with {id}
api.delete('/user/{id}', function (request) {
	'use strict';
	var id, params;
	// Get the id from the pathParams
	id = request.pathParams.id;
	params = {
		TableName: request.env.tableName,
		Key: {
			id: id
		}
	};
	// return a completely different result when dynamo completes
	return dynamoDb.delete(params).promise()
		.then(function () {
			return 'Deleted user with id "' + id + '"';
		});
}, {success: { contentType: 'text/plain'}});

api.addPostDeployConfig('tableName', 'DynamoDB Table Name:', 'configure-db');

