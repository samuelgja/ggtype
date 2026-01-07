/**
 * Type declarations for Fetch API extensions
 * Extends RequestInit to include the duplex property as per web standards
 * @see https://fetch.spec.whatwg.org/#requestinit
 */

declare global {
  interface RequestInit {
    /**
     * The duplex member must be specified for a request with a streaming body.
     * @see https://fetch.spec.whatwg.org/#dom-requestinit-duplex
     */
    duplex?: 'half'
  }
}

// eslint-disable-next-line unicorn/require-module-specifiers
export {}
