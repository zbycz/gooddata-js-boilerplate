/**
 * Returns shortDelay-times delay for faster polling
 * then always returns slower polling times.
 */
export function *delayGenerator(shortDelay) {
    while (shortDelay--) {
        yield 200;
    }

    while (true) {
        yield 1000;
    }
}
