/** @jsx React.DOM */

var SwatchifyActions = require('../actions/SwatchifyActions');
var React = require('react');
var _ = require('underscore');

var SwatchSlider = module.exports = React.createClass({

	render : function() {
		return (
			<div>
				<label htmlFor="SwatchSliderInput">Number of Swatches</label><br/>
				<input ref="range" type="range" min="2" max="10" step="1" defaultValue={this.props.swatchify.swatchCount} onChange={this.handleChange} />
				{this.props.swatchify.swatchCount}
			</div>
		)
	},
	
	componentWillReceiveProps: function(nextProps) {

		var image = this.props.swatchify.currentImage;

		this.setState({
			lastImageId : image ? image.id : null
		});
	},
	
	componentDidUpdate: function() {

		var image = this.props.swatchify.currentImage;
		
		//If the image changed
		if( image && image.id !== this.state.lastImageId ) {
			this.refs.range.getDOMNode().value = image.swatchCount;
		}
		
	},
	
	handleChange : function() {
		
		var debouncedChange = _.debounce(function( value ) {
			SwatchifyActions.setSwatches( value );
		}, 500);
		
		//Immediately grab the value, but wait for the debounce to try and change
		return function(e) {
			debouncedChange( e.target.value );
		};
	}()
	
	
});