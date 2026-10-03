# ROS2 desde cero

[![CI](https://github.com/leonpradomario/ros2-desde-cero/actions/workflows/ci.yml/badge.svg)](https://github.com/leonpradomario/ros2-desde-cero/actions/workflows/ci.yml)

ROS2 en español, para quien acaba de instalarlo y no sabe qué sigue.

**Empieza aquí: [leonpradomario.github.io/ros2-desde-cero](https://leonpradomario.github.io/ros2-desde-cero/)**

Son lecciones cortas que se juegan en el navegador: un poco de teoría, ejercicios de código que se revisan al instante y, al final de cada una, el comando exacto para correr ese mismo código en tu máquina. Te acompaña Tuerca, una tortuga robot.

## Para quién es

- Ya instalaste ROS2 Humble y corriste `turtlesim`, pero no sabes cómo escribir tu primer nodo.
- Prefieres aprender en español y con ejemplos pequeños que se entienden completos.
- Sabes lo básico de Python y de la terminal de Linux.

No hace falta saber C++ ni tener un robot.

## Cómo funciona

Cada lección tiene dos mitades:

1. **En el navegador.** Lees la idea y resuelves ejercicios: elegir una respuesta, completar código, ordenar líneas, encontrar el error y escribir comandos. Cada error gasta una carga de la batería de Tuerca; con cinco errores, la lección se reinicia. No necesitas instalar nada para esta parte, y tu progreso se guarda solo en tu navegador.
2. **En tu máquina.** Corres el código real de la lección, que está en este repositorio.

El navegador no ejecuta ROS2. Los ejercicios comprueban que entendiste el código; ver los nodos funcionando ocurre en tu computadora.

## Lecciones

**Estado: EN PROGRESO.** La Unidad 1 está completa; la Unidad 2 está en construcción.

| # | Lección | Qué aprendes | Estado |
|---|---------|--------------|--------|
| 01 | [Publicador y suscriptor](ros2_desde_cero/ros2_desde_cero/leccion_01_pub_sub/) | Nodos, tópicos, callbacks y `rclpy.spin` | Lista |
| 02 | [Servicio: cliente y servidor](ros2_desde_cero/ros2_desde_cero/leccion_02_servicio/) | Petición y respuesta, `call_async` y futuros | Lista |
| 03 | [Launch file](ros2_desde_cero/launch/) | Levantar varios nodos con un solo comando | Lista |
| 04 | Parámetros | Configurar un nodo sin tocar su código | En construcción |
| 05 | Interfaces propias | Definir tus propios mensajes y servicios | En construcción |
| 06 | Acciones | Tareas largas con avance y cancelación | En construcción |

## Correr el código en tu máquina

Necesitas Ubuntu 22.04 con [ROS2 Humble](https://docs.ros.org/en/humble/Installation.html) instalado.

```bash
# 1. Activa ROS2 en esta terminal
source /opt/ros/humble/setup.bash

# 2. Crea un workspace y clona el repositorio dentro de src/
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src
git clone https://github.com/leonpradomario/ros2-desde-cero.git

# 3. Compila desde la raíz del workspace
cd ~/ros2_ws
colcon build --packages-select ros2_desde_cero

# 4. Activa lo que acabas de compilar
source install/setup.bash
```

El paso 4 hay que repetirlo en **cada terminal nueva** que abras. Si un comando responde `Package 'ros2_desde_cero' not found`, casi siempre es eso.

Después, cada lección se corre así:

```bash
# Lección 01 — dos terminales
ros2 run ros2_desde_cero publicador
ros2 run ros2_desde_cero suscriptor

# Lección 02 — dos terminales
ros2 run ros2_desde_cero servidor
ros2 run ros2_desde_cero cliente 2 3

# Lección 03 — una sola terminal levanta los cuatro nodos
ros2 launch ros2_desde_cero leccion_03.launch.py
```

Si cambias el código, vuelve a correr `colcon build` antes de probarlo.

## Qué hay en el repositorio

```
ros2-desde-cero/
├── web/                       El sitio de las lecciones (HTML, CSS y JavaScript, sin compilar)
│   ├── lecciones/             Una lección por archivo JSON
│   └── js/                    El motor: ruta, ejercicios, progreso y mascota
└── ros2_desde_cero/           El paquete de ROS2 (ament_python)
    ├── ros2_desde_cero/
    │   ├── leccion_01_pub_sub/
    │   └── leccion_02_servicio/
    └── launch/                Lección 03
```

## Probar el sitio en local

El sitio no tiene dependencias ni paso de compilación. Solo necesita un servidor de archivos:

```bash
cd web
python3 -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Agregar o corregir una lección

Una lección es un archivo JSON dentro de `web/lecciones/`, con una lista de pasos. Cada paso es teoría o uno de los cinco tipos de ejercicio: `opcion`, `completar`, `ordenar`, `error` y `escribir`. Las lecciones existentes sirven de modelo.

Para que aparezca en la ruta, agrégala a `web/lecciones/indice.json`.

Si encuentras un error en una explicación o en el código, abre un issue o un pull request.

## Licencia

[MIT](LICENSE). Puedes usar, copiar y adaptar el contenido, también para dar clases.
