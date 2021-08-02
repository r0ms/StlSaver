//download.js v4.2, by dandavis; 2008-2017. [MIT] see http://danml.com/download.html for tests/usage
(function(r,l){"function"==typeof define&&define.amd?define([],l):"object"==typeof exports?module.exports=l():r.download=l()})(this,function(){return function l(a,e,k){function q(a){var h=a.split(/[:;,]/);a=h[1];var h=("base64"==h[2]?atob:decodeURIComponent)(h.pop()),d=h.length,b=0,c=new Uint8Array(d);for(b;b<d;++b)c[b]=h.charCodeAt(b);return new f([c],{type:a})}function m(a,b){if("download"in d)return d.href=a,d.setAttribute("download",n),d.className="download-js-link",d.innerHTML="downloading...",d.style.display="none",document.body.appendChild(d),setTimeout(function(){d.click(),document.body.removeChild(d),!0===b&&setTimeout(function(){g.URL.revokeObjectURL(d.href)},250)},66),!0;if(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent))return/^data:/.test(a)&&(a="data:"+a.replace(/^data:([\w\/\-\+]+)/,"application/octet-stream")),!window.open(a)&&confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")&&(location.href=a),!0;var c=document.createElement("iframe");document.body.appendChild(c),!b&&/^data:/.test(a)&&(a="data:"+a.replace(/^data:([\w\/\-\+]+)/,"application/octet-stream")),c.src=a,setTimeout(function(){document.body.removeChild(c)},333)}var g=window,b=k||"application/octet-stream",c=!e&&!k&&a,d=document.createElement("a");k=function(a){return String(a)};var f=g.Blob||g.MozBlob||g.WebKitBlob||k,n=e||"download",f=f.call?f.bind(g):Blob;"true"===String(this)&&(a=[a,b],b=a[0],a=a[1]);if(c&&2048>c.length&&(n=c.split("/").pop().split("?")[0],d.href=c,-1!==d.href.indexOf(c))){var p=new XMLHttpRequest;return p.open("GET",c,!0),p.responseType="blob",p.onload=function(a){l(a.target.response,n,"application/octet-stream")},setTimeout(function(){p.send()},0),p}if(/^data:([\w+-]+\/[\w+.-]+)?[,;]/.test(a)){if(!(2096103.424<a.length&&f!==k))return navigator.msSaveBlob?navigator.msSaveBlob(q(a),n):m(a);a=q(a),b=a.type||"application/octet-stream"}else if(/([\x80-\xff])/.test(a)){e=0;var c=new Uint8Array(a.length),t=c.length;for(e;e<t;++e)c[e]=a.charCodeAt(e);a=new f([c],{type:b})}a=a instanceof f?a:new f([a],{type:b});if(navigator.msSaveBlob)return navigator.msSaveBlob(a,n);if(g.URL)m(g.URL.createObjectURL(a),!0);else{if("string"==typeof a||a.constructor===k)try{return m("data:"+b+";base64,"+g.btoa(a))}catch(h){return m("data:"+b+","+encodeURIComponent(a))}b=new FileReader,b.onload=function(a){m(this.result)},b.readAsDataURL(a)}return!0}});

console.log("HeroSaver - Starting Loading");

function init() {
	
	
	
    (function(){

	THREE.STLExporter = function () {};

	THREE.STLExporter.prototype = {

		constructor: THREE.STLExporter,

		parse: function ( scene, options ) {

			if ( options === undefined ) options = {};

			var binary = options.binary !== undefined ? options.binary : false;

			//

			var objects = [];
			var triangles = 0;

			scene.traverse( function ( object ) {

				if ( object.isMesh ) {

					var geometry = object.geometry;

					if ( geometry.isGeometry ) {

						geometry = new THREE.BufferGeometry().fromGeometry( geometry );

					}

					var index = geometry.index;
					var positionAttribute = geometry.getAttribute( 'position' );

					triangles += ( index !== null ) ? ( index.count / 3 ) : ( positionAttribute.count / 3 );

					objects.push( {
						object3d: object,
						geometry: geometry
					} );

				}

			} );

			var output;
			var offset = 80; // skip header

			if ( binary === true ) {

				var bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
				var arrayBuffer = new ArrayBuffer( bufferLength );
				output = new DataView( arrayBuffer );
				output.setUint32( offset, triangles, true ); offset += 4;

			} else {

				output = '';
				output += 'solid exported\n';

			}

			var vA = new THREE.Vector3();
			var vB = new THREE.Vector3();
			var vC = new THREE.Vector3();
			var cb = new THREE.Vector3();
			var ab = new THREE.Vector3();
			var normal = new THREE.Vector3();

			for ( var i = 0, il = objects.length; i < il; i ++ ) {

				var object = objects[ i ].object3d;
				var geometry = objects[ i ].geometry;

				var index = geometry.index;
				var positionAttribute = geometry.getAttribute( 'position' );

				if ( index !== null ) {

					// indexed geometry

					for ( var j = 0; j < index.count; j += 3 ) {

						var a = index.getX( j + 0 );
						var b = index.getX( j + 1 );
						var c = index.getX( j + 2 );

						writeFace( a, b, c, positionAttribute, object );

					}

				} else {

					// non-indexed geometry

					for ( var j = 0; j < positionAttribute.count; j += 3 ) {

						var a = j + 0;
						var b = j + 1;
						var c = j + 2;

						writeFace( a, b, c, positionAttribute, object );

					}

				}

			}

			if ( binary === false ) {

				output += 'endsolid exported\n';

			}

			return output;

			function writeFace( a, b, c, positionAttribute, object ) {

				vA.fromBufferAttribute( positionAttribute, a );
				vB.fromBufferAttribute( positionAttribute, b );
				vC.fromBufferAttribute( positionAttribute, c );

				if ( object.isSkinnedMesh === true ) {

					object.boneTransform = ( function () {

							const basePosition = new THREE.Vector3();

							const skinIndex = new THREE.Vector4();
							const skinWeight = new THREE.Vector4();

							const vector = new THREE.Vector3();
							const matrix = new THREE.Matrix4();

							return function ( index, target ) {

								const skeleton = this.skeleton;
								const geometry = this.geometry;

								skinIndex.fromBufferAttribute( geometry.attributes.skinIndex0, index );
								skinWeight.fromBufferAttribute( geometry.attributes.skinWeight0, index );

								basePosition.fromBufferAttribute( geometry.attributes.position, index ).applyMatrix4( this.bindMatrix );

								target.set( 0, 0, 0 );

								for ( let i = 0; i < 4; i ++ ) {

									const weight = skinWeight.getComponent( i );

									if ( weight !== 0 ) {

										const boneIndex = skinIndex.getComponent( i );

										matrix.multiplyMatrices( skeleton.bones[ boneIndex ].matrixWorld, skeleton.boneInverses[ boneIndex ] );

										target.addScaledVector( vector.copy( basePosition ).applyMatrix4( matrix ), weight );

									}

								}

								return target.applyMatrix4( this.bindMatrixInverse );

							};

						}() )

					object.boneTransform( a, vA );
					object.boneTransform( b, vB );
					object.boneTransform( c, vC );

				}

				vA.applyMatrix4( object.matrixWorld );
				vB.applyMatrix4( object.matrixWorld );
				vC.applyMatrix4( object.matrixWorld );

				writeNormal( vA, vB, vC );

				writeVertex( vA );
				writeVertex( vB );
				writeVertex( vC );

				if ( binary === true ) {

					output.setUint16( offset, 0, true ); offset += 2;

				} else {

					output += '\t\tendloop\n';
					output += '\tendfacet\n';

				}

			}

			function writeNormal( vA, vB, vC ) {

				cb.subVectors( vC, vB );
				ab.subVectors( vA, vB );
				cb.cross( ab ).normalize();

				normal.copy( cb ).normalize();

				if ( binary === true ) {

					output.setFloat32( offset, normal.x, true ); offset += 4;
					output.setFloat32( offset, normal.y, true ); offset += 4;
					output.setFloat32( offset, normal.z, true ); offset += 4;

				} else {

					output += '\tfacet normal ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';
					output += '\t\touter loop\n';

				}

			}

			function writeVertex( vertex ) {

				if ( binary === true ) {

					output.setFloat32( offset, vertex.x, true ); offset += 4;
					output.setFloat32( offset, vertex.y, true ); offset += 4;
					output.setFloat32( offset, vertex.z, true ); offset += 4;

				} else {

					output += '\t\t\tvertex ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

				}

			}

		}

	};

    if (typeof module !== "undefined" && module.exports) {
        module.exports = THREE.STLExporter
    } 
    else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
        define([], function() {
            return saveAs;
        });
    }


	var menu_style = { "margin-left": "auto", "width": "100px", "background-color": "crimson", "cursor": "pointer", "pointer-events": "auto", "text-align": "center", "padding": "6px", "font-size": "large" };


    var character_area, stl_base, labeljson;
    
	stl_base = 			jQuery("<a/>").css(menu_style).text("Export STL");
	
    character_area = 	jQuery(".dropdowns-0-1-32").first();
    character_area.css({"display": "flex", "justify-content": "center", "align-content": "center"});
    
    character_area.prepend(stl_base);

    stl_base.click(function(e) {
        e.preventDefault(); 
        var exporter = new THREE.STLExporter();    
        var stlString = exporter.parse(CK.character)
        var name = get_name();
        download(stlString, name + '.stl', 'application/sla');
    });

})()};

function inject_script(url, callback) {
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.src = url; 
  script.onload = function(e) { 
      callback() };
  head.appendChild(script);
}

console.log("HeroSaver - Injecting Libraries");

inject_script("//code.jquery.com/jquery-3.3.1.min.js", function () {
   inject_script("//cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.min.js", function () { 
	  return setTimeout(init, 5000);
   })
});
// inject_script("//code.jquery.com/jquery-3.3.1.min.js", function () {
//     inject_script("//raw.githubusercontent.com/Sonic-Cloud/StlSaver/master/three.js", function () { init() })
// });

function get_name() {
  var timestamp = new Date().getUTCMilliseconds();
  var uqID = timestamp.toString(36);
  var name = "Character " + uqID; 
  try {
    var getName = CK.character.data.meta.character_name
    name = getName === "" ? name : getName;
  } catch (e) {
    if (e instanceof ReferenceError) {
        console.log("Name of character data location has changed");
        console.log(e);
    } else {
        console.log("Other Error");
        console.log(e);
    }
  }
  return name;
}

console.log("HeroSaver - Finished Loading");
