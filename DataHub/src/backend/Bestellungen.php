<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo '[
  {
    "BESTELL_ID": 10012,
    "Arbeitsgruppe": "Institution_5",
    "Arbeitsgruppen_ID": 10013,
    "Sonstiges_Material": "Dummy",
    "Preis": 1,
    "upsize_ts": "499A44E077199834"
  },
  {
    "BESTELL_ID": 10014,
    "Arbeitsgruppe": "Institution_6",
    "Arbeitsgruppen_ID": 10003,
    "Preis": 1,
    "upsize_ts": "64BE2B90F562C31F"
  },
  {
    "BESTELL_ID": 10015,
    "Arbeitsgruppe": "Institution_7",
    "Arbeitsgruppen_ID": 10016,
    "Material": "Ventana-Kit",
    "Preis": 875,
    "Lieferdatum": "2021-11-03T00:00:00",
    "upsize_ts": "35872D0A0DB084A3"
  },
  {
    "BESTELL_ID": 10017,
    "Arbeitsgruppe": "Institution_7",
    "Arbeitsgruppen_ID": 10016,
    "Material": "Ventana-Kit",
    "Preis": 875,
    "Lieferdatum": "2021-11-03T00:00:00",
    "upsize_ts": "A031A854354DC94F"
  },
  {
    "BESTELL_ID": 10018,
    "Arbeitsgruppe": "Institution_7",
    "Arbeitsgruppen_ID": 10016,
    "Material": "Ventana-Kit",
    "Preis": 875,
    "Lieferdatum": "2021-11-03T00:00:00",
    "upsize_ts": "85AEC3045CD2F18E"
  }
]';
?>
