var AppDispatcher = require('../utils/dispatcher/AppDispatcher');
var SwatchifyConstants = require('../constants/SwatchifyConstants');

var SwatchifyActions = {

	createImage: function( img ) {
		AppDispatcher.handleViewAction({
			actionType: SwatchifyConstants.CREATE_IMAGE,
			img: img
		});		
	},
	
	setSwatches: function( swatchCount ) {
		AppDispatcher.handleViewAction({
			actionType: SwatchifyConstants.SET_SWATCH_COUNT,
			swatchCount: swatchCount
		});	
	}
	
};

module.exports = SwatchifyActions;
