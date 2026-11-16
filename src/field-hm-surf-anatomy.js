/* Field-only Surf anatomy, inspected against native IRBI JSON/OAM track art.
 * IDs are data.maps row[0] animation tracks, never cell/image indices.
 * Alternative native maps are included after pixel/placement verification.
 * Empty arrays mean no separate visible joint, not a generic fallback.
 * left/right are full forelimb chains; footLeft/footRight are full hindlimb
 * chains, requiring a common anatomical pivot/rotation within each chain.
 * Generic feet is reserved for Palpitoad's genuinely fused pair of feet.
 * Tympole: central head/body inseparable; tail and side nodules are separate.
 * Palpitoad: head/body inseparable and the two feet share one native track.
 * Audino/Seismitoad/Cubchoo/Druddigon: a rear-view far arm is occluded or
 * fused into the torso; it is intentionally not invented as another joint.
 * Alomomola: head/body are one central cell. Jellicent bell includes body.
 * Stunfisk: only eyes/mouth separate from its flat central body.
 * This catalog does not modify battle part maps or native game mechanics. */
(function(root){
 const anatomy={
 "501": {
  "front": {
   "head": [
    0,
    10
   ],
   "left": [
    3,
    7,
    8,
    13
   ],
   "right": [
    4,
    9,
    14
   ],
   "feet": [],
   "tail": [
    2,
    12
   ],
   "body": [
    1,
    11
   ],
   "footLeft": [
    5,
    15
   ],
   "footRight": [
    6,
    16
   ]
  },
  "back": {
   "head": [
    0,
    9
   ],
   "left": [
    2,
    7,
    11
   ],
   "right": [
    3,
    8,
    12
   ],
   "feet": [],
   "tail": [
    4,
    13
   ],
   "body": [
    1,
    10
   ],
   "footLeft": [
    5,
    14
   ],
   "footRight": [
    6,
    15
   ]
  }
 },
 "502": {
  "front": {
   "head": [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25
   ],
   "left": [
    13,
    16,
    31,
    34
   ],
   "right": [
    14,
    17,
    32,
    35
   ],
   "feet": [],
   "tail": [
    15,
    33
   ],
   "body": [
    8,
    9,
    10,
    26,
    27,
    28
   ],
   "footLeft": [
    11,
    29
   ],
   "footRight": [
    12,
    30
   ]
  },
  "back": {
   "head": [
    0,
    1,
    2,
    3,
    4,
    5,
    14,
    15,
    16,
    17,
    18,
    19
   ],
   "left": [
    12,
    26
   ],
   "right": [
    13
   ],
   "feet": [],
   "tail": [
    11,
    25
   ],
   "body": [
    6,
    7,
    8,
    20,
    21,
    22
   ],
   "footLeft": [
    9,
    23
   ],
   "footRight": [
    10,
    24
   ]
  }
 },
 "503": {
  "front": {
   "head": [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    29,
    30,
    31,
    34,
    56
   ],
   "left": [
    16,
    17,
    18,
    19,
    20,
    43,
    44,
    45,
    46,
    47
   ],
   "right": [
    11,
    12,
    13,
    14,
    15,
    38,
    39,
    40,
    41,
    42
   ],
   "feet": [],
   "tail": [
    26,
    28,
    53,
    55
   ],
   "body": [
    9,
    10,
    36,
    37
   ],
   "footLeft": [
    8,
    27,
    35,
    54
   ],
   "footRight": [
    21,
    22,
    23,
    24,
    25,
    48,
    49,
    50,
    51,
    52
   ]
  },
  "back": {
   "head": [
    0,
    1,
    2,
    3,
    4,
    26,
    27,
    28,
    29,
    30
   ],
   "left": [
    16,
    17,
    18,
    19,
    20,
    42,
    43,
    44,
    45,
    46
   ],
   "right": [
    11,
    12,
    13,
    14,
    15,
    37,
    38,
    39,
    40,
    41
   ],
   "feet": [],
   "tail": [
    8,
    34
   ],
   "body": [
    5,
    6,
    7,
    31,
    32,
    33
   ],
   "footLeft": [
    9,
    10,
    35,
    36
   ],
   "footRight": [
    21,
    22,
    23,
    24,
    25,
    47,
    48,
    49,
    50,
    51
   ]
  }
 },
 "507": {
  "front": {
   "head": [
    0,
    1,
    2,
    15,
    16,
    17
   ],
   "left": [
    3,
    4,
    18,
    19
   ],
   "right": [
    5,
    6,
    20,
    21
   ],
   "feet": [],
   "tail": [
    14,
    29
   ],
   "body": [
    9,
    10,
    11,
    12,
    13,
    24,
    25,
    26,
    27,
    28
   ],
   "footLeft": [
    7,
    22
   ],
   "footRight": [
    8,
    23
   ]
  },
  "back": {
   "head": [
    0,
    1,
    2,
    3,
    12,
    13,
    14,
    15
   ],
   "left": [
    9,
    21
   ],
   "right": [
    10,
    22
   ],
   "feet": [],
   "tail": [
    11,
    23
   ],
   "body": [
    4,
    5,
    6,
    16,
    17,
    18
   ],
   "footLeft": [
    7,
    19
   ],
   "footRight": [
    8,
    20
   ]
  }
 },
 "508": {
  "front": {
   "head": [
    0,
    1,
    2,
    3,
    11,
    14,
    15,
    16,
    17,
    25
   ],
   "left": [
    4,
    5,
    12,
    18,
    19
   ],
   "right": [
    6,
    13,
    20
   ],
   "feet": [],
   "tail": [
    7,
    10,
    21,
    24
   ],
   "body": [
    8,
    9,
    22,
    23
   ],
   "footLeft": [],
   "footRight": []
  },
  "back": {
   "head": [
    0,
    1,
    2,
    10,
    11,
    12
   ],
   "left": [],
   "right": [
    3,
    13
   ],
   "feet": [],
   "tail": [
    4,
    7,
    14,
    17
   ],
   "body": [
    5,
    6,
    15,
    16
   ],
   "footLeft": [
    8
   ],
   "footRight": [
    9
   ]
  }
 },
 "515": {
  "front": {
   "head": [
    4,
    13,
    14,
    15,
    16
   ],
   "left": [
    6,
    18
   ],
   "right": [
    7,
    19
   ],
   "feet": [],
   "tail": [
    12,
    24
   ],
   "body": [
    5,
    17
   ],
   "footLeft": [
    8,
    9,
    20,
    21
   ],
   "footRight": [
    10,
    11,
    22,
    23
   ]
  },
  "back": {
   "head": [
    4,
    13,
    14,
    15,
    16
   ],
   "left": [
    7,
    20
   ],
   "right": [
    6,
    19
   ],
   "feet": [],
   "tail": [
    12,
    25
   ],
   "body": [
    5,
    18
   ],
   "footLeft": [
    10,
    11,
    23,
    24
   ],
   "footRight": [
    8,
    9,
    21,
    22
   ]
  }
 },
 "516": {
  "front": {
   "head": [
    0,
    1,
    2,
    3,
    4,
    5,
    22,
    23
   ],
   "left": [
    15,
    32,
    33
   ],
   "right": [
    19,
    20,
    35,
    36
   ],
   "feet": [],
   "tail": [
    21,
    37
   ],
   "body": [
    8,
    24
   ],
   "footLeft": [
    10,
    11,
    25
   ],
   "footRight": [
    13,
    14,
    28
   ]
  },
  "back": {
   "head": [
    1,
    2,
    3,
    4,
    5,
    6,
    22,
    23
   ],
   "left": [
    15,
    33,
    34
   ],
   "right": [
    19,
    20,
    36,
    37
   ],
   "feet": [],
   "tail": [
    21,
    38
   ],
   "body": [
    7,
    8,
    24,
    25
   ],
   "footLeft": [
    13,
    14,
    29
   ],
   "footRight": [
    10,
    11,
    26
   ]
  }
 },
 "531": {
  "front": {
   "head": [
    0,
    1,
    2,
    5,
    9,
    10,
    11
   ],
   "left": [
    14
   ],
   "right": [
    4,
    13
   ],
   "feet": [],
   "tail": [
    8,
    17
   ],
   "body": [
    3,
    12
   ],
   "footLeft": [
    6,
    15
   ],
   "footRight": [
    7,
    16
   ]
  },
  "back": {
   "head": [
    0,
    1,
    2,
    8,
    9,
    10
   ],
   "left": [
    4,
    12
   ],
   "right": [],
   "feet": [],
   "tail": [
    7,
    15
   ],
   "body": [
    3,
    11
   ],
   "footLeft": [
    5,
    13
   ],
   "footRight": [
    6,
    14
   ]
  }
 },
 "535": {
  "front": {
   "head": [
    1,
    2,
    5,
    6
   ],
   "left": [],
   "right": [],
   "feet": [],
   "tail": [
    3,
    7
   ],
   "body": [
    0,
    4
   ]
  },
  "back": {
   "head": [
    1,
    2,
    5,
    6
   ],
   "left": [],
   "right": [],
   "feet": [],
   "tail": [
    3,
    7
   ],
   "body": [
    0,
    4
   ]
  }
 },
 "536": {
  "front": {
   "head": [
    4,
    5,
    6,
    12,
    13,
    14
   ],
   "left": [],
   "right": [],
   "feet": [
    1,
    9
   ],
   "tail": [
    7,
    15
   ],
   "body": [
    0,
    2,
    3,
    8,
    10,
    11
   ]
  },
  "back": {
   "head": [
    2,
    3,
    4,
    12,
    13,
    14
   ],
   "left": [],
   "right": [],
   "feet": [
    1,
    11
   ],
   "tail": [
    9,
    19
   ],
   "body": [
    0,
    5,
    6,
    7,
    8,
    10,
    15,
    16,
    17,
    18
   ]
  }
 },
 "537": {
  "front": {
   "head": [
    0,
    2,
    3,
    10,
    12,
    13
   ],
   "left": [
    4,
    5,
    14,
    15
   ],
   "right": [
    6,
    7,
    16,
    17
   ],
   "feet": [],
   "tail": [],
   "body": [
    1,
    11
   ],
   "footLeft": [
    8,
    18
   ],
   "footRight": [
    9,
    19
   ]
  },
  "back": {
   "head": [
    1,
    2,
    3,
    4,
    12,
    13,
    14,
    15
   ],
   "left": [],
   "right": [
    7,
    8,
    18,
    19
   ],
   "feet": [],
   "tail": [],
   "body": [
    0,
    5,
    6,
    11,
    16,
    17
   ],
   "footLeft": [
    9,
    20
   ],
   "footRight": [
    10,
    21
   ]
  }
 },
 "550": {
  "front": {
   "head": [
    0,
    1,
    7,
    8
   ],
   "left": [
    3,
    10
   ],
   "right": [
    4,
    11
   ],
   "feet": [],
   "tail": [
    6,
    13
   ],
   "body": [
    2,
    5,
    9,
    12
   ]
  },
  "back": {
   "head": [
    0,
    1,
    7,
    8
   ],
   "left": [
    3,
    10
   ],
   "right": [
    4,
    11
   ],
   "feet": [],
   "tail": [
    6,
    13
   ],
   "body": [
    2,
    5,
    9,
    12
   ]
  }
 },
 "699": {
  "front": {
   "head": [
    0,
    1,
    7,
    8
   ],
   "left": [
    3,
    10
   ],
   "right": [
    4,
    11
   ],
   "feet": [],
   "tail": [
    6,
    13
   ],
   "body": [
    2,
    5,
    9,
    12
   ]
  },
  "back": {
   "head": [
    0,
    1,
    7,
    8
   ],
   "left": [
    3,
    10
   ],
   "right": [
    4,
    11
   ],
   "feet": [],
   "tail": [
    6,
    13
   ],
   "body": [
    2,
    5,
    9,
    12
   ]
  }
 },
 "564": {
  "front": {
   "head": [
    0,
    1,
    9
   ],
   "left": [
    3,
    7
   ],
   "right": [
    4,
    8
   ],
   "feet": [],
   "tail": [],
   "body": [
    2
   ],
   "footLeft": [
    5,
    10
   ],
   "footRight": [
    6,
    11
   ]
  },
  "back": {
   "head": [
    0
   ],
   "left": [
    3,
    7
   ],
   "right": [
    2,
    6
   ],
   "feet": [],
   "tail": [],
   "body": [
    1
   ],
   "footLeft": [
    4,
    8
   ],
   "footRight": [
    5,
    9
   ]
  }
 },
 "565": {
  "front": {
   "head": [
    0,
    12,
    21
   ],
   "left": [
    2,
    4,
    14,
    16,
    25,
    27
   ],
   "right": [
    3,
    5,
    15,
    17,
    26,
    28
   ],
   "feet": [],
   "tail": [
    8,
    20,
    29
   ],
   "body": [
    1,
    13,
    22
   ],
   "footLeft": [
    6,
    9,
    18,
    23
   ],
   "footRight": [
    7,
    10,
    19,
    24
   ]
  },
  "back": {
   "head": [
    0,
    13
   ],
   "left": [
    4,
    6,
    17,
    19
   ],
   "right": [
    3,
    5,
    16,
    18
   ],
   "feet": [],
   "tail": [
    10,
    23
   ],
   "body": [
    1,
    14
   ],
   "footLeft": [
    2,
    9,
    12,
    15,
    22
   ],
   "footRight": [
    7,
    8,
    11,
    20,
    21
   ]
  }
 },
 "592": {
  "front": {
   "head": [
    0,
    1,
    2,
    11,
    12,
    13
   ],
   "left": [
    4,
    5,
    15,
    16
   ],
   "right": [
    3,
    6,
    14,
    17
   ],
   "feet": [],
   "tail": [
    7,
    8,
    9,
    18,
    19,
    20
   ],
   "body": [
    10,
    21
   ]
  },
  "back": {
   "head": [
    0,
    1,
    10,
    11
   ],
   "left": [
    5,
    6,
    15,
    16
   ],
   "right": [
    3,
    4,
    13,
    14
   ],
   "feet": [],
   "tail": [
    7,
    8,
    9,
    17,
    18,
    19
   ],
   "body": [
    2,
    12
   ]
  }
 },
 "592-female": {
  "front": {
   "head": [
    0,
    1,
    2,
    11,
    12,
    13
   ],
   "left": [
    4,
    5,
    15,
    16
   ],
   "right": [
    3,
    6,
    14,
    17
   ],
   "feet": [],
   "tail": [
    7,
    8,
    9,
    18,
    19,
    20
   ],
   "body": [
    10,
    21
   ]
  },
  "back": {
   "head": [
    0,
    1,
    10,
    11
   ],
   "left": [
    5,
    6,
    15,
    16
   ],
   "right": [
    3,
    4,
    13,
    14
   ],
   "feet": [],
   "tail": [
    7,
    8,
    9,
    17,
    18,
    19
   ],
   "body": [
    2,
    12
   ]
  }
 },
 "593": {
  "front": {
   "head": [
    0,
    1,
    2,
    8,
    9,
    10
   ],
   "left": [
    3,
    6,
    11,
    13
   ],
   "right": [
    4,
    7,
    12,
    14
   ],
   "feet": [],
   "tail": [
    5,
    15
   ],
   "body": []
  },
  "back": {
   "head": [
    0,
    6
   ],
   "left": [
    2,
    4,
    8,
    10
   ],
   "right": [
    1,
    5,
    7,
    11
   ],
   "feet": [],
   "tail": [
    3,
    9
   ],
   "body": []
  }
 },
 "593-female": {
  "front": {
   "head": [
    0,
    1,
    2,
    8,
    9,
    10
   ],
   "left": [
    3,
    6,
    11,
    13
   ],
   "right": [
    4,
    7,
    12,
    14
   ],
   "feet": [],
   "tail": [
    5,
    15
   ],
   "body": []
  },
  "back": {
   "head": [
    0,
    6
   ],
   "left": [
    2,
    4,
    8,
    10
   ],
   "right": [
    1,
    5,
    7,
    11
   ],
   "feet": [],
   "tail": [
    3,
    9
   ],
   "body": []
  }
 },
 "594": {
  "front": {
   "head": [],
   "left": [
    3,
    7
   ],
   "right": [
    2,
    6
   ],
   "feet": [],
   "tail": [
    1,
    5
   ],
   "body": [
    0,
    4
   ]
  },
  "back": {
   "head": [],
   "left": [
    3,
    7
   ],
   "right": [
    2,
    6
   ],
   "feet": [],
   "tail": [
    1,
    5
   ],
   "body": [
    0,
    4
   ]
  }
 },
 "612": {
  "front": {
   "head": [
    0,
    1,
    2,
    17,
    18,
    19
   ],
   "left": [
    11,
    12,
    28,
    29
   ],
   "right": [
    9,
    10,
    26,
    27
   ],
   "feet": [],
   "tail": [
    14,
    15,
    16,
    31,
    32,
    33
   ],
   "body": [
    3,
    4,
    13,
    20,
    21,
    30
   ],
   "footLeft": [
    7,
    8,
    24,
    25
   ],
   "footRight": [
    5,
    6,
    22,
    23
   ]
  },
  "back": {
   "head": [
    0,
    1,
    2,
    3,
    13,
    14,
    15,
    16
   ],
   "left": [
    12,
    25
   ],
   "right": [
    11,
    24
   ],
   "feet": [],
   "tail": [
    10,
    23
   ],
   "body": [
    4,
    5,
    17,
    18
   ],
   "footLeft": [
    8,
    9,
    21,
    22
   ],
   "footRight": [
    6,
    7,
    19,
    20
   ]
  }
 },
 "613": {
  "front": {
   "head": [
    0,
    1,
    2,
    3,
    4,
    11,
    12,
    13,
    14,
    15
   ],
   "left": [
    6,
    17
   ],
   "right": [
    7,
    18
   ],
   "feet": [],
   "tail": [],
   "body": [
    5,
    16
   ],
   "footLeft": [
    8,
    19
   ],
   "footRight": [
    9,
    10,
    20,
    21
   ]
  },
  "back": {
   "head": [
    0,
    1,
    2,
    3,
    8,
    9,
    10,
    11
   ],
   "left": [
    5,
    13
   ],
   "right": [],
   "feet": [],
   "tail": [],
   "body": [
    4,
    12
   ],
   "footLeft": [
    7,
    15
   ],
   "footRight": [
    6,
    14
   ]
  }
 },
 "614": {
  "front": {
   "head": [
    0,
    1,
    2,
    3,
    15,
    16,
    17,
    18
   ],
   "left": [
    7,
    8,
    22,
    23
   ],
   "right": [
    9,
    10,
    24,
    25
   ],
   "feet": [],
   "tail": [],
   "body": [
    4,
    5,
    6,
    19,
    20,
    21
   ],
   "footLeft": [
    11,
    12,
    26,
    27
   ],
   "footRight": [
    13,
    14,
    28,
    29
   ]
  },
  "back": {
   "head": [
    0,
    1,
    2,
    3,
    15,
    16,
    17,
    18
   ],
   "left": [
    7,
    8,
    22,
    23
   ],
   "right": [
    9,
    10,
    24,
    25
   ],
   "feet": [],
   "tail": [],
   "body": [
    4,
    5,
    6,
    19,
    20,
    21
   ],
   "footLeft": [
    11,
    12,
    26,
    27
   ],
   "footRight": [
    13,
    14,
    28,
    29
   ]
  }
 },
 "618": {
  "front": {
   "head": [
    0,
    2,
    6,
    8
   ],
   "left": [
    3,
    9
   ],
   "right": [
    4,
    10
   ],
   "feet": [],
   "tail": [
    5,
    11
   ],
   "body": [
    1,
    7
   ]
  },
  "back": {
   "head": [
    0,
    5
   ],
   "left": [
    2,
    7
   ],
   "right": [
    3,
    8
   ],
   "feet": [],
   "tail": [
    4,
    9
   ],
   "body": [
    1,
    6
   ]
  }
 },
 "621": {
  "front": {
   "head": [
    0,
    1,
    2,
    15,
    16,
    17
   ],
   "left": [
    6,
    7,
    21,
    22
   ],
   "right": [
    8,
    9,
    23,
    24
   ],
   "feet": [],
   "tail": [
    14,
    29
   ],
   "body": [
    3,
    18
   ],
   "wings": [
    4,
    5,
    19,
    20
   ],
   "footLeft": [
    10,
    11,
    25,
    26
   ],
   "footRight": [
    12,
    13,
    27,
    28
   ]
  },
  "back": {
   "head": [
    0,
    1,
    2,
    14,
    15,
    16
   ],
   "left": [],
   "right": [
    7,
    8,
    21,
    22
   ],
   "feet": [],
   "tail": [
    13,
    27
   ],
   "body": [
    3,
    4,
    17,
    18
   ],
   "wings": [
    5,
    6,
    19,
    20
   ],
   "footLeft": [
    9,
    10,
    23,
    24
   ],
   "footRight": [
    11,
    12,
    25,
    26
   ]
  }
 },
 "626": {
  "front": {
   "head": [
    0,
    1,
    2,
    3,
    4,
    14,
    15,
    16,
    17,
    18
   ],
   "left": [
    6,
    20
   ],
   "right": [
    7,
    8,
    21,
    22
   ],
   "feet": [],
   "tail": [
    13,
    27
   ],
   "body": [
    5,
    19
   ],
   "footLeft": [
    9,
    10,
    23,
    24
   ],
   "footRight": [
    11,
    12,
    25,
    26
   ]
  },
  "back": {
   "head": [
    0,
    1,
    2,
    13,
    14,
    15
   ],
   "left": [
    5,
    6,
    18,
    19
   ],
   "right": [
    7,
    8,
    20,
    21
   ],
   "feet": [],
   "tail": [
    4,
    17
   ],
   "body": [
    3,
    16
   ],
   "footLeft": [
    9,
    10,
    22,
    23
   ],
   "footRight": [
    11,
    12,
    24,
    25
   ]
  }
 }
};
 root.FieldHMSurfAnatomy=anatomy;
 if(typeof module!=='undefined')module.exports=anatomy;
})(typeof window==='undefined'?globalThis:window);
