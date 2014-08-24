var colors;

self.addEventListener('message', function(e) {
	console.log('herro');
	switch (e.data.action) {
		case "kMeans":
			calculateKMeans( e.data );
			break;
		case "setColors":
			colors = e.data.colors;
			break;
	}
	
	self.postMessage(JSON.stringify(e.data));

}, false);


function calculateKMeans( data ) {
	var colors = data.colors;
	var swatchCount = data.swatchCount;
	var timestamp = data.timestamp;
	
	var clusters = clusterfck.kmeans( colors, swatchCount );
	var swatches = reduceToSwatches( clusters ); 

	self.postMessage(JSON.stringify({
		timestamp: timestamp,
		swatches: swatches
	}));
}

function reduceToSwatches( clusters ) {
	
	var swatches = _.map(clusters, function( cluster ) {
		
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
	
	return _.sortBy(swatches, function(color) {
		var hsv = utils.rgbToHsv(color);
		
		return hsv[0];
	});
	
};
//clusterfck library included below:
/* MIT license */
var clusterfck = (function() {
	
	var require = function (file, cwd) {

		var resolved = require.resolve(file, cwd || '/');
		var mod = require.modules[resolved];
		if (!mod) throw new Error(
			'Failed to resolve module ' + file + ', tried ' + resolved
		);
		var res = mod._cached ? mod._cached : mod();
		return res;
	}

	require.paths = [];
	require.modules = {};
	require.extensions = [".js",".coffee"];

	require._core = {
		'assert': true,
		'events': true,
		'fs': true,
		'path': true,
		'vm': true
	};

	require.resolve = (function () {
		return function (x, cwd) {
			if (!cwd) cwd = '/';
		
			if (require._core[x]) return x;
			var path = require.modules.path();
			var y = cwd || '.';
		
			if (x.match(/^(?:\.\.?\/|\/)/)) {
				var m = loadAsFileSync(path.resolve(y, x))
					|| loadAsDirectorySync(path.resolve(y, x));
				if (m) return m;
			}
		
			var n = loadNodeModulesSync(x, y);
			if (n) return n;
		
			throw new Error("Cannot find module '" + x + "'");
		
			function loadAsFileSync (x) {
				if (require.modules[x]) {
					return x;
				}
			
				for (var i = 0; i < require.extensions.length; i++) {
					var ext = require.extensions[i];
					if (require.modules[x + ext]) return x + ext;
				}
			}
		
			function loadAsDirectorySync (x) {
				x = x.replace(/\/+$/, '');
				var pkgfile = x + '/package.json';
				if (require.modules[pkgfile]) {
					var pkg = require.modules[pkgfile]();
					var b = pkg.browserify;
					if (typeof b === 'object' && b.main) {
						var m = loadAsFileSync(path.resolve(x, b.main));
						if (m) return m;
					}
					else if (typeof b === 'string') {
						var m = loadAsFileSync(path.resolve(x, b));
						if (m) return m;
					}
					else if (pkg.main) {
						var m = loadAsFileSync(path.resolve(x, pkg.main));
						if (m) return m;
					}
				}
			
				return loadAsFileSync(x + '/index');
			}
		
			function loadNodeModulesSync (x, start) {
				var dirs = nodeModulesPathsSync(start);
				for (var i = 0; i < dirs.length; i++) {
					var dir = dirs[i];
					var m = loadAsFileSync(dir + '/' + x);
					if (m) return m;
					var n = loadAsDirectorySync(dir + '/' + x);
					if (n) return n;
				}
			
				var m = loadAsFileSync(x);
				if (m) return m;
			}
		
			function nodeModulesPathsSync (start) {
				var parts;
				if (start === '/') parts = [ '' ];
				else parts = path.normalize(start).split('/');
			
				var dirs = [];
				for (var i = parts.length - 1; i >= 0; i--) {
					if (parts[i] === 'node_modules') continue;
					var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
					dirs.push(dir);
				}
			
				return dirs;
			}
		};
	})();

	require.alias = function (from, to) {
		var path = require.modules.path();
		var res = null;
		try {
			res = require.resolve(from + '/package.json', '/');
		}
		catch (err) {
			res = require.resolve(from, '/');
		}
		var basedir = path.dirname(res);
	
		var keys = Object_keys(require.modules);
	
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (key.slice(0, basedir.length + 1) === basedir + '/') {
				var f = key.slice(basedir.length);
				require.modules[to + f] = require.modules[basedir + f];
			}
			else if (key === basedir) {
				require.modules[to] = require.modules[basedir];
			}
		}
	};

	require.define = function (filename, fn) {
		var dirname = require._core[filename]
			? ''
			: require.modules.path().dirname(filename)
		;
	
		var require_ = function (file) {
			return require(file, dirname)
		};
		require_.resolve = function (name) {
			return require.resolve(name, dirname);
		};
		require_.modules = require.modules;
		require_.define = require.define;
		var module_ = { exports : {} };
	
		require.modules[filename] = function () {
			require.modules[filename]._cached = module_.exports;
			fn.call(
				module_.exports,
				require_,
				module_,
				module_.exports,
				dirname,
				filename
			);
			require.modules[filename]._cached = module_.exports;
			return module_.exports;
		};
	};

	var Object_keys = Object.keys || function (obj) {
		var res = [];
		for (var key in obj) res.push(key)
		return res;
	};

	if (typeof process === 'undefined') process = {};

	if (!process.nextTick) process.nextTick = function (fn) {
		setTimeout(fn, 0);
	};

	if (!process.title) process.title = 'browser';

	if (!process.binding) process.binding = function (name) {
		if (name === 'evals') return require('vm')
		else throw new Error('No such module')
	};

	if (!process.cwd) process.cwd = function () { return '.' };

	require.define("path", function (require, module, exports, __dirname, __filename) {
		function filter (xs, fn) {
		var res = [];
		for (var i = 0; i < xs.length; i++) {
			if (fn(xs[i], i, xs)) res.push(xs[i]);
		}
		return res;
	}

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length; i >= 0; i--) {
		var last = parts[i];
		if (last == '.') {
		  parts.splice(i, 1);
		} else if (last === '..') {
		  parts.splice(i, 1);
		  up++;
		} else if (up) {
		  parts.splice(i, 1);
		  up--;
		}
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
		for (; up--; up) {
		  parts.unshift('..');
		}
	  }

	  return parts;
	}

	// Regex to split a filename into [*, dir, basename, ext]
	// posix version
	var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function() {
	var resolvedPath = '',
		resolvedAbsolute = false;

	for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
	  var path = (i >= 0)
		  ? arguments[i]
		  : process.cwd();

	  // Skip empty and invalid entries
	  if (typeof path !== 'string' || !path) {
		continue;
	  }

	  resolvedPath = path + '/' + resolvedPath;
	  resolvedAbsolute = path.charAt(0) === '/';
	}

	// At this point the path should be resolved to a full absolute path, but
	// handle relative paths to be safe (might happen when process.cwd() fails)

	// Normalize the path
	resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
		return !!p;
	  }), !resolvedAbsolute).join('/');

	  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function(path) {
	var isAbsolute = path.charAt(0) === '/',
		trailingSlash = path.slice(-1) === '/';

	// Normalize the path
	path = normalizeArray(filter(path.split('/'), function(p) {
		return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
		path = '.';
	  }
	  if (path && trailingSlash) {
		path += '/';
	  }
  
	  return (isAbsolute ? '/' : '') + path;
	};


	// posix version
	exports.join = function() {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function(p, index) {
		return p && typeof p === 'string';
	  }).join('/'));
	};


	exports.dirname = function(path) {
	  var dir = splitPathRe.exec(path)[1] || '';
	  var isWindows = false;
	  if (!dir) {
		// No dirname
		return '.';
	  } else if (dir.length === 1 ||
		  (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
		// It is just a slash or a drive letter with a slash
		return dir;
	  } else {
		// It is a full dirname, strip trailing slash
		return dir.substring(0, dir.length - 1);
	  }
	};


	exports.basename = function(path, ext) {
	  var f = splitPathRe.exec(path)[2] || '';
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
		f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};


	exports.extname = function(path) {
	  return splitPathRe.exec(path)[3] || '';
	};

	});

	require.define("/clusterfck.js", function (require, module, exports, __dirname, __filename) {
		module.exports = {
	   hcluster: require("./hcluster"),
	   kmeans: require("./kmeans")
	};
	});

	require.define("/hcluster.js", function (require, module, exports, __dirname, __filename) {
		var distances = require("./distance");

	var HierarchicalClustering = function(distance, linkage, threshold) {
	   this.distance = distance;
	   this.linkage = linkage;
	   this.threshold = threshold == undefined ? Infinity : threshold;
	}

	HierarchicalClustering.prototype = {
	   cluster : function(items, snapshotPeriod, snapshotCb) {
		  this.clusters = [];
		  this.dists = [];	// distances between each pair of clusters
		  this.mins = []; // closest cluster for each cluster
		  this.index = []; // keep a hash of all clusters by key
	  
		  for (var i = 0; i < items.length; i++) {
			 var cluster = {
				value: items[i],
				key: i,
				index: i,
				size: 1
			 };
			 this.clusters[i] = cluster;
			 this.index[i] = cluster;
			 this.dists[i] = [];
			 this.mins[i] = 0;
		  }

		  for (var i = 0; i < this.clusters.length; i++) {
			 for (var j = 0; j <= i; j++) {
				var dist = (i == j) ? Infinity : 
				   this.distance(this.clusters[i].value, this.clusters[j].value);
				this.dists[i][j] = dist;
				this.dists[j][i] = dist;

				if (dist < this.dists[i][this.mins[i]]) {
				   this.mins[i] = j;			   
				}
			 }
		  }

		  var merged = this.mergeClosest();
		  var i = 0;
		  while (merged) {
			if (snapshotCb && (i++ % snapshotPeriod) == 0) {
			   snapshotCb(this.clusters);			
			}
			merged = this.mergeClosest();
		  }
	
		  this.clusters.forEach(function(cluster) {
			// clean up metadata used for clustering
			delete cluster.key;
			delete cluster.index;
		  });

		  return this.clusters;
	   },
  
	   mergeClosest: function() {
		  // find two closest clusters from cached mins
		  var minKey = 0, min = Infinity;
		  for (var i = 0; i < this.clusters.length; i++) {
			 var key = this.clusters[i].key,
				 dist = this.dists[key][this.mins[key]];
			 if (dist < min) {
				minKey = key;
				min = dist;
			 }
		  }
		  if (min >= this.threshold) {
			 return false;		   
		  }

		  var c1 = this.index[minKey],
			  c2 = this.index[this.mins[minKey]];

		  // merge two closest clusters
		  var merged = {
			 left: c1,
			 right: c2,
			 key: c1.key,
			 size: c1.size + c2.size
		  };

		  this.clusters[c1.index] = merged;
		  this.clusters.splice(c2.index, 1);
		  this.index[c1.key] = merged;

		  // update distances with new merged cluster
		  for (var i = 0; i < this.clusters.length; i++) {
			 var ci = this.clusters[i];
			 var dist;
			 if (c1.key == ci.key) {
				dist = Infinity;			
			 }
			 else if (this.linkage == "single") {
				dist = this.dists[c1.key][ci.key];
				if (this.dists[c1.key][ci.key] > this.dists[c2.key][ci.key]) {
				   dist = this.dists[c2.key][ci.key];
				}
			 }
			 else if (this.linkage == "complete") {
				dist = this.dists[c1.key][ci.key];
				if (this.dists[c1.key][ci.key] < this.dists[c2.key][ci.key]) {
				   dist = this.dists[c2.key][ci.key];			   
				}
			 }
			 else if (this.linkage == "average") {
				dist = (this.dists[c1.key][ci.key] * c1.size
					   + this.dists[c2.key][ci.key] * c2.size) / (c1.size + c2.size);
			 }
			 else {
				dist = this.distance(ci.value, c1.value);			 
			 }

			 this.dists[c1.key][ci.key] = this.dists[ci.key][c1.key] = dist;
		  }

	
		  // update cached mins
		  for (var i = 0; i < this.clusters.length; i++) {
			 var key1 = this.clusters[i].key;		 
			 if (this.mins[key1] == c1.key || this.mins[key1] == c2.key) {
				var min = key1;
				for (var j = 0; j < this.clusters.length; j++) {
				   var key2 = this.clusters[j].key;
				   if (this.dists[key1][key2] < this.dists[key1][min]) {
					  min = key2;				   
				   }
				}
				this.mins[key1] = min;
			 }
			 this.clusters[i].index = i;
		  }
	
		  // clean up metadata used for clustering
		  delete c1.key; delete c2.key;
		  delete c1.index; delete c2.index;

		  return true;
	   }
	}

	var hcluster = function(items, distance, linkage, threshold, snapshot, snapshotCallback) {
	   distance = distance || "euclidean";
	   linkage = linkage || "average";

	   if (typeof distance == "string") {
		 distance = distances[distance];
	   }
	   var clusters = (new HierarchicalClustering(distance, linkage, threshold))
					  .cluster(items, snapshot, snapshotCallback);
	  
	   if (threshold === undefined) {
		  return clusters[0]; // all clustered into one
	   }
	   return clusters;
	}

	module.exports = hcluster;

	});

	require.define("/distance.js", function (require, module, exports, __dirname, __filename) {
		module.exports = {
	  euclidean: function(v1, v2) {
		  var total = 0;
		  for (var i = 0; i < v1.length; i++) {
			 total += Math.pow(v2[i] - v1[i], 2);	   
		  }
		  return Math.sqrt(total);
	   },
	   manhattan: function(v1, v2) {
		 var total = 0;
		 for (var i = 0; i < v1.length ; i++) {
			total += Math.abs(v2[i] - v1[i]);	   
		 }
		 return total;
	   },
	   max: function(v1, v2) {
		 var max = 0;
		 for (var i = 0; i < v1.length; i++) {
			max = Math.max(max , Math.abs(v2[i] - v1[i]));		
		 }
		 return max;
	   }
	};
	});

	require.define("/kmeans.js", function (require, module, exports, __dirname, __filename) {
		var distances = require("./distance");

	function randomCentroids(points, k) {
	   var centroids = points.slice(0); // copy
	   centroids.sort(function() {
		  return (Math.round(Math.random()) - 0.5);
	   });
	   return centroids.slice(0, k);
	}

	function closestCentroid(point, centroids, distance) {
	   var min = Infinity,
		   index = 0;
	   for (var i = 0; i < centroids.length; i++) {
		  var dist = distance(point, centroids[i]);
		  if (dist < min) {
			 min = dist;
			 index = i;
		  }
	   }
	   return index;
	}

	function kmeans(points, k, distance, snapshotPeriod, snapshotCb) {
	   distance = distance || "euclidean";
	   if (typeof distance == "string") {
		  distance = distances[distance];
	   }
   
	   var centroids = randomCentroids(points, k);
	   var assignment = new Array(points.length);
	   var clusters = new Array(k);

	   var iterations = 0;	 
	   var movement = true;
	   while (movement) {
		  // update point-to-centroid assignments
		  for (var i = 0; i < points.length; i++) {
			 assignment[i] = closestCentroid(points[i], centroids, distance);
		  }

		  // update location of each centroid
		  movement = false;
		  for (var j = 0; j < k; j++) {
			 var assigned = [];
			 assignment.forEach(function(centroid, index) {
				if (centroid == j) {
				   assigned.push(points[index]);
				}
			 });

			 if (!assigned.length) {
				continue;
			 }
			 var centroid = centroids[j];
			 var newCentroid = new Array(centroid.length);

			 for (var g = 0; g < centroid.length; g++) {
				var sum = 0;
				for (var i = 0; i < assigned.length; i++) {
				   sum += assigned[i][g];
				}
				newCentroid[g] = sum / assigned.length;
			
				if (newCentroid[g] != centroid[g]) {
				   movement = true;
				}
			 }
			 centroids[j] = newCentroid;
			 clusters[j] = assigned;
		  }
	  
		  if (snapshotCb && (iterations++ % snapshotPeriod == 0)) {
			 snapshotCb(clusters);
		  }
	   }
	   return clusters;
	}

	module.exports = kmeans;

	});

	return require('/clusterfck')

})();

