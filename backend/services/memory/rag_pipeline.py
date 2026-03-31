from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
import logging
import os

from ...models.events import Event

logger = logging.getLogger(__name__)

HAS_EMBEDDER = False
vector_store = None

try:
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_community.vectorstores import FAISS
    from langchain_core.documents import Document
    
    # Store FAISS index locally
    FAISS_INDEX_PATH = "faiss_index"
    
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    if os.path.exists(FAISS_INDEX_PATH):
        vector_store = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
        logger.info("Successfully loaded local FAISS index.")
    else:
        # Initialize an empty vector store with a dummy document to establish schema
        dummy_doc = Document(page_content="dummy", metadata={"id": "dummy"})
        vector_store = FAISS.from_documents([dummy_doc], embeddings)
        logger.info("Created new local FAISS index.")
        
    HAS_EMBEDDER = True
except (ImportError, Exception) as e:
    logger.warning(f"Vector search components not available: {e}. Using standard SQL fallback.")

async def store_event_embedding(event: Event, db: AsyncSession):
    """Generate and store embedding for a new event natively in FAISS."""
    if not HAS_EMBEDDER or vector_store is None:
        return
        
    text_to_embed = f"{event.type} in {event.location}. {event.description}"
    
    doc = Document(
        page_content=text_to_embed, 
        metadata={
            "id": event.id, 
            "type": event.type, 
            "severity": event.severity.value if event.severity else "unknown", 
            "location": event.location
        }
    )
    
    # Store natively into the vector database
    vector_store.add_documents([doc])
    vector_store.save_local(FAISS_INDEX_PATH)
    
    # Fallback indicator for SQLite sync tracker
    event.embedding_data = "faiss_indexed_v1"
    db.add(event)
    await db.commit()

async def build_context(event: Event, db: AsyncSession) -> str:
    """Build context finding relevant past events via Vector Similarity Search (FAISS)."""
    context = "RELEVANT HISTORICAL CONTEXT:\n"
    
    if not HAS_EMBEDDER or vector_store is None:
        # Fallback to local SQL exact match if ML libraries are missing
        result = await db.execute(
            select(Event)
            .where((Event.type == event.type) | (Event.location == event.location))
            .where(Event.id != event.id)
            .order_by(Event.timestamp.desc())
            .limit(3)
        )
        similar_events = result.scalars().all()
        if not similar_events:
            context += "No highly similar past events found.\n"
        else:
            for past_event in similar_events:
                sev = past_event.severity.value if past_event.severity else "unknown"
                context += f"- Past {past_event.type} in {past_event.location} (Severity: {sev}): {past_event.description}\n"
        return context

    # True FAISS k-NN Cosine Similarity Vector Search
    query = f"{event.type} in {event.location}. {event.description}"
    docs = vector_store.similarity_search(query, k=3)
    
    # Filter out the dummy init doc and the exact same event if re-processing
    valid_docs = [d for d in docs if d.metadata.get("id") not in ["dummy", event.id]]
    
    if not valid_docs:
        context += "No similar historical events found in the vector memory space.\n"
    else:
        for d in valid_docs:
            sev = d.metadata.get("severity", "unknown")
            loc = d.metadata.get("location", "unknown")
            typ = d.metadata.get("type", "unknown")
            context += f"- Past {typ} in {loc} (Severity: {sev}): {d.page_content}\n"
            
    return context
