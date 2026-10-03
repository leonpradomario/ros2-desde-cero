"""Lección 01 · Suscriptor: muestra cada mensaje que llega al tópico /saludo.

Para correrlo (con el publicador en otra terminal):
    ros2 run ros2_desde_cero suscriptor
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class Suscriptor(Node):

    def __init__(self):
        super().__init__('suscriptor')

        # El tipo y el nombre del tópico tienen que ser idénticos a los del
        # publicador. self.escuchar va sin paréntesis: se entrega la función,
        # y ROS2 la llama cada vez que llega un mensaje.
        self.sub = self.create_subscription(
            String, 'saludo', self.escuchar, 10)

    def escuchar(self, msg):
        self.get_logger().info(f'Recibido: "{msg.data}"')


def main(args=None):
    rclpy.init(args=args)
    nodo = Suscriptor()
    try:
        # Sin spin, el programa terminaría aquí y el callback nunca correría.
        rclpy.spin(nodo)
    except KeyboardInterrupt:
        pass
    finally:
        nodo.destroy_node()
        rclpy.try_shutdown()


if __name__ == '__main__':
    main()
