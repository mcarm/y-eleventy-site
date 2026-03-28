export type TemplateType = 'classic' | 'sidebar' | 'modern' | 'minimal' | 'executive' | string

export type ResumeStyle = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  fontSize: string
  lineHeight: string
  template: TemplateType
}

export type CustomTemplate = {
  id: string
  name: string
  description: string
  baseTemplate: TemplateType
  customCSS: string
  style: Partial<ResumeStyle>
}

export type TemplateInfo = {
  id: TemplateType
  name: string
  description: string
  isCustom?: boolean
}

export const BUILT_IN_TEMPLATES: TemplateInfo[] = [
  { id: 'classic', name: 'Classic', description: 'Traditional single-column layout' },
  { id: 'sidebar', name: 'Sidebar', description: 'Header with side column for skills/contact' },
  { id: 'modern', name: 'Modern', description: 'Clean design with accent colors' },
  { id: 'minimal', name: 'Minimal', description: 'Simple, elegant whitespace-focused' },
  { id: 'executive', name: 'Executive', description: 'Bold header with professional styling' },
]

export const DEFAULT_STYLE: ResumeStyle = {
  primaryColor: '#6b8e8e',
  secondaryColor: '#5a6872',
  accentColor: '#f0f4f4',
  fontFamily: 'Georgia, serif',
  fontSize: '14px',
  lineHeight: '1.5',
  template: 'classic',
}
