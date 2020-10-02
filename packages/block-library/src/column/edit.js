/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	InnerBlocks,
	BlockControls,
	BlockVerticalAlignmentToolbar,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

function ColumnEdit( {
	attributes,
	setAttributes,
	updateAlignment,
	hasChildBlocks,
} ) {
	const { verticalAlignment, width } = attributes;

	const classes = classnames( 'block-core-columns', {
		[ `is-vertically-aligned-${ verticalAlignment }` ]: verticalAlignment,
	} );

	const { hasChildBlocks, rootClientId } = useSelect(
		( select ) => {
			const { getBlockOrder, getBlockRootClientId } = select(
				'core/block-editor'
			);

			return {
				hasChildBlocks: getBlockOrder( clientId ).length > 0,
				rootClientId: getBlockRootClientId( clientId ),
			};
		},
		[ clientId ]
	);

	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	const updateAlignment = ( value ) => {
		// Update own alignment.
		setAttributes( { verticalAlignment: value } );
		// Reset parent Columns block.
		updateBlockAttributes( rootClientId, {
			verticalAlignment: null,
		} );
	};

	const blockProps = useBlockProps( {
		className: classes,
		style: width ? { flexBasis: width } : undefined,
	} );

	return (
		<>
			<BlockControls>
				<BlockVerticalAlignmentToolbar
					onChange={ updateAlignment }
					value={ verticalAlignment }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Column settings' ) }>
					<UnitControl
						label={ __( 'Width' ) }
						labelPosition="edge"
						__unstableInputWidth="80px"
						value={ width || '' }
						onChange={ ( nextWidth ) => {
							nextWidth =
								0 > parseFloat( nextWidth ) ? '0' : nextWidth;
							setAttributes( { width: nextWidth } );
						} }
						units={ [
							{ value: '%', label: '%', default: '' },
							{ value: 'px', label: 'px', default: '' },
							{ value: 'em', label: 'em', default: '' },
							{ value: 'rem', label: 'rem', default: '' },
							{ value: 'vw', label: 'vw', default: '' },
						] }
					/>
				</PanelBody>
			</InspectorControls>
			<InnerBlocks
				templateLock={ false }
				renderAppender={
					hasChildBlocks ? undefined : InnerBlocks.ButtonBlockAppender
				}
				__experimentalTagName="div"
				__experimentalPassedProps={ blockProps }
			/>
		</>
	);
}

export default compose(
	withSelect( ( select, ownProps ) => {
		const { clientId } = ownProps;
		const { getBlockOrder } = select( 'core/block-editor' );

		return {
			hasChildBlocks: getBlockOrder( clientId ).length > 0,
		};
	} ),
	withDispatch( ( dispatch, ownProps, registry ) => {
		return {
			updateAlignment( verticalAlignment ) {
				const { clientId, setAttributes } = ownProps;
				const { updateBlockAttributes } = dispatch(
					'core/block-editor'
				);
				const { getBlockRootClientId } = registry.select(
					'core/block-editor'
				);

				// Update own alignment.
				setAttributes( { verticalAlignment } );

				// Reset Parent Columns Block
				const rootClientId = getBlockRootClientId( clientId );
				updateBlockAttributes( rootClientId, {
					verticalAlignment: null,
				} );
			},
		};
	} )
)( ColumnEdit );
