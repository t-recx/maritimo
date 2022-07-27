namespace Database.Lib;

public class MMSIService : IMMSIService
{
    Dictionary<ObjectType, int> MidStartPositionByObjectType = new Dictionary<ObjectType, int>()
    {
        [ObjectType.Ship] = 0,
        [ObjectType.GroupsOfShips] = 1,
        [ObjectType.BaseStations] = 2,
        [ObjectType.SearchAndRescueAircraft] = 3,
        [ObjectType.AidsToNavigation] = 2,
        [ObjectType.CraftAssociatedWithParentShip] = 2,
    };

    Dictionary<int, string> CountryDescriptionsByMid = new Dictionary<int, string>()
    {
        [201] = "Albania",
        [202] = "Andorra",
        [203] = "Austria",
        [204] = "Portugal - Azores",
        [205] = "Belgium",
        [206] = "Belarus",
        [207] = "Bulgaria",
        [208] = "Vatican City State",
        [209] = "Cyprus",
        [210] = "Cyprus",
        [211] = "Germany",
        [212] = "Cyprus",
        [213] = "Georgia",
        [214] = "Moldova",
        [215] = "Malta",
        [216] = "Armenia",
        [218] = "Germany",
        [219] = "Denmark",
        [220] = "Denmark",
        [224] = "Spain",
        [225] = "Spain",
        [226] = "France",
        [227] = "France",
        [228] = "France",
        [229] = "Malta",
        [230] = "Finland",
        [231] = "Denmark - Faroe Islands",
        [232] = "United Kingdom",
        [233] = "United Kingdom",
        [234] = "United Kingdom",
        [235] = "United Kingdom",
        [236] = "Gibraltar",
        [237] = "Greece",
        [238] = "Croatia",
        [239] = "Greece",
        [240] = "Greece",
        [241] = "Greece",
        [242] = "Morocco",
        [243] = "Hungary",
        [244] = "Netherlands",
        [245] = "Netherlands",
        [246] = "Netherlands",
        [247] = "Italy",
        [248] = "Malta",
        [249] = "Malta",
        [250] = "Ireland",
        [251] = "Iceland",
        [252] = "Liechtenstein",
        [253] = "Luxembourg",
        [254] = "Monaco",
        [255] = "Portugal - Madeira",
        [256] = "Malta",
        [257] = "Norway",
        [258] = "Norway",
        [259] = "Norway",
        [261] = "Poland",
        [262] = "Montenegro",
        [263] = "Portugal",
        [264] = "Romania",
        [265] = "Sweden",
        [266] = "Sweden",
        [267] = "Slovakia",
        [268] = "San Marino",
        [269] = "Switzerland",
        [270] = "Czech Republic",
        [271] = "Turkey",
        [272] = "Ukraine",
        [273] = "Russia",
        [274] = "North Macedonia",
        [275] = "Latvia",
        [276] = "Estonia",
        [277] = "Lithuania",
        [278] = "Slovenia",
        [279] = "Serbia",
        [301] = "Anguilla",
        [303] = "United States of America - Alaska",
        [304] = "Antigua and Barbuda",
        [305] = "Antigua and Barbuda",
        [306] = "Netherlands - Bonaire, Sint Eustatius and Saba",
        [307] = "Netherlands - Aruba",
        [308] = "Bahamas",
        [309] = "Bahamas",
        [310] = "Bermuda",
        [311] = "Bahamas",
        [312] = "Belize",
        [314] = "Barbados",
        [316] = "Canada",
        [319] = "Cayman Islands",
        [321] = "Costa Rica",
        [323] = "Cuba",
        [325] = "Dominica",
        [327] = "Dominican Republic",
        [329] = "France - Guadeloupe",
        [330] = "Grenada",
        [331] = "Denmark - Greenland",
        [332] = "Guatemala",
        [334] = "Honduras",
        [336] = "Haiti",
        [338] = "United States of America",
        [339] = "Jamaica",
        [341] = "Saint Kitts and Nevis",
        [343] = "Saint Lucia",
        [345] = "Mexico",
        [347] = "France - Martinique",
        [348] = "Montserrat",
        [350] = "Nicaragua",
        [351] = "Panama",
        [352] = "Panama",
        [353] = "Panama",
        [354] = "Panama",
        [355] = "Panama",
        [356] = "Panama",
        [357] = "Panama",
        [358] = "Puerto Rico",
        [359] = "El Salvador",
        [361] = "France - Saint Pierre and Miquelon",
        [362] = "Trinidad and Tobago",
        [364] = "Turks and Caicos Islands",
        [366] = "United States of America",
        [367] = "United States of America",
        [368] = "United States of America",
        [369] = "United States of America",
        [370] = "Panama",
        [371] = "Panama",
        [372] = "Panama",
        [373] = "Panama",
        [374] = "Panama",
        [375] = "Saint Vincent and the Grenadines",
        [376] = "Saint Vincent and the Grenadines",
        [377] = "Saint Vincent and the Grenadines",
        [378] = "British Virgin Islands",
        [379] = "United States Virgin Islands",
        [401] = "Afghanistan",
        [403] = "Saudi Arabia",
        [405] = "Bangladesh",
        [408] = "Bahrain",
        [410] = "Bhutan",
        [412] = "China",
        [413] = "China",
        [414] = "China",
        [416] = "China - Taiwan (Province of China)",
        [417] = "Sri Lanka",
        [419] = "India",
        [422] = "Iran",
        [423] = "Azerbaijan",
        [425] = "Iraq",
        [428] = "Israel",
        [431] = "Japan",
        [432] = "Japan",
        [434] = "Turkmenistan",
        [436] = "Kazakhstan",
        [437] = "Uzbekistan",
        [438] = "Jordan",
        [440] = "South Korea",
        [441] = "South Korea",
        [443] = "Palestine",
        [445] = "Democratic People's Republic of Korea",
        [447] = "Kuwait",
        [450] = "Lebanon",
        [451] = "Kyrgyzstan",
        [453] = "China - Macao (SAR)",
        [455] = "Maldives",
        [457] = "Mongolia",
        [459] = "Nepal",
        [461] = "Oman",
        [463] = "Pakistan",
        [466] = "Qatar",
        [468] = "Syrian Arab Republic",
        [470] = "United Arab Emirates",
        [471] = "United Arab Emirates",
        [472] = "Tajikistan",
        [473] = "Yemen",
        [475] = "Yemen",
        [477] = "China - Hong Kong (SAR)",
        [478] = "Bosnia and Herzegovina",
        [501] = "France - Adelie Land",
        [503] = "Australia",
        [506] = "Myanmar",
        [508] = "Brunei Darussalam",
        [510] = "Micronesia",
        [511] = "Palau",
        [512] = "New Zealand",
        [514] = "Cambodia",
        [515] = "Cambodia",
        [516] = "Australia - Christmas Island (Indian Ocean)",
        [518] = "New Zealand - Cook Islands",
        [520] = "Fiji",
        [523] = "Australia - Cocos (Keeling) Islands",
        [525] = "Indonesia",
        [529] = "Kiribati",
        [531] = "Laos",
        [533] = "Malaysia",
        [536] = "Northern Mariana Islands",
        [538] = "Marshall Islands",
        [540] = "France - New Caledonia",
        [542] = "New Zealand - Niue",
        [544] = "Nauru",
        [546] = "France - French Polynesia",
        [548] = "Philippines",
        [550] = "Timor-Leste",
        [553] = "Papua New Guinea",
        [555] = "Pitcairn Island",
        [557] = "Solomon Islands",
        [559] = "United States of America - American Samoa",
        [561] = "Samoa",
        [563] = "Singapore",
        [564] = "Singapore",
        [565] = "Singapore",
        [566] = "Singapore",
        [567] = "Thailand",
        [570] = "Tonga",
        [572] = "Tuvalu",
        [574] = "Vietnam",
        [576] = "Vanuatu",
        [577] = "Vanuatu",
        [578] = "France - Wallis and Futuna Islands",
        [601] = "South Africa",
        [603] = "Angola",
        [605] = "Algeria",
        [607] = "France - Saint Paul and Amsterdam Islands",
        [608] = "Ascension Island",
        [609] = "Burundi",
        [610] = "Benin",
        [611] = "Botswana",
        [612] = "Central African Republic",
        [613] = "Cameroon",
        [615] = "Congo",
        [616] = "Comoros",
        [617] = "Cabo Verde",
        [618] = "France - Crozet Archipelago",
        [619] = "Côte d'Ivoire",
        [620] = "Comoros",
        [621] = "Djibouti",
        [622] = "Egypt",
        [624] = "Ethiopia",
        [625] = "Eritrea",
        [626] = "Gabon",
        [627] = "Ghana",
        [629] = "Gambia",
        [630] = "Guinea-Bissau",
        [631] = "Equatorial Guinea",
        [632] = "Guinea",
        [633] = "Burkina Faso",
        [634] = "Kenya",
        [635] = "France - Kerguelen Islands",
        [636] = "Liberia",
        [637] = "Liberia",
        [638] = "South Sudan",
        [642] = "Libya",
        [644] = "Lesotho",
        [645] = "Mauritius",
        [647] = "Madagascar",
        [649] = "Mali",
        [650] = "Mozambique",
        [654] = "Mauritania",
        [655] = "Malawi",
        [656] = "Niger",
        [657] = "Nigeria",
        [659] = "Namibia",
        [660] = "France - Reunion",
        [661] = "Rwanda",
        [662] = "Sudan",
        [663] = "Senegal",
        [664] = "Seychelles",
        [665] = "Saint Helena",
        [666] = "Somalia",
        [667] = "Sierra Leone",
        [668] = "Sao Tome and Principe",
        [669] = "Eswatini",
        [670] = "Chad",
        [671] = "Togolese Republic",
        [672] = "Tunisia",
        [674] = "Tanzania",
        [675] = "Uganda",
        [676] = "Democratic Republic of the Congo",
        [677] = "Tanzania",
        [678] = "Zambia",
        [679] = "Zimbabwe",
        [701] = "Argentina",
        [710] = "Brazil",
        [720] = "Bolivia",
        [725] = "Chile",
        [730] = "Colombia",
        [735] = "Ecuador",
        [740] = "Falkland Islands",
        [745] = "France - Guiana",
        [750] = "Guyana",
        [755] = "Paraguay",
        [760] = "Peru",
        [765] = "Suriname",
        [770] = "Uruguay",
        [775] = "Venezuela",
    };

