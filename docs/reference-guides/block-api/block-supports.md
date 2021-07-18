# Supports

Block Supports is the API that allows a block to declare features used in the editor.

Some block supports — for example, `anchor` or `className` — apply their attributes by adding additional props on the element returned by `save`. This will work automatically for default HTML tag elements (`div`, etc). However, if the return value of your `save` is a custom component element, you will need to ensure that your custom component handles these props in order for the attributes to be persisted.

## anchor

-   Type: `boolean`
-   Default value: `false`

Anchors let you link directly to a specific block on a page. This property adds a field to define an id for the block and a button to copy the direct link.

```js
// Declare support for anchor links.
supports: {
	anchor: true;
}
```

## align

-   Type: `boolean` or `array`
-   Default value: `false`

This property adds block controls which allow to change block's alignment. _Important: It doesn't work with dynamic blocks yet._

```js
supports: {
	// Declare support for block's alignment.
	// This adds support for all the options:
	// left, center, right, wide, and full.
	align: true;
}
```

```js
supports: {
	// Declare support for specific alignment options.
	align: [ 'left', 'right', 'full' ];
}
```

When the block declares support for `align`, the attributes definition is extended to include an align attribute with a `string` type. By default, no alignment is assigned. The block can apply a default alignment by specifying its own `align` attribute with a default e.g.:

```js
attributes: {
    align: {
        type: 'string',
        default: 'right'
    }
}
```

## alignWide

-   Type: `boolean`
-   Default value: `true`

