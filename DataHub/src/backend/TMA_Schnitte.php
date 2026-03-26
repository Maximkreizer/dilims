<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo '[
  {
    "ORIGREC": 10019,
    "TMA_NAME": "Mamma STR",
    "TMA_NR": 23,
    "Blocknummern": "1-3",
    "Anz_Bloecke": 3,
    "Anz_Schnitte_pro_Block": 10,
    "ProjektNr": "0003",
    "Abgabedatum": "2010-07-27T00:00:00",
    "Timestamp": "89C286B521376BA7"
  },
  {
    "ORIGREC": 10021,
    "Folgeprojekt": "",
    "TMA_NAME": "SCC",
    "TMA_NR": 19,
    "Blocknummern": "1",
    "Anz_Bloecke": 1,
    "Anz_Schnitte_pro_Block": 1,
    "ProjektNr": "0009",
    "Abgabedatum": "2010-09-16T00:00:00",
    "Timestamp": "6408369A85130B6F"
  },
  {
    "ORIGREC": 10023,
    "Folgeprojekt": "",
    "TMA_NAME": "Mamma STR",
    "TMA_NR": 23,
    "Blocknummern": "1,3",
    "Anz_Bloecke": 3,
    "Anz_Schnitte_pro_Block": 12,
    "ProjektNr": "0013",
    "Abgabedatum": "2010-11-30T00:00:00",
    "Timestamp": "D967E77E7D8252C0"
  },
  {
    "ORIGREC": 10024,
    "TMA_NAME": "Mamma STR",
    "TMA_NR": 23,
    "Blocknummern": "1-3",
    "Anz_Bloecke": 3,
    "Anz_Schnitte_pro_Block": 12,
    "ProjektNr": "0021",
    "Abgabedatum": "2011-01-18T00:00:00",
    "Timestamp": "0336A1D34892BD75"
  },
  {
    "ORIGREC": 10025,
    "Folgeprojekt": "",
    "TMA_NAME": "RCC",
    "TMA_NR": 10,
    "Blocknummern": "1-19",
    "Anz_Bloecke": 19,
    "Anz_Schnitte_pro_Block": 1,
    "ProjektNr": "0039",
    "Abgabedatum": "2011-05-12T00:00:00",
    "Timestamp": "16DE44363BD626E2"
  }
]';
?>
