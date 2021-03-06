/**
 * Converts editor's block type.
 *
 * @param {string} name Block name.
 */
export async function transformBlockTo( name ) {
	await page.mouse.move( 0, 0 );
	await page.mouse.move( 10, 10 );
	const switcherToggle = await page.waitForSelector(
		'.block-editor-block-switcher__toggle'
	);
	await switcherToggle.click();

	// Find the block button option within the switcher popover.
	const xpath = `//*[contains(@class, "block-editor-block-switcher__popover")]//button[.='${ name }']`;
	const insertButton = await page.waitForXPath( xpath, { visible: true } );
	// Clicks may fail if the button is out of view. Assure it is before click.
	await insertButton.evaluate( ( element ) => element.scrollIntoView() );
	await insertButton.click();

	// Wait for the transformed block to appear.
	const BLOCK_SELECTOR = '.block-editor-block-list__block';
	const BLOCK_NAME_SELECTOR = `[data-title="${ name }"]`;
	await page.waitForSelector( `${ BLOCK_SELECTOR }${ BLOCK_NAME_SELECTOR }` );
}
