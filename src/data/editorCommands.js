export const editorCommands = [
  // Core text blocks
  { id: 'insert.text', label: 'Text', slash: '/text', aliases: ['/paragraph'], category: 'Basic', status: 'active', blockType: 'text' },
  { id: 'insert.heading1', label: 'Heading 1', slash: '/h1', aliases: ['/heading 1'], category: 'Basic', status: 'active', blockType: 'heading1' },
  { id: 'insert.heading2', label: 'Heading 2', slash: '/h2', aliases: ['/heading 2'], category: 'Basic', status: 'active', blockType: 'heading2' },
  { id: 'insert.heading3', label: 'Heading 3', slash: '/h3', aliases: ['/heading 3'], category: 'Basic', status: 'active', blockType: 'heading3' },
  { id: 'insert.bullet', label: 'Bullet List', slash: '/bullet', aliases: ['/bullets'], category: 'Basic', status: 'active', blockType: 'bullet' },
  { id: 'insert.numbered', label: 'Numbered List', slash: '/numbered', aliases: ['/numbered list'], category: 'Basic', status: 'active', blockType: 'numbered' },
  { id: 'insert.checklist', label: 'Checklist', slash: '/checklist', aliases: ['/todo'], category: 'Basic', status: 'active', blockType: 'checklist' },
  { id: 'insert.toggle', label: 'Toggle', slash: '/toggle', aliases: ['/toggle list'], category: 'Basic', status: 'active', blockType: 'toggle' },
  { id: 'insert.quote', label: 'Quote', slash: '/quote', aliases: ['/blockquote'], category: 'Basic', status: 'active', blockType: 'quote' },
  { id: 'insert.callout', label: 'Callout', slash: '/callout', aliases: ['/callout box'], category: 'Basic', status: 'active', blockType: 'callout' },
  { id: 'insert.divider', label: 'Divider', slash: '/divider', aliases: ['/hr'], category: 'Basic', status: 'active', blockType: 'divider' },
  { id: 'insert.code', label: 'Code Block', slash: '/code', aliases: ['/code block'], category: 'Basic', status: 'active', blockType: 'code' },

  // Academic blocks
  { id: 'academic.citation', label: 'Citation', slash: '/citation', aliases: ['/cite'], category: 'Academic', status: 'active', blockType: 'citation' },
  { id: 'academic.footnote', label: 'Footnote', slash: '/footnote', aliases: ['/fn'], category: 'Academic', status: 'active', blockType: 'footnote' },
  { id: 'academic.definition', label: 'Definition', slash: '/definition', aliases: ['/define'], category: 'Academic', status: 'active', blockType: 'definition' },
  { id: 'academic.question', label: 'Research Question', slash: '/question', aliases: ['/research question'], category: 'Academic', status: 'active', blockType: 'question' },
  { id: 'academic.claim', label: 'Claim', slash: '/claim', aliases: ['/argument claim'], category: 'Academic', status: 'active', blockType: 'claim' },
  { id: 'academic.term', label: 'Term', slash: '/term', aliases: ['/vocabulary'], category: 'Academic', status: 'active', blockType: 'term' },
  { id: 'academic.summary', label: 'Summary', slash: '/summary', aliases: ['/summarize note'], category: 'Academic', status: 'active', blockType: 'summary' },

  // Media / embeds
  { id: 'insert.image', label: 'Image', slash: '/image', aliases: ['/img'], category: 'Media', status: 'planned', blockType: 'image' },
  { id: 'insert.file', label: 'File', slash: '/file', aliases: ['/attachment'], category: 'Media', status: 'planned', blockType: 'file' },
  { id: 'insert.pdf', label: 'PDF', slash: '/pdf', aliases: ['/PDF'], category: 'Media', status: 'planned', blockType: 'pdf' },
  { id: 'insert.video', label: 'Video', slash: '/video', aliases: ['/media'], category: 'Media', status: 'planned', blockType: 'video' },
  { id: 'insert.embed', label: 'Embed', slash: '/embed', aliases: ['/embed url'], category: 'Media', status: 'planned', blockType: 'embed' },
  { id: 'insert.bookmark', label: 'Bookmark', slash: '/bookmark', aliases: ['/link preview'], category: 'Media', status: 'planned', blockType: 'bookmark' },

  // Structure
  { id: 'insert.table', label: 'Table', slash: '/table', aliases: ['/database table'], category: 'Structure', status: 'planned', blockType: 'table' },
  { id: 'insert.columns', label: 'Columns', slash: '/columns', aliases: ['/column layout'], category: 'Structure', status: 'planned', blockType: 'columns' },
  { id: 'insert.equation', label: 'Equation', slash: '/equation', aliases: ['/math'], category: 'Structure', status: 'planned', blockType: 'equation' },
  { id: 'insert.toc', label: 'Table of Contents', slash: '/toc', aliases: ['/table of contents'], category: 'Structure', status: 'planned', blockType: 'toc' },

  // Objects
  { id: 'create.book', label: 'Book Source', slash: '/book', aliases: ['/create book', '/add book'], category: 'Create', status: 'planned', objectType: 'book' },
  { id: 'create.article', label: 'Article Source', slash: '/article', aliases: ['/create article'], category: 'Create', status: 'planned', objectType: 'article' },
  { id: 'create.note', label: 'Note', slash: '/note', aliases: ['/create note'], category: 'Create', status: 'planned', objectType: 'note' },
  { id: 'create.assignment', label: 'Assignment', slash: '/assignment', aliases: ['/create assignment'], category: 'Create', status: 'planned', objectType: 'assignment' },
  { id: 'create.concept', label: 'Concept', slash: '/concept', aliases: ['/idea'], category: 'Create', status: 'planned', objectType: 'concept' },
  { id: 'create.person', label: 'Person', slash: '/person', aliases: ['/author'], category: 'Create', status: 'planned', objectType: 'person' },

  // Links / references
  { id: 'reference.link', label: 'Link', slash: '/link', aliases: ['/add link'], category: 'Reference', status: 'planned', blockType: 'link' },
  { id: 'reference.mention', label: 'Mention', slash: '/mention', aliases: ['@'], category: 'Reference', status: 'planned', blockType: 'mention' },
  { id: 'reference.related', label: 'Related Items', slash: '/related', aliases: ['/related items'], category: 'Reference', status: 'planned', blockType: 'relatedItems' },
  { id: 'reference.backlink', label: 'Backlinks', slash: '/backlinks', aliases: ['/show backlinks'], category: 'Reference', status: 'planned', blockType: 'backlinks' },

  // AI
  { id: 'ai.summarize', label: 'AI Summarize', slash: '/ai summarize', aliases: ['/summarize'], category: 'AI', status: 'planned', action: 'aiSummarize' },
  { id: 'ai.extractTopics', label: 'AI Extract Topics', slash: '/ai topics', aliases: ['/extract topics'], category: 'AI', status: 'planned', action: 'aiExtractTopics' },
  { id: 'ai.extractTasks', label: 'AI Extract Tasks', slash: '/ai tasks', aliases: ['/extract tasks'], category: 'AI', status: 'planned', action: 'aiExtractTasks' },
  { id: 'ai.createCitation', label: 'AI Create Citation', slash: '/ai citation', aliases: ['/create citation'], category: 'AI', status: 'planned', action: 'aiCreateCitation' }
]

export function getActiveEditorCommands() {
  return editorCommands.filter((command) => command.status === 'active')
}

export function searchEditorCommands(query = '') {
  const q = query.toLowerCase().trim()

  if (!q) return editorCommands

  return editorCommands.filter((command) => {
    const searchable = [
      command.id,
      command.label,
      command.slash,
      command.category,
      command.blockType,
      command.objectType,
      command.action,
      ...(command.aliases || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(q)
  })
}

export function getCommandByBlockType(blockType) {
  return editorCommands.find((command) => command.blockType === blockType)
}