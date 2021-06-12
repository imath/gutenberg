# CardFooter

CardFooter renders an optional footer within a [`<Card />`](../card/README.md).

## Usage

```jsx
import { Card, CardFooter } from '@wordpress/components';

const Example = () => (
	<Card>
		<CardFooter>...</CardFooter>
	</Card>
);
```

### Flex

Underneath, CardFooter uses the layout component [`<Flex/>`](../../flex/flex/README.md). This improves the alignment of child items within the component.

```jsx
import {
	Button,
	Card,
	CardFooter,
	FlexItem,
	FlexBlock,
} from '@wordpress/components';

const Example = () => (
	<Card>
		<CardFooter>
			<FlexBlock>Content</FlexBlock>
			<FlexItem>
				<Button>Action</Button>
			</FlexItem>
		</CardFooter>
	</Card>
);
```

Check out [the documentation](../../flex/flex/README.md) on `<Flex/>` for more details on layout composition.

## Props

Name | Type | Default | Description
--- | --- | --- | ---
`isBorderless` | `boolean` | `false` | Determines the border style of the card.
`isElevated` | `boolean` | `false` | Determines the elevation style of the card.
`isShady` | `boolean` | `false` | Renders with a light gray background color.
`size` | `string` | `medium` | Determines the amount of padding within the component.

Note: This component is connected to [`<Card />`'s Context](../card/README.md#context). Passing props directly to this component will override the props derived from context.
