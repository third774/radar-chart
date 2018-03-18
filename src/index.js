import * as d3 from 'd3'

import data from './data'

const RADIANS = Math.PI * 2

const DEFAULT_OPTIONS = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40,
  height: 500,
  width: 500,
}

class RadarChart {
  constructor(options) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }
  }

  get height() {
    return this.options.height - this.options.top - this.options.bottom
  }

  get width() {
    return this.options.width - this.options.left - this.options.right
  }

  render(data) {
    const radar = d3
      .select(this.options.el)
      .append('svg')
      .attr('height', this.options.height)
      .attr('width', this.options.width)
      .append('g')
      .attr(
        'height',
        this.options.height - this.options.top - this.options.bottom,
      )
      .attr('transform', `translate(${this.options.left},${this.options.top})`)
      .attr(
        'width',
        this.options.width - this.options.left - this.options.right,
      )

    const stats = []
    data.forEach(d => {
      Object.keys(d.stats).forEach(key => {
        if (stats.indexOf(key) < 0) {
          stats.push(key)
        }
      })
    })

    const max = d3.max(data, d => d3.max(Object.values(d.stats)))

    const axis = radar
      .selectAll('.axis')
      .data(stats)
      .enter()
      .append('g')
      .attr('class', 'axis')

    const xCoordinate = (value, index, totalItems) =>
      this.width / 2 * (1 - 1 * Math.cos(index * RADIANS / totalItems) * value)

    const yCoordinate = (value, index, totalItems) =>
      this.height / 2 * (1 - 1 * Math.sin(index * RADIANS / totalItems) * value)

    axis
      .append('line')
      .attr('x1', this.width / 2)
      .attr('y1', this.height / 2)
      .attr('x2', (d, i, all) => xCoordinate(1, i, all.length))
      .attr('y2', (d, i, all) => yCoordinate(1, i, all.length))
      .attr('stroke', 'gray')
      .attr('stroke-width', '1px')

    for (let v = 0; v <= max; v++) {
      for (let a = 0; a < stats.length; a++) {
        radar
          .append('line')
          .attr('x1', xCoordinate(v / max, a, stats.length))
          .attr('y1', yCoordinate(v / max, a, stats.length))
          .attr('x2', xCoordinate(v / max, a + 1, stats.length))
          .attr('y2', yCoordinate(v / max, a + 1, stats.length))
          .attr('stroke-width', '1px')
          .attr('stroke', 'gray')
          .attr('stroke-opacity', 0.3)
      }
    }

    axis
      .append('text')
      .text(d => d.toUpperCase())
      .attr('x', (d, i, all) => xCoordinate(1.1, i, all.length))
      .attr('y', (d, i, all) => yCoordinate(1.1, i, all.length))
      .attr('text-anchor', 'middle')
      .attr('font-family', 'monospace')

    // TODO: FILL IN
    const points = []

    data.forEach(d => {
      const pointString = Object.values(d.stats)
        .reduce((acc, val, i, arr) => {
          acc.push(
            `${xCoordinate(val / max, i, arr.length)},${yCoordinate(
              val / max,
              i,
              arr.length,
            )}`,
          )
          return acc
        }, [])
        .join(' ')

      points.push(pointString)
    })

    const polygon = radar
      .selectAll('.character')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'character')

    polygon
      .append('polygon')
      .attr('points', (d, i) => points[i])
      .attr('fill-opacity', 0.5)
      .attr('fill', (d, i) => d3.schemeCategory10[i])
      .on('mouseover', function(d, i) {
        d3
          .selectAll('.character>polygon')
          .filter(s => s !== d)
          .attr('fill-opacity', 0.2)
        d3.select(this).attr('fill-opacity', 0.9)
      })
      .on('mouseout', function() {
        d3.selectAll('.character>polygon').attr('fill-opacity', 0.5)
      })
  }
}

const radar = new RadarChart({
  el: document.querySelector('.radar'),
  width: 500,
  height: 500,
})

radar.render(data)
