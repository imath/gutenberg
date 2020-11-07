/**
 * External dependencies
 */
const { command } = require( 'execa' );
const { isEmpty, omitBy } = require( 'lodash' );
const { join } = require( 'path' );
const writePkg = require( 'write-pkg' );

/**
 * Internal dependencies
 */
const { info } = require( './log' );

module.exports = async ( { author, description, license, slug, version } ) => {
	const cwd = join( process.cwd(), slug );

	info( '' );
	info( 'Installing packages. It might take a couple of minutes...' );
	await command( 'npm install @wordpress/scripts --save-dev', {
		cwd,
	} );

	info( '' );
	info( 'Formatting JavaScript files.' );
	await command( 'npm run format:js', {
		cwd,
	} );

	info( '' );
	info( 'Compiling block.' );
	await command( 'npm run build', {
		cwd,
	} );
};
