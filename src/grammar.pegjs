Pattern
= (MaybeWhitespace? EOL)*
  title:Title?
  (MaybeWhitespace? EOL)*
  rows:RowOrComment|.., (MaybeWhitespace? EOL)| {
  let pattern = {
    "title": title,
    "rows": [],
  }
  for (let r in rows) {
    if (rows[r]) {
      pattern.rows.push(rows[r]);
    }
  }
  return pattern;
}

RowOrComment
= r:Row t:TotalStitches? MaybeWhitespace c:Comment? {
  let row = r
  if (t) {
    row.total_stitches = t
  }
  if (c) {
    row.comment = c
  }
  if (!r.comment && !r.items[0]) {
    return null
  }
  return row
}

Title
= ('title' MaybeWhitespace ':')
  MaybeWhitespace title:[^\r\n]* '\r'? '\n' {
  return title.join("")
}

Row
= n:RowStart? MaybeWhitespace items:Items {
  let row = {
    "items": items
  }
  if (n && n > 0) {
    row["rowNum"] = n;
  }
  return row
}

RowStart
= "r:"{
    return null;
  }
  / "r"? rowNum:[0-9]+ ":" {
    return parseInt(rowNum.join(""), 10);
  }

TotalStitches
= '(' digits:[0-9]+ ')' {
  return parseInt(digits.join(""), 10)
}

Items
= itemlist:Item|..,DefinitelyWhitespace| MaybeWhitespace {
  return itemlist
}

Token
= token:[a-zA-Z]+ multi:Multiplier? {
  let ret = {
    "stitch": token.join(""),
    "count": 1,
  }
  if (multi) {
    ret["count"] = multi
  }
  return ret;
}

Multiplier
= '*' digits:[0-9]+ { return parseInt(digits.join(""), 10); }

Item
= t:Token { return t }
  / s:SubItem { return s }

SubItem
= '['
      MaybeWhitespace items:Items MaybeWhitespace
  ']' multi:Multiplier? {
  let ret = {
    "items": items,
    "count": 1,
    "delimiter": "["
  }
  if (multi) {
    ret["count"] = multi
  }
  return ret
}
  / '('
  MaybeWhitespace 
  items:Items 
  MaybeWhitespace 
  ')'
  multi:Multiplier? {
    let ret = {
    "items": items,
    "count": 1,
    "delimiter": "("
  }
  if (multi) {
    ret["count"] = multi
  }
  return ret
}

MaybeWhitespace
= HorizontalWhitespace*

DefinitelyWhitespace
= HorizontalWhitespace+

HorizontalWhitespace
= [ \t]

EOL
= '\r'? '\n'

Comment
= one:OnelineComment {
    return one
  }
  / multi:MultilineComment {
  return multi
}

OnelineComment
= '//' text:[^\n]* { return text.join('') }

MultilineComment
= '/*' text:('/' / '*' !'/' / [^*/])* ('*/') {
  return text.join('')
}
