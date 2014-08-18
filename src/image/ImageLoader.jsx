/** @jsx React.DOM */

//Example: <ImageLoader onNewImage={this.callback}/>

var ImageLoader = module.exports = React.createClass({
	
	render: function() {
		return	<div>
					<input type="file" onChange={this.loadImage} />
				</div>;
	},
	
	loadImage : function( changeEvent ) {
		var reader, file;
		
		file = changeEvent.target.files[0];
		if(!file.type.match(/image.*/)) return;
		
		reader = new FileReader();
		
		reader.onload = function(readerEvent){
			
			var img = new Image();
			
			img.onload = function(){
				if( typeof this.props.onNewImage === 'function' ) {
					this.props.onNewImage( img );					
				}
			}.bind(this)
			
			img.src = readerEvent.target.result;
			
		}.bind(this);
		
		reader.readAsDataURL(file); 
		
	}
	
});