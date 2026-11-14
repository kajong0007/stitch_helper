import { expect, test } from 'vitest'
import { runParser } from '../validate_grammar.ts'

test('Basic Parse', () => {
  expect(runParser('')).toStrictEqual({ rows: [], title: null })
})

test('Basic Title', () => {
  expect(
    runParser(
      `
title: Hello World!
`,
    ),
  ).toStrictEqual({
    title: 'Hello World!',
    rows: [],
  })
})

test('Basic Title and Row', () => {
  expect(
    runParser(
      `
title: Hello World!
sc*3
`,
    ),
  ).toStrictEqual({
    title: 'Hello World!',
    rows: [
      {
        items: [
          {
            count: 3,
            stitch: 'sc',
          },
        ],
      },
    ],
  })
})

test('Basic On-Row Comment', () => {
  expect(
    runParser(
      `
sc*3 // three of em
`,
    ),
  ).toStrictEqual({
    title: null,
    rows: [
      {
        items: [
          {
            count: 3,
            stitch: 'sc',
          },
        ],
        comment: ' three of em',
      },
    ],
  })
})

test('Just a Comment', () => {
  expect(
    runParser(
      `
// none of em
`,
    ),
  ).toStrictEqual({
    title: null,
    rows: [
      {
        items: [],
        comment: ' none of em',
      },
    ],
  })
})

test('Comment and Rows', () => {
  expect(
    runParser(
      `
sc
// none of em
sc*4 [sc sc sc]*3
`,
    ),
  ).toStrictEqual({
    rows: [
      {
        items: [
          {
            count: 1,
            stitch: 'sc',
          },
        ],
      },
      {
        comment: ' none of em',
        items: [],
      },
      {
        items: [
          {
            count: 4,
            stitch: 'sc',
          },
          {
            count: 3,
            delimiter: '[',
            items: [
              {
                count: 1,
                stitch: 'sc',
              },
              {
                count: 1,
                stitch: 'sc',
              },
              {
                count: 1,
                stitch: 'sc',
              },
            ],
          },
        ],
      },
    ],
    title: null,
  })
})

test('Comment and Rows', () => {
  expect(
    runParser(
      `
r: [sc dec sc]*6 // Back loop only
// Start stuffing
r: [sc dec]*6 // Invisible decrease
`,
    ),
  ).toStrictEqual({
    rows: [
      {
        comment: ' Back loop only',
        items: [
          {
            count: 6,
            delimiter: '[',
            items: [
              {
                count: 1,
                stitch: 'sc',
              },
              {
                count: 1,
                stitch: 'dec',
              },
              {
                count: 1,
                stitch: 'sc',
              },
            ],
          },
        ],
      },
      {
        comment: ' Start stuffing',
        items: [],
      },
      {
        comment: ' Invisible decrease',
        items: [
          {
            count: 6,
            delimiter: '[',
            items: [
              {
                count: 1,
                stitch: 'sc',
              },
              {
                count: 1,
                stitch: 'dec',
              },
            ],
          },
        ],
      },
    ],
    title: null,
  })
})

test('Row with number, row without', () => {
  expect(
    runParser(
      `
1: row with one
r3: row with three
2: row with two
`,
    ),
  ).toStrictEqual({
    rows: [
      {
        items: [
          {
            count: 1,
            stitch: 'row',
          },
          {
            count: 1,
            stitch: 'with',
          },
          {
            count: 1,
            stitch: 'one',
          },
        ],
        rowNum: 1,
      },
      {
        items: [
          {
            count: 1,
            stitch: 'row',
          },
          {
            count: 1,
            stitch: 'with',
          },
          {
            count: 1,
            stitch: 'three',
          },
        ],
        rowNum: 3,
      },
      {
        items: [
          {
            count: 1,
            stitch: 'row',
          },
          {
            count: 1,
            stitch: 'with',
          },
          {
            count: 1,
            stitch: 'two',
          },
        ],
        rowNum: 2,
      },
    ],
    title: null,
  })
})

test('Parens vs Squares', () => {
  expect(
    runParser(
      `
sc (sc)*4 [sc]*2
`,
    ),
  ).toStrictEqual({
    rows: [
      {
        items: [
          {
            count: 1,
            stitch: 'sc',
          },
          {
            count: 4,
            delimiter: '(',
            items: [
              {
                count: 1,
                stitch: 'sc',
              },
            ],
          },
          {
            count: 2,
            delimiter: '[',
            items: [
              {
                count: 1,
                stitch: 'sc',
              },
            ],
          },
        ],
      },
    ],
    title: null,
  })
})
