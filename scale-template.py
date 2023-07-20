#!/usr/bin/env python3

import argparse
import numpy
import sys

from PIL import Image, ImageColor


def build_colors() -> list:
    # official colors from reddit
    colors = {
        'red': '#FF4500',
        'orange': '#FFA800',
        'yellow': '#FFD635',
        'green': '#00A368',
        'blue': '#3690EA',
        'purple': '#B44AC0',
        'black': '#000000',
        'white': '#E9EBED',
    }
    return [ImageColor.getcolor(c, 'RGB') for c in colors.values()]


def closest(color: tuple, colors: list) -> tuple:
    valid = numpy.array(colors)
    distances = numpy.sqrt(numpy.sum((valid-color)**2, axis=1))
    smallest = numpy.where(distances == numpy.amin(distances))

    return valid[smallest]


def main(path: str, factor: int):
    cache: dict = {}
    colors: list = build_colors()
    input = Image.open(path)
    input.load()

    width, height = input.size
    with Image.new(mode='RGBA', size=(width*factor, height*factor)) as output:
        for x in range(width):
            for y in range(height):
                before = input.getpixel((x, y))
                if before not in cache:
                    cache[before] = closest(input.getpixel((x, y)), colors)[0]
                after = cache[before]

                output.putpixel(
                    ((x*factor)+(factor//2), (y*factor)+(factor//2)),
                    (*after, 255)
                )
        output.save(sys.stdout, 'png')


if __name__ == '__main__':
    parser = argparse.ArgumentParser('scale-template')
    parser.add_argument('input')
    parser.add_argument('factor', default=3, type=int)
    args = parser.parse_args()

    main(args.input, args.factor)
