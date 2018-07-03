import React, { Component } from 'react'

import {
  LinearGradient,
  Line,
  Text,
  Defs,
  Stop
} from 'react-native-svg'

class AbstractChart extends Component {

  renderHorizontalLines = config => {
    const { count, width, height, labelCount, paddingTop } = config
    return [...Array(count)].map((_, i) => {
      return (
        <Line
          key={Math.random()}
          x1={width / labelCount}
          y1={(height / 4 * i) + paddingTop}
          x2={width}
          y2={(height / 4 * i) + paddingTop}
          stroke={this.props.chartConfig.color(0.2)}
          strokeDasharray="5, 10"
          strokeWidth={1}
        />
      )
    })
  }

  renderHorizontalLabels = config => {
    const { count, data, width, height, labelsCount, paddingTop, yLabelsOffset = 12 } = config
    return [...Array(count)].map((_, i) => {
      return (
        <Text
          key={Math.random()}
          x={(width / labelsCount) - yLabelsOffset}
          textAnchor="end"
          y={(height * 3 / 4) - (height / 4 * i) + (paddingTop / 2)}
          fontSize={12}
          fill={this.props.chartConfig.color(0.5)}
        >{(((Math.max(...data) - Math.min(...data)) / 4 * i) + Math.min(...data)).toFixed(2)}
        </Text>
      )
    })
  }

  renderVerticalLabels = config => {
    const { labels, width, height, paddingRight, paddingTop, horizontalOffset = 0 } = config
    const fontSize = 12
    return labels.map((label, i) => {
      return (
        <Text
          key={Math.random()}
          x={((width - paddingRight) / labels.length * (i + 1)) + horizontalOffset}
          y={(height * 3 / 4) + paddingTop + (fontSize*2)}
          fontSize={fontSize}
          fill={this.props.chartConfig.color(0.5)}
          textAnchor="middle"
        >{label}
        </Text>
      )
    })
  }

  renderVerticalLines = config => {
    const { data, width, height, paddingTop, paddingRight } = config
    return [...Array(data.length)].map((_, i) => {
      return (
        <Line
          key={Math.random()}
          x1={Math.floor((width - paddingRight) / data.length * (i + 1))}
          y1={0}
          x2={Math.floor((width - paddingRight) / data.length * (i + 1))}
          y2={height - (height / 4) + paddingTop}
          stroke={this.props.chartConfig.color(0.2)}
          strokeDasharray="5, 10"
          strokeWidth={1}
        />
      )
    })
  }

  renderDefs = config => {
    const { width, height, backgroundGradientFrom, backgroundGradientTo } = config
    return (
      <Defs>
        <LinearGradient id="backgroundGradient" x1="0" y1={height} x2={width} y2={0}>
          <Stop offset="0" stopColor={backgroundGradientFrom}/>
          <Stop offset="1" stopColor={backgroundGradientTo}/>
        </LinearGradient>
        <LinearGradient id="fillShadowGradient" x1={0} y1={0} x2={0} y2={height}>
          <Stop offset="0" stopColor={this.props.chartConfig.color()} stopOpacity="0.1"/>
          <Stop offset="1" stopColor={this.props.chartConfig.color()} stopOpacity="0"/>
        </LinearGradient>
      </Defs>
    )
  }
}

export default AbstractChart
