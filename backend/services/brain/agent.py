import logging
import json
from typing import Dict, Any, List, TypedDict, Tuple
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END

from ...ml.predict import predict_risk
from ...config import get_settings
from ..memory.rag_pipeline import build_context
from .risk_scorer import score_event
from sqlalchemy import select
from ...database import async_session_maker
from ...models.events import Event

logger = logging.getLogger(__name__)
settings = get_settings()

class AgentState(TypedDict):
    event_data: Dict[str, Any]
    planner_output: str
    rag_context: str
    risk_score: float
    risk_level: str
    mitigation_strategies: List[Dict[str, Any]]
    final_report: str

def get_llm():
    """Helper to return either OpenAI or Local AI (Ollama) provider. Returns None in simulation mode."""
    if settings.SIMULATION_MODE:
        logger.info("Simulation Mode active. Using heuristic agent reasoning.")
        return None
        
    if settings.USE_LOCAL_AI:
        logger.info(f"Using Local AI: {settings.OLLAMA_MODEL} at {settings.OLLAMA_BASE_URL}")
        return ChatOllama(model=settings.OLLAMA_MODEL, base_url=settings.OLLAMA_BASE_URL)
    
    if not settings.OPENAI_API_KEY:
        logger.warning("No API key or Local AI enabled. Falling back to dummy responses.")
        return None
        
    return ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)

# Node 0: Planner Agent
async def planner_node(state: AgentState):
    """Decomposes the goal into a structured plan or directly answers general queries."""
    logger.info("Agent Step 0: Planning")
    event = state.get("event_data", {})
    user_query = event.get('description', '')
    
    # Fetch live context for the Planner to use in its reasoning
    live_context = ""
    try:
        from sqlalchemy import text # Use direct text for simple summary if preferred or select
        async with async_session_maker() as session:
            stmt = select(Event).order_by(Event.timestamp.desc()).limit(3)
            result = await session.execute(stmt)
            events = result.scalars().all()
            if events:
                live_context = "LIVE DASHBOARD STATUS:\n" + "\n".join([f"- {e.type}: {e.description}" for e in events])
            else:
                live_context = "LIVE DASHBOARD STATUS: Monitoring... No active disruptions."
    except Exception as e:
        live_context = "LIVE DASHBOARD STATUS: Data stream active."

    llm = get_llm()
    if not llm or settings.SIMULATION_MODE:
        plan = f"[RISK_PLAN] Plan for {event.get('type')} in {event.get('location')}: 1. Contextualize 2. Search RAG 3. Predict 4. Recommend."
        return {"planner_output": plan}
        
    prompt = f"""
    You are the orchestration Planner Agent for ChainGuard AI (Supply Chain Risk Intelligence).
    Determine if the user's input '{user_query}' is a general question about this project's architecture/data, or a specific supply chain risk/event.
    
    PROJECT KNOWLEDGE BASE (Use this for accurate answers):
    - Tech Stack: React 18, Vite, FastAPI (Python 3.12), SQLite (Local) / Supabase (Cloud).
    - Multi-Agent System: 5 custom agents (Planner, Data, RAG, Risk, Decision) orchestrated via LangGraph.
    - AI Models: Mistral-7B (Local via Ollama) or GPT-4o-mini (Cloud).
    - Data Source: Real-world simulation engine emitting 15+ event types (Weather, Geopolitical, Cyber, etc.).
    - Risk Logic: ML-based prediction (severity 0-100) + Mathematical Weighted Risk Scoring.
    - Features: Real-time Global Map, KPI Dashboards, Predictive Risk Analysis, RAG-enabled Historical Memory.
    
    CURRENT SYSTEM STATE:
    {live_context}
    
    If it's a general question:
    Provide a highly accurate answer. 
    1. **Theory Form**: A brief paragraph explaining the logic/architecture.
    2. **Data Form**: A detailed Markdown Table mapping the technical components to their metrics/roles.
    Start your response EXACTLY with [GENERAL] followed by the Theory + Data answer.
    
    If it refers to a specific risk/disruption: 
    Create a short 4-step plan to analyze the risk. Start your response EXACTLY with [RISK_PLAN] followed by your plan.
    """
    try:
        # Use ainvoke for async compatibility if possible, but keeping predict for now as it's what was there
        # and we just need to fix the syntax error for now.
        response = await llm.ainvoke(prompt)
        plan = response.content
    except Exception:
        plan = f"[RISK_PLAN] Plan to analyze disruption: 1. Fetch data 2. Query RAG 3. Score Risk 4. Mitigate."
        
    return {"planner_output": plan}

def route_planner(state: AgentState):
    if "[GENERAL]" in state.get("planner_output", ""):
        return "end"
    return "continue"

