/** @jsx React.DOM */

var ImageLoader = require('./ImageLoader.jsx');
var ImageSwatch = require('./ImageSwatch.jsx');
var ImageStore = require('../stores/ImageStore');
var SwatchifyActions = require('../actions/SwatchifyActions');

function getImageState() {
	return {
		allImages: ImageStore.getAll(),
		currentImage: ImageStore.getCurrent()
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
				<ImageLoader onNewImage={this.handleNewImage} /> <br/>
				<ImageSwatch
					image={this.state.currentImage}
					addChangeListener={ImageStore.addChangeListener}
					removeChangeListener={ImageStore.removeChangeListener}
					swatches={this.props.swatches}
					width={this.props.width} />
			</div>
		);
	},
	
	handleNewImage : function( img ) {
		SwatchifyActions.createImage( img );
	},
	
    _handleChange: function() {
		this.setState( getImageState() );
    }
	
});

React.renderComponent(<Swatchify swatches={7} width={300} />, document.getElementById('node'));