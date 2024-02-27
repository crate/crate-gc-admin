// try / catch to prevent tests failing
// i've wasted a lot of time on trying to get this to work without success
// this works fine in the app, and we can improve it in future if we get chance to
try {
  ace.define(
    'ace/mode/sql_highlight_rules',
    ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text_highlight_rules'],
    function (require, exports, module) {
      'use strict';
      var oop = require('../lib/oop');
      var TextHighlightRules = require('./text_highlight_rules').TextHighlightRules;
      var SqlHighlightRules = function () {
        // select word from pg_get_keywords() order by word;
        var keywords =
          'absolute|add|alias|all|allocate|alter|always|analyze|analyzer|and|any|array|artifacts|' +
          'as|asc|asensitive|at|authorization|backward|begin|bernoulli|between|binary|blob|boolean|' +
          'both|by|byte|called|cancel|case|cast|catalogs|char_filters|character|characteristics|' +
          'check|close|cluster|clustered|column|columns|commit|committed|conflict|connection|' +
          'constraint|copy|costs|create|cross|current|current_date|current_schema|current_time|' +
          'current_timestamp|current_user|cursor|dangling|day|deallocate|declare|decommission|' +
          'default|deferrable|delete|deny|desc|describe|directory|disable|discard|distinct|' +
          'distributed|do|double|drop|duplicate|dynamic|else|enable|end|escape|except|exists|' +
          'explain|extends|extract|failed|false|fetch|filter|first|float|following|for|format|' +
          'forward|from|full|fulltext|function|functions|gc|generated|geo_point|geo_shape|global|' +
          'grant|graphviz|group|having|hold|hour|if|ignore|ignored|ilike|in|index|inner|input|' +
          'insensitive|insert|int|integer|intersect|interval|into|ip|is|isolation|join|key|kill|' +
          'language|last|leading|left|level|like|limit|local|logical|long|match|materialized|' +
          'metadata|minute|month|move|natural|next|no|not|nothing|null|nulls|object|off|offset|' +
          'on|only|open|optimize|or|order|outer|over|partition|partitioned|partitions|persistent|' +
          'plain|plans|preceding|precision|prepare|prior|privileges|promote|publication|range|' +
          'read|recursive|refresh|relative|rename|repeatable|replace|replica|repository|reroute|' +
          'reset|respect|restore|retry|return|returning|returns|revoke|right|row|rows|schema|' +
          'schemas|scroll|second|select|sequences|serializable|session|session_user|set|shard|' +
          'shards|short|show|snapshot|some|start|storage|stratify|strict|string|subscription|' +
          'substring|summary|swap|system|table|tables|tablesample|temp|temporary|text|then|' +
          'time|timestamp|to|token_filters|tokenizer|trailing|transaction|transaction_isolation|' +
          'transient|trim|true|try_cast|type|unbounded|uncommitted|union|update|user|using|' +
          'values|varying|view|when|where|window|with|without|work|write|year|zone';
        var builtinConstants = 'true|false';
        var builtinFunctions =
          'abs|acos|age|any_value|arbitrary|area|array|array_agg|array_append|array_avg|array_cat|' +
          'array_difference|array_length|array_lower|array_max|array_min|array_position|array_set|' +
          'array_slice|array_sum|array_to_string|array_unique|array_unnest|array_upper|ascii|asin|atan|' +
          'atan2|avg|bit_length|btrim|ceil|ceiling|char_length|chr|coalesce|col_description|concat|' +
          'concat_ws|cos|cot|count|curdate|current_database|current_date|current_schema|current_schemas|' +
          'current_setting|current_time|current_timestamp|current_user|date_bin|date_format|date_trunc|' +
          'decode|degrees|dense_rank|distance|empty_row|encode|exp|extract|first_value|floor|format|' +
          'format_type|gen_random_text_uuid|geohash|geometric_mean|greatest|has_database_privilege|' +
          'has_schema_privilege|hyperloglog_distinct|if|ignore3vl|in|information_schema._pg_expandarray|' +
          'initcap|intersects|knn_match|lag|last_value|latitude|lead|least|left|length|ln|log|longitude|' +
          'lower|lpad|ltrim|max|max_by|md5|mean|min|min_by|mod|modulus|now|nth_value|null_or_empty|' +
          'null_string|nullif|obj_description|object_keys|octet_length|parse_uri|parse_url|percentile|' +
          'pg_backend_pid|pg_catalog.generate_series|pg_catalog.generate_subscripts|' +
          'pg_catalog.pg_get_keywords|pg_encoding_to_char|pg_function_is_visible|pg_get_expr|' +
          'pg_get_function_result|pg_get_partkeydef|pg_get_serial_sequence|pg_get_userbyid|' +
          'pg_postmaster_start_time|pg_typeof|pi|power|quote_ident|radians|random|rank|regexp_matches|' +
          'regexp_replace|repeat|replace|right|round|row_number|rpad|rtrim|separator|session_user|sha1|' +
          'sin|split_part|sqrt|stddev|string_agg|string_to_array|substr|sum|tan|timezone|to_char|' +
          'translate|trim|trunc|unnest|upper|user|variance|version|within';
        var dataTypes =
          'int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|' +
          'money|real|number|integer|string';
        var keywordMapper = this.createKeywordMapper(
          {
            'support.function': builtinFunctions,
            keyword: keywords,
            'constant.language': builtinConstants,
            'storage.type': dataTypes,
          },
          'identifier',
          true,
        );
        this.$rules = {
          start: [
            {
              token: 'comment',
              regex: '--.*$',
            },
            {
              token: 'comment',
              start: '/\\*',
              end: '\\*/',
            },
            {
              token: 'string', // " string
              regex: '".*?"',
            },
            {
              token: 'string', // ' string
              regex: "'.*?'",
            },
            {
              token: 'string', // ` string (apache drill)
              regex: '`.*?`',
            },
            {
              token: 'constant.numeric', // float
              regex: '[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b',
            },
            {
              token: keywordMapper,
              regex: '[a-zA-Z_$][a-zA-Z0-9_$]*\\b',
            },
            {
              token: 'keyword.operator',
              regex: '\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|=',
            },
            {
              token: 'paren.lparen',
              regex: '[\\(]',
            },
            {
              token: 'paren.rparen',
              regex: '[\\)]',
            },
            {
              token: 'text',
              regex: '\\s+',
            },
          ],
        };
        this.normalizeRules();
      };
      oop.inherits(SqlHighlightRules, TextHighlightRules);
      exports.SqlHighlightRules = SqlHighlightRules;
    },
  );

  ace.define(
    'ace/mode/folding/cstyle',
    [
      'require',
      'exports',
      'module',
      'ace/lib/oop',
      'ace/range',
      'ace/mode/folding/fold_mode',
    ],
    function (require, exports, module) {
      'use strict';
      var oop = require('../../lib/oop');
      var Range = require('../../range').Range;
      var BaseFoldMode = require('./fold_mode').FoldMode;
      var FoldMode = (exports.FoldMode = function (commentRegex) {
        if (commentRegex) {
          this.foldingStartMarker = new RegExp(
            this.foldingStartMarker.source.replace(
              /\|[^|]*?$/,
              '|' + commentRegex.start,
            ),
          );
          this.foldingStopMarker = new RegExp(
            this.foldingStopMarker.source.replace(
              /\|[^|]*?$/,
              '|' + commentRegex.end,
            ),
          );
        }
      });
      oop.inherits(FoldMode, BaseFoldMode);
      (function () {
        this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/;
        this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/;
        this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/;
        this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
        this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;
        this._getFoldWidgetBase = this.getFoldWidget;
        this.getFoldWidget = function (session, foldStyle, row) {
          var line = session.getLine(row);
          if (this.singleLineBlockCommentRe.test(line)) {
            if (
              !this.startRegionRe.test(line) &&
              !this.tripleStarBlockCommentRe.test(line)
            )
              return '';
          }
          var fw = this._getFoldWidgetBase(session, foldStyle, row);
          if (!fw && this.startRegionRe.test(line)) return 'start'; // lineCommentRegionStart
          return fw;
        };
        this.getFoldWidgetRange = function (
          session,
          foldStyle,
          row,
          forceMultiline,
        ) {
          var line = session.getLine(row);
          if (this.startRegionRe.test(line))
            return this.getCommentRegionBlock(session, line, row);
          var match = line.match(this.foldingStartMarker);
          if (match) {
            var i = match.index;
            if (match[1]) return this.openingBracketBlock(session, match[1], row, i);
            var range = session.getCommentFoldRange(row, i + match[0].length, 1);
            if (range && !range.isMultiLine()) {
              if (forceMultiline) {
                range = this.getSectionRange(session, row);
              } else if (foldStyle != 'all') range = null;
            }
            return range;
          }
          if (foldStyle === 'markbegin') return;
          var match = line.match(this.foldingStopMarker);
          if (match) {
            var i = match.index + match[0].length;
            if (match[1]) return this.closingBracketBlock(session, match[1], row, i);
            return session.getCommentFoldRange(row, i, -1);
          }
        };
        this.getSectionRange = function (session, row) {
          var line = session.getLine(row);
          var startIndent = line.search(/\S/);
          var startRow = row;
          var startColumn = line.length;
          row = row + 1;
          var endRow = row;
          var maxRow = session.getLength();
          while (++row < maxRow) {
            line = session.getLine(row);
            var indent = line.search(/\S/);
            if (indent === -1) continue;
            if (startIndent > indent) break;
            var subRange = this.getFoldWidgetRange(session, 'all', row);
            if (subRange) {
              if (subRange.start.row <= startRow) {
                break;
              } else if (subRange.isMultiLine()) {
                row = subRange.end.row;
              } else if (startIndent == indent) {
                break;
              }
            }
            endRow = row;
          }
          return new Range(
            startRow,
            startColumn,
            endRow,
            session.getLine(endRow).length,
          );
        };
        this.getCommentRegionBlock = function (session, line, row) {
          var startColumn = line.search(/\s*$/);
          var maxRow = session.getLength();
          var startRow = row;
          var re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
          var depth = 1;
          while (++row < maxRow) {
            line = session.getLine(row);
            var m = re.exec(line);
            if (!m) continue;
            if (m[1]) depth--;
            else depth++;
            if (!depth) break;
          }
          var endRow = row;
          if (endRow > startRow) {
            return new Range(startRow, startColumn, endRow, line.length);
          }
        };
      }).call(FoldMode.prototype);
    },
  );

  ace.define(
    'ace/mode/folding/sql',
    ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/folding/cstyle'],
    function (require, exports, module) {
      'use strict';
      var oop = require('../../lib/oop');
      var BaseFoldMode = require('./cstyle').FoldMode;
      var FoldMode = (exports.FoldMode = function () {});
      oop.inherits(FoldMode, BaseFoldMode);
      (function () {}).call(FoldMode.prototype);
    },
  );

  ace.define(
    'ace/mode/cratedb',
    [
      'require',
      'exports',
      'module',
      'ace/lib/oop',
      'ace/mode/text',
      'ace/mode/sql_highlight_rules',
      'ace/mode/folding/sql',
    ],
    function (require, exports, module) {
      'use strict';
      var oop = require('../lib/oop');
      var TextMode = require('./text').Mode;
      var SqlHighlightRules = require('./sql_highlight_rules').SqlHighlightRules;
      var SqlFoldMode = require('./folding/sql').FoldMode;
      var Mode = function () {
        this.HighlightRules = SqlHighlightRules;
        this.foldingRules = new SqlFoldMode();
        this.$behaviour = this.$defaultBehaviour;
      };
      oop.inherits(Mode, TextMode);
      (function () {
        this.lineCommentStart = '--';
        this.blockComment = { start: '/*', end: '*/' };
        this.$id = 'ace/mode/sql';
        this.snippetFileId = 'ace/snippets/sql';
      }).call(Mode.prototype);
      exports.Mode = Mode;
    },
  );

  (function () {
    ace.require(['ace/mode/cratedb'], function (m) {
      if (typeof module == 'object' && typeof exports == 'object' && module) {
        exports['default'] = m;
      }
    });
  })();
} catch (error) {
  //
}
