import React from 'react'
import { View } from 'react-native'
import {
  Svg,
  Circle,
  Polygon,
  Polyline,
  Path,
  Rect
} from 'react-native-svg'
import AbstractChart from './abstract-chart'

class LineChart extends AbstractChart {
  calcScaler = data => (Math.max(...data) - Math.min(...data)) || 1

  renderDots = config => {
    const { data, width, height, paddingTop, paddingRight } = config
    return data.map((x, i) => {
      return (
        <Circle
          key={Math.random()}
          cx={paddingRight + (i * (width - paddingRight) / data.length)}
          cy={((height / 4 * 3 * (1 - ((x - Math.min(...data)) / this.calcScaler(data)))) + paddingTop)}
          r="4"
          fill={this.props.chartConfig.color(0.7)}
        />)
    })
  }

  renderShadow = config => {
    if (this.props.bezier) {
      return this.renderBezierShadow(config)
    }
    const { data, width, height, paddingRight, paddingTop } = config
    return (
      <Polygon
        points={data.map((x, i) =>
          (paddingRight + (i * (width - paddingRight) / data.length)) +
        ',' +
         (((height / 4 * 3 * (1 - ((x - Math.min(...data)) / this.calcScaler(data)))) + paddingTop))
        ).join(' ') + ` ${paddingRight + ((width - paddingRight) / data.length * (data.length - 1))},${(height / 4 * 3) + paddingTop} ${paddingRight},${(height / 4 * 3) + paddingTop}`}
        fill="url(#fillShadowGradient)"
        strokeWidth={0}
      />)
  }

  renderLine = config => {
    if (this.props.bezier) {
      return this.renderBezierLine(config)
    }
    const { width, height, paddingRight, paddingTop, data } = config
    const points = data.map((x, i) =>
      (paddingRight + (i * (width - paddingRight) / data.length)) +
      ',' +
       (((height / 4 * 3 * (1 - ((x - Math.min(...data)) / this.calcScaler(data))))) + paddingTop))

    return (
      <Polyline
        points={points.join(' ')}
        fill="none"
        stroke={this.props.chartConfig.color(0.2)}
        strokeWidth={3}
      />
    )
  }

  getBezierLinePoints = config => {
    const { width, height, paddingRight, paddingTop, data } = config
    if (data.length === 0) {
      return 'M0,0'
    }
    const x = i => Math.floor(paddingRight + i * (width - paddingRight) / data.length)
    const y = i => Math.floor(((height / 4 * 3 * (1 - ((data[i] - Math.min(...data)) / this.calcScaler(data)))) + paddingTop))
    return [`M${x(0)},${y(0)}`].concat(data.slice(0, -1).map((_, i) => {
      const x_mid = (x(i) + x(i + 1)) / 2
      const y_mid = (y(i) + y(i + 1)) / 2
      const cp_x1 = (x_mid + x(i)) / 2
      const cp_x2 = (x_mid + x(i + 1)) / 2
      return `Q ${cp_x1}, ${y(i)}, ${x_mid}, ${y_mid}` +
      ` Q ${cp_x2}, ${y(i + 1)}, ${x(i + 1)}, ${y(i + 1)}`
    })).join(' ')
  }

  renderBezierLine = config => {
    return (
      <Path
        d={this.getBezierLinePoints(config)}
        fill="none"
        stroke={this.props.chartConfig.color(0.2)}
        strokeWidth={3}
      />
    )
  }

  renderBezierShadow = config => {
    const { width, height, paddingRight, paddingTop, data } = config
    return (
      <Path
        d={this.getBezierLinePoints(config) +
          ` L${paddingRight + ((width - paddingRight) / data.length * (data.length - 1))},${(height / 4 * 3) + paddingTop} L${paddingRight},${(height / 4 * 3) + paddingTop} Z`}
        fill="url(#fillShadowGradient)"
        strokeWidth={0}
      />)
  }

  render() {
    const paddingTop = 16
    const paddingRight = 64
    const { width, height, data, withShadow = true, withDots = true, style = {} } = this.props
    const { labels = [] } = data
    const { borderRadius = 0 } = style
    const config = {
      width,
      height
    }
    return (
      <View style={style}>
        <Svg
          height={height}
          width={width}
        >
          {this.renderDefs({
            ...config,
            ...this.props.chartConfig
          })}
          <Rect
            width="100%"
            height={height}
            rx={borderRadius}
            ry={borderRadius}
            fill="url(#backgroundGradient)"/>
          {this.renderHorizontalLines({
            ...config,
            count: 4,
            paddingTop,
            paddingRight
          })}
          {this.renderHorizontalLabels({
            ...config,
            count: (Math.min(...data.datasets[0].data) === Math.max(...data.datasets[0].data)) ?
              1 : 4,
            data: data.datasets[0].data,
            paddingTop,
            paddingRight
          })}
          {this.renderVerticalLines({
            ...config,
            data: data.datasets[0].data,
            paddingTop,
            paddingRight
          })}
          {this.renderVerticalLabels({
            ...config,
            labels,
            paddingRight,
            paddingTop
          })}
          {this.renderLine({
            ...config,
            paddingRight,
            paddingTop,
            data: data.datasets[0].data
          })}
          {withShadow && this.renderShadow({
            ...config,
            data: data.datasets[0].data,
            paddingRight,
            paddingTop
          })}
          {withDots && this.renderDots({
            ...config,
            data: data.datasets[0].data,
            paddingTop,
            paddingRight
          })}
        </Svg>
      </View>
    )
  }
}

export default LineChart
