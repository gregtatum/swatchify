/** @jsx React.DOM */

var ImageLoader = require('./ImageLoader.jsx');
var ImageSwatch = require('./ImageSwatch.jsx');
var ImageStore = require('../stores/ImageStore');
var SwatchifyActions = require('../actions/SwatchifyActions');
var SwatchSlider = require('./SwatchSlider.jsx');

function getImageState() {
	return {
		allImages: ImageStore.getAll(),
		currentImage: ImageStore.getCurrent(),
		swatchCount: ImageStore.getSwatchCount(),
		isCalculating: ImageStore.isCalculating()
	};
};

var Swatchify = React.createClass({
	
    getInitialState: function() {
    	return getImageState();
    },

	componentWillMount: function() {
		SwatchifyActions.setSwatches( this.props.swatches );
	},
	
    componentDidMount: function() {
    	ImageStore.addChangeListener(this._handleChange);
    },

    componentWillUnmount: function() {
    	ImageStore.removeChangeListener(this._handleChange);
    },
	
	getDefaultProps: function() {
		return {
			width: 300,
			swatches: 5
		};
	},
	
	propTypes: {
		width: React.PropTypes.number,
		swatches: React.PropTypes.number
	},
	
	render : function() {
		var divStyle = {
			width : this.props.width
		}
		
		return (
			<div className="Swatchify" style={divStyle}>
				<h1>Swatchify</h1>
				<SwatchSlider	swatchify={this.state} swatchCount={this.state.swatchCount} />
				<ImageLoader	swatchify={this.state} onNewImage={this.handleNewImage} /> <br/>
				<ImageSwatch	swatchify={this.state} width={this.props.width} />
			</div>
		);
	},
	
	handleNewImage : function( img ) {
		SwatchifyActions.createImage( img, this.state.swatchCount );
	},
	
    _handleChange: function() {
		this.setState( getImageState() );
    }
	
});

React.renderComponent(<Swatchify swatches={7} width={300} />, document.getElementById('node'));