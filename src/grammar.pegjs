Pattern
= Title? 
  (MaybeWhitespace? EOL)*
  RowOrComment|.., (MaybeWhitespace? EOL)*|

RowOrComment
= Row Comment?
  / Comment

Title
= ('title' MaybeWhitespace ':')
  MaybeWhitespace $[^\r\n]* '\r'? '\n'

Row
= ('r:') MaybeWhitespace Items

Items
= Item|..,DefinitelyWhitespace| MaybeWhitespace Comment?

Token
= token:[a-zA-Z]+ { return token.join(""); }

Multiplier
= '*' digits:[0-9]+ { return parseInt(digits.join(""), 10); }

Item
= (
    Token
    / '[' MaybeWhitespace Items MaybeWhitespace ']'
  )
  Multiplier?

MaybeWhitespace
= HorizontalWhitespace* { }

DefinitelyWhitespace
= HorizontalWhitespace+

HorizontalWhitespace
= [ \t]

EOL
= '\r'? '\n'

Comment
= $OnelineComment / $MultilineComment

OnelineComment
= '/' '/' [^\n]*

MultilineComment
= '/*' ('/' / '*' !'/' / [^*/])* ('*'+ '/')
