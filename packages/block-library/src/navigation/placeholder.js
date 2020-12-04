/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * WordPress dependencies
 */
import { createBlock, parse } from '@wordpress/blocks';
import {
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Spinner,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import {
	forwardRef,
	useCallback,
	useState,
	useEffect,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, chevronDown, search } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import createDataTree from './create-data-tree';

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
	const [ selectedMenu, setSelectedMenu ] = useState();

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
					per_page: -1,
				},
			];
			const menusParameters = [ { per_page: -1 } ];
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
		[ selectedMenu ]
	);

	const hasPages = !! ( hasResolvedPages && pages?.length );
	const hasMenus = !! ( hasResolvedMenus && menus?.length );
	const isLoading = isResolvingPages || isResolvingMenus;

	const createFromMenu = useCallback( () => {
		const blocks = convertMenuItemsToBlocks( menuItems );
		const selectNavigationBlock = true;
		onCreate( blocks, selectNavigationBlock );
	} );

	const onCreateFromMenu = () => {
		// If we have menu items, create the block right away.
		if ( hasResolvedMenuItems ) {
			createFromMenu();
			return;
		}

		// Otherwise, create the block when resolution finishes.
		setIsCreatingFromMenu( true );
	};

	const onCreateEmptyMenu = () => {
		onCreate( [] );
	};

	const onCreateAllPages = () => {
		const blocks = convertPagesToBlocks( pages );
		const selectNavigationBlock = true;
		onCreate( blocks, selectNavigationBlock );
	};

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

	return (
		<div className="wp-block-navigation-placeholder">
			<div className="wp-block-navigation-placeholder__preview">
				<span className="wp-block-navigation-link"></span>
				<span className="wp-block-navigation-link"></span>
				<span className="wp-block-navigation-link"></span>
				<Icon icon={ search } />
			</div>

			<div className="wp-block-navigation-placeholder__controls">
				{ isLoading && (
					<div ref={ ref }>
						<Spinner />
					</div>
				) }
				{ ! isLoading && (
					<div
						ref={ ref }
						className="wp-block-navigation-placeholder__actions"
					>
						{ hasMenus ? (
							<DropdownMenu
								text={ __( 'Existing menu' ) }
								icon={ chevronDown }
								className="wp-block-navigation-placeholder__actions__dropdown"
							>
								{ ( { onClose } ) => (
									<MenuGroup>
										{ menus.map( ( menu ) => {
											return (
												<MenuItem
													onClick={ () => {
														setSelectedMenu(
															menu.id
														);
														onCreateFromMenu();
													} }
													onClose={ onClose }
													key={ menu.id }
												>
													{ menu.name }
												</MenuItem>
											);
										} ) }
									</MenuGroup>
								) }
							</DropdownMenu>
						) : undefined }
						{ hasPages ? (
							<Button onClick={ onCreateAllPages }>
								{ __( 'Add all pages' ) }
							</Button>
						) : undefined }
						<Button onClick={ onCreateEmptyMenu }>
							{ __( 'Start empty' ) }
						</Button>
					</div>
				) }
			</div>
		</div>
	);
}

export default forwardRef( NavigationPlaceholder );
