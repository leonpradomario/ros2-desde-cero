# Lección 02 · Servicio: cliente y servidor

Un nodo servidor ofrece el servicio `/sumar`. Un nodo cliente le envía dos enteros y recibe su suma.

La explicación y los ejercicios están en la [lección en el navegador](https://leonpradomario.github.io/ros2-desde-cero/#/leccion/02).

## Correrlo

Abre dos terminales. En cada una, primero activa el workspace:

```bash
cd ~/ros2_ws
source install/setup.bash
```

Terminal 1:

```bash
ros2 run ros2_desde_cero servidor
```

Terminal 2:

```bash
ros2 run ros2_desde_cero cliente 2 3
```

El cliente muestra `Resultado: 2 + 3 = 5` y termina. El servidor sigue corriendo hasta que lo detengas con `Ctrl+C`. Puedes cambiar los dos números.

## Para explorar

Con el servidor corriendo, en otra terminal:

```bash
ros2 service list
ros2 service call /sumar example_interfaces/srv/AddTwoInts "{a: 10, b: 5}"
```

## Archivos

- [`servidor.py`](servidor.py): crea el servicio y el callback que atiende cada petición.
- [`cliente.py`](cliente.py): envía la petición con `call_async` y espera la respuesta.
