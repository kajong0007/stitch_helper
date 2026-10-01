Pattern
= (MaybeWhitespace? EOL)*
  title:Title?
  (MaybeWhitespace? EOL)*
  rows:RowOrComment|.., (MaybeWhitespace? EOL)*| {
  return {
    "title": title,
    "rows": rows,
  }
}

RowOrComment
= r:Row t:TotalStitches? MaybeWhitespace c:Comment? {
  let row = {
    "items": r,
  }
  if (t) {
    row.total_stitches = t
  }
  if (c) {
    row.comment = c
  }
  return row
}
  / c:Comment {
  return c
}

Title
= ('title' MaybeWhitespace ':')
  MaybeWhitespace title:[^\r\n]* '\r'? '\n' {
  return title.join("")
}

Row
= ('r:') MaybeWhitespace items:Items {
  return items
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
    return {"onecomment": one}
  }
  / multi:MultilineComment {
  return {"multicomment": multi}
}

OnelineComment
= '//' text:[^\n]* { return text.join('') }

MultilineComment
= '/*' text:('/' / '*' !'/' / [^*/])* ('*/') {
  return text.join('')
}
