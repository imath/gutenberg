/**
 * Clicks a block toolbar button.
 *
 * @param {string} label  The text string of the button label.
 * @param {string} [type] The type of button label: 'ariaLabel' or 'content'.
 */
export async function clickBlockToolbarButton( label, type = 'ariaLabel' ) {
	await showBlockToolbar();
	const BLOCK_TOOLBAR_SELECTOR = 'block-editor-block-toolbar';
	let button;

	if ( type === 'ariaLabel' ) {
		const BUTTON_SELECTOR = `.${ BLOCK_TOOLBAR_SELECTOR } button[aria-label="${ label }"]`;
		button = await page.waitForSelector( BUTTON_SELECTOR );
	}

	if ( type === 'content' ) {
		[ button ] = await page.$x(
			`//*[@class='${ BLOCK_TOOLBAR_SELECTOR }']//button[contains(text(), '${ label }')]`
		);
	}

	await button.evaluate( ( element ) => element.scrollIntoView() );
	await button.click();
}
