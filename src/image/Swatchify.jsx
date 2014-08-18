/** @jsx React.DOM */

var ImageLoader = require('./ImageLoader.jsx');
var kMeans = require('./kMeans');
var _ = require('underscore');

var Swatchify = React.createClass({
	
	getDefaultProps: function() {
		return {
			maxWidth: 300,
			maxHeight: 200
		};
	},
	
	getInitialState: function() {
	    return {
			width: this.props.maxWidth,
			height: this.props.maxHeight
		};
	},
	
	propTypes: {
		maxWidth: React.PropTypes.number,
		maxHeight: React.PropTypes.number
	},
	
	render : function() {
		return	<div>
					<h1>Swatchify</h1>
					<ImageLoader onNewImage={this.onNewImage} /> <br/>
					<canvas width={this.state.width} height={this.state.height} ref="canvas"/> <br/>
					<canvas width={this.state.width} height={this.state.height / 3} ref="swatch"/> <br/>
				</div>;
	},
	
	componentDidMount : function() {
		this.ctx = this.refs.canvas.getDOMNode().getContext('2d');
		this.swatchCtx = this.refs.swatch.getDOMNode().getContext('2d');
		this.kMeans = new kMeans();
	},
	
	onNewImage : function( img ) {
		var imageData;
		
		this.renderCanvas( img );
		
		imageData = this.ctx.getImageData(0, 0, this.state.width, this.state.height);
		
		this.kMeans.process( imageData );
		
		this.renderSwatches( this.kMeans.swatches );
	},
	
	renderSwatches : function( swatches ) {
		
		var width = this.state.width / swatches.length;
		var height = this.state.height / 3;
		
		_.each(swatches, function(swatch, i) {
			
			this.swatchCtx.fillStyle = "rgb(" + swatch.join(',') + ")";
			this.swatchCtx.fillRect(
				width * i, 0,
				width, height
			);
			
			
		}, this);
	},
	
	renderCanvas : function( img ) {
		
		var ratio, width, height;
		
		//Resize the source image to fit
		ratio = Math.min(
			this.props.maxWidth / img.width,
			this.props.maxHeight / img.height
		);
		
		this.setState({
			
			width: img.width * ratio,
			height: img.height * ratio
			
		}, function() {
			
			//Clear old canvas
			this.ctx.clearRect(0, 0, this.state.width, this.state.height);

			//Draw new image
			this.ctx.drawImage(
				img,
				0, 0,
				this.state.width, this.state.height
			);
		});
		
	}
	
});

React.renderComponent(<Swatchify maxWidth={300} maxHeight={300} swatches={7}/>, document.getElementById('node'));