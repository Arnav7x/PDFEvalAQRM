from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime

# Database setup
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/pdf_eval"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Pydantic models
class RegionBase(BaseModel):
    questionNumber: str
    page: int
    x: float
    y: float
    width: float
    height: float

class RegionCreate(RegionBase):
    pass

class Region(RegionBase):
    id: int
    
    class Config:
        orm_mode = True

class TemplateBase(BaseModel):
    name: str
    pageCount: int
    aspectRatio: float

class TemplateCreate(TemplateBase):
    regions: List[RegionCreate]

class Template(TemplateBase):
    id: int
    regions: List[Region]
    createdAt: datetime
    
    class Config:
        orm_mode = True

class PaperBase(BaseModel):
    studentName: str
    fileName: str
    fileSize: str
    pdfUrl: str
    templateId: Optional[int] = None

class PaperCreate(PaperBase):
    pass

class Paper(PaperBase):
    id: int
    aspectRatio: float
    regions: List[Region]
    offsets: dict
    grades: dict
    createdAt: datetime
    
    class Config:
        orm_mode = True

# Database models
class DBRegion(Base):
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True, index=True)
    questionNumber = Column(String)
    page = Column(Integer)
    x = Column(Float)
    y = Column(Float)
    width = Column(Float)
    height = Column(Float)
    template_id = Column(Integer, nullable=True)
    paper_id = Column(Integer, nullable=True)

class DBTemplate(Base):
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    pageCount = Column(Integer)
    aspectRatio = Column(Float)
    createdAt = Column(DateTime, default=datetime.utcnow)

class DBPaper(Base):
    __tablename__ = "papers"
    
    id = Column(Integer, primary_key=True, index=True)
    studentName = Column(String)
    fileName = Column(String)
    fileSize = Column(String)
    pdfUrl = Column(String)
    aspectRatio = Column(Float)
    template_id = Column(Integer, nullable=True)
    offsets = Column(JSON)  # Store as JSON
    grades = Column(JSON)   # Store as JSON
    createdAt = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI app
app = FastAPI(title="PDF Eval API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.get("/")
async def root():
    return {"message": "PDF Eval API is running"}

# Template routes
@app.post("/templates/", response_model=Template)
def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    db_template = DBTemplate(
        name=template.name,
        pageCount=template.pageCount,
        aspectRatio=template.aspectRatio
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    # Add regions
    for region_data in template.regions:
        db_region = DBRegion(
            **region_data.dict(),
            template_id=db_template.id
        )
        db.add(db_region)
    
    db.commit()
    db.refresh(db_template)
    return db_template

@app.get("/templates/", response_model=List[Template])
def read_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    templates = db.query(DBTemplate).offset(skip).limit(limit).all()
    return templates

@app.get("/templates/{template_id}", response_model=Template)
def read_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(DBTemplate).filter(DBTemplate.id == template_id).first()
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@app.put("/templates/{template_id}", response_model=Template)
def update_template(template_id: int, template: TemplateCreate, db: Session = Depends(get_db)):
    db_template = db.query(DBTemplate).filter(DBTemplate.id == template_id).first()
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Update template fields
    db_template.name = template.name
    db_template.pageCount = template.pageCount
    db_template.aspectRatio = template.aspectRatio
    
    # Delete existing regions
    db.query(DBRegion).filter(DBRegion.template_id == template_id).delete()
    
    # Add new regions
    for region_data in template.regions:
        db_region = DBRegion(
            **region_data.dict(),
            template_id=template_id
        )
        db.add(db_region)
    
    db.commit()
    db.refresh(db_template)
    return db_template

@app.delete("/templates/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(DBTemplate).filter(DBTemplate.id == template_id).first()
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(template)
    db.commit()
    return {"message": "Template deleted successfully"}

# Paper routes
@app.post("/papers/", response_model=Paper)
def create_paper(paper: PaperCreate, db: Session = Depends(get_db)):
    db_paper = DBPaper(
        studentName=paper.studentName,
        fileName=paper.fileName,
        fileSize=paper.fileSize,
        pdfUrl=paper.pdfUrl
    )
    db.add(db_paper)
    db.commit()
    db.refresh(db_paper)
    return db_paper

@app.get("/papers/", response_model=List[Paper])
def read_papers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    papers = db.query(DBPaper).offset(skip).limit(limit).all()
    return papers

@app.get("/papers/{paper_id}", response_model=Paper)
def read_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(DBPaper).filter(DBPaper.id == paper_id).first()
    if paper is None:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper

@app.put("/papers/{paper_id}", response_model=Paper)
def update_paper(paper_id: int, paper: PaperCreate, db: Session = Depends(get_db)):
    db_paper = db.query(DBPaper).filter(DBPaper.id == paper_id).first()
    if db_paper is None:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    # Update paper fields
    db_paper.studentName = paper.studentName
    db_paper.fileName = paper.fileName
    db_paper.fileSize = paper.fileSize
    db_paper.pdfUrl = paper.pdfUrl
    
    db.commit()
    db.refresh(db_paper)
    return db_paper

@app.delete("/papers/{paper_id}")
def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(DBPaper).filter(DBPaper.id == paper_id).first()
    if paper is None:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    db.delete(paper)
    db.commit()
    return {"message": "Paper deleted successfully"}

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)