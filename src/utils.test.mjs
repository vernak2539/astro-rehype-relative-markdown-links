import { test, describe } from 'node:test'
import assert from 'node:assert'

import { replaceExt } from './utils.mjs'

describe('replaceExt', () => {
  test('replaces extension with another extension', () => {
    const actual = replaceExt('foo.js', '.md')

    assert.equal(actual, 'foo.md')
  })

  test('removes extension', () => {
    const actual = replaceExt('foo.js', '')

    assert.equal(actual, 'foo')
  })

  test('handles relative paths with single dot', () => {
    const actual = replaceExt('./foo.js', '.md')

    assert.equal(actual, './foo.md')
  })

  test('handles relative paths with two dots', () => {
    const actual = replaceExt('../foo.js', '.md')

    assert.equal(actual, '../foo.md')
  })

  test('returns arg if not string', () => {
    const actual = replaceExt(['foo.js'], '.md')

    assert.deepStrictEqual(actual, ['foo.js'])
  })

  test('returns path if length is zero', () => {
    const actual = replaceExt('', '.md')

    assert.equal(actual, '')
  })
})
