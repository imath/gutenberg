/**
 * External dependencies
 */
import { some } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { createBlock, parse } from '@wordpress/blocks';
import {
	Button,
	CustomSelectControl,
	Spinner,
	Placeholder,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { forwardRef, useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { navigation as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import createDataTree from './create-data-tree';

const CREATE_EMPTY_OPTION_VALUE = '__CREATE_EMPTY__';
const CREATE_FROM_PAGES_OPTION_VALUE = '__CREATE_FROM_PAGES__';

/**
 * Get instruction text for the Placeholder component.
 *
 * @param {boolean} hasMenus Flag that indicates if there are menus.
 * @param {boolean} hasPages Flag that indicates if there are pages.
 *
 * @return {string} Text to display as the placeholder instructions.
 */
function getPlaceholderInstructions( hasMenus, hasPages ) {
	if ( hasMenus && hasPages ) {
		return __(
			'Use an existing menu here, include all top-level pages, or add an empty Navigation block.'
		);
	} else if ( hasMenus && ! hasPages ) {
		return __(
			'Use an existing menu here, or add an empty Navigation block.'
		);
	} else if ( ! hasMenus && hasPages ) {
		return __(
			'Include all existing pages here, or add an empty Navigation block.'
		);
	}

	return __( 'Create an empty navigation.' );
}

/**
 * Return the menu id if the user has one selected.
 *
 * @param {Object} selectedCreateOption An object containing details of
 *                                      the selected create option.
 *
 * @return {number|undefined} The menu id.
 */
function getSelectedMenu( selectedCreateOption ) {
	const optionId = selectedCreateOption?.id;
	return optionId !== undefined && Number.isInteger( optionId )
		? optionId
		: undefined;
}

/**
 * A recursive function that maps menu item nodes to blocks.
 *
 * @param {Object[]} menuItems An array of menu items.
 * @return {WPBlock[]} An array of blocks.
 */
function mapMenuItemsToBlocks( menuItems ) {
	return menuItems.map( ( menuItem ) => {
		if ( menuItem.type === 'block' ) {
			const [ block ] = parse( menuItem.content.raw );

			if ( ! block ) {
				return createBlock( 'core/freeform', {
					content: menuItem.content,
				} );
			}

			return block;
		}

		const attributes = {
			label: ! menuItem.title.rendered
				? __( '(no title)' )
				: menuItem.title.rendered,
			opensInNewTab: menuItem.target === '_blank',
		};

		if ( menuItem.url ) {
			attributes.url = menuItem.url;
		}

		if ( menuItem.description ) {
			attributes.description = menuItem.description;
		}

		if ( menuItem.xfn?.length && some( menuItem.xfn ) ) {
			attributes.rel = menuItem.xfn.join( ' ' );
		}

		if ( menuItem.classes?.length && some( menuItem.classes ) ) {
			attributes.className = menuItem.classes.join( ' ' );
		}

		const innerBlocks = menuItem.children?.length
			? mapMenuItemsToBlocks( menuItem.children )
			: [];

		return createBlock( 'core/navigation-link', attributes, innerBlocks );
	} );
}

/**
 * Convert a flat menu item structure to a nested blocks structure.
 *
 * @param {Object[]} menuItems An array of menu items.
 *
 * @return {WPBlock[]} An array of blocks.
 */
function convertMenuItemsToBlocks( menuItems ) {
	if ( ! menuItems ) {
		return null;
	}

	const menuTree = createDataTree( menuItems );
	return mapMenuItemsToBlocks( menuTree );
}

/**
 * Convert pages to blocks.
 *
 * @param {Object[]} pages An array of pages.
 *
 * @return {WPBlock[]} An array of blocks.
 */
function convertPagesToBlocks( pages ) {
	if ( ! pages ) {
		return null;
	}

	return pages.map( ( { title, type, link: url, id } ) =>
		createBlock( 'core/navigation-link', {
			type,
			id,
			url,
			label: ! title.rendered ? __( '(no title)' ) : title.rendered,
			opensInNewTab: false,
		} )
	);
}

/**
 * Returns a value that indicates whether the create button should be disabled.
 *
 * @param {Object}  selectedCreateOption An object containing details of
 *                                       the selected create option.
 * @param {boolean} hasResolvedPages     Indicates whether pages have loaded.
 * @param {boolean} hasResolvedMenuItems Indicates whether menu items have loaded.
 *
 * @return {boolean} A value that indicates whether the create button is disabled.
 */
function getIsCreateButtonDisabled(
	selectedCreateOption,
	hasResolvedPages,
	hasResolvedMenuItems
) {
	// If there is no key at all then disable.
	if ( ! selectedCreateOption ) {
		return true;
	}

	const optionKey = selectedCreateOption?.key;

	// Always disable if the default "placeholder" option is selected.
	if ( optionKey === CREATE_PLACEHOLDER_VALUE ) {
		return true;
	}

	// Always enable if Create Empty is selected.
	if ( optionKey === CREATE_EMPTY_OPTION_VALUE ) {
		return false;
	}

	// Enable if Pages option selected and we have Pages available.
	if ( optionKey === CREATE_FROM_PAGES_OPTION_VALUE && hasResolvedPages ) {
		return false;
	}

	// Enable if a menu is selected and menu items have loaded.
	const selectedMenu = getSelectedMenu( selectedCreateOption );
	return selectedMenu === undefined || ! hasResolvedMenuItems;
}

function NavigationPlaceholder( { onCreate }, ref ) {
	const [ selectedCreateOption, setSelectedCreateOption ] = useState();

	const {
		pages,
		isResolvingPages,
		hasResolvedPages,
		menus,
		isResolvingMenus,
		hasResolvedMenus,
		menuItems,
		hasResolvedMenuItems,
	} = useSelect(
		( select ) => {
			const {
				getEntityRecords,
				getMenus,
				getMenuItems,
				isResolving,
				hasFinishedResolution,
			} = select( 'core' );
			const pagesParameters = [
				'postType',
				'page',
				{
					parent: 0,
					order: 'asc',
					orderby: 'id',
				},
			];
			const menusParameters = [ { per_page: -1 } ];
			const selectedMenu = getSelectedMenu( selectedCreateOption );
			const hasSelectedMenu = selectedMenu !== undefined;
			const menuItemsParameters = hasSelectedMenu
				? [
						{
							menus: selectedMenu,
							per_page: -1,
						},
				  ]
				: undefined;

			return {
				pages: getEntityRecords( ...pagesParameters ),
				isResolvingPages: isResolving(
					'getEntityRecords',
					pagesParameters
				),
				hasResolvedPages: hasFinishedResolution(
					'getEntityRecords',
					pagesParameters
				),
				menus: getMenus( ...menusParameters ),
				isResolvingMenus: isResolving( 'getMenus', menusParameters ),
				hasResolvedMenus: hasFinishedResolution(
					'getMenus',
					menusParameters
				),
				menuItems: hasSelectedMenu
					? getMenuItems( ...menuItemsParameters )
					: undefined,
				hasResolvedMenuItems: hasSelectedMenu
					? hasFinishedResolution(
							'getMenuItems',
							menuItemsParameters
					  )
					: false,
			};
		},
		[ selectedCreateOption ]
	);

	const hasPages = !! ( hasResolvedPages && pages?.length );
	const hasMenus = !! ( hasResolvedMenus && menus?.length );
	const isLoading = isResolvingPages || isResolvingMenus;

	const createOptions = useMemo(
		() => [
			...( hasMenus ? menus : [] ),
			{
				id: CREATE_EMPTY_OPTION_VALUE,
				name: __( 'Create empty Navigation' ),
				className: 'is-create-empty-option',
			},
			...( hasPages
				? [
						{
							id: CREATE_FROM_PAGES_OPTION_VALUE,
							name: __( 'Create from all top-level pages' ),
						},
				  ]
				: [] ),
		],
		[ menus, hasMenus, hasPages ]
	);

	const createFromMenu = useCallback( () => {
		// If an empty menu was selected, create an empty block.
		if ( ! menuItems.length ) {
			onCreate( [] );
			return;
		}

		const blocks = convertMenuItemsToBlocks( menuItems );
		const selectNavigationBlock = true;
		onCreate( blocks, selectNavigationBlock );
	} );

	const onCreateButtonClick = useCallback( () => {
		if ( ! selectedCreateOption ) {
			return;
		}

		const { key } = selectedCreateOption;
		switch ( key ) {
			case CREATE_EMPTY_OPTION_VALUE: {
				onCreate( [] );
				return;
			}

			case CREATE_FROM_PAGES_OPTION_VALUE: {
				const blocks = convertPagesToBlocks( pages );
				const selectNavigationBlock = true;
				onCreate( blocks, selectNavigationBlock );
				return;
			}

		if ( key === CREATE_FROM_PAGES_OPTION_VALUE && hasPages ) {
			const blocks = convertPagesToBlocks( pages );
			const selectNavigationBlock = true;
			onCreate( blocks, selectNavigationBlock );
			return;
		}

		if ( key === CREATE_EMPTY_OPTION_VALUE || ! menuItems?.length ) {
			const blocks = [ createBlock( 'core/navigation-link' ) ];
			onCreate( blocks );
		}

		// Infer that the user selected a menu to create from.
		// If either there's no selected menu or menu items are undefined
		// this is undefined behavior, do nothing.
		const selectedMenu = getSelectedMenu( selectedCreateOption );
		if ( selectedMenu === undefined || menuItems === undefined ) {
			return;
		}

		const blocks = convertMenuItemsToBlocks( menuItems );
		const selectNavigationBlock = true;
		onCreate( blocks, selectNavigationBlock );
	} );

	if ( hasMenus && ! selectedCreateOption ) {
		setSelectedCreateOption( createOptions[ 0 ] );
	}

	return (
		<Placeholder
			className="wp-block-navigation-placeholder"
			icon={ icon }
			label={ __( 'Navigation' ) }
		>
			{ isLoading && (
				<div ref={ ref }>
					<Spinner /> { __( 'Loading…' ) }
				</div>
			) }
			{ ! isLoading && (
				<div
					ref={ ref }
					className="wp-block-navigation-placeholder__actions"
				>
					<>
						<CustomSelectControl
							className={ classnames(
								'wp-block-navigation-placeholder__select-control',
								{
									'has-menus': hasMenus,
								}
							) }
							label={
								! isLoading
									? getPlaceholderInstructions(
											hasMenus,
											hasPages
									  )
									: undefined
							}
							value={ selectedCreateOption || createOptions[ 0 ] }
							onChange={ ( { selectedItem } ) => {
								if (
									selectedItem?.key === selectedCreateOption
								) {
									return;
								}
								setSelectedCreateOption( selectedItem );
							} }
							options={ createOptions.map( ( option ) => {
								return {
									...option,
									key: option.id,
								};
							} ) }
						/>
						<Button
							isSecondary
							className="wp-block-navigation-placeholder__button"
							disabled={ ! selectedCreateOption }
							isBusy={ isCreatingFromMenu }
							onClick={ onCreateButtonClick }
							disabled={ getIsCreateButtonDisabled(
								selectedCreateOption,
								hasResolvedPages,
								hasResolvedMenuItems
							) }
						>
							{ __( 'Create' ) }
						</Button>
					</>
				</div>
			) }
		</Placeholder>
	);
}

export default forwardRef( NavigationPlaceholder );
