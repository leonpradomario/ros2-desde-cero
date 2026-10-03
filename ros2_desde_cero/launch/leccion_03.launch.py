"""Lección 03 · Launch file: levanta los cuatro nodos de las lecciones 01 y 02.

Para correrlo:
    ros2 launch ros2_desde_cero leccion_03.launch.py
"""

from launch import LaunchDescription
from launch_ros.actions import Node


# ROS2 busca una función con este nombre exacto.
def generate_launch_description():
    paquete = 'ros2_desde_cero'

    return LaunchDescription([
        # Cada Node equivale a un `ros2 run <package> <executable>`.
        # output='screen' muestra en esta terminal lo que imprime el nodo.
        Node(package=paquete, executable='publicador', output='screen'),
        Node(package=paquete, executable='suscriptor', output='screen'),
        Node(package=paquete, executable='servidor', output='screen'),
        # arguments son los valores que irían después del nombre del
        # ejecutable: aquí, los dos números que el cliente pide sumar.
        Node(package=paquete, executable='cliente', arguments=['2', '3'],
             output='screen'),
    ])
