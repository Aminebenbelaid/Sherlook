from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    IngestRequest, IngestResponse,
    AskRequest, AskResponse,
    SourceChunk,
)
from app.services import loader, chunker, embedder, vectorstore, retriever, generator

router = APIRouter()


@router.post("/ingest", response_model=IngestResponse)
def ingest(request: IngestRequest) -> IngestResponse:
    """
    Recursively load files from *request.path*, chunk them, embed, and store
    in ChromaDB.
    """
    try:
        files = loader.load_files(request.path)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not files:
        return IngestResponse(
            files_processed=0,
            chunks_stored=0,
            message="No supported files found in the given path.",
        )

    chunks = chunker.chunk_documents(files)

    if not chunks:
        return IngestResponse(
            files_processed=len(files),
            chunks_stored=0,
            message="Files were loaded but produced no text chunks.",
        )

    texts = [c["text"] for c in chunks]
    embeddings = embedder.embed_documents(texts)
    vectorstore.add_chunks(chunks, embeddings)

    return IngestResponse(
        files_processed=len(files),
        chunks_stored=len(chunks),
        message=f"Successfully ingested {len(files)} files into {len(chunks)} chunks.",
    )


@router.post("/ask", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    """
    Retrieve relevant chunks for *request.question* and generate an answer.
    """
    chunks = retriever.retrieve(request.question)
    answer = generator.generate_answer(request.question, chunks)

    sources = [
        SourceChunk(
            file_path=c["file_path"],
            chunk_index=c["chunk_index"],
            score=c["score"],
            text=c.get("text", ""),
        )
        for c in chunks
    ]

    return AskResponse(answer=answer, sources=sources)
