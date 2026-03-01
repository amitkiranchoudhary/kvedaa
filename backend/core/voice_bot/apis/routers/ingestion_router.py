import os
import shutil
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from core import logger
from core.voice_bot.rag.knowledge_base import kb

log = logger(__name__)
router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    if not kb.ready:
        raise HTTPException(
            status_code=503,
            detail="Knowledge base dependencies are not installed",
        )

    try:
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        chunks = kb.add_document(str(file_path))
        return {
            "message": "Document uploaded and indexed successfully",
            "filename": file.filename,
            "chunks": chunks,
        }
    except Exception as exc:
        log.error(f"Upload failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {exc}")


@router.get("/documents")
async def list_documents():
    try:
        files = []
        for entry in os.listdir(UPLOAD_DIR):
            path = UPLOAD_DIR / entry
            if path.is_file():
                files.append({"filename": entry, "size_bytes": path.stat().st_size})
        return files
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.delete("/documents/{filename}")
async def delete_document(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    file_path.unlink()
    return {"message": f"Document '{filename}' deleted successfully"}


@router.post("/knowledge-base/clear")
async def clear_knowledge_base():
    if not kb.ready:
        raise HTTPException(
            status_code=503,
            detail="Knowledge base dependencies are not installed",
        )
    try:
        kb.clear()
        return {"message": "Knowledge base cleared successfully"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

