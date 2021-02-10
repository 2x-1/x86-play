// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
  mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
  define(["../../lib/codemirror"], mod);
  else // Plain browser env
  mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode('z80', function(_config, parserConfig) {
  var ez80 = parserConfig.ez80;
  var keywords1, keywords2;
  keywords1 = /^(exx?|(ld|cp)([di]r?)?|d[bwd]|[lp]ea|pop[af]?|push[af]?|ad[cd]|cpl|da[as]|addrsiz|arpl|bound|bsf|bswap|bt[crs]?|aa[adms]|cbw|cl[cdi]|cm[cp]|cmps[bw]|cmpxchg|cmpxchg8b|cpuid|cl?ts|cwd|das|i?div|i?mul|enter|fwait|dec|inc?|ins[bw]|into?|invd|invlpg|iret|j[agl]e|je?cxz|j[abceglosz]|jp[eo]|jmp|jn[ceglopsz]|jnge|jnbe?|lahf|lar|l[defg]s|l[gil]dt|lmsw|ls[ls]|ltr|mov|movsx?[bw]|lock|lods[bw]|loop[ez]?|loopn[ez]|leave|ro[lr]|sa(hf|l|r)|rc[lr]|rd(msr|tsc)|repn?[ez]?|neg|not|sbc|sub|and|bit|[cs]cf|x?or|res|set|r[lr]c?a?|r[lr]d|s[lr]a|srl|djnz|sbb|scas[bw]|seg|sgdt|sh[lr]d?|si(dt|z)|smsw|st[cdi]|stos[bw]|str|test|ver[rw]|wait|wbinvd|wrmsr|xadd|xchg|xlat|nop|[de]i|hlt|im|in([di]mr?|ir?|irx|2r?)|ot(dmr?|[id]rx|imr?)|out(0?|[di]r?|[di]2r?|s|sb)|tst(io)?|slp)(\.([sl]?i)?[sl])?\b/i;
  keywords2 = /^(((call|j[pr]|rst|ret[in]?)(\.([sl]?i)?[sl])?)|(r|st)mix)\b/i;
  var variables1 = /^(af?|bc?|c|de?|e|hl?|l|i[xy]?|r|sp|[abcd][xlh]|[sd]i|[sd]p|[cdefgs]s)\b/i;
  var variables2 = /^(n?[zc]|p[oe]?|m)\b/i;
  var errors = /^([hl][xy]|i[xy][hl]|slia|sll)\b/i;
  var numbers = /^([\da-f]+h|[0-7]+o|[01]+b|\d+d?)\b/i;

  return {
    startState: function() {
      return {
        context: 0
      };
    },
    token: function(stream, state) {
      if (!stream.column())
        state.context = 0;

      if (stream.eatSpace())
        return null;

      var w;

      if (stream.eatWhile(/\w/)) {
        if (ez80 && stream.eat('.')) {
          stream.eatWhile(/\w/);
        }
        w = stream.current();

        if (true) {
          if ((state.context == 1 || state.context == 4) && variables1.test(w)) {
            state.context = 4;
            return 'def';
          }

          if (state.context == 2 && variables2.test(w)) {
            state.context = 4;
            return 'def';
          }

          if (keywords1.test(w)) {
            state.context = 1;
            return 'keyword';
          } else if (keywords2.test(w)) {
            state.context = 2;
            return 'keyword';
          } else if (state.context >= 1 && numbers.test(w)) {
            return 'number';
          }

          if (errors.test(w))
            return 'error';
        } else if (stream.match(numbers)) {
          return 'number';
        } else {
          return null;
        }
      } else if (stream.eat(';')) {
        stream.skipToEnd();
        return 'comment';
      } else if (stream.eat('"')) {
        while (w = stream.next()) {
          if (w == '"')
            break;

          if (w == '\\')
            stream.next();
        }
        return 'string';
      } else if (stream.eat('\'')) {
        while (w = stream.next()) {
          if (w == '\'')
            break;

          if (w == '\\')
            stream.next();
        }
        return 'string';
      } else if (stream.eat('.') || stream.sol() && stream.eat('#')) {
        state.context = 5;
        if (stream.eatWhile(/\w/))
          return 'def';
      } else {
        stream.next();
      }
      return null;
    }
  };
});

CodeMirror.defineMIME("text/x-z80", "z80");
CodeMirror.defineMIME("text/x-ez80", { name: "z80", ez80: true });

});