This property allows to enable [wide alignment](/docs/how-to-guides/themes/theme-support.md#wide-alignment) for your theme. To disable this behavior for a single block, set this flag to `false`.

```js
supports: {
	// Remove the support for wide alignment.
	alignWide: false;
}
```

## className

-   Type: `boolean`
-   Default value: `true`

By default, the class `.wp-block-your-block-name` is added to the root element of your saved markup. This helps having a consistent mechanism for styling blocks that themes and plugins can rely on. If, for whatever reason, a class is not desired on the markup, this functionality can be disabled.

```js
supports: {
	// Remove the support for the generated className.
	className: false;
}
```

## color

-   Type: `Object`
-   Default value: null
-   Subproperties:
    -   `background`: type `boolean`, default value `true`
    -   `__experimentalDuotone`: type `string`, default value undefined
    -   `gradients`: type `boolean`, default value `false`
    -   `link`: type `boolean`, default value `false`
    -   `text`: type `boolean`, default value `true`

This value signals that a block supports some of the properties related to color. When it does, the block editor will show UI controls for the user to set their values.

Note that the `background` and `text` keys have a default value of `true`, so if the `color` property is present they'll also be considered enabled:

```js
supports: {
	color: {
		// This also enables text and background UI controls.
		gradients: true; // Enable gradients UI control.
	}
}
```

It's possible to disable them individually:

```js
supports: {
    color: { // Text UI control is enabled.
        background: false, // Disable background UI control.
        gradients: true // Enable gradients UI control.
    }
}
```

### color.background

This property adds UI controls which allow the user to apply a solid background color to a block.

When color support is declared, this property is enabled by default (along with text), so simply setting color will enable background color.

```js
supports: {
    color: true // Enables background and text
}
```

To disable background support while keeping other color supports enabled, set to `false`.

```js
supports: {
    color: {
        // Disable background support. Text color support is still enabled.
        background: false
    }
}
```

When the block declares support for `color.background`, the attributes definition is extended to include two new attributes: `backgroundColor` and `style`:

- `backgroundColor`: attribute of `string` type with no default assigned.

  When a user chooses from the list of preset background colors, the preset slug is stored in the `backgroundColor` attribute.

  Background color presets are sourced from the `editor-color-palette` [theme support](/docs/how-to-guides/themes/theme-support.md#block-color-palettes).

  The block can apply a default preset background color by specifying its own attribute with a default e.g.:

  ```js
  attributes: {
      backgroundColor: {
          type: 'string',
          default: 'some-preset-background-slug',
      }
  }
  ```

- `style`: attribute of `object` type with no default assigned.

  When a custom background color is selected (i.e. using the custom color picker), the custom color value is stored in the `style.color.background` attribute.

  The block can apply a default custom background color by specifying its own attribute with a default e.g.:

  ```js
  attributes: {
      style: {
          type: 'object',
          default: {
              color: {
                  background: '#aabbcc',
              }
          }
      }
  }
  ```

### color.__experimentalDuotone

This property adds UI controls which allow to apply a duotone filter to a block or part of a block.

The parent selector is automatically added much like nesting in Sass/SCSS (however, the `&` selector is not supported).

```js
supports: {
    color: {
        // Apply the filter to the same selector in both edit and save.
        __experimentalDuotone: '> .duotone-img, > .duotone-video',

        // Default values must be disabled if you don't want to use them with duotone.
        background: false,
        text: false
    }
}
```

Duotone presets are sourced from `color.duotone` in [theme.json](/docs/how-to-guides/themes/theme-json.md).

When the block declares support for `color.__experimentalDuotone`, the attributes definition is extended to include the attribute `style`:

- `style`: attribute of `object` type with no default assigned.

  The block can apply a default duotone color by specifying its own attribute with a default e.g.:

  ```js
  attributes: {
      style: {
          type: 'object',
          default: {
              color: {
                  duotone: [
                      '#FFF',
                      '#000'
                  ]
              }
          }
      }
  }
  ```

### color.gradients

This property adds UI controls which allow the user to apply a gradient background to a block.

```js
supports: {
    color: {
        gradient: true,

        // Default values must be disabled if you don't want to use them with gradient.
        background: false,
        text: false
    }
}
```

Gradient presets are sourced from `editor-gradient-presets` [theme support](/docs/how-to-guides/themes/theme-support.md#block-gradient-presets).


When the block declares support for `color.gradient`, the attributes definition is extended to include two new attributes: `gradient` and `style`:

- `gradient`: attribute of `string` type with no default assigned.

  When a user chooses from the list of preset gradients, the preset slug is stored in the `gradient` attribute.

  The block can apply a default preset gradient by specifying its own attribute with a default e.g.:

  ```js
  attributes: {
      gradient: {
          type: 'string',
          default: 'some-preset-gradient-slug',
      }
  }
  ```

- `style`: attribute of `object` type with no default assigned.

  When a custom gradient is selected (i.e. using the custom gradient picker), the custom gradient value is stored in the `style.color.gradient` attribute.

  The block can apply a default custom gradient by specifying its own attribute with a default e.g.:

  ```js
  attributes: {
      style: {
          type: 'object',
          default: {
              color: {
                  gradient: 'linear-gradient(135deg,rgb(170,187,204) 0%,rgb(17,34,51) 100%)',
              }
          }
      }
  }
  ```

### color.link

This property adds block controls which allow the user to set link color in a block, link color is disabled by default.


```js
supports: {
    color: true // Enables only background and text
}
```

To enable link color support, set to `true`.

```js
supports: {
    color: {
        link: true
    }
}
```

Link color presets are sourced from the `editor-color-palette` [theme support](/docs/how-to-guides/themes/theme-support.md#block-color-palettes).


When the block declares support for `color.link`, the attributes definition is extended to include two new attributes: `linkColor` and `style`:

- `linkColor`: attribute of `string` type with no default assigned.

  When a user chooses from the list of preset link colors, the preset slug is stored in the `linkColor` attribute.

  The block can apply a default preset text color by specifying its own attribute with a default e.g.:

  ```js
  attributes: {
      linkColor: {
          type: 'string',
          default: 'some-preset-link-color-slug',
      }
  }
  ```

- `style`: attribute of `object` type with no default assigned.

  When a custom link color is selected (i.e. using the custom color picker), the custom color value is stored in the `style.color.link` attribute.

  The block can apply a default custom link color by specifying its own attribute with a default e.g.:

  ```js
  attributes: {
      style: {
          type: 'object',
          default: {
              color: {
                  link: '#ff0000',
              }
          }
      }
  }
  ```

### color.text

This property adds block controls which allow the user to set text color in a block.

When color support is declared, this property is enabled by default (along with background), so simply setting color will enable text color.

```js
supports: {
    color: true // Enables background and text, but not link.
}
```

To disable text color support while keeping other color supports enabled, set to `false`.

```js
supports: {
    color: {
        // Disable text color support.
        text: false
    }
}
```

Text color presets are sourced from the `editor-color-palette` [theme support](/docs/how-to-guides/themes/theme-support.md#block-color-palettes).


When the block declares support for `color.text`, the attributes definition is extended to include two new attributes: `textColor` and `style`:

- `textColor`: attribute of `string` type with no default assigned.

  When a user chooses from the list of preset text colors, the preset slug is stored in the `textColor` attribute.

  The block can apply a default preset text color by specifying its own attribute with a default e.g.:

  ```js
  attributes: {
      textColor: {
          type: 'string',
          default: 'some-preset-text-color-slug',
      }
  }
  ```

- `style`: attribute of `object` type with no default assigned.

  When a custom text color is selected (i.e. using the custom color picker), the custom color value is stored in the `style.color.text` attribute.

  The block can apply a default custom text color by specifying its own attribute with a default e.g.:

  ```js
  attributes: {
      style: {
          type: 'object',
          default: {
              color: {
                  text: '#aabbcc',
              }
          }
      }
  }
  ```

## customClassName

-   Type: `boolean`
-   Default value: `true`

This property adds a field to define a custom className for the block's wrapper.

```js
supports: {
	// Remove the support for the custom className.
	customClassName: false;
}
```

## defaultStylePicker

-   Type: `boolean`
-   Default value: `true`

When the style picker is shown, a dropdown is displayed so the user can select a default style for this block type. If you prefer not to show the dropdown, set this property to `false`.

```js
supports: {
	// Remove the Default Style picker.
	defaultStylePicker: false;
}
```

## fontSize

-   Type: `boolean`
-   Default value: `false`

This value signals that a block supports the font-size CSS style property. When it does, the block editor will show an UI control for the user to set its value.

The values shown in this control are the ones declared by the theme via the `editor-font-sizes` [theme support](/docs/how-to-guides/themes/theme-support.md#block-font-sizes), or the default ones if none is provided.

```js
supports: {
    // Enable UI control for font-size.
    fontSize: true,
}
```

When the block declares support for `fontSize`, the attributes definition is extended to include two new attributes: `fontSize` and `style`:

-   `fontSize`: attribute of `string` type with no default assigned. It stores the preset values set by the user. The block can apply a default fontSize by specifying its own `fontSize` attribute with a default e.g.:

```js
attributes: {
    fontSize: {
        type: 'string',
        default: 'some-value',
    }
}
```

-   `style`: attribute of `object` type with no default assigned. It stores the custom values set by the user. The block can apply a default style by specifying its own `style` attribute with a default e.g.:

```js
attributes: {
    style: {
        type: 'object',
        default: {
            typography: {
                fontSize: 'value'
            }
        }
    }
}
```

## html

-   Type: `boolean`
-   Default value: `true`

By default, a block's markup can be edited individually. To disable this behavior, set `html` to `false`.

```js
supports: {
	// Remove support for an HTML mode.
	html: false;
}
```

## inserter

-   Type: `boolean`
-   Default value: `true`

By default, all blocks will appear in the inserter. To hide a block so that it can only be inserted programmatically, set `inserter` to `false`.

```js
supports: {
	// Hide this block from the inserter.
	inserter: false;
}
```

## lineHeight

-   Type: `boolean`
-   Default value: `false`

This value signals that a block supports the line-height CSS style property. When it does, the block editor will show an UI control for the user to set its value if [the theme declares support](/docs/how-to-guides/themes/theme-support.md#supporting-custom-line-heights).

```js
supports: {
    // Enable UI control for line-height.
    lineHeight: true,
}
```

When the block declares support for `lineHeight`, the attributes definition is extended to include a new attribute `style` of `object` type with no default assigned. It stores the custom value set by the user. The block can apply a default style by specifying its own `style` attribute with a default e.g.:

```js
attributes: {
    style: {
        type: 'object',
        default: {
            typography: {
                lineHeight: 'value'
            }
        }
    }
}
```

## multiple

-   Type: `boolean`
-   Default value: `true`

A non-multiple block can be inserted into each post, one time only. For example, the built-in 'More' block cannot be inserted again if it already exists in the post being edited. A non-multiple block's icon is automatically dimmed (unclickable) to prevent multiple instances.

```js
supports: {
	// Use the block just once per post
	multiple: false;
}
```

## reusable

-   Type: `boolean`
-   Default value: `true`

A block may want to disable the ability of being converted into a reusable block. By default all blocks can be converted to a reusable block. If supports reusable is set to false, the option to convert the block into a reusable block will not appear.

```js
supports: {
	// Don't allow the block to be converted into a reusable block.
	reusable: false;
}
```

## spacing

-   Type: `Object`
-   Default value: null
-   Subproperties:
    -   `margin`: type `boolean` or `array`, default value `false`
    -   `padding`: type `boolean` or `array`, default value `false`

This value signals that a block supports some of the CSS style properties related to spacing. When it does, the block editor will show UI controls for the user to set their values, if [the theme declares support](/docs/how-to-guides/themes/theme-support.md#cover-block-padding).

```js
supports: {
    spacing: {
        margin: true,  // Enable margin UI control.
        padding: true, // Enable padding UI control.
    }
}
```

When the block declares support for a specific spacing property, the attributes definition is extended to include the `style` attribute.

-   `style`: attribute of `object` type with no default assigned. This is added when `margin` or `padding` support is declared. It stores the custom values set by the user.

```js
supports: {
    spacing: {
        margin: [ 'top', 'bottom' ], // Enable margin for arbitrary sides.
        padding: true,               // Enable padding for all sides.
    }
}
```

A spacing property may define an array of allowable sides that can be configured. When arbitrary sides are defined only UI controls for those sides are displayed.