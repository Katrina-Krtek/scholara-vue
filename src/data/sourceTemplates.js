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
    label: 'Article',
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
        placeholder: 'What is the stated research problem or ministry problem?',
      },
      {
        id: 'methodology',
        title: 'Methodology',
        placeholder: 'What methodology was used?',
      },
      {
        id: 'findings',
        title: 'Findings / Conclusions',
        placeholder: 'What did the author discover or conclude?',
      },
      {
        id: 'application',
        title: 'Application to My Work',
        placeholder: 'How does this help your own project or research?',
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

export function getSourceTemplate(type) {
  return SOURCE_TEMPLATES[type] || SOURCE_TEMPLATES[DEFAULT_SOURCE_TYPE]
}

export function createEmptyTemplateNotes(type) {
  const template = getSourceTemplate(type)

  return template.sections.reduce((notes, section) => {
    notes[section.id] = ''
    return notes
  }, {})
}