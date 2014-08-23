/** @jsx React.DOM */

var _ = require('underscore');

var ImageSwatch = module.exports = React.createClass({
	
	propTypes: {
		swatchify: React.PropTypes.object.isRequired,
		width: React.PropTypes.number.isRequired
	},
	
    getInitialState: function() {
    	return {
			prevSwatches : null,
			initialSwatchDrawn : false
		};
    },
	
    componentDidMount: function() {
		
		var image = this.props.swatchify.currentImage;
		
		if( image && image.swatches ) {
			this.drawSwatches( image.swatches );
		}
    },
	
	componentWillReceiveProps: function( nextProps ) {
		
		var nextImage = nextProps.swatchify.currentImage;
		var prevSwatches = this.state.prevSwatches;
		var nextSwatches = null;
		
		if( nextImage ) {
			
			nextSwatches = nextImage.swatches ? nextImage.swatches : null;
		
			if( nextSwatches && !_.isEqual( prevSwatches, nextSwatches ) ) {
				this.drawSwatches( nextSwatches );
			}
		}
		
		this.setState({
			prevSwatches : nextSwatches
		});
	},
	
	render : function() {
		
		var image, imgSrc, divStyle, swatchCount;
		
		image = this.props.swatchify.currentImage;
		divStyle = {
			width: this.props.width
		};
		imgSrc = null;
		
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
		
	},
	
	drawSwatches : function( swatches ) {
		var ctx = this.refs.swatches.getDOMNode().getContext('2d');
		var width = this.props.width / swatches.length;
		var height = width;
				
		_.each(swatches, function(swatch, i) {
			ctx.fillStyle = "rgb(" + swatch.join(',') + ")";
			ctx.fillRect(
				width * i, 0,
				width, height
			);
		}, this);
		
		if(!this.state.initialSwatchDrawn) {
			this.setState({
				initialSwatchDrawn : true
			});
			this.forceUpdate();
		}
	}
	
});