/** @jsx React.DOM */

var _ = require('underscore');

var ImageSwatch = module.exports = React.createClass({
	
	propTypes: {
		swatchify: React.PropTypes.object.isRequired,
		width: React.PropTypes.number.isRequired
	},
	
    componentDidMount: function() {
		
		this.drawSwatches();
		
    },
	
	render : function() {
		
		var image, imgSrc, divStyle, swatchCount;
		
		image = this.props.swatchify.currentImage;
		divStyle = {
			width: this.props.width,
			opacity: this.props.swatchify.isCalculating ? 0.2 : 1
		};
		
		if(!image || image.swatches === null) {
			divStyle.display = "none";
			swatchCount = this.props.swatchify.swatchCount
		} else {
			imgSrc = image.img.src;
			swatchCount = image.swatchCount;
		}
			
		return	(
			<div className="ImageSwatch" style={divStyle}>
				<img ref="image" src={imgSrc} /> <br/>
				<canvas width={this.props.width} height={this.props.width / swatchCount} ref="swatches"/> <br/>
			</div>
		);
		
	},
	
	componentDidUpdate : function() {
		this.drawSwatches();
	},
	
	drawSwatches : function( swatches ) {
		
		var image, ctx, width, height, swatches;
		
		image = this.props.swatchify.currentImage;
		
		if( image && image.swatches ) {
			
			swatches = image.swatches;
			
			ctx = this.refs.swatches.getDOMNode().getContext('2d');
			width = this.props.width / swatches.length;
			height = width;
				
			_.each(swatches, function(swatch, i) {
				ctx.fillStyle = "rgb(" + swatch.join(',') + ")";
				ctx.fillRect(
					width * i, 0,
					width, height
				);
			}, this);
		
		}
	}
	
});