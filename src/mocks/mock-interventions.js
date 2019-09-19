export function getDrugs() {
  return {
    terms: [
      {
        name: 'Fludarabine Phosphate',
        codes: ['C1102'],
        synonyms: ['Beneflur'],
        category: 'agent',
        count: 133,
      },
      {
        name: 'Quinone Compound',
        codes: ['C796'],
        synonyms: ['Benzoquinone Compound'],
        category: 'agent category',
        count: 23,
      },
      {
        name: 'Bendamustine',
        codes: ['C73261'],
        synonyms: [],
        category: 'agent',
        count: 21,
      },
      {
        name: 'Bendamustine Hydrochloride',
        codes: ['C61565'],
        synonyms: ['Bendeka', 'Levact', 'Ribomustin', 'Treanda'],
        category: 'agent',
        count: 13,
      },
      {
        name: '6,8-Bis(benzylthio)octanoic Acid',
        codes: ['C80039'],
        synonyms: ['Devimistat'],
        category: 'agent',
        count: 7,
      },
      {
        name: 'Benzodiazepine',
        codes: ['C1012'],
        synonyms: [],
        category: 'agent category',
        count: 3,
      },
      {
        name: 'PV-10',
        codes: ['C53412'],
        synonyms: ['Provecta', 'Rose Bengal Solution PV-10'],
        category: 'agent',
        count: 2,
      },
      {
        name: 'Belimumab',
        codes: ['C91385'],
        synonyms: ['Benlysta', 'LymphoStat-B'],
        category: 'agent',
        count: 1,
      },
      {
        name: 'Cianidanol',
        codes: ['C63654'],
        synonyms: [
          '(+)-Catechin',
          '(2R,3S)-2-(3,4-dihydroxyphenyl)chroman-3,5,7-triol',
          '(2R-trans)-2-(3,4-dihydroxyphenyl)-3,4-dihydro-2H-1-benzopyran-3,5,7-triol',
          'Catechin',
        ],
        category: 'agent category',
        count: 1,
      },
      {
        name: 'Diphenhydramine Hydrochloride',
        codes: ['C300'],
        synonyms: ['Benadryl', 'Bendylate', 'Eldadryl', 'SK-Diphenhydramine'],
        category: 'agent',
        count: 1,
      },
    ],
  };
}

export function getTreatments() {
  return {
    terms: [
      {
        name: 'Fluorine F-18 6-Fluorodopamine',
        codes: ['C91706'],
        synonyms: [
          '1,2-Benzenediol, 4-(2-Aminoethyl)-5-(fluoro-18F)-',
          '18F-DA',
          '18F-fluorodopamine',
          '3,4-Dihydroxy-6-fluorophenethylamine F-18',
          '6-(18F)-Fluorodopamine',
          '6-Fluorodopamine F-18',
          '[18F]-6F-DA',
          '[18F]-6F-dopamine',
        ],
        category: 'other',
        count: 1,
      },
      {
        name: 'meta-Fluorine F 18 Fluorobenzylguanidine',
        codes: ['C120311'],
        synonyms: [
          '18F meta-Fluoro Benzylguanidine',
          '18F-MFBG',
          '[(18)F]-MFBG',
          'meta-[(18)F]-Fluorobenzylguanidine',
        ],
        category: 'other',
        count: 1,
      },
    ],
  };
}
