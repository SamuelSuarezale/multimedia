from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel 
from typing import List 
app = FastAPI(title="API Ingeniería Telecomunicaciones") 
app.add_middleware( 
    CORSMiddleware, allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"],
) 
class Asignatura(BaseModel): 
    semestre: int 
    codigo: str 
    asignatura: str 
    creditos: int 
    tipo: str 
    area: str 

malla_db = [ 
    # SEMESTRE 1 
    {"semestre": 1, "codigo": "164010", "asignatura": "Habilidades Comunicativas", "creditos": 2, "tipo": "sociohumanistica", "area": "Formación Sociohumanística"}, 
    {"semestre": 1, "codigo": "167428", "asignatura": "Informática Básica", "creditos": 2, "tipo": "obligatoria", "area": "Formación Básica"}, 
    {"semestre": 1, "codigo": "167220", "asignatura": "Fundamentos de Programación", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"},
    {"semestre": 1, "codigo": "168003", "asignatura": "Cálculo Diferencial", "creditos": 4, "tipo": "obligatoria", "area": "Formación Básica"}, 
    {"semestre": 1, "codigo": "167223", "asignatura": "Introducción a las Telecomunicaciones", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 1, "codigo": "157400", "asignatura": "Cátedra Faria", "creditos": 2, "tipo": "sociohumanistica", "area": "Formación Sociohumanística"},
    # SEMESTRE 2 
    {"semestre": 2, "codigo": "168004", "asignatura": "Cálculo Integral", "creditos": 4, "tipo": "obligatoria", "area": "Formación Básica"}, 
    {"semestre": 2, "codigo": "167226", "asignatura": "Programación para Telecomunicaciones", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 2, "codigo": "168027", "asignatura": "Circuitos Eléctricos I", "creditos": 4, "tipo": "obligatoria", "area": "Formación Profesional"},
    {"semestre": 2, "codigo": "167369", "asignatura": "Algebra Lineal", "creditos": 3, "tipo": "obligatoria", "area": "Formación Básica"}, 
    {"semestre": 2, "codigo": "167322", "asignatura": "Expresión Gráfica", "creditos": 2, "tipo": "obligatoria", "area": "Formación Básica"}, 
    {"semestre": 2, "codigo": "150001", "asignatura": "Inglés I", "creditos": 2, "tipo": "sociohumanistica", "area": "Formación Sociohumanística"}, 
    # SEMESTRE 3 
    {"semestre": 3, "codigo": "167254", "asignatura": "Circuitos Eléctricos II", "creditos": 4, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 3, "codigo": "168005", "asignatura": "Cálculo Multivariable", "creditos": 4, "tipo": "obligatoria", "area": "Formación Básica"}, 
    {"semestre": 3, "codigo": "167279", "asignatura": "Probabilidad y Estadística Ing.", "creditos": 3, "tipo": "obligatoria", "area": "Formación Básica"},
    {"semestre": 3, "codigo": "167344", "asignatura": "Mecánica", "creditos": 3, "tipo": "obligatoria", "area": "Formación Básica"}, 
    {"semestre": 3, "codigo": "150002", "asignatura": "Inglés II", "creditos": 2, "tipo": "sociohumanistica", "area": "Formación Sociohumanística"}, 
    # SEMESTRE 4 
    {"semestre": 4, "codigo": "167403", "asignatura": "Electrónica I", "creditos": 4, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 4, "codigo": "168006", "asignatura": "Ecuaciones Diferenciales", "creditos": 4, "tipo": "obligatoria", "area": "Formación Básica"}, 
    {"semestre": 4, "codigo": "167455", "asignatura": "Teoría de Señales I", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 4, "codigo": "167457", "asignatura": "Electromagnetismo", "creditos": 3, "tipo": "obligatoria", "area": "Formación Básica"},
    {"semestre": 4, "codigo": "167401", "asignatura": "Educación Ambiental", "creditos": 2, "tipo": "sociohumanistica", "area": "Formación Sociohumanística"}, 
    # SEMESTRE 5 
    {"semestre": 5, "codigo": "167459", "asignatura": "Procesamiento Digital de Señales", "creditos": 4, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 5, "codigo": "168007", "asignatura": "Comunicaciones Analógicas", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 5, "codigo": "167465", "asignatura": "Propagación Electromagnética", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 5, "codigo": "167468", "asignatura": "Telemática", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 5, "codigo": "150003", "asignatura": "Inglés III", "creditos": 2, "tipo": "sociohumanistica", "area": "Formación Sociohumanística"}, 
    # SEMESTRE 6 
    {"semestre": 6, "codigo": "167466", "asignatura": "Telemática II", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 6, "codigo": "167467", "asignatura": "Seguridad Digital y Ciberseguridad", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 6, "codigo": "167463", "asignatura": "Teoría de Señales II", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 6, "codigo": "167462", "asignatura": "Antenas y Radiopropagación", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 6, "codigo": "167461", "asignatura": "Conmutación y Telefonía", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 6, "codigo": "164004", "asignatura": "Formación Ciudadana y Cultura de Paz", "creditos": 2, "tipo": "sociohumanistica", "area": "Formación Sociohumanística"}, 
    # SEMESTRE 7 
    {"semestre": 7, "codigo": "167455", "asignatura": "Comunicaciones Móviles y Satelitales", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 7, "codigo": "167472", "asignatura": "Fundamentos de Inteligencia Artificial", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 7, "codigo": "167452", "asignatura": "Electiva Profesional I", "creditos": 3, "tipo": "electiva", "area": "Profundización"}, 
    {"semestre": 7, "codigo": "167462", "asignatura": "Comunicaciones Digitales", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 7, "codigo": "167846", "asignatura": "Ética", "creditos": 2, "tipo": "sociohumanistica", "area": "Formación Sociohumanística"}, 
    # SEMESTRE 8 
    {"semestre": 8, "codigo": "167344", "asignatura": "Gestión de Proyectos Telecom I", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 8, "codigo": "167467", "asignatura": "Computación en la Nube y Niebla", "creditos": 3, "tipo": "obligatoria", "area": "Profundización"}, 
    {"semestre": 8, "codigo": "167469", "asignatura": "Comunicaciones Ópticas", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 8, "codigo": "167462", "asignatura": "Electiva Profesional II", "creditos": 3, "tipo": "electiva", "area": "Profundización"}, 
    {"semestre": 8, "codigo": "167460", "asignatura": "Microondas", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    # SEMESTRE 9 
    {"semestre": 9, "codigo": "167461", "asignatura": "Gestión de Proyectos Telecom II", "creditos": 3, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 9, "codigo": "167467", "asignatura": "Trabajo de Grado", "creditos": 6, "tipo": "obligatoria", "area": "Formación Profesional"}, 
    {"semestre": 9, "codigo": "167476", "asignatura": "Electiva Profesional III", "creditos": 3, "tipo": "electiva", "area": "Profundización"}, 
    {"semestre": 9, "codigo": "167483", "asignatura": "Actividad Deportiva / Cultural", "creditos": 1, "tipo": "sociohumanistica", "area": "Formación Sociohumanística"}, 
    {"semestre": 9, "codigo": "167478", "asignatura": "Legislación en Telecomunicaciones", "creditos": 2, "tipo": "obligatoria", "area": "Formación Profesional"}
] 
@app.get("/") 
def home(): 
    return {"mensaje": "API Lista para Despliegue"} 
@app.get("/api/plan-estudios", response_model=List[Asignatura]) 
def obtener_plan_estudios(): return malla_db