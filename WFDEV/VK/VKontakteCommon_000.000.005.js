var activities = {
	"postType": {
		"all": "0",
		"comments": "1",
		"shares": "2"
	},
	"orderBy": {
		"date": "0",
		"rating": "1"
	},
	"likes": {
		"all": "0",
		"over 10 likes": "10",
		"over 100 likes": "100",
		"over 1000 likes": "1000"
	}
}

var profiles = {
	"orderBy": {
		"by rating": "0",
		"by date registered": "1"
	},
	"sex": {
		"female": "1",
		"male": "2"
	},
	"countries": {
		"bulgaria": "39",
		"greece": "71",
		"serbia": "181",
		"romania": "165",
		"turkey": "200",
		"russia": "1",
		"ukraine": "2",
		"moldova": "15",
		"belarus": "3",
		"usa": "9",
		"germany": "65",
		"afghanistan": "30",
		"albania": "21",
		"algeria": "22",
		"american samoa": "23",
		"andorra": "26",
		"angola": "25",
		"anguilla": "24",
		"antigua and barbuda": "27",
		"argentina": "28",
		"armenia": "6",
		"aruba": "29",
		"australia": "19",
		"austria": "20",
		"azerbaijan": "5",
		"bahamas": "31",
		"bahrain": "34",
		"bangladesh": "32",
		"barbados": "33",
		"belgium": "36",
		"belize": "35",
		"benin": "37",
		"bermuda": "38",
		"bhutan": "47",
		"bolivia": "40",
		"bonaire, sint eustatius and saba": "235",
		"bosnia and herzegovina": "41",
		"botswana": "42",
		"brazil": "43",
		"british virgin islands": "52",
		"brunei darussalam": "44",
		"burkina faso": "45",
		"burundi": "46",
		"cote d`ivoire": "103",
		"cambodia": "91",
		"cameroon": "92",
		"canada": "10",
		"cape verde": "90",
		"cayman islands": "149",
		"central african republic": "213",
		"chad": "214",
		"chile": "216",
		"china": "97",
		"colombia": "98",
		"comoros": "99",
		"congo": "100",
		"congo, democratic republic": "101",
		"cook islands": "150",
		"costa rica": "102",
		"croatia": "212",
		"cuba": "104",
		"curacao": "138",
		"cyprus": "95",
		"czech republic": "215",
		"denmark": "73",
		"djibouti": "231",
		"dominica": "74",
		"dominican republic": "75",
		"east timor": "54",
		"ecuador": "221",
		"egypt": "76",
		"el salvador": "166",
		"equatorial guinea": "222",
		"eritrea": "223",
		"estonia": "14",
		"ethiopia": "224",
		"falkland islands": "208",
		"faroe islands": "204",
		"fiji": "205",
		"finland": "207",
		"france": "209",
		"french guiana": "210",
		"french polynesia": "211",
		"gabon": "56",
		"gambia": "59",
		"georgia": "7",
		"ghana": "60",
		"gibraltar": "66",
		"greenland": "70",
		"grenada": "69",
		"guadeloupe": "61",
		"guam": "72",
		"guatemala": "62",
		"guernsey": "236",
		"guinea": "63",
		"guinea-bissau": "64",
		"guyana": "58",
		"haiti": "57",
		"honduras": "67",
		"hong kong": "68",
		"hungary": "50",
		"iceland": "86",
		"india": "80",
		"indonesia": "81",
		"iran": "84",
		"iraq": "83",
		"ireland": "85",
		"isle of man": "147",
		"israel": "8",
		"italy": "88",
		"jamaica": "228",
		"japan": "229",
		"jersey": "237",
		"jordan": "82",
		"kazakhstan": "4",
		"kenya": "94",
		"kiribati": "96",
		"kuwait": "105",
		"kyrgyzstan": "11",
		"laos": "106",
		"latvia": "12",
		"lebanon": "109",
		"lesotho": "107",
		"liberia": "108",
		"libya": "110",
		"liechtenstein": "111",
		"lithuania": "13",
		"luxembourg": "112",
		"macau": "116",
		"macedonia": "117",
		"madagascar": "115",
		"malawi": "118",
		"malaysia": "119",
		"maldives": "121",
		"mali": "120",
		"malta": "122",
		"marshall islands": "125",
		"martinique": "124",
		"mauritania": "114",
		"mauritius": "113",
		"mexico": "126",
		"micronesia": "127",
		"monaco": "129",
		"mongolia": "130",
		"montenegro": "230",
		"montserrat": "131",
		"morocco": "123",
		"mozambique": "128",
		"myanmar": "132",
		"namibia": "133",
		"nauru": "134",
		"nepal": "135",
		"netherlands": "139",
		"new caledonia": "143",
		"new zealand": "142",
		"nicaragua": "140",
		"niger": "136",
		"nigeria": "137",
		"niue": "141",
		"norfolk island": "148",
		"north korea": "173",
		"northern mariana islands": "174",
		"norway": "144",
		"oman": "146",
		"pakistan": "152",
		"palau": "153",
		"palestine": "154",
		"panama": "155",
		"papua new guinea": "156",
		"paraguay": "157",
		"peru": "158",
		"philippines": "206",
		"pitcairn islands": "159",
		"poland": "160",
		"portugal": "161",
		"puerto rico": "162",
		"qatar": "93",
		"reunion": "163",
		"rwanda": "164",
		"sao tome and principe": "169",
		"saint helena": "172",
		"saint kitts and nevis": "178",
		"saint lucia": "179",
		"saint pierre and miquelon": "180",
		"saint vincent and the grenadines": "177",
		"samoa": "167",
		"san marino": "168",
		"saudi arabia": "170",
		"senegal": "176",
		"seychelles": "175",
		"sierra leone": "190",
		"singapore": "182",
		"sint maarten": "234",
		"slovakia": "184",
		"slovenia": "185",
		"solomon islands": "186",
		"somalia": "187",
		"south africa": "227",
		"south korea": "226",
		"south sudan": "232",
		"spain": "87",
		"sri lanka": "220",
		"sudan": "188",
		"suriname": "189",
		"svalbard and jan mayen": "219",
		"swaziland": "171",
		"sweden": "218",
		"switzerland": "217",
		"syria": "183",
		"taiwan": "192",
		"tajikistan": "16",
		"tanzania": "193",
		"thailand": "191",
		"togo": "194",
		"tokelau": "195",
		"tonga": "196",
		"trinidad and tobago": "197",
		"tunisia": "199",
		"turkmenistan": "17",
		"turks and caicos islands": "151",
		"tuvalu": "198",
		"us virgin islands": "53",
		"uganda": "201",
		"united arab emirates": "145",
		"united kingdom": "49",
		"uruguay": "203",
		"uzbekistan": "18",
		"vanuatu": "48",
		"vatican": "233",
		"venezuela": "51",
		"vietnam": "55",
		"wallis and futuna": "202",
		"western sahara": "78",
		"yemen": "89",
		"zambia": "77",
		"zimbabwe": "79"
	}
}

