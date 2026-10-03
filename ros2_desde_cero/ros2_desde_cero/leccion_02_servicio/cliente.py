"""Lección 02 · Cliente: le pide al servicio /sumar la suma de dos enteros.

Para correrlo (con el servidor en otra terminal):
    ros2 run ros2_desde_cero cliente 2 3
"""

import signal
import sys

from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node
from rclpy.utilities import remove_ros_args


class Cliente(Node):

    def __init__(self):
        super().__init__('cliente')
        self.cliente = self.create_client(AddTwoInts, 'sumar')

        # Si el servidor todavía no arrancó, espera en vez de fallar.
        while not self.cliente.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Esperando al servicio /sumar...')

    def pedir_suma(self, a, b):
        peticion = AddTwoInts.Request()
        peticion.a = a
        peticion.b = b

        # call_async envía la petición y devuelve un futuro de inmediato.
        futuro = self.cliente.call_async(peticion)
        # El nodo sigue trabajando hasta que la respuesta llega.
        rclpy.spin_until_future_complete(self, futuro)
        return futuro.result()


def main(args=None):
    rclpy.init(args=args)

    # `ros2 run` y `ros2 launch` agregan argumentos propios de ROS.
    # Se quitan para quedarse solo con los dos números.
    argumentos = remove_ros_args(args=sys.argv)
    a = int(argumentos[1]) if len(argumentos) > 1 else 2
    b = int(argumentos[2]) if len(argumentos) > 2 else 3

    nodo = Cliente()
    try:
        respuesta = nodo.pedir_suma(a, b)
        nodo.get_logger().info(f'Resultado: {a} + {b} = {respuesta.sum}')
    except KeyboardInterrupt:
        pass
    finally:
        # `ros2 launch` reenvía Ctrl+C a cada nodo, así que puede llegar un
        # segundo mientras este se cierra. Se ignora para terminar sin errores.
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        nodo.destroy_node()
        rclpy.try_shutdown()


if __name__ == '__main__':
    main()