//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,w=Object.keys,_=i.bind,j=function(n){return n instanceof j?n:this instanceof j?void(this._wrapped=n):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.6.0";var A=j.each=j.forEach=function(n,t,e){if(null==n)return n;if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a=j.keys(n),u=0,i=a.length;i>u;u++)if(t.call(e,n[a[u]],a[u],n)===r)return;return n};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var O="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(O);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(O);return r},j.find=j.detect=function(n,t,r){var e;return k(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var k=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:k(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,j.property(t))},j.where=function(n,t){return j.filter(n,j.matches(t))},j.findWhere=function(n,t){return j.find(n,j.matches(t))},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);var e=-1/0,u=-1/0;return A(n,function(n,i,a){var o=t?t.call(r,n,i,a):n;o>u&&(e=n,u=o)}),e},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);var e=1/0,u=1/0;return A(n,function(n,i,a){var o=t?t.call(r,n,i,a):n;u>o&&(e=n,u=o)}),e},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e},j.sample=function(n,t,r){return null==t||r?(n.length!==+n.length&&(n=j.values(n)),n[j.random(n.length-1)]):j.shuffle(n).slice(0,Math.max(0,t))};var E=function(n){return null==n?j.identity:j.isFunction(n)?n:j.property(n)};j.sortBy=function(n,t,r){return t=E(t),j.pluck(j.map(n,function(n,e,u){return{value:n,index:e,criteria:t.call(r,n,e,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=E(r),A(t,function(i,a){var o=r.call(e,i,a,t);n(u,o,i)}),u}};j.groupBy=F(function(n,t,r){j.has(n,t)?n[t].push(r):n[t]=[r]}),j.indexBy=F(function(n,t,r){n[t]=r}),j.countBy=F(function(n,t){j.has(n,t)?n[t]++:n[t]=1}),j.sortedIndex=function(n,t,r,e){r=E(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:0>t?[]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var M=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):M(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return M(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.partition=function(n,t){var r=[],e=[];return A(n,function(n){(t(n)?r:e).push(n)}),[r,e]},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.contains(t,n)})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var R=function(){};j.bind=function(n,t){var r,e;if(_&&n.bind===_)return _.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));R.prototype=n.prototype;var u=new R;R.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){for(var r=0,e=t.slice(),u=0,i=e.length;i>u;u++)e[u]===j&&(e[u]=arguments[r++]);for(;r<arguments.length;)e.push(arguments[r++]);return n.apply(this,e)}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:j.now(),a=null,i=n.apply(e,u),e=u=null};return function(){var l=j.now();o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u),e=u=null):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u,i,a,o,c=function(){var l=j.now()-a;t>l?e=setTimeout(c,t-l):(e=null,r||(o=n.apply(i,u),i=u=null))};return function(){i=this,u=arguments,a=j.now();var l=r&&!e;return e||(e=setTimeout(c,t)),l&&(o=n.apply(i,u),i=u=null),o}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return j.partial(t,n)},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=function(n){if(!j.isObject(n))return[];if(w)return w(n);var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},j.pairs=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},j.invert=function(n){for(var t={},r=j.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o)&&"constructor"in n&&"constructor"in t)return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.constant=function(n){return function(){return n}},j.property=function(n){return function(t){return t[n]}},j.matches=function(n){return function(t){if(t===n)return!0;for(var r in n)if(n[r]!==t[r])return!1;return!0}},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},j.now=Date.now||function(){return(new Date).getTime()};var T={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};T.unescape=j.invert(T.escape);var I={escape:new RegExp("["+j.keys(T.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(T.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(I[n],function(t){return T[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}}),"function"==typeof define&&define.amd&&define("underscore",[],function(){return j})}).call(this);
//# sourceMappingURL=underscore-min.map