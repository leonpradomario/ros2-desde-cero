"""Lección 01 · Publicador: envía un saludo por segundo al tópico /saludo.

Para correrlo:
    ros2 run ros2_desde_cero publicador
"""

import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class Publicador(Node):

    def __init__(self):
        # El nombre con el que el nodo aparece en `ros2 node list`.
        super().__init__('publicador')

        # Tipo de mensaje, nombre del tópico y tamaño de la cola.
        self.pub = self.create_publisher(String, 'saludo', 10)

        # Llama a self.publicar cada 1.0 segundos.
        self.timer = self.create_timer(1.0, self.publicar)
        self.contador = 0

    def publicar(self):
        msg = String()
        msg.data = f'Hola ROS2 #{self.contador}'
        self.pub.publish(msg)
        self.get_logger().info(f'Publicando: "{msg.data}"')
        self.contador += 1


def main(args=None):
    rclpy.init(args=args)       # 1. Enciende ROS2 en este programa
    nodo = Publicador()         # 2. Crea el nodo
    try:
        rclpy.spin(nodo)        # 3. Lo deja trabajando hasta Ctrl+C
    except KeyboardInterrupt:
        pass                    # Ctrl+C es la forma normal de salir, no un error
    finally:
        nodo.destroy_node()     # 4. Lo destruye al salir
        rclpy.try_shutdown()    # 5. Apaga ROS2 (si Ctrl+C no lo apagó ya)


if __name__ == '__main__':
    main()
