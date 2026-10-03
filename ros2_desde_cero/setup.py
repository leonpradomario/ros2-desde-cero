from glob import glob
import os

from setuptools import find_packages, setup

package_name = 'ros2_desde_cero'

setup(
    name=package_name,
    version='0.1.0',
    # find_packages encuentra también las carpetas de cada lección,
    # porque cada una tiene su __init__.py.
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        # Sin esta línea, `ros2 launch` no encuentra los launch files:
        # los copia de launch/ a la carpeta install/ al compilar.
        (os.path.join('share', package_name, 'launch'),
            glob('launch/*.launch.py')),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Mario Leon Prado',
    maintainer_email='292083661+leonpradomario@users.noreply.github.com',
    description='Ejemplos mínimos de ROS2 en español.',
    license='MIT',
    # Cada línea crea un ejecutable: el nombre de la izquierda es el que
    # se usa en `ros2 run ros2_desde_cero <nombre>`.
    entry_points={
        'console_scripts': [
            'publicador = ros2_desde_cero.leccion_01_pub_sub.publicador:main',
            'suscriptor = ros2_desde_cero.leccion_01_pub_sub.suscriptor:main',
            'servidor = ros2_desde_cero.leccion_02_servicio.servidor:main',
            'cliente = ros2_desde_cero.leccion_02_servicio.cliente:main',
        ],
    },
)
