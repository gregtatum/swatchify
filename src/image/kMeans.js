var clusterfck = require("clusterfck");
var _ = require('underscore');

var kMeans = module.exports = function( args ) {
	this.colors = null;
};
	
kMeans.prototype = {
	
	process : function( imageData ) {
		this.colors = this.convertToRgbRows( imageData );
		this.clusters = clusterfck.kmeans(this.colors, 5);
		this.swatches = this.reduceToSwatches( this.clusters );
	},
	
	reduceToSwatches : function( clusters ) {
		
		return _.map(clusters, function( cluster ) {
			
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
		
	},
	
	convertToRgbRows : function( imageData ) {
		
		var data, results, i;
		
		results = [];
		data = imageData.data;
		
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