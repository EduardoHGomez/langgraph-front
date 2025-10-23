from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Necesario para la comunicación frontend/backend
from pydantic import BaseModel
import os # Opcional: para obtener variables de entorno

app = FastAPI()

# ----------------------------------------------------
# 1. CONFIGURACIÓN DE CORS (CRUCIAL)
# ----------------------------------------------------
# Define los orígenes permitidos.
# IMPORTANTE: Cambia los dominios según dónde despliegues tu frontend.
origins = [
    "http://localhost:3000",            # Si tu React/Vercel corre localmente
    "https://tu-dominio-de-vercel.app", # ¡CAMBIA ESTO! Dominio de tu aplicación desplegada
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos los métodos (POST, GET, etc.)
    allow_headers=["*"],
)
# ----------------------------------------------------

# 2. MODELOS DE DATOS (PARA ENTRADA Y SALIDA)
class PromptRequest(BaseModel):
    prompt_text: str

class BenchmarkResult(BaseModel):
    time_native_ms: float
    time_optimized_ms: float
    # Puedes añadir más campos aquí: tokens, memory, etc.

# 3. EL ENDPOINT PRINCIPAL
@app.post("/api/run_benchmark", response_model=BenchmarkResult)
async def run_benchmark(request: PromptRequest):
    """
    Recibe el prompt del frontend, ejecuta la lógica del kernel 
    y retorna los resultados de comparación.
    """
    prompt = request.prompt_text
    print(f"Prompt recibido: {prompt}")

    # --- AQUÍ VA TU LÓGICA DE EJECUCIÓN DE KERNELS ---
    # Simulación de resultados:
    native_time = 1250.5 
    optimized_time = 890.2
    
    # ---------------------------------------------------
    
    return BenchmarkResult(
        time_native_ms=native_time,
        time_optimized_ms=optimized_time
    )