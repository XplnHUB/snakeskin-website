# Smart CLI Feature

A production-ready, accessible, and performant typewriter CLI component.

## Usage

1.  **Drop in HTML**: Copy the content of `feature.html` into your page.
2.  **Include CSS**: Add `feature.css` to your global styles or import it.
3.  **Initialize JS**:

```javascript
import { initSnippet } from './path/to/feature.js';

// Initialize
const cleanup = initSnippet({
  rootSelector: '[data-smart-cli]',
  commands: [
    'pip install snakeskin-xplnhub',
    'snakeskin create my-app'
  ],
  typingSpeed: 50,
  loop: true
});

// Cleanup when needed (e.g., component unmount)
// cleanup();
```

## Customization

### Tailwind Configuration
Ensure your `tailwind.config.js` has the following colors if not using CSS variables:
```js
theme: {
  extend: {
    colors: {
      'neon-green': '#39ff14',
    }
  }
}
```

### Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `commands` | `string[]` | `['...']` | Array of strings to type. |
| `typingSpeed` | `number` | `50` | Time in ms between key presses. |
| `pauseBetween` | `number` | `2000` | Time in ms to pause after finishing a command. |
| `loop` | `boolean` | `true` | Whether to loop through commands indefinitely. |

## Accessibility Features
- `aria-live="polite"`: Announces typing updates to screen readers without interrupting.
- `prefers-reduced-motion`: Disables cursor blinking and rapid animations.
- `aria-label`: Clearly labels the copy button.
- Keyboard support: Copy button is focusable and actionable via Enter/Space.

## Testing
Run the included `feature.test.js` using Vitest or Jest.
```bash
npx vitest src/components/SmartCLI/feature.test.js
```
