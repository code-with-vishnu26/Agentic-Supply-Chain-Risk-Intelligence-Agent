import sys
with open('src/index.css', 'a', encoding='utf-8') as f:
    f.write('''
/* ========== MARKDOWN PROSE TABLES (AGENT AI) ========== */
.markdown-prose { display: flex; flex-direction: column; gap: 8px; }
.markdown-prose table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 12px; font-size: 0.9rem; }
.markdown-prose th, .markdown-prose td { border: 1px solid rgba(255,255,255,0.1); padding: 10px 14px; text-align: left; }
.markdown-prose th { background: rgba(56,189,248,0.1); color: var(--accent-cyan); font-weight: 600; }
.markdown-prose td { background: rgba(0,0,0,0.1); }
.markdown-prose strong { color: var(--accent-cyan); font-weight: 600; }
.markdown-prose ul { padding-left: 20px; list-style-type: disc; }
.markdown-prose ol { padding-left: 20px; list-style-type: decimal; }
''')
print("CSS Appended")
