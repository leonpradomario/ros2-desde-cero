# Lección 01 · Publicador y suscriptor

Dos nodos: uno publica un saludo por segundo en el tópico `/saludo` y el otro muestra cada mensaje que llega.

La explicación y los ejercicios están en la [lección en el navegador](https://leonpradomario.github.io/ros2-desde-cero/#/leccion/01).

## Correrlo

Abre dos terminales. En cada una, primero activa el workspace:

```bash
cd ~/ros2_ws
source install/setup.bash
```

Terminal 1:

```bash
ros2 run ros2_desde_cero publicador
```

Terminal 2:

```bash
ros2 run ros2_desde_cero suscriptor
```

Deberías ver `Publicando: "Hola ROS2 #0"` en la primera y `Recibido: "Hola ROS2 #0"` en la segunda. Se detienen con `Ctrl+C`.

## Para explorar

Con los dos nodos corriendo, en una tercera terminal:

```bash
ros2 topic list            # los tópicos activos
ros2 topic echo /saludo    # los mensajes, sin escribir un suscriptor
ros2 node list             # los nodos activos
```

## Archivos

- [`publicador.py`](publicador.py): crea el publicador y un timer que lo dispara.
- [`suscriptor.py`](suscriptor.py): crea la suscripción y su callback.
