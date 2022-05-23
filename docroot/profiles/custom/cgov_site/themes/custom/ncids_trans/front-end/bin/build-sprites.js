#!/usr/bin/env node

/**
 * So yeah. There is a lot of cruft in the sprites, and to get them working
 * with IDs we had to provide a function to cleanup the names. This requires
 * Javascript. This was ok with gulp-svg-sprite because you passed in the
 * config via javascript. Unfortunately the OOB cli script for svg-sprite
 * only allows JSON for its configs. So this here script is just a script
 * that sets up our config and calls the svg-sprite function directly.
 */

'use strict';

const SVGSpriter = require('svg-sprite');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const mkdirp = require('mkdirp');
const File = require('vinyl');

const spritePath = path.join(
	__dirname,
	'../../../cgov/cgov_common/assets/sprites/*.svg'
);
const spriteConfig = {
	shape: {
		id: {
			separator: '',
		},
		dimension: {
			precision: 5,
		},
		spacing: {
			padding: 0,
		},
	},
	mode: {
		view: {
			sprite: path.join(__dirname, '../../dist/images/sprites/svg-sprite.svg'),
			dest: '.',
			render: {
				scss: {
					dest: path.join(
						__dirname,
						'../src/legacy/legacy-sprites/_svg-sprite-map.scss'
					),
					template: path.join(
						__dirname,
						'../../../cgov/src/styles/sprites/sprite-template.scss'
					),
				},
			},
			layout: 'packed',
			bust: true,
			example: false,
		},
	},
	variables: {
		mapname: 'icons',
		// This is a helper to extract just the sprite filename. You can use {{sprite}}, however,
		// that is the full path to the destination, and not using the webpack alias.
		filename() {
			return (fullPath, render) => {
				// The string passed into mustach appears to be html encoded.
				const pathArr = render(fullPath).split('&#x2F;');
				return pathArr.at(-1);
			};
		},
	},
	svg: {
		precision: 5,
	},
};

/**
 * Checks if value is the language type of Object (e.g. objects, regexes, new Number(0),
 * and new String('')). Excluding arrays (new Array())
 *
 * This was taken from svg-sprite script.
 *
 * @param {any} value The value to check.
 * @returns {boolean} Returns true if value is an object, else false.
 */
function isObject(value) {
	return typeof value === 'object' && value !== null;
}

/**
 * Recursively write files to disk
 *
 * This was lifted from the svg-sprite script.
 *
 * @param {object} files Files
 * @returns {number}     Number of written files
 */
function writeFiles(files) {
	var written = 0;
	for (var key in files) {
		if (isObject(files[key])) {
			if (files[key].constructor === File) {
				try {
					mkdirp.sync(path.dirname(files[key].path));
					fs.writeFileSync(files[key].path, files[key].contents);
					++written;
				} catch (err) {
					console.error(err);
					throw err;
				}
			} else {
				written += writeFiles(files[key]);
			}
		}
	}
	return written;
}

/**
 * Helper to add a sprite file that is a symlink to the spriter.
 *
 * @param {string} fullPath The full path and filename of the symlink
 * @param {SVGSpriter} spriter The spriter instance
 */
const addSymlinkToSpriter = (fullPath, spriter) => {
	const realFilePath = fs.readlinkSync(fullPath);
	const basename = path.basename(realFilePath);
	spriter.add(realFilePath, basename, fs.readFileSync(realFilePath));
};

/**
 * Helper to add a sprite file to the spriter.
 * @param {string} spriteFile The original filename
 * @param {string} fullPath The full path and filename of the sprite file
 * @param {SVGSpriter} spriter The spriter instance
 */
const addFileToSpriter = (spriteFile, fullPath, spriter) => {
	const basepos = spriteFile.lastIndexOf('./');
	const basename =
		basepos >= 0 ? spriteFile.substr(basepos + 2) : path.basename(spriteFile);
	spriter.add(fullPath, basename, fs.readFileSync(fullPath));
};

/**
 * This is the main program.
 */
const main = () => {
	const spriter = new SVGSpriter(spriteConfig);

	// Send errors out to the console as they occur.
	spriter.config.log.error = (message, error) => {
		console.error(message);
		console.error(error);
	};

	// Read in the sprites to be read.
	const sprites = glob.sync(spritePath);

	// Iterate over files adding to the spriter.
	// A lot of this was borrowed from svg-sprite cli.
	for (const spriteFile of sprites) {
		const fullPath = path.resolve(spriteFile);
		const stat = fs.lstatSync(fullPath);
		if (stat.isSymbolicLink()) {
			addSymlinkToSpriter(fullPath, spriter);
		} else {
			addFileToSpriter(spriteFile, fullPath, spriter);
		}
	}

	// Now build the sprite. Note the callback is responsible for writing out the files.
	spriter.compile((err, res) => {
		if (err) {
			console.error(err);
			// If there was an error building the sprite we should exit with an error code.
			process.exit(1);
		} else {
			writeFiles(res);
			process.exit(0);
		}
	});
};

main();
