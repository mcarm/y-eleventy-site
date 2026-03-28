import { useState, useCallback } from 'react'
import { marked } from 'marked'
import './App.css'
import { useResizablePanel } from './hooks/useResizablePanel'
import { useAI, AIAction } from './hooks/useAI'
import { ResumeStyle, CustomTemplate, TemplateInfo, BUILT_IN_TEMPLATES, DEFAULT_STYLE, TemplateType } from './types'
import Dashboard from './components/Dashboard'

type AppView = 'dashboard' | 'editor'

const DEFAULT_MARKDOWN = `# James Smith

**Location:** Chicago, IL
**Phone:** (555) 234-5678
**Email:** robert.anderson@example.com
**LinkedIn:** [linkedin.com/in/robertanderson](https://linkedin.com/in/robertanderson)

## Summary

Results-driven Project Manager with over 10 years of experience in leading cross-functional teams to deliver complex projects on time and within budget. Skilled in Agile and Waterfall methodologies, with a strong focus on stakeholder management, risk assessment, and process improvement. Adept at using project management tools to streamline workflows and enhance productivity.

## Skills

- **Project Management:** Agile, Scrum, Waterfall, Kanban
- **Tools:** Jira, Trello, Asana, MS Project, Smartsheet
- **Methodologies:** PMP, PRINCE2, Lean Six Sigma
- **Communication:** Stakeholder Management, Conflict Resolution, Team Leadership
- **Budget Management:** Cost Estimation, Financial Reporting, Resource Allocation
- **Risk Management:** Risk Identification, Mitigation Strategies, Contingency Planning

## Professional Experience

### Senior Project Manager
**Tech Innovators Inc.** — Chicago, IL
*May 2016 – Present*

1. Led a team of 15 in the successful delivery of multiple high-profile projects, achieving a 95% on-time delivery rate.
1. Implemented Agile methodologies across the organization, resulting in a 30% increase in team productivity and a 20% reduction in project delivery times.
1. Managed project budgets totaling over $10 million, ensuring projects were delivered within budget and with optimal resource utilization.
1. Conducted regular risk assessments and developed mitigation plans, reducing project risks by 40%.
1. Fostered strong relationships with stakeholders, enhancing communication and ensuring alignment with project goals and objectives.

### Project Manager
**Global Solutions Ltd.** — New York, NY
*June 2012 – April 2016*

1. Coordinated and managed over 20 projects simultaneously, ranging from software development to infrastructure upgrades.
1. Streamlined project processes, introducing new tools and techniques that improved efficiency by 25%.
1. Delivered projects with budgets up to $2 million, consistently meeting or exceeding financial targets.
1. Developed comprehensive project plans, including timelines, milestones, and resource allocation, ensuring clear guidance for project teams.
1. Facilitated cross-functional team collaboration, enhancing communication and ensuring successful project outcomes.

### Assistant Project Manager
**NextGen Technologies** — Boston, MA
*July 2009 – May 2012*

1. Assisted in managing software development projects, ensuring they were completed on time and within budget.
1. Coordinated project activities and resources, maintaining detailed project documentation and status reports.
1. Supported the implementation of project management tools, improving tracking and reporting capabilities.
1. Assisted in risk management activities, identifying potential issues and developing mitigation strategies.
1. Contributed to process improvement initiatives, enhancing project workflows and increasing team productivity.

## Education

**Master of Business Administration (MBA)** Harvard Business School — Boston, MA
*Graduated: May 2009*

**Bachelor of Science in Computer Science** University of Illinois at Urbana-Champaign
*Graduated: May 2007*
`

type TabType = 'markdown' | 'style' | 'ai'

