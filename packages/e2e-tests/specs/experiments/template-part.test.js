/**
 * WordPress dependencies
 */
import {
	createNewPost,
	insertBlock,
	disablePrePublishChecks,
	visitAdminPage,
	trashAllPosts,
} from '@wordpress/e2e-test-utils';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { useExperimentalFeatures } from '../../experimental-features';

describe( 'Template Part', () => {
	useExperimentalFeatures( [
		'#gutenberg-full-site-editing',
		'#gutenberg-full-site-editing-demo',
	] );

	beforeAll( async () => {
		await trashAllPosts( 'wp_template' );
		await trashAllPosts( 'wp_template_part' );
	} );
	afterAll( async () => {
		await trashAllPosts( 'wp_template' );
		await trashAllPosts( 'wp_template_part' );
	} );

	describe( 'Template part block', () => {
		beforeEach( async () => {
			await visitAdminPage(
				'admin.php',
				addQueryArgs( '', {
					page: 'gutenberg-edit-site',
				} ).slice( 1 )
			);
			await page.waitForSelector( '.edit-site-visual-editor' );
		} );

		it( 'Should load customizations when in a template even if only the slug and theme attributes are set.', async () => {
			// Switch to editing the header template part.
			await page.click(
				'.components-dropdown-menu__toggle[aria-label="Switch Template"]'
			);
			const [ switchToHeaderTemplatePartButton ] = await page.$x(
				'//button[contains(text(), "header")]'
			);
			await switchToHeaderTemplatePartButton.click();

			// Edit it.
			await insertBlock( 'Paragraph' );
			await page.keyboard.type( 'Header Template Part 123' );

			// Save it.
			await page.click( '.edit-site-save-button__button' );
			await page.click( '.editor-entities-saved-states__save-button' );
			await page.waitForSelector(
				'.edit-site-save-button__button:not(.is-busy)'
			);

			// Switch back to the front page template.
			await page.click(
				'.components-dropdown-menu__toggle[aria-label="Switch Template"]'
			);
			const [ switchToFrontPageTemplateButton ] = await page.$x(
				'//button[contains(text(), "front-page")]'
			);
			await switchToFrontPageTemplateButton.click();

			// Verify that the header template part is updated.
			const [ headerTemplatePart ] = await page.$x(
				'//*[@data-type="core/template-part"][//p[text()="Header Template Part123"]]'
			);
			expect( headerTemplatePart ).not.toBeNull();
		} );
	} );

	describe( 'Template part placeholder', () => {
		// Test constants for template part.
		const testContent = 'some words...';

		// Selectors
		const chooseButtonSelector =
			'//div[contains(@class,"is-selected")]//button[text()="Choose"]';
		const entitiesSaveSelector =
			'.editor-entities-saved-states__save-button';
		const savePostSelector = '.editor-post-publish-button__button';
		const templatePartSelector = '*[data-type="core/template-part"]';
		const activatedTemplatePartSelector = `${ templatePartSelector } .block-editor-block-list__layout`;
		const testContentSelector = `//p[contains(., "${ testContent }")]`;
		const createNewButtonSelector =
			'//button[contains(text(), "New template part")]';
		const chooseExistingButtonSelector =
			'//button[contains(text(), "Choose existing")]';

		it( 'Should prompt to create when no match found', async () => {
			await createNewPost();
			await disablePrePublishChecks();
			// Create new template part.
			await insertBlock( 'Template Part' );
			const [ createNewButton ] = await page.$x(
				createNewButtonSelector
			);
			await createNewButton.click();

			const newTemplatePart = await page.waitForSelector(
				activatedTemplatePartSelector
			);
			expect( text ).toBe( 'Create' );

			// Finish creating template part, insert some text, and save.
			await page.click( '.block-editor-button-block-appender' );
			await page.click( '.editor-block-list-item-paragraph' );
			await page.keyboard.type( testContent );
			await page.click( savePostSelector );
			await page.click( entitiesSaveSelector );

			// TODO: Remove when toolbar supports text fields
			expect( console ).toHaveWarnedWith(
				'Using custom components as toolbar controls is deprecated. Please use ToolbarItem or ToolbarButton components instead. See: https://developer.wordpress.org/block-editor/components/toolbar-button/#inside-blockcontrols'
			);
		} );

		it( 'Should prompt to Choose when match found', async () => {
			await createNewPost();
			await disablePrePublishChecks();
			// Try to insert the template part we created.
			await insertBlock( 'Template Part' );
			const [ chooseExistingButton ] = await page.$x(
				chooseExistingButtonSelector
			);
			await chooseExistingButton.click();
			const preview = await page.waitForXPath( testContentSelector );
			expect( preview ).toBeTruthy();
		} );

		it( 'Should dispaly a preview when match is found', async () => {
			const [ preview ] = await page.$x( testContentSelector );
			expect( preview ).toBeTruthy();
		} );

		it( 'Should insert the desired template part', async () => {
			const [ placeholderButton ] = await page.$x( chooseButtonSelector );
			await placeholderButton.click();
			await page.waitForSelector( activatedTemplatePartSelector );
			const templatePartContent = await page.waitForXPath(
				testContentSelector
			);
			expect( templatePartContent ).toBeTruthy();

			// TODO: Remove when toolbar supports text fields
			expect( console ).toHaveWarnedWith(
				'Using custom components as toolbar controls is deprecated. Please use ToolbarItem or ToolbarButton components instead. See: https://developer.wordpress.org/block-editor/components/toolbar-button/#inside-blockcontrols'
			);
		} );
	} );
} );
