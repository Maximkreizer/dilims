<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo '[
  {
    "ORIGREC": 10019,
    "TYP": "TA",
    "KUERZEL": "BW",
    "LANGTEXT": "Walter, Bettina",
    "SORTER": 1,
    "AUSGESCHIEDEN": false,
    "TimestampX": "DC360C48ED63837A"
  },
  {
    "ORIGREC": 10021,
    "TYP": "TA",
    "KUERZEL": "CZ",
    "LANGTEXT": "Zgorzelski, Christiane",
    "SORTER": 2,
    "AUSGESCHIEDEN": true,
    "TimestampX": "18FBDEC0168190CC"
  },
  {
    "ORIGREC": 10023,
    "TYP": "TA",
    "KUERZEL": "GL",
    "LANGTEXT": "Laukemper, Gloria",
    "SORTER": 3,
    "AUSGESCHIEDEN": true,
    "TimestampX": "41BABB994A391C24"
  },
  {
    "ORIGREC": 10024,
    "TYP": "TA",
    "KUERZEL": "GE",
    "LANGTEXT": "Geißler, Veronika",
    "SORTER": 4,
    "AUSGESCHIEDEN": true,
    "TimestampX": "52BF3EF8ECB50322"
  },
  {
    "ORIGREC": 10025,
    "TYP": "TA",
    "KUERZEL": "DJ",
    "LANGTEXT": "Jansen, David",
    "SORTER": 5,
    "AUSGESCHIEDEN": true,
    "TimestampX": "324304A15C438BAC"
  }
]';
?>
