"""Lección 02 · Servidor: atiende el servicio /sumar y devuelve a + b.

Para correrlo:
    ros2 run ros2_desde_cero servidor
"""

import signal

from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node


class Servidor(Node):

    def __init__(self):
        super().__init__('servidor')

        # Tipo del servicio, nombre y la función que atiende cada petición.
        self.srv = self.create_service(AddTwoInts, 'sumar', self.atender)
        self.get_logger().info('Servicio /sumar listo')

    def atender(self, request, response):
        # ROS2 entrega la petición y una respuesta vacía para llenar.
        response.sum = request.a + request.b
        self.get_logger().info(
            f'Petición: {request.a} + {request.b} = {response.sum}')
        # Hay que devolver la respuesta completa: es lo que recibe el cliente.
        return response


def main(args=None):
    rclpy.init(args=args)
    nodo = Servidor()
    try:
        rclpy.spin(nodo)
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
