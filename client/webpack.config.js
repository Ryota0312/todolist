const path = require('path');

module.exports = {
    entry: {
	app: path.join(__dirname, 'src/index.js'),
    },
	
    output: {
	path: path.join(__dirname, '../app/assets/javascripts/webpack'),
	filename: '[name].js',
    },
    
    module: {
	loaders: [
	    { test: /\.(js|jsx)$/,
              loader: "babel-loader",
              exclude: /node_modules/,
	      query: {
		  presets: [
		      ["env", {
			  "targets": {
			      "broesers": ["last 2 versions"]
			  }
		      }], "react"]	
	      }
	    },
	]
    },
}
