#!/usr/bin/env python3
"""
dump_react_code.py
Extrae y concatena el código fuente de un proyecto React
en un único TXT que se guarda en la MISMA CARPETA que este script,
incluyendo nombre y ruta de cada archivo.

Uso:
    python dump_react_code.py <ruta_proyecto> [ruta_salida]

Si omites [ruta_salida], se creará "react_code_dump.txt"
en el mismo directorio que dump_react_code.py.

Autor: ChatGPT (o3) • 2025
"""

import sys
from pathlib import Path

# --- Configuración ---
EXTS = {".js", ".jsx", ".ts", ".tsx", ".css", ".html"}
SKIP_DIRS = {"node_modules", ".git", "build", "dist", ".next", ".parcel-cache"}

def should_skip(path: Path) -> bool:
    """Omite archivos dentro de directorios irrelevantes o pesados."""
    return any(part in SKIP_DIRS for part in path.parts)

def dump_code(root: Path, out_file: Path, absolute: bool = False) -> None:
    """Recorre el proyecto y vuelca todo el código al TXT."""
    with out_file.open("w", encoding="utf-8") as fout:
        for file in root.rglob("*"):
            if file.is_file() and file.suffix in EXTS and not should_skip(file):
                rel_path = file.relative_to(root)
                abs_path = file.resolve()
                # Cabeceras dentro del TXT
                fout.write("\n\n")
                fout.write(f"# === Nombre : {file.name}\n")
                fout.write(f"# === Ruta   : {abs_path if absolute else rel_path}\n")
                fout.write("# ==============================================\n\n")
                try:
                    fout.write(file.read_text(encoding="utf-8", errors="ignore"))
                except UnicodeDecodeError:
                    fout.write("[Archivo omitido: codificación no reconocida]")
    print(f"✅ Código extraído en: {out_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python dump_react_code.py <ruta_proyecto> [archivo_salida]")
        sys.exit(1)

    project_dir = Path(sys.argv[1]).resolve()
    script_dir = Path(__file__).parent.resolve()

    # Si el usuario NO pasa un segundo argumento, usamos la carpeta del script.
    out_path = (
        Path(sys.argv[2]).resolve()
        if len(sys.argv) > 2
        else script_dir / "react_code_dump.txt"
    )

    if not project_dir.exists():
        print("❌ Error: la ruta del proyecto no existe.")
        sys.exit(1)

    # Cambia absolute=True si quieres rutas completas en la cabecera.
    dump_code(project_dir, out_path, absolute=False)
