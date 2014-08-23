var AppDispatcher = require('../utils/dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var SwatchifyConstants = require('../constants/SwatchifyConstants');
var merge = require('react/lib/merge');
var kMeans = require('../utils/kMeans');
var Promise = require('es6-promise');
var _ = require('underscore');

//Constants
var CHANGE_EVENT = 'change';
var MAX_CANVAS_DIMENSION = 150;

//Private variables
var _images = {};									//The collection of images
var _canvas = document.createElement('canvas');		//A scratchpad canvas element
var _ctx = _canvas.getContext('2d');
var _swatchCount = 3;									//For the kMeans operation

function create( img, swatchCount ) {
	
	var image;
	var id = Date.now();
	
	image = {
		id: id,
		img: img,
		swatchCount: swatchCount,
		data: getImageData( img ),
		isCurrent: true,
		swatches: null,
		clusters: null
	};
	
	_.each(_images, function(image) {
		image.isCurrent = false;
	});
	
	_images[id] = image;
	
	updateSwatches( image );
}

function updateSwatches( image ) {
	
	console.log('proceed to calculate kmeans');
	kMeans.generateSwatches( image.data, image.swatchCount ).then(function( data ) {
		
		console.log('kmeans has finished');
		
		image.clusters = data.clusters;
		image.swatches = data.swatches;
		
		ImageStore.emitChange();
		
	});
	
}

function destroy( id ) {
	delete _images[id];
}

function getImageData( img ) {
	
	var ratio, width, height;
	
	//Resize the source image to fit
	ratio = Math.min(
		MAX_CANVAS_DIMENSION / img.width,
		MAX_CANVAS_DIMENSION / img.height
	);
	
	width = img.width * ratio;
	height = img.height * ratio;
	
	_canvas.width = width;
	_canvas.height = height;
	
	//Clear old canvas
	_ctx.clearRect(0, 0, width, height);

	//Draw new image
	_ctx.drawImage(
		img,
		0, 0,
		width, height
	);
	
	return _ctx.getImageData(0, 0, width, height);
}

function setSwatchCount( swatchCount ) {
	
	_swatchCount = parseInt(swatchCount, 10);
	
	var image = ImageStore.getCurrent();
	
	if( image ) {
		image.swatchCount = _swatchCount;
		updateSwatches( image );
	}
}

var ImageStore = merge(EventEmitter.prototype, {

	getAll: function() {
		return _images;
	},
	
	getCurrent: function() {
		return _.find(_images, function(image) {
			return image.isCurrent;
		});	
	},

	getSwatchCount: function() {
		return _swatchCount;
	},

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},

	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	}
});

AppDispatcher.register(function(payload) {
	var action = payload.action;

	switch(action.actionType) {
		case SwatchifyConstants.CREATE_IMAGE:
			create( action.img, action.swatchCount );
			break;

		case SwatchifyConstants.DESTROY_IMAGE:
			destroy(action.id);
			break;
			
		case SwatchifyConstants.SET_SWATCH_COUNT:
			setSwatchCount( action.swatchCount );
			break;

		default:
			return true;
	}

	ImageStore.emitChange();

	return true; // No errors.	Needed by promise in Dispatcher.
});

module.exports = ImageStore;