import React from 'react'
import { View } from 'react-native'
import {
  Svg,
  Rect,
  Text,
  G,
  Path
} from 'react-native-svg'
import AbstractChart from './abstract-chart'

const Pie = require('paths-js/pie')

class PieChart extends AbstractChart {
  render() {
    const { style = {} } = this.props
    const { borderRadius = 0 } = style
    const chart = Pie({
      center: this.props.center || [0, 0],
      r: 0,
      R: this.props.height / 2.5,
      data: this.props.data,
      accessor: x => {
        return x[this.props.accessor]
      }
    })
    const total = this.props.data.reduce((sum, item) => {
      return sum + item[this.props.accessor]
    }, 0)
    const slices = chart.curves.map((c, i) => {
      return (
        <G key={Math.random()}>
          <Path
            d={c.sector.path.print()}
            fill={this.props.chartConfig.color(0.2 * (i + 1))}
          />
          <Rect
            width="16"
            height="16"
            fill={this.props.chartConfig.color(0.2 * (i + 1))}
            rx={8}
            ry={8}
            x={(this.props.width / 2.5) - 24}
            y={-(this.props.height / 2.5) + ((this.props.height * 0.8) / this.props.data.length * i) + 12}
          />
          <Text
            fill={this.props.chartConfig.color(0.5)}
            fontSize="11"
            x={this.props.width / 2.5}
            y={-(this.props.height / 2.5) + ((this.props.height * 0.8) / this.props.data.length * i) + 12*2}
          >{Math.round(100 / total * c.item[this.props.accessor])}% { c.item.name }
          </Text>
        </G>
      )
    })
    return (
      <View
        style={{
          width: this.props.width,
          height: this.props.height,
          padding: 0,
          ...style
        }}
      >
        <Svg
          width={this.props.width}
          height={this.props.height}
        >
          {this.renderDefs({
            width: this.props.height,
            height: this.props.height,
            ...this.props.chartConfig
          })}
          <Rect width="100%" height={this.props.height} rx={borderRadius} ry={borderRadius} fill="url(#backgroundGradient)"/>
          <G
            x={this.props.width / 2.5}
            y={this.props.height / 2}
          >
            {slices}
          </G>
        </Svg>
      </View>
    )
  }
}

export default PieChart
