/**
 * WordPress dependencies
 */
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BlockTypesList from '../block-types-list';
import BlockIcon from '../block-icon';

export default function ChildBlocks( { rootClientId, children } ) {
	const { rootBlockTitle, rootBlockIcon } = useSelect( ( select ) => {
		const { getBlockType } = select( blocksStore );
		const { getBlockName } = select( 'core/block-editor' );
		const rootBlockName = getBlockName( rootClientId );
		const rootBlockType = getBlockType( rootBlockName );
		return {
			rootBlockTitle: rootBlockType && rootBlockType.title,
			rootBlockIcon: rootBlockType && rootBlockType.icon,
		};
	} );

	return (
		<div className="block-editor-inserter__child-blocks">
			{ ( rootBlockIcon || rootBlockTitle ) && (
				<div className="block-editor-inserter__parent-block-header">
					<BlockIcon icon={ rootBlockIcon } showColors />
					{ rootBlockTitle && <h2>{ rootBlockTitle }</h2> }
				</div>
			) }
			<BlockTypesList items={ items } { ...props } />
		</div>
	);
}

export default compose(
	ifCondition( ( { items } ) => items && items.length > 0 ),
	withSelect( ( select, { rootClientId } ) => {
		const { getBlockType } = select( 'core/blocks' );
		const { getBlockName } = select( 'core/block-editor' );
		const rootBlockName = getBlockName( rootClientId );
		const rootBlockType = getBlockType( rootBlockName );
		return {
			rootBlockTitle: rootBlockType && rootBlockType.title,
			rootBlockIcon: rootBlockType && rootBlockType.icon,
		};
	} )
)( ChildBlocks );
