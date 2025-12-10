/**
 * feature.js
 * Purpose: Modular, accessible, and performant logic for the Smart CLI feature.
 * 
 * Why:
 * - Uses ES Module pattern for encapsulation.
 * - Uses IntersectionObserver for performance (lazy start).
 * - Uses requestAnimationFrame for smooth typing.
 * - Handles accessibility (ARIA live regions, focus management).
 */

export function initSnippet({
    rootSelector = '[data-smart-cli]',
    commands = ['pip install snakeskin-xplnhub'],
    typingSpeed = 50,
    pauseBetween = 2000,
    deleteSpeed = 30,
    loop = true
} = {}) {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    // Elements
    const textEl = root.querySelector('.smart-cli__text');
    const srCommandEl = root.querySelector('[data-sr-command]');
    const copyBtn = root.querySelector('.smart-cli__copy-btn');
    const toastEl = root.querySelector('[data-toast]');

    // State
    let state = {
        isTyping: false,
        commandIndex: 0,
        charIndex: 0,
        isDeleting: false,
        observer: null,
        rafId: null,
        lastFrameTime: 0
    };

    // --- Typewriter Logic ---

    const type = (timestamp) => {
        if (!state.lastFrameTime) state.lastFrameTime = timestamp;
        const elapsed = timestamp - state.lastFrameTime;

        // Determine speed based on action
        const currentSpeed = state.isDeleting ? deleteSpeed : typingSpeed;
        const randomVariance = Math.random() * 20; // Humanize

        if (elapsed > currentSpeed + randomVariance) {
            state.lastFrameTime = timestamp;

            const currentCommand = commands[state.commandIndex];

            if (state.isDeleting) {
                state.charIndex--;
                // Stop deleting when empty
                if (state.charIndex < 0) {
                    state.isDeleting = false;
                    state.commandIndex = (state.commandIndex + 1) % commands.length;

                    // If no loop and reached end, stop
                    if (!loop && state.commandIndex === 0) return;
                }
            } else {
                state.charIndex++;
                // Stop typing when full
                if (state.charIndex > currentCommand.length) {
                    if (commands.length > 1 || loop) {
                        state.isDeleting = true;
                        // Pause before deleting
                        setTimeout(() => {
                            state.lastFrameTime = performance.now();
                            state.rafId = requestAnimationFrame(type);
                        }, pauseBetween);
                        return; // Exit current frame
                    } else {
                        return; // Stop forever if single command no loop
                    }
                }
            }

            // Update DOM
            const visibleText = currentCommand.substring(0, state.charIndex);
            textEl.textContent = visibleText;

            // Minimal ARIA updates to avoid spamming textContent changes to screen readers frequently
            // Only update SR text when command completes
            if (state.charIndex === currentCommand.length && !state.isDeleting) {
                srCommandEl.textContent = currentCommand;
            }
        }

        state.rafId = requestAnimationFrame(type);
    };

    const startTyping = () => {
        if (state.isTyping) return;
        state.isTyping = true;
        state.lastFrameTime = performance.now();
        state.rafId = requestAnimationFrame(type);
    };

    const stopTyping = () => {
        state.isTyping = false;
        if (state.rafId) cancelAnimationFrame(state.rafId);
    };

    // --- Copy Logic ---

    const handleCopy = async () => {
        const textToCopy = commands[state.commandIndex % commands.length] || commands[0]; // Fallback to current or first

        try {
            await navigator.clipboard.writeText(textToCopy);
            showSuccess();
            trackAnalytics('copy', { text: textToCopy });
        } catch (err) {
            console.warn('Clipboard API failed, trying fallback', err);
            fallbackCopy(textToCopy);
        }
    };

    const fallbackCopy = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure not visible but part of DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) showSuccess();
        } catch (err) {
            console.error('Fallback copy failed', err);
        }

        document.body.removeChild(textArea);
    };

    const showSuccess = () => {
        // Update Button State
        copyBtn.setAttribute('data-state', 'success');
        copyBtn.setAttribute('aria-label', 'Copied successfully');

        // Show Toast
        root.setAttribute('data-show-toast', 'true');

        // Reset after 2s
        setTimeout(() => {
            copyBtn.removeAttribute('data-state');
            copyBtn.setAttribute('aria-label', 'Copy installation command to clipboard');
            root.removeAttribute('data-show-toast');
        }, 2000);
    };

    // --- Analytics Stub ---
    const trackAnalytics = (event, meta) => {
        if (window.snakeskin && window.snakeskin.track) {
            window.snakeskin.track(event, meta);
        }
    };

    // --- Initialization ---

    // Intersection Observer for lazy start
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startTyping();
                // Optional: disconnect if single run desired, utilizing loop for now
                // observer.disconnect();
            } else {
                stopTyping();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(root);
    state.observer = observer;

    // Event Listeners
    copyBtn.addEventListener('click', handleCopy);

    // Return cleanup function
    return () => {
        stopTyping();
        observer.disconnect();
        copyBtn.removeEventListener('click', handleCopy);
    };
}
