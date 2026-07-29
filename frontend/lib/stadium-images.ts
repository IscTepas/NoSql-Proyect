const FIFA_2018_IMAGES: Record<string, string> = {
  "Kaliningrad Stadium": "https://digitalhub.fifa.com/m/2c0891f205af576e/original/rix1w71xsds8ggivexte-jpg.jpg",
  "Luzhniki Stadium": "https://digitalhub.fifa.com/m/5573240bd46abe65/original/pftmtv1af01zk9mb2cbq-jpg.jpg",
  "Otkritie Arena (Spartak Stadium)": "https://digitalhub.fifa.com/m/5d4371bf7bfd407c/original/quipk2r49dopzobu5qmf-jpg.jpg",
  "Krestovsky Stadium (Saint Petersburg Stadium)": "https://digitalhub.fifa.com/m/4949b141b50de218/original/rbi3zm8at7ed26t1ajen-jpg.jpg",
  "Fisht Olympic Stadium (Fisht Stadium)": "https://digitalhub.fifa.com/m/15b79b2d13b946b9/original/rkj3vzqijgxjuky3clrc-jpg.jpg",
  "Volgograd Arena": "https://digitalhub.fifa.com/m/896dc18233fb233/original/smc6azgrjefm6zmk4zpy-jpg.jpg",
  "Rostov Arena": "https://digitalhub.fifa.com/m/54d93ae0c36de090/original/ejcgpmvkhlabpbzh4zzm-jpg.jpg",
  "Nizhny Novgorod Stadium": "https://digitalhub.fifa.com/m/6dda88a440083842/original/hbr8aasvibqlfnhghrwg-jpg.jpg",
  "Kazan Arena": "https://digitalhub.fifa.com/m/1c4229e6a0ab37fc/original/yeluy55yjhco9alfcemn-jpg.jpg",
  "Mordovia Arena": "https://digitalhub.fifa.com/m/2ab172335c8cad5f/original/mvkxgpsftcjphn7g3wdf-jpg.jpg",
  "Samara Arena": "https://digitalhub.fifa.com/m/3e679593221f92ba/original/kwywtjlmwtijzcdzj86b-jpg.jpg",
  "Central Stadium (Ekaterinburg Arena)": "https://digitalhub.fifa.com/m/20fea0c1cc99a4db/original/v6lygaritrhonfe0wsoi-jpg.jpg",
};

const WIKIPEDIA_TITLES: Record<string, string> = {
  "Estádio do Maracanã": "Maracanã Stadium",
  "Estádio Nacional (Mané Garrincha)": "Estádio Nacional Mané Garrincha",
  "Arena Corinthians": "Arena Corinthians",
  "Estádio Castelão": "Castelão (stadium)",
  "Estádio Mineirão": "Mineirão",
  "Arena Fonte Nova": "Itaipava Arena Fonte Nova",
  "Estádio Beira-Rio": "Estádio Beira-Rio",
  "Arena Pernambuco": "Arena Pernambuco",
  "Arena das Dunas": "Arena das Dunas",
  "Arena da Baixada": "Arena da Baixada",
  "Arena Pantanal": "Arena Pantanal",
  "Arena da Amazônia": "Arena da Amazônia",
  "Ahmad bin Ali Stadium": "Ahmad bin Ali Stadium",
  "Stadium 974": "Stadium 974",
  "BMO Field": "BMO Field",
  "AT&T Stadium": "AT&T Stadium",
};

export function getOfficialStadiumImage(year: number, stadiumName: string): string | null {
  return year === 2018 ? FIFA_2018_IMAGES[stadiumName] || null : null;
}

export function getWikipediaStadiumTitle(stadiumName: string): string {
  return WIKIPEDIA_TITLES[stadiumName] || stadiumName;
}