    public int? GetCountryCodeByMMSI(uint mmsi)
    {
        return GetCountryCodeByMMSIAndObjectType(mmsi, GetObjectTypeByMMSI(mmsi));
    }

    int? GetCountryCodeByMMSIAndObjectType(uint mmsi, ObjectType objectType)
    {
        string mmsiString = mmsi.ToString().PadLeft(9, '0');

        if (MidStartPositionByObjectType.ContainsKey(objectType))
        {
            return Int32.Parse(mmsiString.Substring(MidStartPositionByObjectType[objectType], 3));
        }

        return null;
    }

    bool ValidCountryCode(int countryCode)
    {
        return CountryDescriptionsByMid.ContainsKey(countryCode);
    }

    bool HasCountryInMMSI(ObjectType objectType)
    {
        ObjectType[] withCountry = new ObjectType[] { ObjectType.Ship, ObjectType.GroupsOfShips, ObjectType.BaseStations, ObjectType.SearchAndRescueAircraft, ObjectType.AidsToNavigation, ObjectType.CraftAssociatedWithParentShip, ObjectType.SearchAndRescueTransmitter };

        return withCountry.Contains(objectType);
    }

    public ObjectType GetObjectTypeByMMSI(uint mmsi)
    {
        ObjectType objectType;
        string mmsiString = mmsi.ToString().PadLeft(9, '0');

        if (mmsiString.StartsWith("974"))
        {
            objectType = ObjectType.EmergencyPositionIndicatingRadioBeacons;
        }
        else if (mmsiString.StartsWith("972"))
        {
            objectType = ObjectType.ManOverboard;
        }
        else if (mmsiString.StartsWith("970"))
        {
            objectType = ObjectType.SearchAndRescueTransmitter;
        }
        else if (mmsiString.StartsWith("111"))
        {
            objectType = ObjectType.SearchAndRescueAircraft;
        }
        else if (mmsiString.StartsWith("98"))
        {
            objectType = ObjectType.CraftAssociatedWithParentShip;
        }
        else if (mmsiString.StartsWith("99"))
        {
            objectType = ObjectType.AidsToNavigation;
        }
        else if (mmsiString.StartsWith("00"))
        {
            objectType = ObjectType.BaseStations;
        }
        else if (mmsiString.StartsWith("0"))
        {
            objectType = ObjectType.GroupsOfShips;
        }
        else
        {
            objectType = ObjectType.Ship;
        }

        if (HasCountryInMMSI(objectType))
        {
            var countryCode = GetCountryCodeByMMSIAndObjectType(mmsi, objectType);

            if (!countryCode.HasValue || !ValidCountryCode(countryCode.Value))
            {
                objectType = ObjectType.Unknown;
            }
        }

        return objectType;
    }
}
