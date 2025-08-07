import os

def extraer_codigo_y_rutas(origen, archivo_salida):
    if not os.path.exists(origen):
        print(f"Error: La ruta de origen '{origen}' no existe.")
        return

    with open(archivo_salida, 'w', encoding='utf-8') as f:
        for root, dirs, files in os.walk(origen):
            for archivo in files:
                # Definir la extensión de archivo que queremos extraer (código de React)
                if archivo.endswith(('.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json', '.html', '.env')):
                    ruta_completa = os.path.join(root, archivo)
                    ruta_relativa = os.path.relpath(ruta_completa, origen)

                    f.write(f"\n\n=== Archivo: {ruta_relativa} ===\n\n")

                    try:
                        with open(ruta_completa, 'r', encoding='utf-8') as archivo_leer:
                            contenido = archivo_leer.read()
                            f.write(contenido)  # Escribir contenido del archivo
                    except Exception as e:
                        f.write(f"Error al leer el archivo: {e}")
                    f.write("\n\n====================\n\n")
    
    print(f"📄 Proyecto extraído exitosamente en: {archivo_salida}")

# === Uso ===
# Cambia estas rutas según tu sistema:
ruta_origen = "./"
archivo_salida = "./proyecto_extraido.txt"

extraer_codigo_y_rutas(ruta_origen, archivo_salida)