function buildQueryString(input) {
	try {
		if (input.searchTerm) {
			Logger.debug("We will collect news");
            //keyword = input.searchTerm;
            keyword = encodeURIComponent(input.searchTerm); //VAL
			var searchUrl = "https://vk.com/search?c[q]=" + keyword + "&c[section]=statuses";




			if (keyword.toLowerCase() === "ignore") {
				searchUrl = "https://vk.com/search?c[section]=statuses";
			}

			if (input.orderBy) {
				var orderBy = "&c[sort]=" + input.orderBy;
				searchUrl += orderBy;
			}
			if (input.postType) {
				var postType = "&c[type]=" + input.postType;
				searchUrl += postType;
			}
			if (input.viralSkale) {
				var viralSkale = "&c[likes]=" + input.viralSkale;
				searchUrl += viralSkale;
			}
			if (input.excludeWords) {
				var excludeWords = "&c[exclude]=" + input.excludeWords;
				searchUrl += excludeWords;
			}
			if (input.contentMentions) {
				var contentMentions = "&c[content]=" + input.contentMentions;
				searchUrl += contentMentions;
			}
			if (input.linkMentions) {
				var linkMentions = "&c[url]=" + input.linkMentions;
				searchUrl += linkMentions;
			}
			Logger.production("URL for the search is: " + searchUrl);
		} else if (input.searchName) {
			Logger.debug("We will collect profiles");
			keyword = encodeURIComponent(input.searchName); //VAL
			var searchUrl = "https://vk.com/search?c[name]=1&c[q]=" + keyword + "&c[section]=people";

			if (keyword.toLowerCase() === "ignore") {
				searchUrl = "https://vk.com/search?c[name]=1&c[section]=people";
			}

			if (input.searchResultsOrder) {
				var searchResultsOrder = "&c[sort]=" + input.searchResultsOrder;
				searchUrl += searchResultsOrder;
			}
			if (input.country) {
				var region = "&c[country]=" + input.country;
				searchUrl += region;
			}
			if (input.sex) {
				var sex = "&c[sex]=" + input.sex;
				searchUrl += sex;
			}
			if (input.companyName) {
				var companyName = "&c[company]=" + input.companyName;
				searchUrl += companyName;
			}
			if (input.companyPosition) {
				var position = "&c[position]=" + input.companyPosition;
				searchUrl += position;
			}
			if (input.militaryServiceCountry) {
				var militaryCountry = "&c[mil_country]=" + input.militaryServiceCountry;
				searchUrl += militaryCountry;
			}
			if (input.militaryServiceStartYear) {
				var militaryYear = "&c[mil_year_from]=" + input.militaryServiceStartYear;
				searchUrl += militaryYear;
			}
			if (input.fromAge) {
				var fromAge = "&c[age_from]=" + input.fromAge;
				searchUrl += fromAge;
			}
			if (input.toAge) {
				var toAge = "&c[age_to]=" + input.toAge;
				searchUrl += toAge;
			}
			Logger.debug("URL for the search is: " + searchUrl);
		}
		Logger.production("<VAL-1> " + searchUrl);
		
		return searchUrl;
		
	} catch (e) {
		Logger.failure(e.message);
	}
}