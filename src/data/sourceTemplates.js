export const SOURCE_TEMPLATES = {
  book: {
    label: 'Book',
    sections: [
      {
        id: 'overview',
        title: 'Book Overview',
        placeholder: 'What is the book about? What is the author’s main argument?',
      },
      {
        id: 'chapterNotes',
        title: 'Chapter Notes',
        placeholder: 'Add notes by chapter: Chapter 1, Chapter 2, Chapter 3...',
      },
      {
        id: 'keyQuotes',
        title: 'Key Quotes',
        placeholder: 'Paste important quotes with page numbers.',
      },
      {
        id: 'themes',
        title: 'Major Themes',
        placeholder: 'List recurring ideas, theological themes, arguments, or concepts.',
      },
      {
        id: 'reflection',
        title: 'Reflection / Evaluation',
        placeholder: 'How useful is this source? Where do you agree or disagree?',
      },
    ],
  },

  article: {
    label: 'Journal Article',
    sections: [
      {
        id: 'abstract',
        title: 'Abstract / Summary',
        placeholder: 'Summarize the article in your own words.',
      },
      {
        id: 'sectionNotes',
        title: 'Section Notes',
        placeholder: 'Add notes by section, heading, or argument movement.',
      },
      {
        id: 'methodology',
        title: 'Methodology',
        placeholder: 'What method, evidence, or framework does the author use?',
      },
      {
        id: 'keyQuotes',
        title: 'Key Quotes',
        placeholder: 'Paste important quotes with page numbers.',
      },
      {
        id: 'useForWriting',
        title: 'How I Might Use This',
        placeholder: 'Explain where this could fit in a paper, project, or literature review.',
      },
    ],
  },

  dissertation: {
    label: 'Dissertation',
    sections: [
      {
        id: 'overview',
        title: 'Dissertation Overview',
        placeholder: 'What problem does this dissertation address?',
      },
      {
        id: 'chapterOutline',
        title: 'Chapter Outline',
        placeholder: 'Summarize each chapter.',
      },
      {
        id: 'researchProblem',
        title: 'Research Problem',
        placeholder: 'What is the stated research or ministry problem?',
      },
      {
        id: 'researchQuestions',
        title: 'Research Questions',
        placeholder: 'List the primary and secondary research questions.',
      },
      {
        id: 'methodology',
        title: 'Methodology',
        placeholder: 'What methodology, participants, instruments, or procedures were used?',
      },
      {
        id: 'findings',
        title: 'Findings / Conclusions',
        placeholder: 'What did the author discover or conclude?',
      },
      {
        id: 'limitations',
        title: 'Limitations',
        placeholder: 'What limitations or cautions does the author identify?',
      },
      {
        id: 'application',
        title: 'Application to My Work',
        placeholder: 'How does this help your own project or research?',
      },
    ],
  },

  thesis: {
    label: 'Thesis',
    sections: [
      {
        id: 'overview',
        title: 'Thesis Overview',
        placeholder: 'What topic, problem, or question does this thesis address?',
      },
      {
        id: 'chapterOutline',
        title: 'Chapter Outline',
        placeholder: 'Summarize each chapter or major section.',
      },
      {
        id: 'researchQuestion',
        title: 'Research Question',
        placeholder: 'What central question or claim guides the thesis?',
      },
      {
        id: 'methodology',
        title: 'Methodology',
        placeholder: 'What research method, evidence, or framework was used?',
      },
      {
        id: 'findings',
        title: 'Findings / Conclusions',
        placeholder: 'What does the author conclude?',
      },
      {
        id: 'limitations',
        title: 'Limitations',
        placeholder: 'What limits the argument, evidence, or application?',
      },
      {
        id: 'application',
        title: 'Application to My Work',
        placeholder: 'How might this thesis support your own research or writing?',
      },
    ],
  },

  website: {
    label: 'Website',
    sections: [
      {
        id: 'summary',
        title: 'Website Summary',
        placeholder: 'What information does this page provide?',
      },
      {
        id: 'credibility',
        title: 'Credibility Check',
        placeholder: 'Who published this? Is it reliable? Is it current?',
      },
      {
        id: 'usefulInfo',
        title: 'Useful Information',
        placeholder: 'Save facts, definitions, statistics, or explanations.',
      },
      {
        id: 'citationNotes',
        title: 'Citation Notes',
        placeholder: 'Date accessed, author, organization, URL notes.',
      },
    ],
  },

  sermon: {
    label: 'Sermon',
    sections: [
      {
        id: 'sermonOverview',
        title: 'Sermon Overview',
        placeholder: 'Summarize the sermon’s main message.',
      },
      {
        id: 'scripture',
        title: 'Scripture Passage',
        placeholder: 'What biblical text is being preached?',
      },
      {
        id: 'outline',
        title: 'Sermon Outline',
        placeholder: 'Main points, movements, illustrations, and applications.',
      },
      {
        id: 'quotes',
        title: 'Memorable Quotes',
        placeholder: 'Save important phrases or illustrations.',
      },
      {
        id: 'application',
        title: 'Application / Reflection',
        placeholder: 'How does this sermon connect to theology, formation, or ministry?',
      },
    ],
  },
}

export const DEFAULT_SOURCE_TYPE = 'book'

const TEMPLATE_ALIASES = {
  book: 'book',
  article: 'article',
  'journal article': 'article',
  'journal-article': 'article',
  dissertation: 'dissertation',
  thesis: 'thesis',
  website: 'website',
  webpage: 'website',
  sermon: 'sermon',
  video: 'website',
  podcast: 'sermon',
}

const TEMPLATE_TYPE_LABELS = {
  book: 'Book',
  article: 'Journal Article',
  dissertation: 'Dissertation',
  thesis: 'Thesis',
  website: 'Website',
  sermon: 'Sermon',
}

export function normalizeSourceTemplateKey(type) {
  const normalized = String(type || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')

  return TEMPLATE_ALIASES[normalized] || DEFAULT_SOURCE_TYPE
}

export function getSourceTypeLabel(type) {
  const templateKey = normalizeSourceTemplateKey(type)

  return TEMPLATE_TYPE_LABELS[templateKey] || 'Book'
}

export function getSourceTemplate(type) {
  const templateKey = normalizeSourceTemplateKey(type)

  return SOURCE_TEMPLATES[templateKey] || SOURCE_TEMPLATES[DEFAULT_SOURCE_TYPE]
}

export function createEmptyTemplateNotes(type, existingNotes = {}) {
  const template = getSourceTemplate(type)

  return template.sections.reduce((notes, section) => {
    notes[section.id] = String(existingNotes?.[section.id] || '')
    return notes
  }, {})
}

