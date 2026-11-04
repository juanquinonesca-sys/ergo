// Vancouver (ICMJE) manuscript layout for Érgo.
//
// - Page: 2.5 cm margins, page number top right from the title page on.
// - Text: double spaced, left aligned, no first-line indent.
// - Headings: bold and unnumbered (Introduction, Methods, Results, Discussion).
// - References: citation-sequence numbering in brackets ("vancouver" CSL).
//
// Project page-layout settings are applied after this show rule, so they
// override these defaults when the user picks them.

#let double-spacing = 1.5em

#let terms = (
  es: (
    abstract: "Resumen",
    objective: "Objetivo",
    methods: "Métodos",
    results: "Resultados",
    conclusions: "Conclusiones",
    keywords: "Palabras clave",
    running-title: "Título corto",
    corresponding-author: "Autor de correspondencia",
    word-count: "Recuento de palabras",
  ),
  en: (
    abstract: "Abstract",
    objective: "Objective",
    methods: "Methods",
    results: "Results",
    conclusions: "Conclusions",
    keywords: "Keywords",
    running-title: "Running title",
    corresponding-author: "Corresponding author",
    word-count: "Word count",
  ),
)

#let term(key) = terms.at(text.lang, default: terms.en).at(key)

#let is-empty(value) = (
  value == none or value == [] or value == "" or (type(value) == array and value.len() == 0)
)

#let vancouver-style(font-size: 12pt, body) = {
  set text(size: font-size)
  set page(
    paper: "us-letter",
    margin: 2.5cm,
    numbering: "1",
    number-align: top + right,
  )
  set par(
    leading: double-spacing,
    spacing: double-spacing,
    first-line-indent: 0pt,
    justify: false,
  )

  set heading(numbering: none)
  show heading: set text(size: font-size, weight: "bold")
  show heading: set block(above: double-spacing * 1.5, below: double-spacing)

  show figure.where(kind: table): set figure.caption(position: top)
  show figure.caption: set par(first-line-indent: 0pt)
  set math.equation(numbering: "(1)")

  set bibliography(style: "vancouver")

  body
}

// Authors with superscript affiliation numbers, then the numbered affiliations.
#let print-authors(authors, affiliations) = {
  if is-empty(authors) { return }
  let names = authors.map(author => {
    if type(author) == dictionary {
      let keys = author.at("affiliations", default: ())
      [#author.name#if not is-empty(keys) { super(keys.join(",")) }]
    } else {
      [#author]
    }
  })
  par(names.join(", "))
  if type(affiliations) == dictionary and affiliations.len() > 0 {
    set text(size: 0.9em)
    for (key, name) in affiliations {
      par[#super(key) #name]
    }
  }
}

#let title-page(
  authors: none,
  affiliations: none,
  running-title: none,
  corresponding-author: none,
  word-count: none,
) = context {
  set par(first-line-indent: 0pt)
  align(center)[
    #v(3em)
    #text(size: 1.3em, weight: "bold", std.title())
    #v(2em)
    #print-authors(authors, affiliations)
  ]
  v(2em)
  if not is-empty(running-title) {
    par[*#term("running-title"):* #running-title]
  }
  if not is-empty(corresponding-author) {
    par[*#term("corresponding-author"):* #corresponding-author]
  }
  if not is-empty(word-count) {
    par[*#term("word-count"):* #word-count]
  }
}

// Structured abstract (ICMJE): Objective, Methods, Results, Conclusions.
#let abstract-page(
  objective: none,
  methods: none,
  results: none,
  conclusions: none,
  keywords: none,
) = context {
  heading(level: 1, outlined: false, term("abstract"))
  for (key, value) in (
    ("objective", objective),
    ("methods", methods),
    ("results", results),
    ("conclusions", conclusions),
  ) {
    if not is-empty(value) {
      par[*#term(key):* #value]
    }
  }
  if not is-empty(keywords) {
    par[*#term("keywords"):* #keywords.join(", ")]
  }
}
