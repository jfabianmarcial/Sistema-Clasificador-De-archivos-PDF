import { useState, useEffect } from 'react'
import { useTopics } from '../../hooks/useTopics'
import { useDocuments } from '../../hooks/useDocuments'

function DocumentItem({ doc, onDownload, onDelete }) {
  return (
    <li className="doc-item">
      <div className="doc-info">
        <span className="doc-name">📄 {doc.name}</span>
      </div>
      <div className="doc-actions">
        <button className="btn-download" onClick={() => onDownload(doc._id, doc.name)}>
          ↓
        </button>
        <button className="btn-delete" onClick={() => onDelete(doc._id)}>
          ✕
        </button>
      </div>
    </li>
  )
}

function TopicSection({ topic, subtopics, allDocuments, onDownload, onDelete, onDeleteTopic }) {
  const [expanded, setExpanded] = useState(true)

  const topicDocs = allDocuments.filter(d => d.topicId === topic._id)

  return (
    <li className="topic-item">
      <div className="topic-row">
        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? '▾' : '▸'}
        </button>
        <span className="topic-name">{topic.name}</span>
        <span className="topic-count">{topicDocs.length} doc{topicDocs.length !== 1 ? 's' : ''}</span>
        <button className="delete-btn" onClick={() => onDeleteTopic(topic._id)}>✕</button>
      </div>

      {expanded && (
        <div className="topic-body">
          {/* Documentos directo en la temática */}
          {topicDocs.length > 0 && (
            <ul className="doc-list-inner">
              {topicDocs.map(doc => (
                <DocumentItem key={doc._id} doc={doc} onDownload={onDownload} onDelete={onDelete} />
              ))}
            </ul>
          )}

          {/* Subtemáticas */}
          {subtopics.map(sub => {
            const subDocs = allDocuments.filter(d => d.topicId === sub._id)
            return (
              <div key={sub._id} className="subtopic-section">
                <div className="subtopic-row">
                  <span className="subtopic-icon">└─</span>
                  <span className="topic-name">{sub.name}</span>
                  <span className="topic-count">{subDocs.length} doc{subDocs.length !== 1 ? 's' : ''}</span>
                  <button className="delete-btn" onClick={() => onDeleteTopic(sub._id)}>✕</button>
                </div>
                {subDocs.length > 0 && (
                  <ul className="doc-list-inner subtopic-docs">
                    {subDocs.map(doc => (
                      <DocumentItem key={doc._id} doc={doc} onDownload={onDownload} onDelete={onDelete} />
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </li>
  )
}

export default function TopicTree() {
  const { topics, loading, error, addTopic, addSubtopic, deleteTopic } = useTopics()
  const { documents, downloadDocument, deleteDocument } = useDocuments()
  const [newTopic, setNewTopic] = useState('')
  const [newSubtopic, setNewSubtopic] = useState({})
  const [topicError, setTopicError] = useState('')

  const rootTopics = topics.filter(t => !t.parentId)
  const childrenOf = (parentId) => topics.filter(t => t.parentId === parentId)

  // Documentos en General (sin temática)
  const generalDocs = documents.filter(d => !d.topicId)

  const handleAddTopic = async (e) => {
    e.preventDefault()
    if (!newTopic.trim()) return
    setTopicError('')
    try {
      await addTopic(newTopic.trim())
      setNewTopic('')
    } catch (err) {
      setTopicError(err.response?.data?.message || 'Error al crear temática')
    }
  }

  const handleAddSubtopic = async (e, parentId) => {
    e.preventDefault()
    const name = newSubtopic[parentId]?.trim()
    if (!name) return
    try {
      await addSubtopic(name, parentId)
      setNewSubtopic(prev => ({ ...prev, [parentId]: '' }))
    } catch (err) {
      setTopicError(err.response?.data?.message || 'Error al crear subtemática')
    }
  }

  const handleDeleteTopic = async (id) => {
    setTopicError('')
    try {
      await deleteTopic(id)
    } catch (err) {
      setTopicError(err.response?.data?.message || 'Solo puedes eliminar temáticas vacías')
    }
  }

  const handleDeleteDoc = async (id) => {
    if (!confirm('¿Eliminar este documento?')) return
    await deleteDocument(id)
  }

  if (loading) return <p className="loading">Cargando...</p>

  return (
    <div className="topic-tree">
      <h2>Mis temáticas</h2>

      <form className="add-form" onSubmit={handleAddTopic}>
        <input
          placeholder="Nueva temática..."
          value={newTopic}
          onChange={e => setNewTopic(e.target.value)}
        />
        <button type="submit">+ Agregar</button>
      </form>

      {topicError && <p className="error">{topicError}</p>}
      {error && <p className="error">{error}</p>}

      <ul className="topic-list">
        {rootTopics.map(topic => (
          <div key={topic._id}>
            <TopicSection
              topic={topic}
              subtopics={childrenOf(topic._id)}
              allDocuments={documents}
              onDownload={downloadDocument}
              onDelete={handleDeleteDoc}
              onDeleteTopic={handleDeleteTopic}
            />
            {/* Form para agregar subtemática */}
            <form
              className="add-form subtopic-form"
              onSubmit={e => handleAddSubtopic(e, topic._id)}
              style={{ paddingLeft: '1.5rem', marginBottom: '0.5rem' }}
            >
              <input
                placeholder={`Nueva subtemática en ${topic.name}...`}
                value={newSubtopic[topic._id] || ''}
                onChange={e => setNewSubtopic(prev => ({ ...prev, [topic._id]: e.target.value }))}
              />
              <button type="submit">+</button>
            </form>
          </div>
        ))}

        {/* Sin clasificar */}
{generalDocs.length > 0 && (
  <li className="topic-item">
    <div className="topic-row">
      <span className="expand-btn">▾</span>
      <span className="topic-name">Sin clasificar</span>
      <span className="topic-count">{generalDocs.length} doc{generalDocs.length !== 1 ? 's' : ''}</span>
    </div>
    <div className="topic-body">
      <ul className="doc-list-inner">
        {generalDocs.map(doc => (
          <DocumentItem key={doc._id} doc={doc} onDownload={downloadDocument} onDelete={handleDeleteDoc} />
        ))}
      </ul>
    </div>
  </li>
)}
      </ul>

      {rootTopics.length === 0 && (
        <p className="empty">No tienes temáticas aún. ¡Crea la primera!</p>
      )}
    </div>
  )
}