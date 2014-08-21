var clusterfck = require("clusterfck");
var _ = require('underscore');
var utils = require('./Color');

var kMeans = module.exports = {
	
	generateSwatches : function( image, swatchCount ) {
		
		return new Promise(function(resolve, reject) {
			
			var colors = kMeans.convertToRgbRows( image.data );
			var clusters = clusterfck.kmeans( colors, swatchCount );
			var swatches = kMeans.reduceToSwatches( clusters );
			
			resolve({
				clusters : clusters,
				swatches : swatches
			});
			
		}.bind(this));
		
	},
	
	reduceToSwatches : function( clusters ) {
		
		var swatches = _.map(clusters, function( cluster ) {
			
			var swatch = _.reduce(cluster, function(memo, color) {
				
				return [
					memo[0] + color[0],
					memo[1] + color[1],
					memo[2] + color[2]
				];
					
			}, [0,0,0]);
			
			return _.map(swatch, function( value ) {
				return Math.round(value / cluster.length)
			});
		});
		
		return _.sortBy(swatches, function(color) {
			var hsv = utils.rgbToHsv(color);
			
			return hsv[0];
		});
		
	},
	
	//Deprecated test, identical result
	reduceToHslSwatches : function( clusters ) {
		
		return _.map(clusters, function( cluster ) {
			
			var hslCluster = _.map(cluster, utils.rgbToHsv);
			
			var swatch = _.reduce(hslCluster, function(memo, color) {
				
				return [
					memo[0] + color[0],
					memo[1] + color[1],
					memo[2] + color[2]
				];
					
			}, [0,0,0]);
			
			return _.map(swatch, function( value ) {
				return Math.round(value / cluster.length)
			});
		});
		
	},
	
	convertToRgbRows : function( data ) {
		
		var data, results, i;
		
		results = [];
		
		for(i=0; i < data.length; i += 4) {
			results.push([
				data[i],
				data[i+1],
				data[i+2]
			]);
		}

		return results;

	}
	
};