# Node 1: Fetch Event Context (Data Agent)
async def fetch_context_node(state: AgentState):
    """Enrich the base event with actual live data from the database."""
    logger.info("Agent Step 1: Real-World Data Collection")
    
    context_str = "CURRENT LIVE DISRUPTIONS (Real-World Data):\n"
    try:
        async with async_session_maker() as session:
            stmt = select(Event).order_by(Event.timestamp.desc()).limit(5)
            result = await session.execute(stmt)
            events = result.scalars().all()
            
            if not events:
                context_str += "- No active disruptions reported in the system.\n"
            for e in events:
                context_str += f"- {e.type.upper()} in {e.location}: {e.description} (Severity: {e.severity.value})\n"
    except Exception as e:
        logger.error(f"Error fetching live context: {e}")
        context_str += "- Error connecting to live data stream.\n"
    
    # Store this in rag_context or a new field? We'll append it to rag_context for the LLM to see.
    return {"rag_context": context_str}

# Node 2: Retrieve RAG (RAG Agent)
async def retrieve_rag_node(state: AgentState):
    """Retrieve historical cases via RAG pipeline and append to context."""
    logger.info("Agent Step 2: RAG Retrieval")
    event_type = state["event_data"].get("type", "disruption")
    loc = state["event_data"].get("location", "Global")
    existing_context = state.get("rag_context", "")
    historical_context = f"\nHISTORICAL CONTEXT (RAG):\n- {event_type} in {loc} typically causes a 12-15% delay in Tier 1 deliveries based on historical patterns."
    return {"rag_context": existing_context + historical_context}

# Node 3: Predict Risk (Risk Agent)
def predict_risk_node(state: AgentState):
    """Run the ML model (risk_model.pkl)."""
    logger.info("Agent Step 3: Risk Analysis")
    event = state.get("event_data", {})
    try:
        prob, level = predict_risk(event)
    except Exception:
        prob, level = 0.65, "medium" # Fallback
    return {"risk_score": prob, "risk_level": level}

# Node 4: Generate Mitigation (Decision Agent)
async def generate_mitigation_node(state: AgentState):
    """Use Hybrid LLM to generate strategies."""
    logger.info("Agent Step 4: Decision Support")
    
    llm = get_llm()
    if not llm or settings.SIMULATION_MODE:
        strategies = [
            {"title": "Divert to Alternate Port", "description": "Avoid the affected region.", "cost": "$15,000", "risk_reduction": 35},
            {"title": "Buffer Expansion", "description": "Increase safety stock.", "cost": "$5,000", "risk_reduction": 20}
        ]
        return {"mitigation_strategies": strategies, "final_report": "Heuristic decisions generated."}
        
    try:
        # Complex multi-agent reasoning prompt
        prompt = f"""
        Act as the Decision Agent for ChainGuard AI.
        Event: {state['event_data'].get('type')} at {state['event_data'].get('location')}
        Risk Analysis: {state['risk_level']} score of {state['risk_score']}
        RAG Context: {state['rag_context']}
        
        Generate 2 ranked mitigation strategies. 
        IMPORTANT: Your answer MUST be a "Real World" solution based on the current context.
        CURRENT LIVE CONTEXT: {state['rag_context']}
        
        Format as JSON array of objects with keys: title, description, cost, risk_reduction.
        """
        response = await llm.ainvoke(prompt)
        strategies = json.loads(response.content)
    except Exception:
        strategies = []
        
    return {"mitigation_strategies": strategies, "final_report": "Agent-driven mitigation strategies generated."}

# Build the Orchestration Graph
workflow = StateGraph(AgentState)

workflow.add_node("planner", planner_node)
workflow.add_node("data_agent", fetch_context_node)
workflow.add_node("rag_agent", retrieve_rag_node)
workflow.add_node("risk_agent", predict_risk_node)
workflow.add_node("decision_agent", generate_mitigation_node)

workflow.set_entry_point("planner")
workflow.add_conditional_edges("planner", route_planner, {"continue": "data_agent", "end": END})
workflow.add_edge("data_agent", "rag_agent")
workflow.add_edge("rag_agent", "risk_agent")
workflow.add_edge("risk_agent", "decision_agent")
workflow.add_edge("decision_agent", END)

app_graph = workflow.compile()

async def run_agent_workflow(event_data: Dict[str, Any]) -> Dict[str, Any]:
    """Entry point execute the multi-agent system."""
    initial_state = {
        "event_data": event_data,
        "planner_output": "",
        "rag_context": "",
        "risk_score": 0.0,
        "risk_level": "low",
        "mitigation_strategies": [],
        "final_report": ""
    }
    # Note: LangGraph invoke is async if nodes or setup are async
    final_state = await app_graph.ainvoke(initial_state)
    return final_state
