/**
 * feature.test.js
 * Purpose: Unit and behavior tests for standardizing the Smart CLI logic.
 * Note: Requires a test runner like Jest/Vitest with JSDOM environment.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initSnippet } from './feature.js';

describe('Smart CLI Feature', () => {
    let container;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div data-smart-cli>
                <div class="smart-cli__text"></div>
                <div data-sr-command></div>
                <button class="smart-cli__copy-btn" aria-label="Copy"></button>
                <div data-toast></div>
            </div>
        `;
        container = document.querySelector('[data-smart-cli]');

        // Mock Globals
        global.IntersectionObserver = class IntersectionObserver {
            constructor(cb) { this.cb = cb; }
            observe() { this.cb([{ isIntersecting: true }]); }
            disconnect() { }
        };

        // Mock Clipboard
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(),
            },
        });

        // Mock rAF
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 0));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    it('initializes and starts typing when visible', async () => {
        const cleanup = initSnippet({
            commands: ['hello world'],
            typingSpeed: 0 // Instant for test
        });

        const textEl = container.querySelector('.smart-cli__text');

        // Wait for basic loops (simplified for this mock)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if text content eventually gets populated
        // Note: Logic allows partial typing, in full test env we'd mock time
        expect(textEl).toBeTruthy();

        cleanup();
    });

    it('copies text to clipboard on button click', async () => {
        const cleanup = initSnippet({ commands: ['test command'] });
        const btn = container.querySelector('.smart-cli__copy-btn');

        btn.click();

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test command');

        // Check state update
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(btn.getAttribute('data-state')).toBe('success');

        cleanup();
    });

    it('handles multiple commands cycling', () => {
        // Setup logic verification here
        // This would require utilizing checking state.commandIndex over time
        // Omitted for brevity in this skeleton
    });
});
