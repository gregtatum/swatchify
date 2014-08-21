/** @jsx React.DOM */

var _ = require('underscore');

var ImageSwatch = module.exports = React.createClass({
	
	propTypes: {
		image: React.PropTypes.object,
		addChangeListener: React.PropTypes.func.isRequired,
		removeChangeListener: React.PropTypes.func.isRequired
	},
	
	getInitialState: function() {
	    return {
			src: null,
			swatches: null,
			canvasNeedsUpdating: false
		};
	},
	
    componentDidMount: function() {
		
		var image = this.props.image;
		
		if( image && image.swatches ) {
			this.setState({
				swatches : image.swatches
			});
			this.drawSwatches( image.swatches );
		}
    },
	
	componentWillReceiveProps: function( nextProps ) {
		
		var nextImage = nextProps.image;
		var currSwatches;
		var nextSwatches = null;
		
		if( nextImage ) {
			currSwatches = this.state.swatches;
			nextSwatches = nextImage.swatches ? nextImage.swatches : null;
		
			if( nextSwatches && !_.isEqual( currSwatches, nextSwatches ) ) {
				this.drawSwatches( nextSwatches );
			}
		}
		
		this.setState({
			swatches : nextSwatches
		});
	},
	
	render : function() {
		
		var image = this.props.image;
		var divStyle = {};
		var imgSrc = null;
		
		if(!image || image.swatches === null) {
			divStyle.display = "none";
		} else {
			imgSrc = image.img.src;
		}
			
		return	(
			<div className="ImageSwatch" style={divStyle}>
				<img src={imgSrc} /> <br/>
				<canvas width={this.props.width} height={this.props.width / this.props.swatches} ref="swatches"/> <br/>
			</div>
		);
		
	},
	
	drawSwatches : function( swatches ) {
		
		var ctx = this.refs.swatches.getDOMNode().getContext('2d');
		var width = this.props.width / this.props.swatches;
		var height = width;
		
		_.each(swatches, function(swatch, i) {
			ctx.fillStyle = "rgb(" + swatch.join(',') + ")";
			ctx.fillRect(
				width * i, 0,
				width, height
			);
		}, this);
		
		console.log('drawn Swatches');
	}
	
});