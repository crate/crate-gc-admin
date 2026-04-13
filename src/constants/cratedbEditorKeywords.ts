// CrateDB SQL keywords, functions, and data types

// select word from pg_get_keywords() order by word;
export const keywords =
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

export const builtinFunctions =
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

export const dataTypes =
  'int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|' +
  'money|real|number|integer|string';
