const serviceCodes = {
  "1688": "hn",
  "1xbet": "wj",
  "32red": "qi",
  "4Fun": "hk",
  "Adidas": "an",
  "Airbnb": "uk",
  "Airtel": "zl",
  "Alfa": "bt",
  "Alibaba": "ab",
  "AliExpress": "hx",
  "Alipay": "hw",
  "Amasia": "yo",
  "Amazon": "am",
  "AOL": "pm",
  "Apple": "wx",
  "avito": "av",
  "AVON": "ff",
  "Beanfun": "gr_bf",
  "bet365": "ie",
  "Betfair": "vd",
  "BigC": "zu",
  "BIGO LIVE": "bl",
  "Bilibili": "zs",
  "BitClout": "lt",
  "BlaBlaCar": "ua",
  "Blizzard": "bz",
  "Bolt": "tx",
  "Bumble": "mo",
  "Burger King": "ip",
  "Careem": "ls",
  "Chalkboard": "gr_rd",
  "CloudChat": "dd",
  "Coinbase": "re",
  "Craigslist": "wc",
  "Damejidlo": "ox",
  "Dana": "fr",
  "Deliveroo": "zk",
  "Dent": "zz",
  "Dhani": "os",
  "DiDi": "xk",
  "Discord": "ds",
  "dodopizza": "sd",
  "Douyu": "ak",
  "Dream11": "ve",
  "Drom": "hz",
  "Dundle": "fi",
  "EasyPay": "rz",
  "eBay": "dh",
  "Ebay-kleinanzeigen": "gr_dh",
  "facebook": "fb",
  "Feeld": "se",
  "Fiverr": "cn",
  "Flowwow": "gr_fw",
  "Foodpanda": "nz",
  "Fruitz": "mv",
  "Ftx": "gr_fx",
  "Gemgala": "cg",
  "Getcontact": "gr_gc",
  "Getir": "ul",
  "Gett": "gt",
  "GiraBank": "jd",
  "GoFundMe": "bp",
  "Gojek": "ni",
  "Google,youtube,Gmail": "go",
  "GoogleVoice": "gf",
  "Gorillas": "gr_gs",
  "Gorodsreda": "gr_ed",
  "Grindr": "yw",
  "GroupMe": "xs",
  "Hepsiburadacom": "gx",
  "Hermes": "en",
  "Hezzl": "ss",
  "Hinge": "vz",
  "Hirect": "ks",
  "Hopi": "jl",
  "Humble bundle": "gr_hb",
  "IFood": "pd",
  "Imo": "im",
  "IMO messager": "gr_im",
  "Indomaret": "ju",
  "Instagram": "ig",
  "Kaggle": "zo",
  "KakaoTalk": "kt",
  "KazanExpress": "ol",
  "Keybase": "bf",
  "KFC": "fz",
  "KuCoinPlay": "sq",
  "Kwai": "vp",
  "Lamoda": "sb",
  "Lazada": "dl",
  "Leboncoin": "do",
  "LightChat": "xf",
  "LikeCentre": "gr_lc",
  "Line messenger": "me",
  "LinkedIN": "tn",
  "Lyft": "tu",
  "Mail.ru": "ma",
  "Mailru Group": "lb",
  "Mamba, MeetMe": "fd",
  "McDonalds": "ry",
  "Megogo": "lv",
  "Mercari": "dg",
  "Metro": "bv",
  "Michat": "mc",
  "Microsoft": "mm",
  "MIXMART": "bg",
  "MIYACHAT": "gy",
  "Monese": "py",
  "MonobankIndia": "bu",
  "MTS CashBack": "da",
  "myGLO": "ae",
  "Naver": "nv",
  "Netflix": "nf",
  "Nike": "ew",
  "OkCupid": "vm",
  "Olacabs": "ly",
  "OLX": "sn",
  "OpenAI": "dr",
  "OVO": "xh",
  "OZON": "sg",
  "PagSmile": "gg",
  "Papara": "zr",
  "Parkplus": "wo",
  "ParlayPlay": "gr_pp",
  "PayPal": "ts",
  "Paysafecard": "jq",
  "Perfluence": "at",
  "PGbonus": "fx",
  "Picpay": "ev",
  "PingCode": "ro",
  "pof.com": "pf",
  "Poshmark": "oz",
  "premium.one": "po",
  "Prom": "cm",
  "ProtonMail": "dp",
  "Q12 Trivia": "vf",
  "Quipp": "cc",
  "Rediffmail": "co",
  "Remit": "gr_re",
  "Revolut": "ij",
  "RRSA": "mn",
  "RummyLoot": "fl",
  "Samsung": "gs",
  "Seosprint": "vv",
  "Shopee": "ka",
  "Signal": "gr_sg",
  "Skout": "wg",
  "SneakersnStuff": "sf",
  "Steam": "mt",
  "Stormgain": "vj",
  "Subito": "lc",
  "TanTan": "wh",
  "Taobao": "qd",
  "TeenPattiStarpro": "ih",
  "Telegram": "tg",
  "Tencent QQ": "qq",
  "TikTok/Douyin": "lf",
  "Tilda": "gr_tl",
  "Tinder": "oi",
  "Tokopedia": "xd",
  "TradeUP": "bs",
  "TradingView": "gc",
  "Trendyol": "pr",
  "Truecaller": "tl",
  "TurkiyePetrolleri": "jt",
  "Twitch": "hb",
  "Twitter": "tw",
  "Uber": "ub",
  "Uklon": "cp",
  "Uplay": "hh",
  "Urent": "of",
  "Venmo": "yy",
  "Viber": "vi",
  "Vinted": "kc",
  "Voggt": "sc",
  "WeChat": "wb",
  "Weibo": "kf",
  "Whatsapp": "wa",
  "Whoosh": "qj",
  "Wildberries": "uu",
  "Winmasters": "mp",
  "Wolt": "rr",
  "X5ID": "bd",
  "Yahoo": "mb",
  "Yalla": "yl",
  "Yemeksepeti": "yi",
  "Zalo": "mj",
  "Zolushka": "mz",
  "Zomato": "dy",
  "Zupee": "mi",
  "Ашан (Ashan)": "st",
  "Верный (Vernyy)": "nb",
  "Вконтакте (Vk.com, Vkontakte)": "vk",
  "ВкусВилл (VkusVill)": "sh",
  "ДругВокруг (DrugVokrug)": "we",
  "Другой (Any Other)": "ot",
  "Лента (Lenta)": "gr_lt",
  "Магнит (Magnit)": "mg",
  "Одноклассники (OK.ru, Odnoklassniki)": "ok",
  "Самокат (Samokat)": "jr",
  "СберМаркет (SberMarket)": "xj",
  "СберМегаМаркет (SberMegaMarket)": "be",
  "СберЧаевые (SberChayevye)": "gr_sber",
  "СпортМастер (SportMaster)": "yk",
  "Юла (Yula)": "ym",
  "Яндекс (Yandex)": "ya",
  "米画师Mihuashi": "yd"
}


const majorServices = [
  "Whatsapp",
  "Telegram",
  "Fiverr",
  "Facebook",
  "Instagram",
  "Twitter",
  "Twitch",
  "Google",
  "Yahoo",
]
module.exports = {
  serviceCodes,
  majorServices
};