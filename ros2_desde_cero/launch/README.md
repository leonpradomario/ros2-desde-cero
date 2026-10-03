# Lección 03 · Launch file

Un solo comando levanta los cuatro nodos de las lecciones 01 y 02: publicador, suscriptor, servidor y cliente.

La explicación y los ejercicios están en la [lección en el navegador](https://leonpradomario.github.io/ros2-desde-cero/#/leccion/03).

## Correrlo

```bash
cd ~/ros2_ws
source install/setup.bash
ros2 launch ros2_desde_cero leccion_03.launch.py
```

Vas a ver mezclados los mensajes de los cuatro nodos. El cliente termina apenas recibe la suma; los otros tres siguen hasta que presiones `Ctrl+C`, que los apaga a todos.

## Si `ros2 launch` no encuentra el archivo

Un launch file se ejecuta desde la carpeta `install/`, no desde aquí. Para que llegue ahí hacen falta dos cosas:

1. Que esté declarado en [`setup.py`](../setup.py), dentro de `data_files`. En este paquete ya lo está, para todo archivo que termine en `.launch.py`.
2. Volver a compilar después de crearlo:

```bash
cd ~/ros2_ws
colcon build --packages-select ros2_desde_cero
source install/setup.bash
```

## Archivos

- [`leccion_03.launch.py`](leccion_03.launch.py): la lista de nodos por arrancar.
