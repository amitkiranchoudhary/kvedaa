import os
from pathlib import Path

from core import logger

log = logger(__name__)

VOICE_BOT_ROOT = Path(__file__).resolve().parents[1]
CHROMA_PERSIST_DIR = VOICE_BOT_ROOT / "data" / "chroma"


class KnowledgeBase:
    def __init__(self):
        self.ready = False
        self.vector_store = None
        self._initialize()

    def _initialize(self):
        try:
            from langchain_chroma import Chroma
            from langchain_huggingface import HuggingFaceEmbeddings

            os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
            embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True},
            )
            self.vector_store = Chroma(
                persist_directory=str(CHROMA_PERSIST_DIR),
                embedding_function=embeddings,
                collection_name="kvedaa_products",
            )
            self.ready = True
            log.info(f"Voice knowledge base ready at {CHROMA_PERSIST_DIR}")
        except Exception as exc:
            self.ready = False
            log.warning(f"Voice knowledge base disabled: {exc}")

    def add_document(self, file_path: str) -> int:
        if not self.ready or self.vector_store is None:
            raise RuntimeError("Knowledge base is not initialized")

        from langchain_community.document_loaders import PyPDFLoader, TextLoader
        from langchain_text_splitters import RecursiveCharacterTextSplitter

        if file_path.lower().endswith(".pdf"):
            docs = PyPDFLoader(file_path).load()
        else:
            docs = TextLoader(file_path, encoding="utf-8").load()

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(docs)
        self.vector_store.add_documents(chunks)
        return len(chunks)

    def query(self, query_text: str, k: int = 3) -> str:
        if not self.ready or self.vector_store is None:
            return "Knowledge base is not available right now."

        try:
            results = self.vector_store.similarity_search(query_text, k=k)
            if not results:
                return "No relevant information found."
            return "\n\n".join([doc.page_content for doc in results])
        except Exception as exc:
            log.error(f"Knowledge base query failed: {exc}")
            return "Error retrieving information."

    def clear(self):
        if not self.ready or self.vector_store is None:
            return
        self.vector_store.delete_collection()
        self._initialize()


kb = KnowledgeBase()

