import { parse as gParse } from './grammar'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isItem(value: any): value is Item {
  if (typeof value !== 'object') return false
  if (!value.count) return false
  if (typeof value.count !== 'number') return false
  if (value.delimiter && typeof value.delimiter !== 'string') return false
  if (!value.items && !value.stitch) return false
  if (value.items) {
    if (!(value.items instanceof Array)) return false
    for (let i = 0; i < value.items.length; i++) {
      const x = value.items[i]
      if (!isItem(x)) {
        return false
      }
    }
  } else if (value.stitch) {
    if (typeof value.stitch !== 'string') return false
  } else {
    return false
  }
  return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRow(value: any): value is Row {
  if (typeof value !== 'object') return false
  if (value.total_stitches && typeof value.total_stitches !== 'number') return false
  if (!value.items) return false
  if (!(value.items instanceof Array)) return false
  if (value.rowNum && typeof value.rowNum !== 'number') return false
  for (let i = 0; i < value.items.length; i++) {
    const x = value.items[i]
    if (!isItem(x)) {
      return false
    }
  }
  return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPattern(value: any): value is Pattern {
  if (typeof value !== 'object') {
    console.log('Error: Pattern is not an object')
    return false
  }
  if (!value.rows) {
    console.log('Error: No rows parsed')
    return false
  }
  if (value.title && typeof value.title !== 'string') {
    console.log('Error: Title exists and is not a string')
    return false
  }
  if (!(value.rows instanceof Array)) {
    console.log('Error: Rows is not an array')
    return false
  }
  for (let i = 0; i < value.rows.length; i++) {
    if (!isRow(value.rows[i])) {
      console.log('Error: Row ' + (i + 1) + ' is not valid')
      return false
    }
  }
  return true
}

function setRowNumbers(pattern: Pattern): void {
  let curNum = 1
  for (const row of pattern.rows) {
    // If the row number is manually set, use that
    if (row.rowNum && row.rowNum > 0) {
      curNum = row.rowNum + 1
    }
    // Iterate for normal, non-set rows
    else if (row.items.length > 0) {
      row.rowNum = curNum
      curNum++
    }
    // Comment-only rows
    else {
      row.rowNum = curNum - 0.5
    }
  }
}

function runParser(s: string): void | Pattern {
  const maybe_parsed = gParse(s)
  if (isPattern(maybe_parsed)) {
    const p: Pattern = maybe_parsed
    setRowNumbers(p)
    return p
  } else {
    console.log(maybe_parsed)
  }
}

export { runParser }
