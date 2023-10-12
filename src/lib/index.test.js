import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { generateMessageId } from './generateMessageId.js';
import { locale, t, gt, msg, msgPlural, plural, gPlural } from './index.js';

// For the purpose of this test, message and context are combined in the catalog key separated by a pipe character.
function convertMessageCatalogToIdKeys(catalog) {
	const result = {};
	for (const [key, value] of Object.entries(catalog)) {
		const [message, context] = key.split('|');
		result[generateMessageId(message, context)] = value;
	}
	return result;
}

const messageCatalog = convertMessageCatalogToIdKeys({
	hello: 'こんにちは',
	'hello {0}': 'こんにちは {0}',
	John: 'ジョン',
	'right|direction': '右',
	'right|correct': '正しい'
});

describe('svelte-i18n-lingui', () => {
	afterEach(() => {
		locale.set('default');
	});

	describe('locale', () => {
		it('is initially set up with a default locale', () => {
			expect(get(locale)).toBe('default');
		});
		it('can be switched to a different locale', () => {
			locale.set('en');
			expect(get(locale)).toBe('en');
		});
	});

	describe.each([
		{ name: 't store', t: get(t) },
		{ name: 'gt', t: gt }
	])('$name', ({ t }) => {
		it('returns the original message if no translation is available', () => {
			expect(t`hello`).toBe('hello');
		});

		describe('with a message catalog', () => {
			beforeEach(() => {
				locale.set('ja', messageCatalog);
			});
			it('can translate messages declared by a tagged literal', () => {
				expect(t`hello`).toBe('こんにちは');
			});
			it('can translate messages declared by a tagged literal with a variable', () => {
				const name = 'John';
				expect(t`hello ${name}`).toBe('こんにちは John');
			});
			it('can translate messages declared by a tagged literal with a translated variable', () => {
				expect(t`hello ${t`John`}`).toBe('こんにちは ジョン');
			});
			it('can translate messages in plain string, as returned my the msg function', () => {
				const message = 'hello';
				expect(t(message)).toBe('こんにちは');
			});
			it('can translate messages in MessageDescriptor format', () => {
				expect(t({ message: 'hello' })).toBe('こんにちは');
			});
			it('can translate messages in MessageDescriptor with context', () => {
				expect(t({ message: 'right', context: 'direction' })).toBe('右');
				expect(t({ message: 'right', context: 'correct' })).toBe('正しい');
			});
			it('can translate messages in MessageDescriptor with comment', () => {
				expect(t({ message: 'hello', comment: 'Comment for translator' })).toBe('こんにちは');
			});
			it('can translate messages in MessageDescriptor with both context and comment', () => {
				expect(
					t({ message: 'right', context: 'direction', comment: 'The direction, to the right.' })
				).toBe('右');
				expect(
					t({
						message: 'right',
						context: 'correct',
						comment: "The word for correctness e.g. that's right"
					})
				).toBe('正しい');
			});
		});
	});

	describe('msg', () => {
		it('returns the MessageDescriptor object as-is', () => {
			const descriptor = {
				message: 'This is the message.',
				context: 'This is the context.',
				comment: 'Comment for translator'
			};
			expect(msg(descriptor)).toBe(descriptor);
		});
		it('returns the parsed template literal as a string', () => {
			const message = `hello ${'John'}`;
			expect(msg(message)).toBe('hello John');
		});
	});

	describe('msgPlural', () => {
		it('returns the message variations object as-is', () => {
			const variations = {
				one: 'There is # item.',
				other: 'There are # items.'
			};
			expect(msgPlural(variations)).toBe(variations);
		});
	});
});

// TODO: Use describe.each to test all the different ways to declare messages