function App() {
  const [view, setView] = useState<AppView>('dashboard')
  const [currentFileName, setCurrentFileName] = useState<string>('')
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)
  const [activeTab, setActiveTab] = useState<TabType>('markdown')
  const [style, setStyle] = useState<ResumeStyle>(DEFAULT_STYLE)
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([])
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const { panelWidth, isDragging, handleMouseDown } = useResizablePanel(50, 25, 75)
  const { isConfigured, improveText, suggestLayout } = useAI()

  const handleSelectResume = (content: string, fileName: string) => {
    setMarkdown(content)
    setCurrentFileName(fileName)
    setHasUnsavedChanges(false)
    
    const savedStyle = localStorage.getItem(`resumeBuilder_style_${fileName}`)
    if (savedStyle) {
      setStyle(JSON.parse(savedStyle))
    } else {
      setStyle(DEFAULT_STYLE)
    }
    
    setView('editor')
  }

  const handleCreateNew = () => {
    const name = prompt('Enter a name for your new resume:')
    if (!name) return
    
    setMarkdown(DEFAULT_MARKDOWN)
    setCurrentFileName(name)
    setStyle(DEFAULT_STYLE)
    setHasUnsavedChanges(true)
    setView('editor')
    
    const savedFiles = localStorage.getItem('resumeBuilder_files')
    const files = savedFiles ? JSON.parse(savedFiles) : []
    files.push({ name, path: '', lastModified: new Date().toLocaleDateString() })
    localStorage.setItem('resumeBuilder_files', JSON.stringify(files))
  }

  const handleSave = () => {
    if (!currentFileName) {
      const name = prompt('Enter a name for your resume:')
      if (!name) return
      setCurrentFileName(name)
      
      const savedFiles = localStorage.getItem('resumeBuilder_files')
      const files = savedFiles ? JSON.parse(savedFiles) : []
      files.push({ name, path: '', lastModified: new Date().toLocaleDateString() })
      localStorage.setItem('resumeBuilder_files', JSON.stringify(files))
    }
    
    localStorage.setItem(`resumeBuilder_content_${currentFileName}`, markdown)
    localStorage.setItem(`resumeBuilder_style_${currentFileName}`, JSON.stringify(style))
    
    const savedFiles = localStorage.getItem('resumeBuilder_files')
    if (savedFiles) {
      const files = JSON.parse(savedFiles)
      const updated = files.map((f: { name: string }) => 
        f.name === currentFileName 
          ? { ...f, lastModified: new Date().toLocaleDateString() }
          : f
      )
      localStorage.setItem('resumeBuilder_files', JSON.stringify(updated))
    }
    
    setHasUnsavedChanges(false)
    alert('Resume saved!')
  }

  const handleExportMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentFileName || 'resume'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return
      }
    }
    setView('dashboard')
  }

  const handleMarkdownChange = (value: string) => {
    setMarkdown(value)
    setHasUnsavedChanges(true)
  }

  const handleStyleChange = (newStyle: ResumeStyle) => {
    setStyle(newStyle)
    setHasUnsavedChanges(true)
  }

  const allTemplates: TemplateInfo[] = [
    ...BUILT_IN_TEMPLATES,
    ...customTemplates.map(ct => ({ id: ct.id, name: ct.name, description: ct.description, isCustom: true }))
  ]

  const getHtml = () => {
    const rawHtml = marked(markdown, { breaks: true }) as string
    
    if (style.template === 'sidebar') {
      return transformForSidebar(rawHtml)
    }
    
    return rawHtml
  }

  const getNameFromMarkdown = (): string => {
    const match = markdown.match(/^#\s+(.+)$/m)
    return match ? match[1] : 'Resume'
  }

  const getRawHtml = (): string => {
    return marked(markdown, { breaks: true }) as string
  }

  const transformForSidebar = (html: string): string => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const body = doc.body
    
    const header = doc.createElement('div')
    header.className = 'sidebar-header'
    
    const sidebar = doc.createElement('div')
    sidebar.className = 'sidebar-left'
    
    const main = doc.createElement('div')
    main.className = 'sidebar-main'
    
    const children = Array.from(body.children)
    let currentSection: 'header' | 'sidebar' | 'main' = 'header'
    let h2Count = 0
    let foundFirstH2 = false
    
    children.forEach((child) => {
      if (child.tagName === 'H1') {
        header.appendChild(child.cloneNode(true))
      } else if (child.tagName === 'H2') {
        foundFirstH2 = true
        h2Count++
        if (h2Count <= 2) {
          currentSection = 'sidebar'
          sidebar.appendChild(child.cloneNode(true))
        } else {
          currentSection = 'main'
          main.appendChild(child.cloneNode(true))
        }
      } else if (!foundFirstH2 && child.tagName === 'P') {
        const contactDiv = doc.createElement('div')
        contactDiv.className = 'contact-info'
        contactDiv.innerHTML = child.innerHTML
        header.appendChild(contactDiv)
      } else if (child.tagName === 'HR') {
        // Skip HR elements
      } else if (currentSection === 'sidebar') {
        sidebar.appendChild(child.cloneNode(true))
      } else if (currentSection === 'main') {
        main.appendChild(child.cloneNode(true))
      }
    })
    
    const wrapper = doc.createElement('div')
    wrapper.className = 'sidebar-wrapper'
    wrapper.appendChild(header)
    
    const content = doc.createElement('div')
    content.className = 'sidebar-content'
    content.appendChild(sidebar)
    content.appendChild(main)
    wrapper.appendChild(content)
    
    return wrapper.outerHTML
  }

  const getTemplateClass = () => {
    const customTemplate = customTemplates.find(ct => ct.id === style.template)
    if (customTemplate) {
      return `resume-preview template-${customTemplate.baseTemplate}`
    }
    return `resume-preview template-${style.template}`
  }

  const getCustomCSS = (): string => {
    const customTemplate = customTemplates.find(ct => ct.id === style.template)
    return customTemplate?.customCSS || ''
  }

  const handleDuplicateTemplate = (templateId: TemplateType) => {
    const baseTemplate = BUILT_IN_TEMPLATES.find(t => t.id === templateId)
    if (!baseTemplate) return
    
    const newId = `custom-${Date.now()}`
    const newTemplate: CustomTemplate = {
      id: newId,
      name: `${baseTemplate.name} (Copy)`,
      description: 'Custom template',
      baseTemplate: templateId,
      customCSS: '',
      style: { ...style }
    }
    
    setCustomTemplates([...customTemplates, newTemplate])
    setEditingTemplate(newTemplate)
    setStyle({ ...style, template: newId })
  }

  const handleSaveCustomTemplate = (template: CustomTemplate) => {
    setCustomTemplates(customTemplates.map(ct => ct.id === template.id ? template : ct))
    setEditingTemplate(null)
  }

  const handleDeleteCustomTemplate = (templateId: string) => {
    setCustomTemplates(customTemplates.filter(ct => ct.id !== templateId))
    if (style.template === templateId) {
      setStyle({ ...style, template: 'classic' })
    }
    setEditingTemplate(null)
  }

  const handleAIAction = async (action: AIAction) => {
    const textToImprove = selectedText || markdown
    if (!textToImprove) return
    
    setAiLoading(true)
    const result = await improveText(textToImprove, action, action === 'custom' ? aiPrompt : undefined)
    setAiLoading(false)
    
    if (result.success && result.content) {
      if (selectedText) {
        setMarkdown(markdown.replace(selectedText, result.content))
        setSelectedText('')
      } else {
        setMarkdown(result.content)
      }
    } else {
      alert(result.error || 'AI request failed')
    }
  }

  const handleSuggestLayout = async () => {
    setAiLoading(true)
    const result = await suggestLayout(markdown)
    setAiLoading(false)
    
    if (result.success && result.content) {
      try {
        const suggestion = JSON.parse(result.content)
        if (confirm(`AI suggests: ${suggestion.template}\n\nReason: ${suggestion.reason}\n\nApply this template?`)) {
          setStyle({ ...style, template: suggestion.template })
        }
      } catch {
        alert('Could not parse AI suggestion')
      }
    } else {
      alert(result.error || 'AI request failed')
    }
  }

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection()?.toString() || ''
    setSelectedText(selection)
  }, [])

  if (view === 'dashboard') {
    return <Dashboard onSelectResume={handleSelectResume} onCreateNew={handleCreateNew} />
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <button className="btn-back" onClick={handleBackToDashboard}>
          ← Back
        </button>
        <div className="header-center">
          <h1>{currentFileName || 'Untitled Resume'}</h1>
          {hasUnsavedChanges && <span className="unsaved-badge">Unsaved</span>}
          {isConfigured() && <span className="ai-badge">AI</span>}
        </div>
        <div className="header-actions">
          <button className="btn-save-header" onClick={handleSave}>
            💾 Save
          </button>
          <button className="btn-export" onClick={handleExportMd}>
            📥 Export
          </button>
        </div>
      </header>
      
      <div className="main-content">
        {/* Left Panel - Editor */}
        <div className="editor-panel" style={{ width: `${panelWidth}%` }}>
          <div className="tab-bar">
            <button 
              className={`tab ${activeTab === 'markdown' ? 'active' : ''}`}
              onClick={() => setActiveTab('markdown')}
            >
              Markdown
            </button>
            <button 
              className={`tab ${activeTab === 'style' ? 'active' : ''}`}
              onClick={() => setActiveTab('style')}
            >
              Style
            </button>
            <button 
              className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              AI
            </button>
          </div>
          
          {activeTab === 'markdown' && (
            <textarea
              className="markdown-editor"
              value={markdown}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              onSelect={handleTextSelect}
              placeholder="Enter your resume in Markdown format..."
            />
          )}
          
          {activeTab === 'ai' && (
            <div className="ai-panel">
              {!isConfigured() ? (
                <div className="ai-setup">
                  <h3>AI Not Configured</h3>
                  <p>Add your OpenAI API key to the <code>.env</code> file:</p>
                  <code>VITE_OPENAI_API_KEY=your_key_here</code>
                  <p>Then restart the dev server.</p>
                </div>
              ) : (
                <>
                  <div className="ai-section">
                    <h3>Quick Actions</h3>
                    <p className="ai-hint">{selectedText ? `Selected: "${selectedText.slice(0, 50)}..."` : 'Select text in Markdown tab or apply to entire resume'}</p>
                    <div className="ai-buttons">
                      <button onClick={() => handleAIAction('improve')} disabled={aiLoading}>✨ Improve</button>
                      <button onClick={() => handleAIAction('shorten')} disabled={aiLoading}>📝 Shorten</button>
                      <button onClick={() => handleAIAction('expand')} disabled={aiLoading}>📖 Expand</button>
                      <button onClick={() => handleAIAction('fix-grammar')} disabled={aiLoading}>🔤 Fix Grammar</button>
                      <button onClick={() => handleAIAction('make-professional')} disabled={aiLoading}>💼 Professional</button>
                    </div>
                  </div>
                  <div className="ai-section">
                    <h3>Custom Prompt</h3>
                    <textarea
                      className="ai-prompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Enter custom instructions for AI..."
                    />
                    <button onClick={() => handleAIAction('custom')} disabled={aiLoading || !aiPrompt}>Apply Custom</button>
                  </div>
                  <div className="ai-section">
                    <h3>Layout Suggestion</h3>
                    <button onClick={handleSuggestLayout} disabled={aiLoading}>🎨 Suggest Best Template</button>
                  </div>
                  {aiLoading && <div className="ai-loading">AI is thinking...</div>}
                </>
              )}
            </div>
          )}
          
          {activeTab === 'style' && (
            <div className="style-editor">
              {editingTemplate ? (
                <div className="template-editor">
                  <h3>Edit Custom Template</h3>
                  <div className="style-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    />
                  </div>
                  <div className="style-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={editingTemplate.description}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                    />
                  </div>
                  <div className="style-group">
                    <label>Custom CSS</label>
                    <textarea
                      className="css-editor"
                      value={editingTemplate.customCSS}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, customCSS: e.target.value })}
                      placeholder="Add custom CSS overrides..."
                    />
                  </div>
                  <div className="template-actions">
                    <button className="btn-save" onClick={() => handleSaveCustomTemplate(editingTemplate)}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditingTemplate(null)}>Cancel</button>
                    <button className="btn-delete" onClick={() => handleDeleteCustomTemplate(editingTemplate.id)}>Delete</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="style-group">
                    <label>Template</label>
                    <div className="template-grid">
                      {allTemplates.map((t) => (
                        <div key={t.id} className="template-card-wrapper">
                          <button
                            className={`template-card ${style.template === t.id ? 'active' : ''}`}
                            onClick={() => handleStyleChange({ ...style, template: t.id })}
                          >
                            <div className={`template-preview template-thumb-${t.isCustom ? customTemplates.find(ct => ct.id === t.id)?.baseTemplate : t.id}`}>
                              <div className="thumb-header"></div>
                              <div className="thumb-body"></div>
                            </div>
                            <span className="template-name">{t.name}</span>
                            <span className="template-desc">{t.description}</span>
                          </button>
                          <div className="template-card-actions">
                            {!t.isCustom && (
                              <button className="btn-duplicate" onClick={() => handleDuplicateTemplate(t.id as TemplateType)} title="Duplicate">
                                📋
                              </button>
                            )}
                            {t.isCustom && (
                              <button className="btn-edit" onClick={() => setEditingTemplate(customTemplates.find(ct => ct.id === t.id) || null)} title="Edit">
                                ✏️
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="style-group">
                    <label>Primary Color</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={style.primaryColor}
                        onChange={(e) => handleStyleChange({ ...style, primaryColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={style.primaryColor}
                        onChange={(e) => handleStyleChange({ ...style, primaryColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="style-group">
                    <label>Secondary Color</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={style.secondaryColor}
                        onChange={(e) => handleStyleChange({ ...style, secondaryColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={style.secondaryColor}
                        onChange={(e) => handleStyleChange({ ...style, secondaryColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="style-group">
                    <label>Accent Color</label>
                    <div className="color-input">
                      <input
                        type="color"
                        value={style.accentColor}
                        onChange={(e) => handleStyleChange({ ...style, accentColor: e.target.value })}
                      />
                      <input
                        type="text"
                        value={style.accentColor}
                        onChange={(e) => handleStyleChange({ ...style, accentColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="style-group">
                    <label>Font Family</label>
                    <select
                      value={style.fontFamily}
                      onChange={(e) => handleStyleChange({ ...style, fontFamily: e.target.value })}
                    >
                      <option value="Georgia, serif">Georgia (Serif)</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                      <option value="Arial, sans-serif">Arial (Sans-serif)</option>
                      <option value="'Helvetica Neue', sans-serif">Helvetica</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="system-ui, sans-serif">System UI</option>
                    </select>
                  </div>
                  <div className="style-group">
                    <label>Font Size</label>
                    <select
                      value={style.fontSize}
                      onChange={(e) => handleStyleChange({ ...style, fontSize: e.target.value })}
                    >
                      <option value="12px">Small (12px)</option>
                      <option value="14px">Medium (14px)</option>
                      <option value="16px">Large (16px)</option>
                    </select>
                  </div>
                  <div className="style-group">
                    <label>Line Height</label>
                    <select
                      value={style.lineHeight}
                      onChange={(e) => handleStyleChange({ ...style, lineHeight: e.target.value })}
                    >
                      <option value="1.3">Compact (1.3)</option>
                      <option value="1.5">Normal (1.5)</option>
                      <option value="1.7">Relaxed (1.7)</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Resizable Divider */}
        <div 
          className={`panel-divider ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />

        {/* Right Panel - Preview */}
        <div className="preview-panel" style={{ width: `${100 - panelWidth}%` }}>
          <div className="resume-preview-container">
            <div className="page-indicator">Page 1</div>
            <div 
              className={getTemplateClass()}
              style={{
                '--primary-color': style.primaryColor,
                '--secondary-color': style.secondaryColor,
                '--accent-color': style.accentColor,
                '--font-family': style.fontFamily,
                '--font-size': style.fontSize,
                '--line-height': style.lineHeight,
              } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: getHtml() }}
            />
            <div className="page-indicator">Page 2</div>
            <div 
              className={`${getTemplateClass()} page-2`}
              style={{
                '--primary-color': style.primaryColor,
                '--secondary-color': style.secondaryColor,
                '--accent-color': style.accentColor,
                '--font-family': style.fontFamily,
                '--font-size': style.fontSize,
                '--line-height': style.lineHeight,
              } as React.CSSProperties}
            >
              {style.template === 'sidebar' ? (
                <div className="sidebar-wrapper">
                  <div className="sidebar-header page-2-sidebar-header">
                    <h1>{getNameFromMarkdown()}</h1>
                    <span className="page-2-badge">Page 2</span>
                  </div>
                  <div className="sidebar-content">
                    <div className="sidebar-left"></div>
                    <div className="sidebar-main">
                      <div className="page-2-content" dangerouslySetInnerHTML={{ __html: getRawHtml() }} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="page-2-header">
                    <span className="page-2-name">{getNameFromMarkdown()}</span>
                    <span className="page-2-number">Page 2</span>
                  </div>
                  <div className="page-2-content" dangerouslySetInnerHTML={{ __html: getHtml() }} />
                </>
              )}
            </div>
          </div>
          {getCustomCSS() && <style>{getCustomCSS()}</style>}
        </div>
      </div>
    </div>
  )
}

export default App
